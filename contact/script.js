// ===========================
// CHATBASE CHATBOT INTEGRATIE
// ===========================
(function () {
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
        window.chatbase = (...args) => {
            if (!window.chatbase.q) window.chatbase.q = [];
            window.chatbase.q.push(args);
        };

        window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
                if (prop === 'q') return target.q;
                return (...args) => target(prop, ...args);
            }
        });
    }

    const onLoad = function () {
        const script = document.createElement('script');
        script.src = 'https://www.chatbase.co/embed.min.js';
        script.id = 'C60jEJW_QuVD7X3vE5rzE';
        script.setAttribute('domain', 'www.chatbase.co');
        document.body.appendChild(script);
    };

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);
})();

// ===========================
// HULPFUNCTIES EMAILJS
// ===========================
function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getFieldValue(formData, key) {
    return (formData.get(key) || '').toString().trim();
}

function getLabelText(form, key) {
    const field = form.querySelector(`[name="${key}"]`);
    if (!field) return key;

    const id = field.id;
    if (!id) return key;

    const label = form.querySelector(`label[for="${id}"]`);
    return label ? label.textContent.trim() : key;
}

function buildSummaryRows(form, formData) {
    const rows = [];

    for (const [key, value] of formData.entries()) {
        if (key === 'g-recaptcha-response') continue;

        const cleanValue = String(value || '').trim();
        if (!cleanValue) continue;

        rows.push({
            label: getLabelText(form, key),
            value: cleanValue
        });
    }

    return rows;
}

function buildSummaryHtml(rows) {
    return rows.map(row => `
        <tr>
            <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:600; width:40%;">${escapeHtml(row.label)}</td>
            <td style="padding:10px 12px; border:1px solid #e5e7eb;">${escapeHtml(row.value)}</td>
        </tr>
    `).join('');
}

function buildSummaryText(rows) {
    return rows.map(row => `${row.label}: ${row.value}`).join('\n');
}

// ===========================
// ALLES BIJ LADEN
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // ===========================
    // HAMBURGER MENU
    // ===========================
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    if (hamburger && navList) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'main-navigation');

        if (!navList.id) {
            navList.id = 'main-navigation';
        }

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

    // ===========================
    // FORMULIER VERZENDEN
    // ===========================
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
            if (!recaptchaResponse) {
                alert("Bevestig eerst dat u geen robot bent (klik op de reCAPTCHA).");
                return;
            }

            const formData = new FormData(form);

            const voornaam = getFieldValue(formData, 'voornaam');
            const achternaam = getFieldValue(formData, 'achternaam');
            const naam = getFieldValue(formData, 'naam');
            const fullName = naam || `${voornaam} ${achternaam}`.trim() || 'Onbekende afzender';

            const email = getFieldValue(formData, 'email');
            const telefoon = getFieldValue(formData, 'telefoon');
            const onderwerp = getFieldValue(formData, 'onderwerp') || 'Contactverzoek';
            const bericht = getFieldValue(formData, 'bericht') || getFieldValue(formData, 'message') || 'Geen bericht opgegeven.';

            const summaryRows = buildSummaryRows(form, formData);
            const summaryHtmlRows = buildSummaryHtml(summaryRows);
            const summaryText = buildSummaryText(summaryRows);

            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
            }

            const baseParams = {
                from_name: fullName,
                first_name: voornaam,
                last_name: achternaam,
                from_email: email,
                phone: telefoon,
                subject: onderwerp,
                verzoek_type: 'Contactverzoek',
                message: bericht,
                reply_to: email || 'info@klaasvis.nl',
                to_email: email,
                summary_html: summaryHtmlRows,
                summary_text: summaryText
            };

            emailjs.send("service_hcds2qk", "template_xk3jqlc", baseParams)
                .then(() => {
                    if (email) {
                        return emailjs.send("service_hcds2qk", "template_gco2wsm", baseParams);
                    }
                })
                .then(() => {
                    setTimeout(() => {
                        if (loadingScreen) {
                            loadingScreen.style.display = 'none';
                        }

                        form.reset();

                        if (typeof grecaptcha !== 'undefined') {
                            grecaptcha.reset();
                        }

                        alert('Uw bericht is succesvol verzonden. Wij nemen uw verzoek binnen 2 werkdagen in behandeling.');
                        window.location.href = "https://www.klaasvis.nl";
                    }, 1200);
                })
                .catch((error) => {
                    console.error("Fout bij verzenden:", error);

                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }

                    alert(`Er is een fout opgetreden: ${error.text || error}. Probeer het later opnieuw.`);
                });
        });
    }
});
