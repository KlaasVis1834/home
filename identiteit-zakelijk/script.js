

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
      if (!navList.id) navList.id = 'main-navigation';

      function toggleMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : !navList.classList.contains('active');
        navList.classList.toggle('active', isOpen);
        hamburger.textContent = isOpen ? '✕' : '☰';
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      const pointerHandler = (evt) => {
        if (evt.target.closest('.hamburger')) {
          evt.preventDefault();
          toggleMenu();
        }
      };

      const linkClickHandler = (evt) => {
        if (evt.target.closest('.nav-list a')) setTimeout(() => toggleMenu(false), 100);
      };

      const outsideClickHandler = (evt) => {
        if (!navList.classList.contains('active')) return;
        if (!evt.target.closest('.nav-list') && !evt.target.closest('.hamburger')) toggleMenu(false);
      };

      hamburger.addEventListener('pointerdown', pointerHandler);
      hamburger.addEventListener('click', pointerHandler);
      navList.addEventListener('click', linkClickHandler);
      document.addEventListener('pointerdown', outsideClickHandler);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('active')) toggleMenu(false);
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navList.classList.contains('active')) toggleMenu(false);
      });
    }

    /* ===========================
       CONTACTFORMULIER (EmailJS + reCAPTCHA)
    =========================== */
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.querySelector(".submit-btn");

    if (!contactForm || !submitBtn) return;

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const recaptchaResponse =
        typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";
      if (!recaptchaResponse) {
        alert("Bevestig dat u geen robot bent (reCAPTCHA).");
        return;
      }

      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const message = document.getElementById("contact-message").value.trim();
      const newsletter = document.getElementById("newsletter")?.checked;

      if (!name || !email || !message) {
        alert("Vul alle verplichte velden in.");
        return;
      }

      const templateParams = {
        from_name: name,
        to_email: email,
        message: message,
        newsletter: newsletter
          ? "Ja, aangemeld voor nieuwsbrief"
          : "Nee, niet aangemeld",
        "g-recaptcha-response": recaptchaResponse,
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Bezig met versturen...";

      const timeout = setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Verstuur Bericht";
        alert("Verzenden duurt te lang. Probeer het later opnieuw.");
      }, 12000);

      try {
        const response = await emailjs.send(
          "service_zfo7hza",
          "template_28mlibw",
          templateParams,
          "7s23tMHc0wTVQEW3f"
        );

        clearTimeout(timeout);
        alert("✅ Bericht succesvol verzonden!");
        contactForm.reset();
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      } catch (error) {
        clearTimeout(timeout);
        console.error("EmailJS fout:", error);
        alert("Er is iets misgegaan bij het verzenden. Probeer het later opnieuw.");
      }

      submitBtn.disabled = false;
      submitBtn.textContent = "Verstuur Bericht";
    }
      function showUboFields() {
  const aantal = document.getElementById("aantal_ubo").value;
  const container = document.getElementById("ubo-container");
  container.innerHTML = "";

  if (!aantal) return;

  for (let i = 1; i <= Math.min(aantal, 4); i++) {
    const fieldset = document.createElement("fieldset");
    fieldset.innerHTML = `
      <legend>Persoon ${i} ${i === 1 ? "*" : ""}</legend>
      <div class="form-group">
        <label>Naam ${i === 1 ? "*" : ""}</label>
        <input type="text" name="ubo_naam_${i}" ${i===1?'required':''}>
      </div>
      <div class="form-group">
        <label>Adres ${i === 1 ? "*" : ""}</label>
        <input type="text" name="ubo_adres_${i}" ${i===1?'required':''}>
      </div>
      <div class="form-group">
        <label>Geboortedatum ${i === 1 ? "*" : ""}</label>
        <input type="date" name="ubo_geboorte_${i}" ${i===1?'required':''}>
      </div>
      <div class="form-group">
        <label>Nationaliteit ${i === 1 ? "*" : ""}</label>
        <input type="text" name="ubo_nationaliteit_${i}" ${i===1?'required':''}>
      </div>
      <div class="form-group">
        <label>Zeggenschap / belang (%) ${i === 1 ? "*" : ""}</label>
        <input type="number" min="25" max="100" name="ubo_percentage_${i}" ${i===1?'required':''}>
      </div>
    `;
    container.appendChild(fieldset);
  }

  if (aantal > 4) {
    container.innerHTML += `<p style="color:#d00;"><strong>Meer dan 4 UBO's?</strong> Vul de eerste 4 in en mail de rest naar info@klaasvis.nl</p>`;
  }
}
    });
  });
})();
