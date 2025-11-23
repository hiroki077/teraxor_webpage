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
const hoverElements = document.querySelectorAll('a, button, .service-card, .team-member');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('hover');
    });
});

// Navigation scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    // Check if in white section
    const aboutTop = document.getElementById('about').offsetTop;
    const contactTop = document.getElementById('contact').offsetTop;
    
    if (scrollY >= aboutTop - 100 && scrollY < contactTop - 100) {
        nav.classList.add('light');
    } else {
        nav.classList.remove('light');
    }
});

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
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
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
document.querySelectorAll('.team-member, .service-card, .about-lead, .about-text').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
});
