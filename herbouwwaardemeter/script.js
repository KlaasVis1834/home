// EmailJS initialiseren
emailjs.init("noRYJWEETvdqfI2sL");

document.addEventListener("DOMContentLoaded", () => {
    // Mobiele navigatie
    const hamburger = document.querySelector(".hamburger");
    const navList = document.querySelector(".nav-list");

    if (hamburger && navList) {
        hamburger.addEventListener("click", () => {
            navList.classList.toggle("active");
            hamburger.setAttribute(
                "aria-expanded",
                navList.classList.contains("active") ? "true" : "false"
            );
        });

        navList.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navList.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", (e) => {
            const clickedInsideNav = navList.contains(e.target);
            const clickedHamburger = hamburger.contains(e.target);

            if (!clickedInsideNav && !clickedHamburger) {
                navList.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
            }
        });
    }

    // Signature Pad initialiseren
    const canvas = document.getElementById("signaturePad");
    let signaturePad = null;

    if (canvas) {
        signaturePad = new SignaturePad(canvas);
    }

    const clearBtn = document.getElementById("clearSignature");
    if (clearBtn && signaturePad) {
        clearBtn.addEventListener("click", () => signaturePad.clear());
    }

    // Accordion functionaliteit
    const accordionToggle = document.querySelector(".accordion-toggle");
    const accordionContent = document.querySelector(".accordion-content");

    if (accordionToggle && accordionContent) {
        accordionToggle.addEventListener("click", () => {
            accordionContent.classList.toggle("active");
        });
    }

    // Inhoudsberekening automatisch updaten
    function calculateContent(prefix) {
        const lengte = parseFloat(document.getElementById(`${prefix}_lengte`)?.value) || 0;
        const breedte = parseFloat(document.getElementById(`${prefix}_breedte`)?.value) || 0;
        const hoogte = parseFloat(document.getElementById(`${prefix}_hoogte`)?.value) || 0;
        const inhoud = lengte * breedte * hoogte;

        const inhoudField = document.getElementById(`${prefix}_inhoud`);
        if (inhoudField) {
            inhoudField.value = inhoud.toFixed(1);
        }

        updateTotalContent();
    }

    function updateTotalContent() {
        const bg_inhoud = parseFloat(document.getElementById("bg_inhoud")?.value) || 0;
        const v_inhoud = parseFloat(document.getElementById("v_inhoud")?.value) || 0;
        const z_inhoud = parseFloat(document.getElementById("z_inhoud")?.value) || 0;
        const k_inhoud = parseFloat(document.getElementById("k_inhoud")?.value) || 0;
        const totale_inhoud = bg_inhoud + v_inhoud + z_inhoud + k_inhoud;

        const totaalField = document.getElementById("totale_inhoud");
        if (totaalField) {
            totaalField.value = totale_inhoud.toFixed(1);
        }
    }

    ["bg", "v", "z", "k"].forEach(prefix => {
        ["lengte", "breedte", "hoogte"].forEach(dim => {
            const field = document.getElementById(`${prefix}_${dim}`);
            if (field) {
                field.addEventListener("input", () => calculateContent(prefix));
            }
        });
    });

    // Dynamische weergave logica voor toeslag
    document.querySelectorAll('.switch input[name="toeslag"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const toeslagVerklaring = document.getElementById("toeslag_verklaring");
            if (!toeslagVerklaring) return;

            if (e.target.id === "toeslag_ja") {
                toeslagVerklaring.classList.remove("hidden");
            } else {
                toeslagVerklaring.classList.add("hidden");
            }
        });
    });

    // Formulier verzenden
    const rebuildForm = document.getElementById("rebuildForm");
    if (rebuildForm) {
        rebuildForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const tokenField = rebuildForm.querySelector('input[name="cf-turnstile-response"]');
            const turnstileToken = tokenField ? tokenField.value.trim() : "";

            if (!turnstileToken) {
                alert("Bevestig eerst de beveiligingscontrole.");
                return;
            }

            const loadingScreen = document.getElementById("loadingScreen");
            if (loadingScreen) {
                loadingScreen.style.display = "flex";
            }

            const formData = new FormData(e.target);
            const data = {
                polisnummer: formData.get("polisnummer"),
                email: formData.get("email") || "",
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
                handtekening: signaturePad && !signaturePad.isEmpty() ? "Aanwezig" : "Niet aanwezig"
            };

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

            const toEmail = data.email ? data.email : "rbuijs@klaasvis.nl";
            const emailData = {
                message: message,
                to_email: toEmail
            };

            const sendToMe = emailjs.send("service_lpsiijc", "template_l7dk1hc", {
                message: message,
                turnstile_token: turnstileToken
            });

            const sendToClient = emailjs.send("service_lpsiijc", "template_ksj01md", {
                ...emailData,
                turnstile_token: turnstileToken
            });

            Promise.all([sendToMe, sendToClient])
                .then(() => {
                    setTimeout(() => {
                        window.location.href = "https://www.klaasvis.nl";
                    }, 2000);
                })
                .catch(err => {
                    console.error("Fout bij verzenden:", err);

                    if (loadingScreen) {
                        loadingScreen.style.display = "none";
                    }

                    if (window.turnstile) {
                        const widget = document.querySelector(".cf-turnstile");
                        if (widget) {
                            window.turnstile.reset(widget);
                        }
                    }

                    alert("Er is een fout opgetreden bij het verzenden.");
                });
        });
    }
});
