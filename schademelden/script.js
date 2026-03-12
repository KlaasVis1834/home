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
       SCHADEFORMULIER VERZENDEN
    =========================== */
    const schadeForm = document.getElementById('schade-form');
    const messageDiv = document.getElementById('form-message');

    if (!schadeForm || !messageDiv) return;

    schadeForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const form = this;
      const fileInput = document.getElementById('bijlagen');
      const submitButton = form.querySelector('button[type="submit"]');

      const recaptchaResponse =
        typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';

      if (!recaptchaResponse || recaptchaResponse.length === 0) {
        messageDiv.textContent = '❗ Bevestig eerst dat u geen robot bent.';
        messageDiv.style.color = '#dc3545';
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (submitButton) submitButton.disabled = true;
      messageDiv.textContent = 'Bezig met verzenden...';
      messageDiv.style.color = '#007bff';

      const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim() || 'Niet opgegeven',
        insurance: form.insurance.value,
        polisnummer: form.polisnummer.value.trim(),
        datum: form.datum.value,
        beschrijving: form.beschrijving.value.trim(),
        to_email: form.email.value.trim(),
        to_email_mij: 'rbuijs@klaasvis.nl',
        bijlagen_data: []
      };

      formData.message = `
Nieuwe schademelding ontvangen:

- Naam: ${formData.name}
- E-mail: ${formData.email}
- Telefoon: ${formData.phone}
- Verzekering: ${formData.insurance}
- Polisnummer: ${formData.polisnummer}
- Schadedatum: ${formData.datum}
- Beschrijving: ${formData.beschrijving}
`;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.to_email)) {
        messageDiv.textContent = 'Fout: Ongeldig e-mailadres.';
        messageDiv.style.color = '#dc3545';
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (!window.emailjs) {
        messageDiv.textContent = 'Fout: EmailJS niet geladen.';
        messageDiv.style.color = '#dc3545';
        if (submitButton) submitButton.disabled = false;
        return;
      }

      const maxFileSize = 1 * 1024 * 1024; // 1 MB
      const maxFiles = 5;
      let oversizeFiles = false;

      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        if (fileInput.files.length > maxFiles) {
          messageDiv.textContent = `Fout: Maximaal ${maxFiles} bestanden toegestaan.`;
          messageDiv.style.color = '#dc3545';
          if (submitButton) submitButton.disabled = false;
          return;
        }

        formData.message += '\nBijlagen:\n';

        for (const file of fileInput.files) {
          if (file.size > maxFileSize) {
            oversizeFiles = true;
            formData.message += `- ${file.name} (te groot, >1MB)\n`;
            continue;
          }

          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          formData.bijlagen_data.push({
            name: file.name,
            type: file.type,
            base64: base64
          });

          formData.message += `- ${file.name}\n`;
        }
      } else {
        formData.message += '\nBijlagen: Geen';
      }

      try {
        await emailjs.send('service_h6az3sj', 'template_naxxu2a', formData);
        await emailjs.send('service_h6az3sj', 'template_yqe7y7e', formData);

        messageDiv.textContent = '✅ Schade succesvol gemeld! Wij nemen spoedig contact met u op.';
        messageDiv.style.color = '#28a745';
        form.reset();

        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
      } catch (error) {
        console.error('EmailJS fout:', error);
        messageDiv.textContent = '❌ Fout bij verzenden. Probeer het later opnieuw.';
        messageDiv.style.color = '#dc3545';
      } finally {
        if (submitButton) submitButton.disabled = false;

        if (oversizeFiles) {
          messageDiv.textContent += ' Let op: sommige bestanden waren te groot (>1MB).';
        }
      }
    });
  });
})();
