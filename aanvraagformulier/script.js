let currentStep = 0;

// SignaturePad (later init)
let signaturePad = null;

// Noodfix: oude reCAPTCHA-aanroepen vangen we af via Turnstile
window.checkRecaptcha = function () {
    return checkTurnstile();
};

window.grecaptcha = {
    getResponse: function () {
        return getTurnstileToken();
    },
    reset: function () {
        if (window.turnstile) {
            window.turnstile.reset();
        }
    }
};

// ============================================================
// ✅ Helpers EmailJS / samenvatting
// ============================================================
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

function getSelectedRadioValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : '';
}

function getOfferteNummer(formData) {
    const urlParams = new URLSearchParams(window.location.search);

    return (
        urlParams.get('offerte') ||
        getFieldValue(formData, 'offertenummer') ||
        ''
    ).trim();
}
function formatDateNL(dateString) {
    if (!dateString) return "";

    const maanden = [
        "januari", "februari", "maart", "april",
        "mei", "juni", "juli", "augustus",
        "september", "oktober", "november", "december"
    ];

    const d = new Date(dateString);

    return `${d.getDate()} ${maanden[d.getMonth()]} ${d.getFullYear()}`;
}
async function sendAanvraagToPortaal(formData, summaryText, signatureUrl) {
    const offerteNummer = getOfferteNummer(formData);

    const response = await fetch("https://portaal.klaasvis.nl/api/aanvraag", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Aanvraag-Secret": "Aanvraagdekkerautoverzekering2026"
        },
        body: JSON.stringify({
            offerte_nummer: offerteNummer,
            naam: getFieldValue(formData, 'name') || getFieldValue(formData, 'ondertekenaar'),
            email: getFieldValue(formData, 'email'),
            telefoon: getFieldValue(formData, 'telefoon') || '',
            kenteken: getFieldValue(formData, 'kenteken') || '',
            ingangsdatum: getFieldValue(formData, 'ingangsdatum') || '',
            datum_aanvraag: getFieldValue(formData, 'datum-aanvraag') || '',
            ondertekenaar: getFieldValue(formData, 'ondertekenaar') || '',
            summary_text: summaryText,
            signature_url: signatureUrl || ''
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error("Aanvraag kon niet in het portaal worden opgeslagen: " + text);
    }

    return response.json().catch(() => ({}));
}

function humanizeValue(key, value) {
    if (value === 'yes') return 'Ja';
    if (value === 'no') return 'Nee';

    const maps = {
        betalingstermijn: {
            maandelijks: 'Maandelijks',
            kwartaal: 'Kwartaal',
            jaarlijks: 'Jaarlijks'
        },
        aanschaf: {
            particulier: 'Particulier',
            zakelijk: 'Zakelijk'
        },
        dekking: {
            voorstel: 'Dekking en premie conform het verzekeringsvoorstel',
            anders: 'Afwijkende gewenste dekking'
        },
        main_coverage: {
            wa: 'WA',
            'casco-beperkt': 'Casco Beperkt',
            'casco-compleet': 'Casco Compleet'
        },
        rechtsvorm: {
            bv: 'Besloten Vennootschap (BV)',
            zzp: 'Eenmanszaak (ZZP)',
            nv: 'Naamloze Vennootschap (NV)',
            stichting: 'Stichting/Vereniging',
            anders: 'Anders'
        },
        'rechtsvorm-omschrijving': {
            'ubo-eenmanszaak': 'Betreft een eenmanszaak, vul uw gegevens hieronder in (UBO)',
            'ubo-belang': 'Uiteindelijk belanghebbende(n) met een belang van 25% of meer',
            'geen-ubo': 'Geen belanghebbende(n) van 25% of meer',
            zeggenschap: 'Personen die feitelijk zeggenschap uitoefenen over de organisatie'
        }
    };

    if (maps[key] && maps[key][value]) {
        return maps[key][value];
    }

    return value;
}

function getFieldLabel(fieldName) {
    const specialLabels = {
        offertenummer: 'Offertenummer',
        Geboortedatum: 'Geboortedatum verzekeringnemer',
        'regelmatige-bestuurder': 'Bent u de regelmatige bestuurder',
        voorletters: 'Voorletters regelmatige bestuurder',
        achternaam: 'Achternaam regelmatige bestuurder',
        Postcode_en_huisnummer: 'Postcode en huisnummer regelmatige bestuurder',
        geboortedatum: 'Geboortedatum regelmatige bestuurder',
        relatie: 'Relatie tot verzekeringnemer',
        betalingstermijn: 'Betalingstermijn',
        iban: 'IBAN-rekeningnummer',
        ingangsdatum: 'Ingangsdatum verzekering',
        verklaring: 'Ingangsdatum is nog niet bekend / akkoordverklaring',
        dekking: 'Gewenste dekking',
        main_coverage: 'Hoofddekking',
        extra_schadeverzekering: 'Extra optie',
        extra_rechtsbijstand: 'Extra optie',
        'schade-ervaring': 'Schade gehad in afgelopen 5 jaar',
        'schade-datum': 'Schadedatum',
        'schade-bedrag': 'Schadebedrag(en)',
        'soort-schade': 'Soort schade(s)',
        'schadevrije-jaren': 'Schadevrije jaren opgebouwd',
        'aantal-schadevrije-jaren': 'Aantal schadevrije jaren',
        opzegservice: 'Gebruik maken van opzegservice',
        verzekeringsmaatschappij: 'Verzekeringsmaatschappij',
        name: 'Voorletter(s) en achternaam verzekeringnemer',
        polisnummer: 'Huidige polisnummer',
        kenteken: 'Kenteken motorvoertuig',
        'reden-opzegging': 'Reden van opzegging',
        'datum-opzegging': 'Datum opzegging',
        aanschaf: 'Auto aangeschaft als',
        rechtsvorm: 'Rechtsvorm',
        'rechtsvorm-omschrijving': 'Omschrijving rechtsvorm / UBO-situatie',
        'ubo1-naam': 'Belanghebbende 1 naam',
        'ubo1-adres': 'Belanghebbende 1 adres',
        'ubo1-postcode': 'Belanghebbende 1 postcode en woonplaats',
        'ubo1-geboortedatum': 'Belanghebbende 1 geboortedatum',
        'ubo2-naam': 'Belanghebbende 2 naam',
        'ubo2-adres': 'Belanghebbende 2 adres',
        'ubo2-postcode': 'Belanghebbende 2 postcode en woonplaats',
        'ubo2-geboortedatum': 'Belanghebbende 2 geboortedatum',
        'ubo3-naam': 'Belanghebbende 3 naam',
        'ubo3-adres': 'Belanghebbende 3 adres',
        'ubo3-postcode': 'Belanghebbende 3 postcode en woonplaats',
        'ubo3-geboortedatum': 'Belanghebbende 3 geboortedatum',
        'aantal-belanghebbenden': 'Aantal extra belanghebbenden',
        onverzekerd: 'Auto langer dan 10 dagen onverzekerd',
        'onverzekerd-text': 'Toelichting onverzekerd',
        verzekeraar: 'Weigering of opzegging door verzekeraar',
        'verzekeraar-text': 'Toelichting verzekeraar',
        failliet: 'Faillissement / schuldsanering / surseance',
        'failliet-text': 'Toelichting faillissement',
        beslag: 'Beslag gelegd',
        'beslag-text': 'Toelichting beslag',
        rijontzegging: 'Rijverbod of rijontzegging gehad',
        'rijontzegging-text': 'Toelichting rijontzegging',
        conflict: 'Conflict met juridische hulp',
        'conflict-text': 'Toelichting conflict',
        'meer-informatie': 'Overige relevante informatie',
        'meer-informatie-text': 'Toelichting overige informatie',
        ondertekenaar: 'Voorletter(s) en achternaam ondertekenaar',
        email: 'E-mailadres',
        'datum-aanvraag': 'Datum aanvraag',
        signature_url: 'Handtekening'
    };

    return specialLabels[fieldName] || fieldName;
}

function getDekkingText(formData) {
    const dekking = getFieldValue(formData, 'dekking');

    if (dekking !== 'anders') {
        return 'Conform verzekeringsvoorstel';
    }

    const mainCoverage = humanizeValue('main_coverage', getFieldValue(formData, 'main_coverage') || 'wa');
    const extraOptions = [];

    if (formData.get('extra_schadeverzekering')) {
        extraOptions.push('Schadeverzekering voor Inzittenden');
    }

    if (formData.get('extra_rechtsbijstand')) {
        extraOptions.push('Rechtsbijstand Verkeer');
    }

    let text = `Hoofddekking: ${mainCoverage}`;

    if (extraOptions.length) {
        text += `, Extra opties: ${extraOptions.join(', ')}`;
    }

    return text;
}

function buildSummaryRows(formData) {
    const rows = [];
    const aanschaf = getFieldValue(formData, 'aanschaf');

    for (const [key, rawValue] of formData.entries()) {
        if (key === 'cf-turnstile-response') continue;
        if (key === 'g-recaptcha-response') continue;
        if (key === 'main_coverage') continue;
        if (key === 'extra_schadeverzekering') continue;
        if (key === 'extra_rechtsbijstand') continue;
        if (key === 'signature_url') continue;

        if ((key === 'rechtsvorm' || key === 'rechtsvorm-omschrijving' || key.startsWith('ubo')) && aanschaf !== 'zakelijk') {
            continue;
        }

        const value = String(rawValue || '').trim();
        if (!value || value === 'on') continue;

        if (key === 'dekking') {
            rows.push({
                label: 'Gewenste dekking',
                value: getDekkingText(formData)
            });
            continue;
        }

        if (key === 'verklaring') {
            continue;
        }

        let displayValue = humanizeValue(key, value);

        // Datums netjes weergeven
        if (
            key === 'datum-aanvraag' ||
            key === 'ingangsdatum' ||
            key === 'geboortedatum' ||
            key === 'Geboortedatum' ||
            key.endsWith('geboortedatum')
        ) {
            displayValue = formatDateNL(value);
        }

        rows.push({
            label: getFieldLabel(key),
            value: displayValue
        });
    }

    rows.push({
        label: 'Handtekening',
        value: signaturePad && !signaturePad.isEmpty() ? 'Aanwezig' : 'Niet aanwezig'
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

function buildCustomerMessage() {
    return `Wij nemen uw aanvraag in behandeling en u ontvangt binnen ca. 10 werkdagen de polisstukken. Indien de gegevens volledig zijn ingevuld en de ingangsdatum is bekend, dan is het betreffende motorvoertuig per gewenste ingangsdatum in voorlopige dekking genomen en zodoende dus ook verzekerd.

Indien het aanvraagformulier onjuist of onvolledig is ingevuld, dan zullen wij zo spoedig mogelijk contact met u opnemen.

Wij vertrouwen erop u hiermede naar behoren te hebben geïnformeerd en zien uw eventuele vragen met belangstelling tegemoet.`;
}

// ============================================================
// ✅ Hamburger menu
// ============================================================
function initHamburgerMenu() {
    const btn = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-list');
    if (!btn || !menu) return;

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Menu');

    const openMenu = () => {
        menu.classList.add('active');
        btn.classList.add('is-active');
        btn.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add('nav-open');
        document.body.classList.add('nav-open');
    };

    const closeMenu = () => {
        menu.classList.remove('active');
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
        document.body.classList.remove('nav-open');
    };

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (menu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    menu.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a) closeMenu();
    });

    document.addEventListener('click', (e) => {
        if (!menu.classList.contains('active')) return;
        const clickedInside = menu.contains(e.target) || btn.contains(e.target);
        if (!clickedInside) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && menu.classList.contains('active')) {
            closeMenu();
        }
    });
}

// ============================================================
// ✅ Turnstile controle
// ============================================================
function getTurnstileToken() {
    const form = document.getElementById('insurance-form');
    const tokenField = form ? form.querySelector('input[name="cf-turnstile-response"]') : null;
    return tokenField ? tokenField.value.trim() : '';
}

function checkTurnstile() {
    const token = getTurnstileToken();

    if (!token) {
        alert("Bevestig eerst de beveiligingscontrole.");
        return false;
    }

    return true;
}

// ============================================================
// ✅ Handtekening uploaden naar Cloudinary
// ============================================================
async function uploadSignature(signatureBase64) {
    const publicId = 'handtekening_' + Date.now();

    const response = await fetch('https://api.cloudinary.com/v1_1/dqvftnitv/image/upload', {
        method: 'POST',
        body: JSON.stringify({
            file: signatureBase64,
            upload_preset: 'signatureupload',
            public_id: publicId
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (result.secure_url) return result.secure_url;

    throw new Error(`Cloudinary upload mislukt: ${JSON.stringify(result.error || result)}`);
}

// ============================================================
// ✅ Stappenformulier
// ============================================================
function showStep(n) {
    const steps = document.getElementsByClassName("step-content");
    if (!steps.length || !steps[n]) return;

    for (let i = 0; i < steps.length; i++) {
        steps[i].style.display = 'none';
    }

    steps[n].style.display = 'block';

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
        prevBtn.style.display = n === 0 ? 'none' : 'inline';
    }

    if (nextBtn) {
        nextBtn.style.display = n === (steps.length - 1) ? 'none' : 'inline';
    }

    updateStepIndicator(n);
}

function nextPrev(n) {
    const steps = document.getElementsByClassName("step-content");
    if (!steps.length || !steps[currentStep]) return false;

    steps[currentStep].style.display = 'none';
    currentStep = currentStep + n;

    if (currentStep >= steps.length) return false;
    if (currentStep < 0) currentStep = 0;

    showStep(currentStep);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateStepIndicator(n) {
    const indicators = document.getElementsByClassName("step");

    for (let i = 0; i < indicators.length; i++) {
        indicators[i].classList.remove("active-step");
    }

    if (indicators[n]) {
        indicators[n].classList.add("active-step");
    }
}

// ============================================================
// ✅ Modal helpers
// ============================================================
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove('hidden');
    el.style.display = 'block';
}

function closeModalEl(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.display = 'none';
    el.classList.add('hidden');
}

function closeModal() {
    closeModalEl('confirmationModal');
    closeModalEl('resultMessage');
}

function showMultiInsuranceModal() {
    closeModalEl('resultMessage');
    openModal('multiInsuranceModal');
}

function closeMultiInsuranceModal() {
    closeModalEl('multiInsuranceModal');
    window.location.href = 'https://www.klaasvis.nl';
}

// ============================================================
// ✅ Modal samenvatting
// ============================================================
function showModal() {
    const form = document.getElementById('insurance-form');
    if (!form) return;

    if (!checkTurnstile()) return;

    const formData = new FormData(form);
    const rows = buildSummaryRows(formData);

    let summaryHtml = "<strong>Ingevulde gegevens:</strong>";
    summaryHtml += `<div style="margin-top:12px; overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
            ${buildSummaryHtml(rows)}
        </table>
    </div>`;

    const summary = document.getElementById('summary');
    if (summary) summary.innerHTML = summaryHtml;

    openModal('confirmationModal');
}

// ============================================================
// ✅ Verzenden
// ============================================================
async function handleSubmit(isConfirmed) {
    const loadingScreen = document.getElementById('loadingScreen');
    const resultTextElement = document.getElementById('resultText');

    closeModalEl('confirmationModal');

    if (!isConfirmed) {
        if (resultTextElement) {
            resultTextElement.innerHTML = `U wordt teruggeleid naar het formulier om uw antwoorden te controleren.`;
        }

        openModal('resultMessage');
        return;
    }

    if (!checkTurnstile()) return;
    if (!loadingScreen) return;

    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';

    const form = document.getElementById('insurance-form');
    const formData = new FormData(form);
    const turnstileToken = getTurnstileToken();

    const email = getFieldValue(formData, 'email');
    const ondertekenaar = getFieldValue(formData, 'ondertekenaar');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        loadingScreen.style.display = 'none';

        if (resultTextElement) {
            resultTextElement.innerHTML = 'FOUT: Geen geldig e-mailadres opgegeven.';
        }

        openModal('resultMessage');
        return;
    }

    try {
        let signatureUrl = '';

        if (signaturePad && !signaturePad.isEmpty()) {
            const signatureBase64 = signaturePad.toDataURL('image/png');
            signatureUrl = await uploadSignature(signatureBase64);

            const sigField = document.getElementById('signature_url');
            if (sigField) sigField.value = signatureUrl;
        }

        const freshFormData = new FormData(form);
        const rows = buildSummaryRows(freshFormData);

        if (signatureUrl) {
            rows.push({
                label: 'Link naar handtekening',
                value: signatureUrl
            });
        }

        const summaryHtml = buildSummaryHtml(rows);
        const summaryText = buildSummaryText(rows);

        const baseParams = {
            to_email: email,
            from_name: ondertekenaar || 'Aanvrager',
            from_email: email,
            reply_to: email,
            subject: 'Bevestiging aanvraag Dekkerautoverzekering',
            verzoek_type: 'Aanvraag Dekkerautoverzekering',
            message: buildCustomerMessage(),
            summary_html: summaryHtml,
            summary_text: summaryText,
            signature_url: signatureUrl || '',
            offertenummer: getOfferteNummer(freshFormData),
            datum_aanvraag: getFieldValue(freshFormData, 'datum-aanvraag'),
            ingangsdatum: getFieldValue(freshFormData, 'ingangsdatum'),
            ondertekenaar: ondertekenaar,
            turnstile_token: turnstileToken
        };

        await emailjs.send("service_37glay9", "template_vjmqckj", baseParams);

        await new Promise(resolve => setTimeout(resolve, 1200));

        await emailjs.send("service_37glay9", "template_vjmqckj", {
            ...baseParams,
            to_email: "rbuijs@klaasvis.nl"
        });

        await sendAanvraagToPortaal(freshFormData, summaryText, signatureUrl);

        loadingScreen.style.display = 'none';

        if (resultTextElement) {
            resultTextElement.innerHTML = `
                <strong>Uw aanvraag is verzonden!</strong><br><br>
                Wij danken u voor het vertrouwen.<br>
                Een bevestiging is gestuurd naar ${email}.<br>
                Uw auto is in voorlopige dekking per ingangsdatum. Binnen 10 werkdagen ontvangt u de polisstukken.<br><br>
                U kunt nu ook vrijblijvend een offerte aanvragen voor uw andere verzekeringen.
            `;
        }

        const navBtns = document.querySelector('.navigation-buttons');
        if (navBtns) navBtns.style.display = 'none';

        if (window.turnstile) {
            window.turnstile.reset();
        }

        showMultiInsuranceModal();
    } catch (error) {
        loadingScreen.style.display = 'none';

        if (resultTextElement) {
            resultTextElement.innerHTML = `
                Er is een fout opgetreden: ${error.message || error}<br>
                Controleer de console (F12) voor meer info.
            `;
        }

        if (window.turnstile) {
            window.turnstile.reset();
        }

        openModal('resultMessage');
    }
}

// ============================================================
// ✅ DOM init
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    initHamburgerMenu();
    showStep(currentStep);

    const canvas = document.getElementById('signature-pad');

    if (canvas && window.SignaturePad) {
        signaturePad = new SignaturePad(canvas);

        const clearButton = document.getElementById('clear-signature');

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                signaturePad.clear();
            });
        }
    }

    const dekkingRadios = document.getElementsByName('dekking');
    const dekkingOmschrijving = document.getElementById('dekking-omschrijving');

    dekkingRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (!dekkingOmschrijving) return;
            dekkingOmschrijving.style.display = this.value === 'anders' ? 'block' : 'none';
        });
    });

    const checkedDekking = document.querySelector('input[name="dekking"]:checked');

    if (dekkingOmschrijving) {
        dekkingOmschrijving.style.display = checkedDekking && checkedDekking.value === 'anders' ? 'block' : 'none';
    }

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.stopPropagation();

            const tooltip = this.nextElementSibling;

            if (tooltip && tooltip.classList.contains('tooltip-text')) {
                tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    document.addEventListener('click', function (event) {
        if (!event.target.classList.contains('info-icon')) {
            document.querySelectorAll('.tooltip-text').forEach(tooltip => {
                tooltip.style.display = 'none';
            });
        }
    });

    const datumAanvraag = document.getElementById('datum-aanvraag');

    if (datumAanvraag) {
        const today = new Date();
        datumAanvraag.value = today.toISOString().split('T')[0];
    }

    document.querySelectorAll('input[name="regelmatige-bestuurder"]').forEach((elem) => {
        elem.addEventListener("change", function (event) {
            const info = document.getElementById("regelmatige-bestuurder-info");
            if (!info) return;

            if (event.target.value === "no") {
                info.classList.add("active");
                info.classList.remove("hidden");
                info.style.display = 'block';
            } else {
                info.classList.remove("active");
                info.classList.add("hidden");
                info.style.display = 'none';
            }
        });
    });

    function bindConditionalRadio(groupName, infoId) {
        const radios = document.getElementsByName(groupName);
        const info = document.getElementById(infoId);
        if (!info) return;

        radios.forEach(radio => {
            radio.addEventListener('change', function () {
                info.style.display = this.value === 'yes' ? 'block' : 'none';
            });

            if (radio.checked && radio.value === 'yes') {
                info.style.display = 'block';
            }
        });
    }

    bindConditionalRadio('schade-ervaring', 'schade-ervaring-info');
    bindConditionalRadio('schadevrije-jaren', 'schadevrije-jaren-info');
    bindConditionalRadio('onverzekerd', 'onverzekerd-info');
    bindConditionalRadio('verzekeraar', 'verzekeraar-info');
    bindConditionalRadio('failliet', 'failliet-info');
    bindConditionalRadio('rijontzegging', 'rijontzegging-info');
    bindConditionalRadio('conflict', 'conflict-info');
    bindConditionalRadio('beslag', 'beslag-info');
    bindConditionalRadio('meer-informatie', 'meer-informatie-info');

    const submitBtn = document.querySelector('.submit-button');

    if (submitBtn) {
        submitBtn.addEventListener('click', function (event) {
            event.preventDefault();
            showModal();
        });
    }
});

// ============================================================
// ✅ Opzegservice logica
// ============================================================
const schadevrijeJarenYes = document.getElementById('schadevrije-jaren-yes');
const schadevrijeJarenNo = document.getElementById('schadevrije-jaren-no');
const opzegserviceContainer = document.getElementById('opzegservice-container');
const opzegserviceYes = document.getElementById('opzegservice-yes');
const opzegserviceNo = document.getElementById('opzegservice-no');
const opzegserviceDetails = document.getElementById('opzegservice-details');

function toggleOpzegservice() {
    if (!opzegserviceContainer) return;

    if (schadevrijeJarenYes && schadevrijeJarenYes.checked) {
        opzegserviceContainer.style.display = 'block';
    } else {
        opzegserviceContainer.style.display = 'none';

        if (opzegserviceDetails) {
            opzegserviceDetails.style.display = 'none';
        }
    }
}

function toggleOpzegserviceDetails() {
    if (!opzegserviceDetails) return;

    if (opzegserviceYes && opzegserviceYes.checked) {
        opzegserviceDetails.style.display = 'block';
    } else {
        opzegserviceDetails.style.display = 'none';
    }
}

if (schadevrijeJarenYes) schadevrijeJarenYes.addEventListener('change', toggleOpzegservice);
if (schadevrijeJarenNo) schadevrijeJarenNo.addEventListener('change', toggleOpzegservice);
if (opzegserviceYes) opzegserviceYes.addEventListener('change', toggleOpzegserviceDetails);
if (opzegserviceNo) opzegserviceNo.addEventListener('change', toggleOpzegserviceDetails);

toggleOpzegservice();
toggleOpzegserviceDetails();

// ============================================================
// ✅ Zakelijk aanschaf logica
// ============================================================
const particulierRadio = document.getElementById('particulier');
const zakelijkRadio = document.getElementById('zakelijk');
const zakelijkInfo = document.getElementById('zakelijk-info');
const rechtsvormSelect = document.getElementById('rechtsvorm');
const rechtsvormOmschrijvingContainer = document.getElementById('rechtsvorm-omschrijving-container');
const aantalBelanghebbendenInput = document.getElementById('aantal-belanghebbenden');
const belanghebbendenInfo = document.getElementById('belanghebbenden-info');

function toggleZakelijkInfo() {
    if (!zakelijkInfo) return;

    if (zakelijkRadio && zakelijkRadio.checked) {
        zakelijkInfo.style.display = 'block';
    } else {
        zakelijkInfo.style.display = 'none';

        if (rechtsvormOmschrijvingContainer) {
            rechtsvormOmschrijvingContainer.style.display = 'none';
        }

        if (belanghebbendenInfo) {
            belanghebbendenInfo.innerHTML = '';
        }
    }
}

function toggleRechtsvormOmschrijving() {
    if (!rechtsvormOmschrijvingContainer) return;
    rechtsvormOmschrijvingContainer.style.display = 'block';
}

function updateBelanghebbendenInfo() {
    if (!aantalBelanghebbendenInput || !belanghebbendenInfo) return;

    const aantal = Number(aantalBelanghebbendenInput.value || 0);
    belanghebbendenInfo.innerHTML = '';

    for (let i = 1; i <= aantal; i++) {
        const wrap = document.createElement('div');
        wrap.classList.add('belanghebbende-container');

        wrap.innerHTML = `
            <label>Belanghebbende ${i} Voor- en achternaam:</label>
            <input type="text" name="ubo-extra-${i}-naam" id="belanghebbende-${i}-naam">

            <label>Belanghebbende ${i} Adres:</label>
            <input type="text" name="ubo-extra-${i}-adres" id="belanghebbende-${i}-adres">

            <label>Belanghebbende ${i} Postcode en Woonplaats:</label>
            <input type="text" name="ubo-extra-${i}-postcode" id="belanghebbende-${i}-postcode">

            <label>Belanghebbende ${i} Geboortedatum:</label>
            <input type="date" name="ubo-extra-${i}-geboortedatum" id="belanghebbende-${i}-geboortedatum">
        `;

        belanghebbendenInfo.appendChild(wrap);
    }
}

if (particulierRadio) particulierRadio.addEventListener('change', toggleZakelijkInfo);
if (zakelijkRadio) zakelijkRadio.addEventListener('change', toggleZakelijkInfo);
if (rechtsvormSelect) rechtsvormSelect.addEventListener('change', toggleRechtsvormOmschrijving);
if (aantalBelanghebbendenInput) aantalBelanghebbendenInput.addEventListener('input', updateBelanghebbendenInfo);

toggleZakelijkInfo();

// ============================================================
// ✅ Chatbase chatbot integratie
// ============================================================
(function () {
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
        window.chatbase = (...args) => {
            if (!window.chatbase.q) {
                window.chatbase.q = [];
            }

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

    if (document.readyState === 'complete') {
        onLoad();
    } else {
        window.addEventListener('load', onLoad);
    }
})();
