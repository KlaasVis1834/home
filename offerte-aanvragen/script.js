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

    if (contactForm && submitBtn) {
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const recaptchaResponse =
          typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";

        if (!recaptchaResponse) {
          alert("Bevestig dat u geen robot bent (reCAPTCHA).");
          return;
        }

        const name = document.getElementById("contact-name")?.value.trim();
        const email = document.getElementById("contact-email")?.value.trim();
        const phone = document.getElementById("contact-phone")?.value.trim();
        const subject = document.getElementById("contact-subject")?.value.trim();
        const message = document.getElementById("contact-message")?.value.trim();
        const privacyCheck = document.getElementById("privacy-check")?.checked;

        if (!name || !email || !message) {
          alert("Vul alle verplichte velden in.");
          return;
        }

        if (!privacyCheck) {
          alert("U moet akkoord gaan met het privacybeleid.");
          return;
        }

        const templateParams = {
          from_name: name,
          from_email: email,
          reply_to: email,
          phone: phone || "Niet ingevuld",
          subject: subject || "Geen onderwerp gekozen",
          message: message,
          privacy_accepted: "Ja",
        };

        submitBtn.disabled = true;
        submitBtn.textContent = "Bezig met versturen...";

        const timeout = setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Verstuur bericht";
          alert("Verzenden duurt te lang. Probeer het later opnieuw.");
        }, 12000);

        try {
          await emailjs.send(
            "service_zfo7hza",
            "template_28mlibw",
            templateParams,
            "7s23tMHc0wTVQEW3f"
          );

          clearTimeout(timeout);
          alert("✅ Bericht succesvol verzonden!");
          contactForm.reset();

          if (typeof grecaptcha !== "undefined") {
            grecaptcha.reset();
          }
        } catch (error) {
          clearTimeout(timeout);
          console.error("EmailJS fout:", error);
          alert("Er is iets misgegaan bij het verzenden. Probeer het later opnieuw.");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Verstuur bericht";
        }
      });
    }

    /* ===========================
       OFFERTE AANVRAGEN PAGINA
    =========================== */
    const STORAGE_KEY = "klaasvis_offer_data";
    const tabButtons = document.querySelectorAll(".tab-button");
    const offerButtons = document.querySelectorAll("[data-offer-type]");
    const insuranceCheckboxes = document.querySelectorAll('.insurance-item input[type="checkbox"]');

    if (tabButtons.length) {
      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const tabsWrapper = button.closest(".insurance-tabs");
          const targetId = button.dataset.tabTarget;

          if (!tabsWrapper || !targetId) return;

          tabsWrapper.querySelectorAll(".tab-button").forEach((btn) => {
            btn.classList.remove("active");
          });

          tabsWrapper.querySelectorAll(".tab-content").forEach((content) => {
            content.classList.remove("active");
          });

          button.classList.add("active");

          const target = tabsWrapper.querySelector("#" + targetId);
          if (target) {
            target.classList.add("active");
          }
        });
      });
    }

    function updateSummary(groupName) {
      const summary = document.getElementById(`summary-${groupName}`);
      if (!summary) return;

      const selected = Array.from(
        document.querySelectorAll(`input[data-type="${groupName}"]:checked`)
      ).map((input) => input.value);

      if (selected.length === 0) {
        summary.classList.remove("active");
        summary.innerHTML = "";
        return;
      }

      summary.classList.add("active");
      summary.innerHTML = `<strong>Geselecteerd:</strong> ${selected.join(", ")}`;
    }

    if (insuranceCheckboxes.length) {
      insuranceCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const groupName = checkbox.dataset.type;
          if (groupName) {
            updateSummary(groupName);
          }
        });
      });
    }

    if (offerButtons.length) {
      offerButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const type = button.dataset.offerType;

          const selected = Array.from(
            document.querySelectorAll(`input[data-type="${type}"]:checked`)
          ).map((input) => input.value);

          if (selected.length === 0) {
            alert("Selecteer eerst minimaal één verzekering.");
            return;
          }

          const offerData = {
            type,
            selectedInsurances: selected,
            insuranceDetails: {},
            personalData: {}
          };

          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(offerData));

          if (type === "particulier") {
            window.location.href = "/offerte-details-particulier/";
            return;
          }

          if (type === "zakelijk") {
            window.location.href = "/offerte-details-zakelijk/";
            return;
          }

          if (type === "inkomen") {
            window.location.href = "/offerte-details-inkomen/";
          }
        });
      });
    }
  });
})();
