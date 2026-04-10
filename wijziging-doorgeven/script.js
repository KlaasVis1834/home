// ===========================
// TOON/VERBERG VELDEN OP BASIS VAN VERZOEK-TYPE
// ===========================
function toggleFields() {
    const verzoekType = document.getElementById('verzoek-type')?.value;

    const fieldGroups = {
        'adreswijziging': [
            'adreswijziging-fields-postcode',
            'adreswijziging-fields-huisnummer',
            'adreswijziging-fields-adres',
            'adreswijziging-fields-datum'
        ],
        'motorvoertuigwijziging': [
            'motorvoertuigwijziging-fields-datum',
            'motorvoertuigwijziging-fields-polisnummer',
            'motorvoertuigwijziging-fields-huidig-kenteken',
            'motorvoertuigwijziging-fields-huidig-merk',
            'motorvoertuigwijziging-fields-huidig-model',
            'motorvoertuigwijziging-fields-nieuw-kenteken',
            'motorvoertuigwijziging-fields-nieuw-merk',
            'motorvoertuigwijziging-fields-nieuw-model'
        ],
        'verzekering-beëindigen': [
            'verzekering-beëindigen-fields-datum',
            'verzekering-beëindigen-fields-reden'
        ],
        'belverzoek': [
            'belverzoek-fields-telefoon',
            'belverzoek-fields-datum-tijd'
        ],
        'emailwijziging': [
            'emailwijziging-fields-huidig',
            'emailwijziging-fields-nieuw'
        ],
        'anders': [
            'anders-fields'
        ]
    };

    Object.values(fieldGroups).flat().forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    if (verzoekType && fieldGroups[verzoekType]) {
        fieldGroups[verzoekType].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        });
    }
}

// ===========================
// POSTCODE API
// ===========================
async function fetchPostcodeData() {
    const postcodeField = document.getElementById('nieuwe-postcode');
    const huisnummerField = document.getElementById('nieuwe-huisnummer');
    const adresField = document.getElementById('nieuw-adres');

    if (!postcodeField || !huisnummerField || !adresField) return;

    const postcode = postcodeField.value.replace(/\s/g, '');
    const huisnummer = huisnummerField.value;
    if (!postcode || !huisnummer) return;

    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const adres = data?.response?.docs?.[0];

        if (adres) {
            adresField.value = `${adres.straatnaam} ${huisnummer}, ${adres.woonplaatsnaam}`;
        } else {
            adresField.value = '';
        }
    } catch {
        adresField.value = '';
    }
}

// ===========================
// RDW API
// ===========================
async function fetchRDWData(kentekenField, merkField, modelField) {
    const kentekenInput = document.getElementById(kentekenField);
    const merkInput = document.getElementById(merkField);
    const modelInput = document.getElementById(modelField);

    if (!kentekenInput || !merkInput || !modelInput) return;

    const kenteken = kentekenInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!kenteken) return;

    try {
        const response = await fetch(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`);
        const data = await response.json();

        if (data.length > 0) {
            const auto = data[0];
            merkInput.value = auto.merk || '';
            modelInput.value = auto.handelsbenaming || '';
        } else {
            merkInput.value = '';
            modelInput.value = '';
            alert('Geen voertuig gevonden met dit kenteken.');
        }
    } catch (error) {
        alert('Fout bij ophalen RDW-gegevens: ' + error.message);
    }
}

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

function buildSummaryRows(formData) {
    const fieldMap = [
        { key: 'verzoek-type', label: 'Soort verzoek' },
        { key: 'voornaam', label: 'Voorletter(s)' },
        { key: 'achternaam', label: 'Achternaam' },
        { key: 'email', label: 'E-mailadres' },
        { key: 'nieuwe-postcode', label: 'Nieuwe postcode' },
        { key: 'nieuwe-huisnummer', label: 'Nieuw huisnummer' },
        { key: 'nieuw-adres', label: 'Nieuw volledig adres' },
        { key: 'verhuisdatum', label: 'Datum van verhuizing' },
        { key: 'wijzigingsdatum', label: 'Wijzigingsdatum' },
        { key: 'polisnummer-motor', label: 'Polisnummer' },
        { key: 'huidig-kenteken', label: 'Kenteken huidig voertuig' },
        { key: 'huidig-merk', label: 'Merk huidig voertuig' },
        { key: 'huidig-model', label: 'Model huidig voertuig' },
        { key: 'nieuw-kenteken', label: 'Kenteken nieuw voertuig' },
        { key: 'nieuw-merk', label: 'Merk nieuw voertuig' },
        { key: 'nieuw-model', label: 'Model nieuw voertuig' },
        { key: 'opzegdatum', label: 'Opzegdatum' },
        { key: 'reden-beëindiging', label: 'Reden van beëindiging' },
        { key: 'telefoon', label: 'Telefoonnummer' },
        { key: 'voorkeur-datum-tijd', label: 'Gewenste datum en tijdstip' },
        { key: 'huidig-email', label: 'Huidig e-mailadres' },
        { key: 'nieuw-email', label: 'Nieuw e-mailadres' },
        { key: 'anders-reden', label: 'Reden van contact' }
    ];

    const rows = [];

    fieldMap.forEach(field => {
        const value = getFieldValue(formData, field.key);
        if (value) {
            rows.push({
                label: field.label,
                value
            });
        }
    });

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

function formatVerzoekType(verzoekType) {
    const map = {
        'adreswijziging': 'Adreswijziging',
        'motorvoertuigwijziging': 'Motorvoertuigwijziging',
        'verzekering-beëindigen': 'Verzekering beëindigen',
        'belverzoek': 'Terugbelverzoek',
        'emailwijziging': 'E-mailwijziging',
        'anders': 'Anders'
    };
    return map[verzoekType] || verzoekType || 'Algemeen verzoek';
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
            const fullName = `${voornaam} ${achternaam}`.trim();
            const email = getFieldValue(formData, 'email') || 'info@klaasvis.nl';
            const verzoekType = getFieldValue(formData, 'verzoek-type');
            const verzoekLabel = formatVerzoekType(verzoekType);

            const summaryRows = buildSummaryRows(formData);
            const summaryHtmlRows = buildSummaryHtml(summaryRows);
            const summaryText = buildSummaryText(summaryRows);

            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
            }

            const baseParams = {
                from_name: fullName || 'Onbekende afzender',
                first_name: voornaam,
                last_name: achternaam,
                from_email: getFieldValue(formData, 'email'),
                phone: getFieldValue(formData, 'telefoon'),
                subject: verzoekLabel,
                verzoek_type: verzoekLabel,
                message: getFieldValue(formData, 'anders-reden') ||
                         getFieldValue(formData, 'reden-beëindiging') ||
                         'Geen extra toelichting opgegeven.',
                reply_to: getFieldValue(formData, 'email') || 'info@klaasvis.nl',
                to_email: getFieldValue(formData, 'email'),
                summary_html: summaryHtmlRows,
                summary_text: summaryText,

                nieuwe_postcode: getFieldValue(formData, 'nieuwe-postcode'),
                nieuwe_huisnummer: getFieldValue(formData, 'nieuwe-huisnummer'),
                nieuw_adres: getFieldValue(formData, 'nieuw-adres'),
                verhuisdatum: getFieldValue(formData, 'verhuisdatum'),
                wijzigingsdatum: getFieldValue(formData, 'wijzigingsdatum'),
                polisnummer_motor: getFieldValue(formData, 'polisnummer-motor'),
                huidig_kenteken: getFieldValue(formData, 'huidig-kenteken'),
                huidig_merk: getFieldValue(formData, 'huidig-merk'),
                huidig_model: getFieldValue(formData, 'huidig-model'),
                nieuw_kenteken: getFieldValue(formData, 'nieuw-kenteken'),
                nieuw_merk: getFieldValue(formData, 'nieuw-merk'),
                nieuw_model: getFieldValue(formData, 'nieuw-model'),
                opzegdatum: getFieldValue(formData, 'opzegdatum'),
                reden_beeindiging: getFieldValue(formData, 'reden-beëindiging'),
                voorkeur_datum_tijd: getFieldValue(formData, 'voorkeur-datum-tijd'),
                huidig_email: getFieldValue(formData, 'huidig-email'),
                nieuw_email: getFieldValue(formData, 'nieuw-email'),
                anders_reden: getFieldValue(formData, 'anders-reden')
            };

            emailjs.send("service_hcds2qk", "template_xk3jqlc", baseParams)
                .then(() => {
                    if (getFieldValue(formData, 'email')) {
                        return emailjs.send("service_hcds2qk", "template_gco2wsm", baseParams);
                    }
                })
                .then(() => {
                    setTimeout(() => {
                        if (loadingScreen) {
                            loadingScreen.style.display = 'none';
                        }
                        form.reset();
                        toggleFields();

                        if (typeof grecaptcha !== 'undefined') {
                            grecaptcha.reset();
                        }

                        alert('Uw wijziging is succesvol verzonden. Wij nemen uw verzoek binnen 2 werkdagen in behandeling.');
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

    // ===========================
    // EVENT LISTENERS VELDEN
    // ===========================
    const selectElement = document.getElementById('verzoek-type');
    if (selectElement) {
        selectElement.addEventListener('change', toggleFields);
        toggleFields();
    }

    const postcode = document.getElementById('nieuwe-postcode');
    const huisnummer = document.getElementById('nieuwe-huisnummer');
    const huidigKenteken = document.getElementById('huidig-kenteken');
    const nieuwKenteken = document.getElementById('nieuw-kenteken');

    if (postcode) postcode.addEventListener('blur', fetchPostcodeData);
    if (huisnummer) huisnummer.addEventListener('blur', fetchPostcodeData);

    if (huidigKenteken) {
        huidigKenteken.addEventListener('blur', () =>
            fetchRDWData('huidig-kenteken', 'huidig-merk', 'huidig-model')
        );
    }

    if (nieuwKenteken) {
        nieuwKenteken.addEventListener('blur', () =>
            fetchRDWData('nieuw-kenteken', 'nieuw-merk', 'nieuw-model')
        );
    }
});
