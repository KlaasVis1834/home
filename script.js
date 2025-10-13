document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    hamburger.addEventListener('click', () => {
        navList.classList.toggle('active');
        hamburger.textContent = navList.classList.contains('active') ? '✕' : '☰';
    });

    // EmailJS form submission
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (!contactForm || !submitBtn) {
        console.error('Form of submit-knop niet gevonden in de DOM');
        return;
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Controleer of EmailJS geladen is
        if (typeof emailjs === 'undefined') {
            alert('EmailJS is niet geladen. Controleer de internetverbinding of probeer de pagina te herladen.');
            console.error('EmailJS niet geladen – controleer de CDN-link.');
            return;
        }

        // Verify reCAPTCHA
        const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
        if (!recaptchaResponse) {
            alert('Vul de reCAPTCHA in om te bevestigen dat u geen robot bent.');
            return;
        }

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        const newsletter = document.getElementById('newsletter').checked;

        if (!name || !email || !message) {
            alert('Vul alle verplichte velden in (naam, e-mail, bericht).');
            return;
        }

        const templateParams = {
            from_name: name,
            from_email: email,
            message: message,
            newsletter: newsletter ? 'Ja, aangemeld voor nieuwsbrief' : 'Nee, niet aangemeld voor nieuwsbrief',
            'g-recaptcha-response': recaptchaResponse
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Bezig met versturen...';

        // Timeout om oneindig laden te voorkomen
        const timeout = setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verstuur Bericht';
            alert('Verzenden duurt te lang. Probeer het later opnieuw.');
        }, 10000); // 10 seconden

        emailjs.send('service_zfo7hza', 'template_28mlibw', templateParams)
            .then((response) => {
                clearTimeout(timeout);
                alert(`Bericht succesvol verzonden!\n\nNaam: ${name}\nE-mail: ${email}\nBericht: ${message}\nNieuwsbrief: ${templateParams.newsletter}`);
                contactForm.reset();
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verstuur Bericht';
            })
            .catch((error) => {
                clearTimeout(timeout);
                alert('Er is een fout opgetreden bij het verzenden. Controleer de console voor details en probeer het later opnieuw.');
                console.error('EmailJS fout:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verstuur Bericht';
            });
    });
});
