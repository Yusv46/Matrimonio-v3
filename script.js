// Configurazione di Tailwind CSS per il caricamento da CDN
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                'cormorant': ['Cormorant Garamond', 'serif'],
                'body': ['Cormorant Garamond', 'serif'],
                'display': ['"Shippori Mincho"', 'serif']
            },
            colors: {
                'brand-cream': '#FDF5E6',
                'brand-gold': '#D4AF37',
                'brand-red': '#CC3333',
                'brand-dark': '#3a3a3a',
                'brand-light-pink': '#FFE4E1',
                'brand-sakura': '#FFB7C5'
            }
        }
    }
};

/**
 * Modulo principale per il sito di viaggio di nozze in Giappone
 * Ottimizzato per performance e accessibilità
 */

// Namespace pattern per evitare conflitti globali
window.WeddingSite = window.WeddingSite || {};

// Variabili globali per la mappa di Google
let map, markers = {}, activeInfoWindow = null;

// Performance monitoring
const performanceTracker = {
    startTime: performance.now(),
    marks: {},

    mark(name) {
        this.marks[name] = performance.now() - this.startTime;
        console.log(`${name}: ${this.marks[name].toFixed(2)}ms`);
    }
};

// Funzione di inizializzazione mappa (chiamata globalmente dal callback dell'API di Google Maps)
function initMap() {
    const mapStyle = [
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#B0C4DE" }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#F5F5DC" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#D4A574" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#9CAF88" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8B4513" }] }
    ];

    const japan = { lat: 36.2048, lng: 138.2529 };
    const mapOptions = {
        zoom: 5,
        center: japan,
        styles: mapStyle,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    };

    map = new google.maps.Map(document.getElementById("japan-map"), mapOptions);

    const locations = {
        tokyo: { position: { lat: 35.6762, lng: 139.6503 }, title: 'Tokyo', content: '<div class="font-cormorant p-2"><strong class="text-japanese-red">Tokyo</strong><p>La capitale del futuro</p></div>', icon: createMarkerIcon('#B22222') },
        kyoto: { position: { lat: 35.0116, lng: 135.7680 }, title: 'Kyoto', content: '<div class="font-cormorant p-2"><strong class="text-zen-gold">Kyoto</strong><p>L\'antica capitale</p></div>', icon: createMarkerIcon('#DAA520') },
        hakone: { position: { lat: 35.2323, lng: 139.1069 }, title: 'Monte Fuji & Hakone', content: '<div class="font-cormorant p-2"><strong class="text-sakura">Hakone</strong><p>La montagna sacra</p></div>', icon: createMarkerIcon('#D4A574') },
        osaka: { position: { lat: 34.6937, lng: 135.5022 }, title: 'Osaka', content: '<div class="font-cormorant p-2"><strong class="text-japanese-red">Osaka</strong><p>La cucina del Giappone</p></div>', icon: createMarkerIcon('#B22222') }
    };

    for (const [key, loc] of Object.entries(locations)) {
        const marker = new google.maps.Marker({
            position: loc.position,
            map,
            title: loc.title,
            icon: loc.icon,
            animation: google.maps.Animation.DROP
        });

        const infoWindow = new google.maps.InfoWindow({ content: loc.content });

        marker.addListener('click', () => highlightLocation(key, true));
        markers[key] = { marker, infoWindow };
    }

    const path = new google.maps.Polyline({
        path: Object.values(locations).map(loc => loc.position),
        geodesic: true,
        strokeColor: '#D2691E',
        strokeOpacity: 0.8,
        strokeWeight: 3
    });
    path.setMap(map);
}

// Crea un'icona personalizzata per i marker
function createMarkerIcon(color) {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.9,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 10
    };
}

/**
 * Evidenzia una location sulla mappa e la card corrispondente.
 * @param {string} locationId - L'ID della location (es. 'tokyo').
 * @param {boolean} [triggeredByMap=false] - Se true, l'evento è stato scatenato da un click sulla mappa.
 */
function highlightLocation(locationId, triggeredByMap = false) {
    if (!markers[locationId]) return;

    if (activeInfoWindow) {
        activeInfoWindow.close();
    }

    const { marker, infoWindow } = markers[locationId];
    infoWindow.open(map, marker);
    activeInfoWindow = infoWindow;

    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 1500);

    map.panTo(marker.getPosition());
    map.setZoom(8);

    // Evidenzia la card e scorri se necessario
    const cardToHighlight = document.getElementById(`${locationId}-card`);
    if (cardToHighlight) {
        document.querySelectorAll('.card-hover.ring-4').forEach(card => {
            card.classList.remove('ring-4', 'ring-sakura', 'ring-opacity-50');
        });
        cardToHighlight.classList.add('ring-4', 'ring-sakura', 'ring-opacity-50');
        
        // Se l'evento non è scatenato dalla mappa, scrolla alla card
        if (!triggeredByMap) {
            cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// --- Funzioni e Gestori di Eventi ---
function toggleMobileMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('translate-x-full');
}

function smoothScrollTo(elementId) {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
}

// Modulo validazione e utilità
WeddingSite.Utils = {
    // Validazione IBAN migliorata
    validateIBAN(iban) {
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
        return ibanRegex.test(iban.replace(/\s/g, ''));
    },

    // Gestione errori centralizzata
    handleError(error, context = '') {
        console.error(`[${context}] Errore:`, error);
        // In produzione: inviare a servizio di monitoring
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error', {
                event_category: 'JavaScript',
                event_label: context,
                value: 1
            });
        }
    },

    // Debounce per performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

function copyIban() {
    const ibanTextEl = document.getElementById('iban-text');
    const copyBtn = document.getElementById('copy-btn');

    if (!ibanTextEl || !copyBtn) {
        WeddingSite.Utils.handleError('Elementi non trovati', 'copyIban');
        return;
    }

    const textToCopy = ibanTextEl.innerText.trim();

    // Validazione IBAN
    if (!WeddingSite.Utils.validateIBAN(textToCopy)) {
        WeddingSite.Utils.handleError('IBAN non valido', 'copyIban');
        return;
    }

    const updateButtonState = (message, type = 'success') => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = message;
        copyBtn.className = copyBtn.className.replace(/bg-\w+-\w+/,
            type === 'success' ? 'bg-green-500' : 'bg-red-500');

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.className = copyBtn.className.replace(/bg-\w+-\w+/, 'bg-zen-gold');
        }, 2000);
    };

    // Tracciamento analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'copy_iban', {
            event_category: 'engagement',
            event_label: 'contributi'
        });
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => updateButtonState('✓ Copiato!', 'success'))
            .catch(err => {
                WeddingSite.Utils.handleError(err, 'Clipboard API');
                updateButtonState('❌ Errore', 'error');
            });
    } else {
        // Fallback per browser legacy
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);

        try {
            textArea.select();
            const successful = document.execCommand('copy');
            updateButtonState(successful ? '✓ Copiato!' : '❌ Errore', successful ? 'success' : 'error');
        } catch (err) {
            WeddingSite.Utils.handleError(err, 'Fallback copy');
            updateButtonState('❌ Errore', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

function copyIntestatari() {
    const intestatariTextEl = document.getElementById('intestatari-text');
    const copyBtn = document.getElementById('copy-intestatari-btn');

    if (!intestatariTextEl || !copyBtn) {
        WeddingSite.Utils.handleError('Elementi non trovati', 'copyIntestatari');
        return;
    }

    const textToCopy = intestatariTextEl.innerText.trim();

    const updateButtonState = (message, type = 'success') => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = message;
        copyBtn.className = copyBtn.className.replace(/bg-\w+-\w+/,
            type === 'success' ? 'bg-green-500' : 'bg-red-500');

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.className = copyBtn.className.replace(/bg-\w+-\w+/, 'bg-zen-gold');
        }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => updateButtonState('✓ Copiato!', 'success'))
            .catch(err => {
                WeddingSite.Utils.handleError(err, 'Clipboard API');
                updateButtonState('❌ Errore', 'error');
            });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);

        try {
            textArea.select();
            const successful = document.execCommand('copy');
            updateButtonState(successful ? '✓ Copiato!' : '❌ Errore', successful ? 'success' : 'error');
        } catch (err) {
            WeddingSite.Utils.handleError(err, 'Fallback copy');
            updateButtonState('❌ Errore', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

function copyBanca() {
    const bancaTextEl = document.getElementById('banca-text');
    const copyBtn = document.getElementById('copy-banca-btn');

    if (!bancaTextEl || !copyBtn) {
        WeddingSite.Utils.handleError('Elementi non trovati', 'copyBanca');
        return;
    }

    const textToCopy = bancaTextEl.innerText.trim();

    const updateButtonState = (message, type = 'success') => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = message;
        copyBtn.className = copyBtn.className.replace(/bg-\w+-\w+/,
            type === 'success' ? 'bg-green-500' : 'bg-red-500');

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.className = copyBtn.className.replace(/bg-\w+-\w+/, 'bg-zen-gold');
        }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => updateButtonState('✓ Copiato!', 'success'))
            .catch(err => {
                WeddingSite.Utils.handleError(err, 'Clipboard API');
                updateButtonState('❌ Errore', 'error');
            });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);

        try {
            textArea.select();
            const successful = document.execCommand('copy');
            updateButtonState(successful ? '✓ Copiato!' : '❌ Errore', successful ? 'success' : 'error');
        } catch (err) {
            WeddingSite.Utils.handleError(err, 'Fallback copy');
            updateButtonState('❌ Errore', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// --- Modale Immagini ---
const imageModalData = {
    modal1: { src: 'https://www.info-turismo.it/wp-content/uploads/2019/06/hanami.jpg', caption: 'Ciliegi in fiore a Tokyo' },
    modal2: { src: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop', caption: 'Fushimi Inari Taisha, Kyoto' },
    modal3: { src: 'https://www.melarossa.it/wp-content/uploads/2020/10/ramen-giapponese-1140x570.jpg', caption: 'Ramen giapponese' },
    modal4: { src: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop', caption: 'Tokyo di notte' },
    modal5: { src: 'https://png.pngtree.com/background/20230615/original/pngtree-the-zen-garden-as-a-japanese-place-picture-image_3542915.jpg', caption: 'Giardino Zen' },
    modal6: { src: 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=400&h=300&fit=crop', caption: 'Cerimonia tradizionale giapponese' }
};

function openModal(modalId) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const data = imageModalData[modalId];

    if (modal && modalImage && modalCaption && data) {
        modalImage.src = data.src;
        modalCaption.textContent = data.caption;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}


// --- Wedding Countdown Function ---
function updateWeddingCountdown() {
    const weddingDate = new Date('May 23, 2026 00:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('countdown-days').textContent = '0';
        document.getElementById('countdown-hours').textContent = '0';
        document.getElementById('countdown-minutes').textContent = '0';
        document.getElementById('countdown-seconds').textContent = '0';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('countdown-days').textContent = days;
    document.getElementById('countdown-hours').textContent = hours;
    document.getElementById('countdown-minutes').textContent = minutes;
    document.getElementById('countdown-seconds').textContent = seconds;
}

// --- Advanced Micro-interactions ---
function createLoveCursor(e) {
    if (Math.random() > 0.98) { // 2% chance - meno frequente
        const cursor = document.createElement('div');
        cursor.className = 'love-cursor';
        cursor.style.left = (e.clientX + (Math.random() - 0.5) * 100) + 'px'; // Posizione random
        cursor.style.top = (e.clientY + (Math.random() - 0.5) * 100) + 'px'; // Posizione random
        document.body.appendChild(cursor);

        setTimeout(() => {
            cursor.remove();
        }, 4000); // Durata aumentata
    }
}

function addSparkleEffect(element) {
    element.classList.add('sparkle-container');
    for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        element.appendChild(sparkle);
    }
}

// --- Inizializzazione al caricamento del DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza subito i pulsanti scroll-to
    document.querySelectorAll('[data-scroll-to]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-scroll-to');
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Initialize countdown
    updateWeddingCountdown();
    setInterval(updateWeddingCountdown, 1000);

    // Love cursor effect
    document.addEventListener('mousemove', createLoveCursor);

    // Add sparkles to special elements
    document.querySelectorAll('.primary-button, .city-name').forEach(addSparkleEffect);

    // Parallax scrolling effect
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = [
            { element: document.querySelector('.header-bg'), speed: 0.5 },
            { element: document.querySelector('.floating-sakura-1'), speed: 0.3 },
            { element: document.querySelector('.floating-sakura-2'), speed: 0.4 },
            { element: document.querySelector('.floating-sakura-3'), speed: 0.35 },
            { element: document.querySelector('.floating-sakura-4'), speed: 0.45 }
        ];

        parallaxElements.forEach(({ element, speed }) => {
            if (element) {
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

  
    // Lazy loading per immagini ottimizzato
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;

                if (src) {
                    img.src = src;
                    img.classList.remove('lazy-loading');
                    img.classList.add('lazy-loaded');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Inizializza lazy loading per tutte le immagini con data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        img.classList.add('lazy-loading');
        imageObserver.observe(img);
    });

    // Registrazione Service Worker
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('SW registrato:', reg);
                    // Aggiorna quando disponibile
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Nuova versione disponibile
                                if (confirm('Nuova versione disponibile. Ricaricare?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch(err => console.log('Registrazione SW fallita:', err));
        });
    }

    // Animazioni on-scroll ottimizzate
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Usa requestAnimationFrame per performance ottimale
                requestAnimationFrame(() => {
                    entry.target.classList.add("is-visible");
                    // Rimuovi will-change dopo l'animazione
                    setTimeout(() => {
                        entry.target.style.willChange = 'auto';
                    }, 1000);
                });
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px' // Pre-carica anticipatamente
    });

    // Osserva solo elementi visibili inizialmente
    const animatedElements = document.querySelectorAll(".fade-in, .fade-in-up, .slide-in-left, .slide-in-right");
    animatedElements.forEach(el => {
        el.style.willChange = 'transform, opacity';
        animationObserver.observe(el);
    });

    // Gestione della modale
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) closeModal();
        });
        document.querySelector('button[onclick="closeModal()"]')?.addEventListener('click', closeModal);
    }

    // --- Gestione centralizzata degli eventi ---
    document.getElementById('mobile-menu-toggle')?.addEventListener('click', toggleMobileMenu);
    document.getElementById('mobile-menu-close')?.addEventListener('click', toggleMobileMenu);

    // Chiudi menu mobile quando si clicca su qualsiasi link
    document.querySelectorAll('.nav-link-mobile').forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu();
        });
    });

    document.getElementById('copy-btn')?.addEventListener('click', copyIban);
    document.getElementById('copy-intestatari-btn')?.addEventListener('click', copyIntestatari);
    document.getElementById('copy-banca-btn')?.addEventListener('click', copyBanca);
    document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

    // Gestione eventi con data-attributes
    document.body.addEventListener('click', (e) => {
        // Gallery modals
        const modalTarget = e.target.closest('[data-modal]');
        if (modalTarget) {
            openModal(modalTarget.dataset.modal);
            return;
        }

        // Itinerary cards
        const locationTarget = e.target.closest('[data-location]');
        if (locationTarget) {
            highlightLocation(locationTarget.dataset.location);
        }
    });
});
