let currentStep = 0;
showStep(currentStep);

// SignaturePad (later init)
let signaturePad = null;

// ============================================================
// ✅ Hamburger menu (mobiel) — werkt met jouw CSS: .nav-list.active
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

    const toggleMenu = (e) => {
        if (e) e.preventDefault();
        e?.stopPropagation();

        if (menu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    btn.addEventListener('click', toggleMenu);

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
// ✅ reCAPTCHA controle functie
// ============================================================
function checkRecaptcha() {
    if (!window.grecaptcha) {
        alert("reCAPTCHA kon niet laden. Probeer opnieuw.");
        return false;
    }

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        alert("Bevestig eerst dat u geen robot bent (klik op de reCAPTCHA).");
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
    let steps = document.getElementsByClassName("step-content");

    for (let i = 0; i < steps.length; i++) {
        steps[i].style.display = 'none';
    }

    steps[n].style.display = 'block';

    if (n === 0) {
        document.getElementById("prevBtn").style.display = 'none';
    } else {
        document.getElementById("prevBtn").style.display = 'inline';
    }

    if (n === (steps.length - 1)) {
        document.getElementById("nextBtn").style.display = 'none';
    } else {
        document.getElementById("nextBtn").style.display = 'inline';
    }

    updateStepIndicator(n);
}

function nextPrev(n) {
    let steps = document.getElementsByClassName("step-content");
    steps[currentStep].style.display = 'none';
    currentStep = currentStep + n;

    if (currentStep >= steps.length) return false;
    showStep(currentStep);
}

function updateStepIndicator(n) {
    let indicators = document.getElementsByClassName("step");

    for (let i = 0; i < indicators.length; i++) {
        indicators[i].classList.remove("active-step");
    }

    indicators[n].classList.add("active-step");
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

// ============================================================
// ✅ Modal samenvatting
// ============================================================
function showModal() {
    const form = document.getElementById('insurance-form');
    if (!form) return;

    const formData = new FormData(form);
    let summaryHtml = "<strong>Ingevulde gegevens:</strong><ul>";
    const aanschaf = formData.get('aanschaf');

    let dekkingText = '';
    const dekkingAnders = formData.get('dekking') === 'anders';

    if (dekkingAnders) {
        const mainCoverage = formData.get('main_coverage');
        dekkingText += `Hoofddekking: ${mainCoverage || 'WA'}`;

        const extraOptions = [];
        if (formData.get('extra_schadeverzekering')) extraOptions.push('Schadeverzekering voor Inzittenden');
        if (formData.get('extra_rechtsbijstand')) extraOptions.push('Rechtsbijstand Verkeer');

        if (extraOptions.length > 0) {
            dekkingText += `, Extra opties: ${extraOptions.join(', ')}`;
        }
    } else {
        dekkingText = 'Conform verzekeringsvoorstel';
    }

    for (let [key, value] of formData.entries()) {
        if (key === 'g-recaptcha-response') continue;

        if (value && value !== 'on') {
            if ((key === 'rechtsvorm' || key === 'rechtsvorm-omschrijving' || key.startsWith('ubo')) && aanschaf !== 'zakelijk') continue;
            if (key === 'main_coverage' || key === 'extra_schadeverzekering' || key === 'extra_rechtsbijstand') continue;

            if (key === 'dekking') {
                summaryHtml += `<li>Gewenste dekking: ${dekkingText}</li>`;
            } else {
                summaryHtml += `<li>${key}: ${value}</li>`;
            }
        }
    }

    summaryHtml += "</ul>";

    if (signaturePad && !signaturePad.isEmpty()) {
        summaryHtml += "<p><strong>Handtekening:</strong> Aanwezig</p>";
    } else {
        summaryHtml += "<p><strong>Handtekening:</strong> Niet aanwezig</p>";
    }

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

    if (!loadingScreen) return;

    requestAnimationFrame(() => {
        loadingScreen.style.transition = 'none';
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';

        setTimeout(() => {
            loadingScreen.style.transition = 'opacity 0.3s ease';
        }, 0);
    });

    const form = document.getElementById('insurance-form');
    const formData = new FormData(form);

    let emailBody = "Aanvraagformulier Dekkerautoverzekering\n\n";
    const email = formData.get('email');
    const aanschaf = formData.get('aanschaf');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        loadingScreen.classList.add('hidden');

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (resultTextElement) {
                resultTextElement.innerHTML = 'FOUT: Geen geldig e-mailadres opgegeven.';
            }
            openModal('resultMessage');
        }, 300);

        return;
    }

    let dekkingText = '';
    const dekkingAnders = formData.get('dekking') === 'anders';

    if (dekkingAnders) {
        const mainCoverage = formData.get('main_coverage');
        dekkingText += `Hoofddekking: ${mainCoverage || 'WA'}`;

        const extraOptions = [];
        if (formData.get('extra_schadeverzekering')) extraOptions.push('Schadeverzekering voor Inzittenden');
        if (formData.get('extra_rechtsbijstand')) extraOptions.push('Rechtsbijstand Verkeer');

        if (extraOptions.length > 0) {
            dekkingText += `, Extra opties: ${extraOptions.join(', ')}`;
        }
    } else {
        dekkingText = 'Conform verzekeringsvoorstel';
    }

    for (let [key, value] of formData.entries()) {
        if (key === 'g-recaptcha-response') continue;

        if (value && value !== 'on') {
            if ((key === 'rechtsvorm' || key === 'rechtsvorm-omschrijving' || key.startsWith('ubo')) && aanschaf === 'particulier') continue;
            if (key === 'main_coverage' || key === 'extra_schadeverzekering' || key === 'extra_rechtsbijstand') continue;

            if (key === 'dekking') {
                emailBody += `Gewenste dekking: ${dekkingText}\n`;
            } else {
                emailBody += `${key}: ${value}\n`;
            }
        }
    }

    try {
        let signatureUrl = '';

        if (signaturePad && !signaturePad.isEmpty()) {
            const signatureBase64 = signaturePad.toDataURL('image/png');
            signatureUrl = await uploadSignature(signatureBase64);
            emailBody += `\nHandtekening: Bekijk de handtekening via deze link: ${signatureUrl}\n`;

            const sigField = document.getElementById('signature_url');
            if (sigField) sigField.value = signatureUrl;
        } else {
            emailBody += `\nHandtekening: Niet aanwezig\n`;
        }

        const emailParams = {
            message: emailBody,
            reply_to: email,
            signature_url: signatureUrl || ''
        };

        await emailjs.send("service_37glay9", "template_igkvytp", emailParams);

        await emailjs.send("service_37glay9", "template_vjmqckj", {
            to_email: email,
            email: email,
            message: "Bedankt voor uw aanvraag!\n\nHieronder uw ingevulde gegevens:\n" + emailBody
        });

        loadingScreen.classList.add('hidden');

        setTimeout(() => {
            loadingScreen.style.display = 'none';

            if (resultTextElement) {
                resultTextElement.innerHTML = `
                    <strong>Uw aanvraag is verzonden!</strong><br><br>
                    Wij danken u voor het vertrouwen.<br>
                    Een bevestiging is gestuurd naar ${email}.<br>
                    Uw auto is in voorlopige dekking per ingangsdatum. Binnen 10 werkdagen ontvangt u de polisstukken.
                `;
            }

            openModal('resultMessage');

            const formEl = document.getElementById('insurance-form');
            if (formEl) formEl.style.display = 'none';

            const navBtns = document.querySelector('.navigation-buttons');
            if (navBtns) navBtns.style.display = 'none';

            setTimeout(() => {
                loadingScreen.style.display = 'flex';
                loadingScreen.classList.remove('hidden');

                setTimeout(() => {
                    window.location.href = 'https://www.klaasvis.nl';
                }, 3000);
            }, 2000);
        }, 300);
    } catch (error) {
        loadingScreen.classList.add('hidden');

        setTimeout(() => {
            loadingScreen.style.display = 'none';

            if (resultTextElement) {
                resultTextElement.innerHTML = `
                    Er is een fout opgetreden: ${error.message || error}<br>
                    Controleer de console (F12) voor meer info.
                `;
            }

            openModal('resultMessage');
        }, 300);
    }
}

// ============================================================
// ✅ DOM init
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    initHamburgerMenu();

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

    // Dekking logica
    const dekkingRadios = document.getElementsByName('dekking');
    const dekkingOmschrijving = document.getElementById('dekking-omschrijving');

    dekkingRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (!dekkingOmschrijving) return;
            dekkingOmschrijving.style.display = (this.value === 'anders') ? 'block' : 'none';
        });
    });

    const checkedDekking = document.querySelector('input[name="dekking"]:checked');
    if (dekkingOmschrijving) {
        dekkingOmschrijving.style.display = (checkedDekking && checkedDekking.value === 'anders') ? 'block' : 'none';
    }

    // Tooltips
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

    // Datum aanvraag default
    const datumAanvraag = document.getElementById('datum-aanvraag');
    if (datumAanvraag) {
        const today = new Date();
        datumAanvraag.value = today.toISOString().split('T')[0];
    }

    // Regelmatige bestuurder logica
    document.querySelectorAll('input[name="regelmatige-bestuurder"]').forEach((elem) => {
        elem.addEventListener("change", function (event) {
            const value = event.target.value;
            const info = document.getElementById("regelmatige-bestuurder-info");
            if (!info) return;

            if (value === "no") info.classList.add("active");
            else info.classList.remove("active");
        });
    });

    // Schade-ervaring en schadevrije jaren logica
    const schadeErvaringRadios = document.getElementsByName('schade-ervaring');
    const schadeErvaringInfo = document.getElementById('schade-ervaring-info');

    schadeErvaringRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (!schadeErvaringInfo) return;
            schadeErvaringInfo.style.display = (this.value === 'yes') ? 'block' : 'none';
        });
    });

    const schadeVrijeJarenRadios = document.getElementsByName('schadevrije-jaren');
    const schadeVrijeJarenInfo = document.getElementById('schadevrije-jaren-info');

    schadeVrijeJarenRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (!schadeVrijeJarenInfo) return;
            schadeVrijeJarenInfo.style.display = (this.value === 'yes') ? 'block' : 'none';
        });
    });

    schadeErvaringRadios.forEach(radio => {
        if (radio.checked && radio.value === 'yes' && schadeErvaringInfo) {
            schadeErvaringInfo.style.display = 'block';
        }
    });

    schadeVrijeJarenRadios.forEach(radio => {
        if (radio.checked && radio.value === 'yes' && schadeVrijeJarenInfo) {
            schadeVrijeJarenInfo.style.display = 'block';
        }
    });

    // Extra info toggle logica
    function toggleAdditionalInfo(radioGroupName, infoDivId) {
        const radios = document.getElementsByName(radioGroupName);
        const infoDiv = document.getElementById(infoDivId);
        if (!infoDiv) return;

        radios.forEach(radio => {
            radio.addEventListener('change', function () {
                infoDiv.style.display = (this.value === 'yes') ? 'block' : 'none';
            });
        });
    }

    toggleAdditionalInfo('onverzekerd', 'onverzekerd-info');
    toggleAdditionalInfo('verzekeraar', 'verzekeraar-info');
    toggleAdditionalInfo('failliet', 'failliet-info');
    toggleAdditionalInfo('rijontzegging', 'rijontzegging-info');
    toggleAdditionalInfo('conflict', 'conflict-info');
    toggleAdditionalInfo('beslag', 'beslag-info');
    toggleAdditionalInfo('meer-informatie', 'meer-informatie-info');

    // Submit knop
    const submitBtn = document.querySelector('.submit-button');
    if (submitBtn) {
        submitBtn.addEventListener('click', function (event) {
            event.preventDefault();
            if (checkRecaptcha()) showModal();
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
        if (opzegserviceDetails) opzegserviceDetails.style.display = 'none';
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
        if (rechtsvormOmschrijvingContainer) rechtsvormOmschrijvingContainer.style.display = 'none';
        if (belanghebbendenInfo) belanghebbendenInfo.innerHTML = '';
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
            <input type="text" name="ubo${i}-naam" id="belanghebbende-${i}-naam">

            <label>Belanghebbende ${i} Adres:</label>
            <input type="text" name="ubo${i}-adres" id="belanghebbende-${i}-adres">

            <label>Belanghebbende ${i} Postcode en Woonplaats:</label>
            <input type="text" name="ubo${i}-postcode" id="belanghebbende-${i}-postcode">

            <label>Belanghebbende ${i} Geboortedatum:</label>
            <input type="date" name="ubo${i}-geboortedatum" id="belanghebbende-${i}-geboortedatum">
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
