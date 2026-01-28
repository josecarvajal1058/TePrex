/*
    Integrantes:
    - Jose Manuel Carvajal Florentino - A00156381
    -
    Fecha: 28/01/2026
*/

let libros = [];
let prestamos = JSON.parse(localStorage.getItem('prestamos')) || [];
let currentBook = null;
const $ = id => document.getElementById(id);
const q = s => document.querySelector(s);
const qa = s => document.querySelectorAll(s);
const renderSkeletons = () => {
    const main = $('mainContent');
    main.innerHTML = `
        <div class="category-row">
            <div class="skeleton-line" style="height: 3rem; width: 300px; margin-bottom: 2rem; border-radius: 12px;"></div>
            <div class="skeleton-container">
                ${Array(4).fill(`
                    <div class="skeleton-card">
                        <div class="skeleton-img"></div>
                        <div class="skeleton-details">
                            <div class="skeleton-line" style="width: 80%;"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="category-row">
            <div class="skeleton-line" style="height: 3rem; width: 300px; margin-bottom: 2rem; border-radius: 12px;"></div>
            <div class="authors-grid">
                ${Array(3).fill(`
                    <div class="skeleton-card" style="height: 200px;">
                        <div class="skeleton-img" style="height: 100%;"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};
const loadBooks = () => {
    if (typeof librosData !== 'undefined') {
        libros = librosData;
    }
    const main = $('mainContent');
    if (main) {
        main.innerHTML = '';
        renderFeaturedAuthors();
        renderCategories();
        updateHistoryUI();
        initRevealAnimations();
        initDragScroll();
    }
};
const renderFeaturedAuthors = () => {
    const main = $('mainContent');
    if (!main || typeof autoresDestacados === 'undefined') return;
    const section = document.createElement('section');
    section.className = 'category-row reveal';
    section.innerHTML = `
        <h2 class="category-title">Autores Destacados</h2>
        <div class="authors-grid">
            ${autoresDestacados.map(author => `
                <div class="author-card">
                    <img src="${author.foto}" alt="${author.nombre}" class="author-photo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(author.nombre)}&background=fee4e7&color=b55394&size=128'">
                    <div class="author-info">
                        <h3 class="author-name">${author.nombre}</h3>
                        <p class="author-bio">${author.bio}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    main.appendChild(section);
};
const renderCategories = () => {
    const main = $('mainContent');
    if (!main || !libros || libros.length === 0) return;
    const categories = [...new Set(libros.map(l => l.categoria))];
    categories.forEach(cat => {
        const section = document.createElement('section');
        section.className = 'category-row reveal';
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = cat;
        const slider = document.createElement('div');
        slider.className = 'books-slider';
        libros.filter(l => l.categoria === cat).forEach(book => {
            slider.appendChild(createBookCard(book));
        });
        section.append(title, slider);
        main.appendChild(section);
    });
};
const createBookCard = (book) => {
    const div = document.createElement('div');
    div.className = 'book-card';
    div.innerHTML = `
        <div class="book-cover-wrapper">
            <img src="${book.portada}" alt="${book.titulo}" class="book-cover" loading="lazy" onerror="this.parentElement.classList.add('no-image'); this.style.display='none';">
        </div>
        <div class="book-details-mini">
            <div class="book-title">${book.titulo}</div>
            <div class="book-author">${book.autor}</div>
        </div>
    `;
    div.onclick = () => openModal(book);
    return div;
};
const openModal = (book) => {
    currentBook = book;
    $('modalTitle').textContent = book.titulo;
    $('modalAuthor').textContent = book.autor;
    $('modalCode').textContent = book.codigo;
    $('modalDescription').textContent = book.descripcion || 'Sin descripción disponible.';
    const modalCover = $('modalCoverImg');
    modalCover.src = book.portada;
    modalCover.onerror = function () {
        this.parentElement.classList.add('no-image');
        this.style.display = 'none';
    };
    modalCover.parentElement.classList.remove('no-image');
    modalCover.style.display = 'block';
    let yearEl = $('modalYear');
    if (!yearEl) {
        yearEl = document.createElement('span');
        yearEl.id = 'modalYear';
        $('modalCode').after(document.createTextNode(' • '), yearEl);
    }
    yearEl.textContent = book.anio || 'N/A';
    const details = q('.modal-details');
    let linkEl = $('modalExternalLink');
    if (!linkEl) {
        linkEl = document.createElement('a');
        linkEl.id = 'modalExternalLink';
        linkEl.target = '_blank';
        linkEl.className = 'modal-link';
        details.insertBefore(linkEl, $('loanForm'));
    }
    linkEl.href = book.enlace;
    linkEl.textContent = 'Ver en Open Library →';
    $('loanDays').value = '';
    $('returnDate').value = '';
    $('errorMsg').textContent = '';
    const modal = $('loanModal');
    modal.classList.add('visible');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};
const closeModal = () => {
    const modal = $('loanModal');
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 400);
};
const closeModalBtn = q('.close-modal');
if (closeModalBtn) closeModalBtn.onclick = closeModal;
const modalOverlay = q('.modal-overlay');
if (modalOverlay) modalOverlay.onclick = closeModal;
window.addEventListener('scroll', () => {
    const nav = q('.navbar');
    const hero = q('.hero');
    const threshold = hero ? hero.offsetHeight - 80 : 50;
    nav.classList.toggle('scrolled', window.scrollY > threshold);
});
const searchInput = $('searchInput');
const suggestionsBox = $('searchSuggestions');
const renderSuggestions = (books, title = null) => {
    if (!suggestionsBox) return;
    let html = '';
    if (title) {
        html += `<div class="suggestions-header" style="padding: 0.8rem 1.5rem 0.4rem; font-size: 0.75rem; font-weight: 800; color: var(--accent-pink); text-transform: uppercase; letter-spacing: 1px;">${title}</div>`;
    }
    html += books.map(book => `
        <div class="suggestion-item" onclick="selectSuggestion('${book.id}')">
            <img src="${book.portada}" class="suggestion-thumb" onerror="this.src='https://via.placeholder.com/40x55?text=?'">
            <div class="suggestion-info">
                <div class="suggestion-title">${book.titulo}</div>
                <div class="suggestion-author">${book.autor}</div>
            </div>
        </div>
    `).join('');
    suggestionsBox.innerHTML = html;
    suggestionsBox.classList.remove('hidden');
};
const showRecommendations = () => {
    if (libros.length === 0) return;
    const shuffled = [...libros].sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 3);
    renderSuggestions(recommended, 'Te recomendamos');
};
if (searchInput) {
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() === '') {
            showRecommendations();
        }
    });
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (term.length === 0) {
            showRecommendations();
            return;
        }
        if (term.length < 2) {
            suggestionsBox?.classList.add('hidden');
            return;
        }
        const matches = libros.filter(l =>
            [l.titulo, l.autor, l.codigo, String(l.anio)].some(attr => attr && attr.toLowerCase().includes(term))
        ).slice(0, 5);
        if (matches.length > 0) {
            renderSuggestions(matches);
        } else {
            suggestionsBox?.classList.add('hidden');
        }
    });
}
window.selectSuggestion = (bookId) => {
    const book = libros.find(l => l.id === bookId);
    if (book) {
        openModal(book);
        suggestionsBox?.classList.add('hidden');
        searchInput.value = book.titulo;
    }
};
document.addEventListener('click', (e) => {
    if (suggestionsBox && !e.target.closest('.search-wrapper')) {
        suggestionsBox.classList.add('hidden');
    }
});
const initRevealAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0, rootMargin: '100px' });
    qa('.reveal').forEach(el => observer.observe(el));
};
const loanDaysInput = $('loanDays');
const returnDateInput = $('returnDate');
const errorMsg = $('errorMsg');
const loanForm = $('loanForm');
if (loanDaysInput) {
    loanDaysInput.addEventListener('input', () => {
        const days = parseInt(loanDaysInput.value);
        if (isNaN(days)) {
            returnDateInput.value = '';
            errorMsg.textContent = '';
            return;
        }
        if (days < 1 || days > 15) {
            errorMsg.textContent = days < 1 ? 'Mínimo 1 día' : 'Máximo 15 días';
            returnDateInput.value = '';
            return;
        }
        errorMsg.textContent = '';
        returnDateInput.value = formatDate(calculateDeliveryDate(days));
    });
}
const calculateDeliveryDate = (days) => {
    let date = new Date();
    date.setDate(date.getDate() + days);
    const day = date.getDay();
    if (day === 0) date.setDate(date.getDate() + 1);
    if (day === 6) date.setDate(date.getDate() + 2);
    return date;
};
const formatDate = (date) => date.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
});
const getRandomLocation = () => {
    const locations = [
        'Sala de Lectura - Sec. A',
        'Sala de Lectura - Sec. B',
        'Biblio. Central - Piso 1',
        'Biblio. Central - Piso 2',
        'Mostrador Principal',
        'Ala Oeste - Estante 4'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
};
if (loanForm) {
    loanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const days = parseInt(loanDaysInput.value);
        if (days > 0 && days <= 15) {
            const nuevoPrestamo = {
                titulo: currentBook.titulo,
                codigo: currentBook.codigo,
                portada: currentBook.portada,
                descripcion: currentBook.descripcion,
                ubicacion: getRandomLocation(),
                dias: days,
                entrega: returnDateInput.value
            };
            prestamos.push(nuevoPrestamo);
            localStorage.setItem('prestamos', JSON.stringify(prestamos));
            updateHistoryUI();
            closeModal();
            showNotification(`¡Préstamo confirmado! Recoger en: ${nuevoPrestamo.ubicacion}`);
        }
    });
}
const updateHistoryUI = () => {
    const body = $('loansHistoryBody');
    if (!body) return;
    const isHomePage = !!$('mainContent');
    const displayList = isHomePage ? prestamos.slice(-4) : prestamos;
    body.innerHTML = displayList.slice().reverse().map(p => {
        const coverSrc = p.portada || 'https://via.placeholder.com/40x60?text=No+Img';
        const locationCell = `<td style="font-size: 0.9rem; color: var(--accent-pink); font-weight: 600;">${p.ubicacion || 'Mostrador Principal'}</td>`;
        return `
        <tr>
            <td>
                <img src="${coverSrc}" alt="${p.titulo}" class="history-cover" onerror="this.src='https://via.placeholder.com/40x60?text=Error'">
            </td>
            <td style="font-weight: 700;">${p.titulo}</td>
            ${locationCell}
            <td>${p.codigo}</td>
            <td>${p.dias} días</td>
            <td style="color: var(--accent-pink); font-weight: 700;">${p.entrega}</td>
        </tr>
    `}).join('');
};
const showNotification = (message) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem; background: var(--accent-pink);
        color: var(--white); padding: 1rem 2rem; border-radius: 100px;
        font-family: var(--font-heading); font-weight: 700;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2); z-index: 3000;
        transform: translateY(100px); transition: var(--transition-smooth);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.transform = 'translateY(0)', 100);
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};
const initDragScroll = () => {
    qa('.books-slider').forEach(slider => {
        let isDown = false, startX, scrollLeft;
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('active'); });
        slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('active'); });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 3;
            requestAnimationFrame(() => slider.scrollLeft = scrollLeft - walk);
        });
    });
};
const clearBtn = $('clearHistoryBtn');
if (clearBtn) {
    clearBtn.onclick = () => {
        if (prestamos.length === 0) return;
        if (confirm('¿Estás seguro de que deseas limpiar el historial de préstamos?')) {
            prestamos = [];
            localStorage.removeItem('prestamos');
            updateHistoryUI();
            showNotification('Historial limpiado correctamente');
        }
    };
}
document.addEventListener('DOMContentLoaded', () => {
    if (typeof librosData !== 'undefined') {
        libros = librosData;
    }
    if ($('mainContent')) {
        loadBooks();
    } else if ($('loansTable')) {
        updateHistoryUI();
    }
    const navLinks = [$('homeLink'), $('logoLink'), $('catalogLink')];
    navLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#mainContent') {
                    e.preventDefault();
                    const target = href === '#' ? 0 : $('mainContent').offsetTop - 80;
                    window.scrollTo({ top: target, behavior: 'smooth' });
                }
            });
        }
    });
    const heroCatalogBtn = q('.btn-primary');
    if (heroCatalogBtn && $('mainContent')) {
        heroCatalogBtn.addEventListener('click', () => {
            window.scrollTo({ top: $('mainContent').offsetTop - 80, behavior: 'smooth' });
        });
    }
});