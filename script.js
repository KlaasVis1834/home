document.addEventListener('DOMContentLoaded', () => {
    // ===== MENU HAMBURGER =====
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    hamburger.addEventListener('click', () => {
        navList.classList.toggle('active');
        hamburger.textContent = navList.classList.contains('active') ? '✕' : '☰';
    });

    // ===== CONTACTFORMULIER (met EmailJS + reCAPTCHA) =====
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Controleer reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert("Bevestig dat u geen robot bent (klik op de reCAPTCHA).");
            return;
        }

        // Formuliervelden
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        const newsletter = document.getElementById('newsletter').checked;

        if (!name || !email || !message) {
            alert("Vul alle velden in voordat u het formulier verstuurt.");
            return;
        }

        // Template parameters
        const templateParams = {
            from_name: name,
            from_email: email,
            message: message,
            newsletter: newsletter ? 'Ja, aangemeld voor nieuwsbrief' : 'Nee, niet aangemeld voor nieuwsbrief'
        };

        // Knop tijdelijk uitschakelen
        submitBtn.disabled = true;
        submitBtn.textContent = 'Bezig met versturen...';

        // EmailJS verzenden
        emailjs.send('service_zfo7hza', 'template_28mlibw', templateParams)
            .then(() => {
                alert(`Bericht succesvol verzonden! We nemen spoedig contact met u op.`);
                contactForm.reset();
                grecaptcha.reset(); // reset de reCAPTCHA
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verstuur Bericht';
            })
            .catch((error) => {
                console.error("EmailJS fout:", error);
                alert("Er is iets misgegaan bij het versturen. Probeer het opnieuw of mail naar info@klaasvis.nl.");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verstuur Bericht';
            });
    });

    // ===== CHATBASE CHATBOT =====
    (function () {
        if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
            window.chatbase = (...args) => {
                if (!window.chatbase.q) window.chatbase.q = [];
                window.chatbase.q.push(args);
            };
            window.chatbase = new Proxy(window.chatbase, {
                get(target, prop) {
                    if (prop === 'q') return target.q;
                    return (...args) => target(prop, ...args);
                }
            });
        }
        const onLoad = function () {
            const script = document.createElement('script');
            script.src = 'https://www.chatbase.co/embed.min.js';
            script.id = 'C60jEJW_QuVD7X3vE5rzE';
            script.setAttribute('domain', 'www.chatbase.co');
            document.body.appendChild(script);
        };
        if (document.readyState === 'complete') onLoad();
        else window.addEventListener('load', onLoad);
    })();
});
