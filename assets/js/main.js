// ==================== NAVIGATION MENU ==================== 
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');

        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });

        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');

        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    }
});

dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = toggle.closest('.dropdown');
        if (dropdown) {
            dropdown.classList.toggle('open');
        }
    });
});

// ==================== SMOOTH SCROLLING ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== SCROLL TO TOP BUTTON ==================== 
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== CONTACT FORM ==================== 
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);

        // Show success message
        alert('Thank you for your message! We will get back to you soon.');

        // Reset form
        contactForm.reset();
    });
}

// ==================== ACTIVE NAV LINK ON SCROLL ==================== 
window.addEventListener('scroll', () => {
    let current = '';

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ==================== LAZY LOADING FOR IMAGES ==================== 
if ('IntersectionObserver' in window) {
    const imageElements = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    imageElements.forEach(img => imageObserver.observe(img));
}

// ==================== ANIMATION ON SCROLL ==================== 
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .portfolio-item, .team-member').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== PREVENT FORM SUBMISSION FROM REDIRECTING ==================== 
document.querySelectorAll('form').forEach(form => {
    if (form.hasAttribute('data-skip-auto')) {
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim() && input.required) {
                isValid = false;
                input.style.borderColor = '#ff6b6b';
            } else {
                input.style.borderColor = '';
            }
        });

        if (isValid) {
            alert('Thank you for your message! We will contact you soon.');
            form.reset();
        }
    });
});

// ==================== INITIALIZE ==================== 
console.log('Az Meer® website loaded successfully!');

// ==================== LOGIN MODAL (OPTIONAL) ====================
const loginModal = document.getElementById('loginModal');
const openLogin = document.getElementById('openLogin');
const closeLogin = document.getElementById('closeLogin');
const loginPopupForm = document.getElementById('loginPopupForm');
const popupLoginMessage = document.getElementById('popupLoginMessage');

function showLoginModal() {
    if (!loginModal) return;
    loginModal.classList.add('show');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove('show');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function updateLoginButton() {
    if (!openLogin || !window.AbhAuth) return;
    const session = window.AbhAuth.getSession();
    if (session && session.username) {
        openLogin.textContent = 'Profile';
        openLogin.dataset.profile = 'true';
    } else {
        openLogin.textContent = 'Login';
        openLogin.removeAttribute('data-profile');
    }
}

if (openLogin) {
    openLogin.addEventListener('click', () => {
        if (openLogin.dataset.profile === 'true') {
            window.location.href = 'profile.html';
            return;
        }
        showLoginModal();
    });
}

if (loginModal) {
    loginModal.addEventListener('click', (event) => {
        if (event.target && event.target.dataset && event.target.dataset.close === 'login') {
            hideLoginModal();
        }
    });
}

if (closeLogin) {
    closeLogin.addEventListener('click', hideLoginModal);
}

if (loginPopupForm) {
    loginPopupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!window.AbhAuth) {
            return;
        }
        popupLoginMessage.textContent = '';
        const username = document.getElementById('popupUsername').value.trim();
        const password = document.getElementById('popupPassword').value.trim();
        const result = window.AbhAuth.login(username, password);
        if (!result.ok) {
            popupLoginMessage.textContent = result.message || 'Unable to login.';
            return;
        }
        updateLoginButton();
        hideLoginModal();
        window.location.href = 'profile.html';
    });
}

updateLoginButton();