document.addEventListener("DOMContentLoaded", () => {
  // Hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".nav-list");

  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      navList.classList.toggle("active");
      hamburger.textContent = navList.classList.contains("active") ? "✕" : "☰";
    });
  }

  // Contactformulier
  const contactForm = document.getElementById("contact-form");
  const submitBtn = document.querySelector(".submit-btn");

  if (!contactForm || !submitBtn) {
    console.error("Formulier of verzendknop niet gevonden in de DOM.");
    return;
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // reCAPTCHA check
    const recaptchaResponse =
      typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";
    if (!recaptchaResponse) {
      alert("Bevestig dat u geen robot bent (reCAPTCHA).");
      return;
    }

    // Haal waarden op
    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    const newsletter = document.getElementById("newsletter").checked;

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

    // Knop tijdelijk uitschakelen
    submitBtn.disabled = true;
    submitBtn.textContent = "Bezig met versturen...";

    // Timeoutbeveiliging
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
      alert(
        "Er is iets misgegaan bij het verzenden. Controleer uw internetverbinding of probeer het later opnieuw."
      );
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Verstuur Bericht";
  });
});
