// ===========================
// HAMBURGER MENU
// ===========================
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');

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

  hamburger.addEventListener('click', (evt) => {
    evt.preventDefault();
    toggleMenu();
  });

  document.addEventListener('click', (evt) => {
    if (!navList.classList.contains('active')) return;
    if (!evt.target.closest('.nav-list') && !evt.target.closest('.hamburger')) toggleMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('active')) toggleMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navList.classList.contains('active')) toggleMenu(false);
  });
}

// ===========================
// EmailJS INITIALISEREN
// ===========================
emailjs.init("noRYJWEETvdqfI2sL");

// ===========================
// HANDTEKENING (SIGNATURE PAD)
// ===========================
const canvas = document.getElementById("signaturePad");
const signaturePad = new SignaturePad(canvas);
document.getElementById("clearSignature").addEventListener("click", () => signaturePad.clear());

// ===========================
// DYNAMISCHE FORMULIER LOGICA
// ===========================
document.querySelectorAll('.switch input[type="radio"]').forEach(input => {
  input.addEventListener('change', (e) => {
    const targetId = e.target.id;

    const toggle = (yesId, showId, hideId) => {
      if (targetId === `${yesId}Ja`) document.getElementById(showId).classList.remove("hidden");
      if (targetId === `${yesId}Nee`) document.getElementById(showId).classList.add("hidden");
      if (hideId) document.getElementById(hideId).classList.toggle("hidden", targetId === `${yesId}Ja`);
    };

    toggle("oppervlakte", "oppervlakteGroot", "kamers");
    toggle("audio", "audioBedrag");
    toggle("sieraden", "sieradenBedrag");
    toggle("bezittingen", "bezittingenBedrag");
    toggle("huur", "huurBedrag");
    toggle("eigenaar", "eigenaarBedrag");
  });
});

document.getElementById("woningType").addEventListener("change", (e) => {
  const value = e.target.value;
  document.getElementById("huurdersbelang").classList.add("hidden");
  document.getElementById("eigenaarsbelang").classList.add("hidden");
  if (value === "Huurwoning") document.getElementById("huurdersbelang").classList.remove("hidden");
  if (value === "Koopappartement") document.getElementById("eigenaarsbelang").classList.remove("hidden");
});

// ===========================
// FORMULIER VERZENDEN
// ===========================
document.getElementById("inventoryForm").addEventListener("submit", (e) => {
  e.preventDefault();

  document.getElementById("loadingScreen").style.display = "flex";

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const message = `
Polisnummer: ${data.polisnummer}
E-mailadres: ${data.email || "Niet opgegeven"}
Leeftijd hoofdkostwinner: ${data.leeftijd}
Gezinssamenstelling: ${data.gezinssamenstelling}
Netto maandinkomen: ${data.inkomen}
Oppervlakte woning > 300 m²: ${data.oppervlakte}
Aantal kamers: ${data.aantalKamers || "N.v.t."}
Totale oppervlakte: ${data.totaleOppervlakte || "N.v.t."}
Audiovisuele/computerapparatuur > €12.000: ${data.audio}
Extra bedrag audio: ${data.audioExtra || "N.v.t."}
Lijfsieraden > €6.000: ${data.sieraden}
Extra bedrag sieraden: ${data.sieradenExtra || "N.v.t."}
Bijzondere bezittingen > €15.000: ${data.bezittingen}
Extra bedrag bezittingen: ${data.bezittingenExtra || "N.v.t."}
Type woning: ${data.woningType}
Huurdersbelang > €6.000: ${data.huurdersbelang || "N.v.t."}
Extra bedrag huurdersbelang: ${data.huurExtra || "N.v.t."}
Eigenaarsbelang > €6.000: ${data.eigenaarsbelang || "N.v.t."}
Extra bedrag eigenaarsbelang: ${data.eigenaarExtra || "N.v.t."}
Handtekening: ${signaturePad.isEmpty() ? "Niet aanwezig" : "Aanwezig"}
`;

  const emailData = {
    message,
    to_email: data.email || "rbuijs@klaasvis.nl"
  };

  const sendToMe = emailjs.send("service_lpsiijc", "template_l7dk1hc", { message });
  const sendToClient = emailjs.send("service_lpsiijc", "template_ksj01md", emailData);

  Promise.all([sendToMe, sendToClient])
    .then(() => {
      setTimeout(() => {
        window.location.href = "https://www.klaasvis.nl";
      }, 2000);
    })
    .catch(err => {
      console.error("Fout bij verzenden:", err);
      document.getElementById("loadingScreen").style.display = "none";
      alert("Er is een fout opgetreden bij het verzenden.");
    });
});
