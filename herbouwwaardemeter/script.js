// EmailJS initialiseren
emailjs.init("noRYJWEETvdqfI2sL");

// Signature Pad initialiseren
const canvas = document.getElementById("signaturePad");
const signaturePad = new SignaturePad(canvas);
document.getElementById("clearSignature").addEventListener("click", () => signaturePad.clear());

// Accordion functionaliteit
const accordionToggle = document.querySelector(".accordion-toggle");
const accordionContent = document.querySelector(".accordion-content");
accordionToggle.addEventListener("click", () => {
    accordionContent.classList.toggle("active");
});

// Inhoudsberekening automatisch updaten
function calculateContent(prefix) {
    const lengte = parseFloat(document.getElementById(`${prefix}_lengte`).value) || 0;
    const breedte = parseFloat(document.getElementById(`${prefix}_breedte`).value) || 0;
    const hoogte = parseFloat(document.getElementById(`${prefix}_hoogte`).value) || 0;
    const inhoud = lengte * breedte * hoogte;
    document.getElementById(`${prefix}_inhoud`).value = inhoud.toFixed(1);

    updateTotalContent();
}

function updateTotalContent() {
    const bg_inhoud = parseFloat(document.getElementById("bg_inhoud").value) || 0;
    const v_inhoud = parseFloat(document.getElementById("v_inhoud").value) || 0;
    const z_inhoud = parseFloat(document.getElementById("z_inhoud").value) || 0;
    const k_inhoud = parseFloat(document.getElementById("k_inhoud").value) || 0;
    const totale_inhoud = bg_inhoud + v_inhoud + z_inhoud + k_inhoud;
    document.getElementById("totale_inhoud").value = totale_inhoud.toFixed(1);
}

["bg", "v", "z", "k"].forEach(prefix => {
    ["lengte", "breedte", "hoogte"].forEach(dim => {
        document.getElementById(`${prefix}_${dim}`).addEventListener("input", () => calculateContent(prefix));
    });
});

// Dynamische weergave logica voor toeslag
document.querySelectorAll('.switch input[name="toeslag"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const toeslagVerklaring = document.getElementById("toeslag_verklaring");
        if (e.target.id === "toeslag_ja") {
            toeslagVerklaring.classList.remove("hidden");
        } else {
            toeslagVerklaring.classList.add("hidden");
        }
    });
});

// Formulier verzenden
document.getElementById("rebuildForm").addEventListener("submit", (e) => {
    e.preventDefault();

    // Toon loadingscreen
    document.getElementById("loadingScreen").style.display = "flex";

    const formData = new FormData(e.target);
    const data = {
        polisnummer: formData.get("polisnummer"),
        email: formData.get("email") || "", // Optioneel e-mailadres
        bg_lengte: formData.get("bg_lengte") || "N.v.t.",
        bg_breedte: formData.get("bg_breedte") || "N.v.t.",
        bg_hoogte: formData.get("bg_hoogte") || "N.v.t.",
        bg_inhoud: formData.get("bg_inhoud") || "N.v.t.",
        v_lengte: formData.get("v_lengte") || "N.v.t.",
        v_breedte: formData.get("v_breedte") || "N.v.t.",
        v_hoogte: formData.get("v_hoogte") || "N.v.t.",
        v_inhoud: formData.get("v_inhoud") || "N.v.t.",
        z_lengte: formData.get("z_lengte") || "N.v.t.",
        z_breedte: formData.get("z_breedte") || "N.v.t.",
        z_hoogte: formData.get("z_hoogte") || "N.v.t.",
        z_inhoud: formData.get("z_inhoud") || "N.v.t.",
        k_lengte: formData.get("k_lengte") || "N.v.t.",
        k_breedte: formData.get("k_breedte") || "N.v.t.",
        k_hoogte: formData.get("k_hoogte") || "N.v.t.",
        k_inhoud: formData.get("k_inhoud") || "N.v.t.",
        totale_inhoud: formData.get("totale_inhoud") || "N.v.t.",
        type_woning: formData.get("type_woning"),
        inhoud_eigen: formData.get("inhoud_eigen") || "N.v.t.",
        inhoud_woz: formData.get("inhoud_woz") || "N.v.t.",
        afwerkingsniveau: formData.get("afwerkingsniveau"),
        m3_prijs: formData.get("m3_prijs"),
        toeslag: formData.get("toeslag"),
        toeslag_uitleg: formData.get("toeslag_uitleg") || "N.v.t.",
        losse_inhoud_eigen: formData.get("losse_inhoud_eigen") || "N.v.t.",
        losse_inhoud_woz: formData.get("losse_inhoud_woz") || "N.v.t.",
        handtekening: signaturePad.isEmpty() ? "Niet aanwezig" : "Aanwezig"
    };

    // Maak een nette samenvatting voor de e-mail
    const message = `
        Polisnummer: ${data.polisnummer}
        E-mailadres: ${data.email || "Niet opgegeven"}
        Inhoudsberekening:
        - Begane grond: Lengte: ${data.bg_lengte} m, Breedte: ${data.bg_breedte} m, Hoogte: ${data.bg_hoogte} m, Inhoud: ${data.bg_inhoud} m³
        - Verdieping: Lengte: ${data.v_lengte} m, Breedte: ${data.v_breedte} m, Hoogte: ${data.v_hoogte} m, Inhoud: ${data.v_inhoud} m³
        - Zolder: Lengte: ${data.z_lengte} m, Breedte: ${data.z_breedte} m, Hoogte: ${data.z_hoogte} m, Inhoud: ${data.z_inhoud} m³
        - Kelder/Souterrain: Lengte: ${data.k_lengte} m, Breedte: ${data.k_breedte} m, Hoogte: ${data.k_hoogte} m, Inhoud: ${data.k_inhoud} m³
        - Totale inhoud: ${data.totale_inhoud} m³
        Herbouwwaardeberekening:
        - Type woning: ${data.type_woning}
        - Inhoud m³ conform eigen berekening: ${data.inhoud_eigen}
        - Inhoud m³ conform WOZ-beschikking: ${data.inhoud_woz}
        - Afwerkingsniveau: ${data.afwerkingsniveau}
        - m³ prijs: €${data.m3_prijs}
        - Recht op toeslag/korting: ${data.toeslag}
        - Toelichting toeslag/korting: ${data.toeslag_uitleg}
        Losse gebouwen:
        - Inhoud m³ conform eigen berekening: ${data.losse_inhoud_eigen}
        - Inhoud m³ conform WOZ-beschikking: ${data.losse_inhoud_woz}
        Handtekening: ${data.handtekening}
    `;

    // Bepaal het e-mailadres: klant of standaard rbuijs@klaasvis.nl
    const toEmail = data.email ? data.email : "rbuijs@klaasvis.nl";
    const emailData = {
        message: message,
        to_email: toEmail
    };

    // Verzenden naar jou (template_l7dk1hc)
    const sendToMe = emailjs.send("service_lpsiijc", "template_l7dk1hc", { message: message });
    // Verzenden naar klant of rbuijs@klaasvis.nl (template_ksj01md)
    const sendToClient = emailjs.send("service_lpsiijc", "template_ksj01md", emailData);

    Promise.all([sendToMe, sendToClient])
        .then(() => {
            setTimeout(() => {
                window.location.href = "https://www.klaasvis.nl";
            }, 2000); // 2 seconden delay voor redirect
        })
        .catch(err => {
            console.error("Fout bij verzenden:", err);
            document.getElementById("loadingScreen").style.display = "none";
            alert("Er is een fout opgetreden bij het verzenden.");
        });
});
