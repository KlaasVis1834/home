(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  document.addEventListener('DOMContentLoaded', () => {
    /* ===========================
       HAMBURGER MENU
    =========================== */
    const hamburger = $('.hamburger');
    const navList = $('.nav-list');

    if (hamburger && navList) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-controls', 'main-navigation');

      if (!navList.id) {
        navList.id = 'main-navigation';
      }

      function toggleMenu(open) {
        const isOpen =
          typeof open === 'boolean' ? open : !navList.classList.contains('active');

        navList.classList.toggle('active', isOpen);
        hamburger.textContent = isOpen ? '✕' : '☰';
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      hamburger.addEventListener('click', (evt) => {
        evt.preventDefault();
        toggleMenu();
      });

      navList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
            toggleMenu(false);
          }
        });
      });

      document.addEventListener('click', (evt) => {
        if (!navList.classList.contains('active')) return;

        if (!evt.target.closest('.nav-list') && !evt.target.closest('.hamburger')) {
          toggleMenu(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('active')) {
          toggleMenu(false);
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && navList.classList.contains('active')) {
          toggleMenu(false);
        }
      });
    }

    /* ===========================
       CONTACTFORMULIER
       Alleen actief als formulier bestaat
    =========================== */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (contactForm && submitBtn) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const recaptchaResponse =
          typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';

        if (!recaptchaResponse) {
          alert('Bevestig dat u geen robot bent (reCAPTCHA).');
          return;
        }

        const nameField = document.getElementById('contact-name');
        const emailField = document.getElementById('contact-email');
        const messageField = document.getElementById('contact-message');
        const newsletterField = document.getElementById('newsletter');

        if (!nameField || !emailField || !messageField) {
          console.warn('Contactformulier velden niet gevonden.');
          return;
        }

        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const message = messageField.value.trim();
        const newsletter = newsletterField?.checked;

        if (!name || !email || !message) {
          alert('Vul alle verplichte velden in.');
          return;
        }

        const templateParams = {
          from_name: name,
          to_email: email,
          message: message,
          newsletter: newsletter
            ? 'Ja, aangemeld voor nieuwsbrief'
            : 'Nee, niet aangemeld',
          'g-recaptcha-response': recaptchaResponse
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Bezig met versturen...';

        const timeout = setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Verstuur Bericht';
          alert('Verzenden duurt te lang. Probeer het later opnieuw.');
        }, 12000);

        try {
          await emailjs.send(
            'service_zfo7hza',
            'template_28mlibw',
            templateParams,
            '7s23tMHc0wTVQEW3f'
          );

          clearTimeout(timeout);
          alert('✅ Bericht succesvol verzonden!');
          contactForm.reset();

          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
          }
        } catch (error) {
          clearTimeout(timeout);
          console.error('EmailJS fout:', error);
          alert('Er is iets misgegaan bij het verzenden. Probeer het later opnieuw.');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Verstuur Bericht';
      });
    }
  });
})();
