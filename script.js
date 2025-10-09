document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    hamburger.addEventListener('click', () => {
        navList.classList.toggle('active');
        hamburger.textContent = navList.classList.contains('active') ? '✕' : '☰';
    });

    // EmailJS form submission
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        const newsletter = document.getElementById('newsletter').checked;

        const templateParams = {
            from_name: name,
            from_email: email,
            message: message,
            newsletter: newsletter ? 'Ja, aangemeld voor nieuwsbrief' : 'Nee, niet aangemeld voor nieuwsbrief'
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Bezig met versturen...';

        emailjs.send('service_zfo7hza', 'template_28mlibw', templateParams)
            .then((response) => {
                alert(`Bericht succesvol verzonden!\n\nNaam: ${name}\nE-mail: ${email}\nBericht: ${message}\nNieuwsbrief: ${templateParams.newsletter}`);
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verstuur Bericht';
            }, (error) => {
                alert('Er is een fout opgetreden bij het verzenden van het bericht. Probeer het later opnieuw.');
                console.error('EmailJS error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verstuur Bericht';
            });
    });
});
