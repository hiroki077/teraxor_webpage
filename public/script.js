// JS state flags
document.body.classList.remove('no-js');
document.body.classList.add('js-enabled');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const enableFullpageSnap = !prefersReducedMotion.matches;
const heroSection = document.getElementById('hero');
const aboutSection = document.getElementById('about');
const pageTransition = document.getElementById('pageTransition');

// Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';

    cursorOutline.style.left = e.clientX + 'px';
    cursorOutline.style.top = e.clientY + 'px';
});

// Cursor hover
const hoverElements = document.querySelectorAll('a, button, .service-card, .team-member, .vision-card, .news-item');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('hover');
    });
});

// Navigation scroll effect — toggle scrolled / light by current section background
const nav = document.getElementById('nav');
// Sections explicitly marked as light-background; nav should switch to dark-on-light
const lightSectionIds = ['about', 'products', 'vision', 'team', 'company'];
const lightSections = lightSectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

const updateNavState = () => {
    const scrollY = window.scrollY;
    if (scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    // Detect if the area just under the nav is over a light section
    const probeY = scrollY + 60;
    const overLight = lightSections.some(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        return probeY >= top && probeY < bottom;
    });

    if (overLight) {
        nav.classList.add('light');
    } else {
        nav.classList.remove('light');
    }
};

updateNavState();
window.addEventListener('scroll', updateNavState, { passive: true });

// Helper: ensure about visible once reached
const ensureAboutVisibility = () => {
    if (!aboutSection) return;
    const triggerPoint = window.scrollY + window.innerHeight * 0.6;
    if (triggerPoint >= aboutSection.offsetTop) {
        aboutSection.classList.add('about-visible');
    }
};

ensureAboutVisibility();
window.addEventListener('scroll', ensureAboutVisibility, { passive: true });

// Full-page snap between hero and about with soft fade
let isSnapping = false;
const snapToSection = (target) => {
    if (!enableFullpageSnap || !target || isSnapping) return false;
    isSnapping = true;
    if (pageTransition) {
        pageTransition.classList.add('active');
    }
    if (target === aboutSection) {
        aboutSection.classList.add('about-visible');
    }
    window.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth'
    });
    setTimeout(() => {
        if (pageTransition) {
            pageTransition.classList.remove('active');
        }
        isSnapping = false;
    }, 700);
    return true;
};

if (heroSection && aboutSection && enableFullpageSnap) {
    window.addEventListener('wheel', (e) => {
        if (isSnapping) {
            e.preventDefault();
            return;
        }
        const scrollY = window.scrollY;
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        // scroll down from hero to about
        if (scrollY < heroBottom - 50 && e.deltaY > 0) {
            e.preventDefault();
            snapToSection(aboutSection);
        }
        // scroll up from about to hero
        if (scrollY <= aboutSection.offsetTop + 50 && e.deltaY < 0) {
            e.preventDefault();
            snapToSection(heroSection);
        }
    }, { passive: false });
}

// Smooth scroll (anchors) with snap support for ABOUT
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            if (target === aboutSection && snapToSection(target)) {
                return;
            }
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            if (target === aboutSection) {
                aboutSection.classList.add('about-visible');
            }
        }
    });
});

// Logo animation on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroLogo = document.querySelector('.hero-logo img');
    if (heroLogo) {
        heroLogo.style.transform = `rotate(${scrolled * 0.1}deg) scale(${1 - scrolled * 0.0005})`;
    }
});

// Instantly switch to sections (no scroll-triggered animations)
document.querySelectorAll('.team-member, .service-card, .about-lead, .about-text, .vision-card, .news-item').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
});

/* ---------- i18n: JA / EN switcher ---------- */
const STORAGE_KEY = 'teraxor.lang';

const captureOriginals = () => {
    document.querySelectorAll('[data-en]').forEach(el => {
        if (el.dataset.ja === undefined) {
            el.dataset.ja = el.innerHTML;
        }
    });
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
        if (el.dataset.placeholderJa === undefined) {
            el.dataset.placeholderJa = el.getAttribute('placeholder') || '';
        }
    });
};

const applyLang = (lang) => {
    const useEn = lang === 'en';
    document.documentElement.lang = useEn ? 'en' : 'ja';

    document.querySelectorAll('[data-en]').forEach(el => {
        const next = useEn ? el.dataset.en : el.dataset.ja;
        if (next !== undefined && el.innerHTML !== next) {
            el.innerHTML = next;
        }
    });

    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
        const next = useEn ? el.dataset.placeholderEn : el.dataset.placeholderJa;
        if (next !== undefined) {
            el.setAttribute('placeholder', next);
        }
    });

    document.querySelectorAll('.lang-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });
};

const detectInitialLang = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ja' || saved === 'en') return saved;
    const browser = (navigator.language || 'ja').toLowerCase();
    return browser.startsWith('ja') ? 'ja' : 'en';
};

captureOriginals();
let currentLang = detectInitialLang();
applyLang(currentLang);

const langToggle = document.getElementById('langToggle');
if (langToggle) {
    langToggle.addEventListener('click', (e) => {
        // Allow clicking a specific JA/EN label, otherwise toggle
        const target = e.target.closest('.lang-opt');
        const next = target && target.dataset.lang
            ? target.dataset.lang
            : (currentLang === 'ja' ? 'en' : 'ja');
        if (next === currentLang) return;
        currentLang = next;
        localStorage.setItem(STORAGE_KEY, currentLang);
        applyLang(currentLang);
    });
}
