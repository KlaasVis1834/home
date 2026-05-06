let currentStep = 0;

document.addEventListener('DOMContentLoaded', function () {
    /* ===========================
       HAMBURGER MENU
    =========================== */
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    if (hamburger && navList) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'main-navigation');

        if (!navList.id) {
            navList.id = 'main-navigation';
        }

        function toggleMenu(open) {
            const isOpen =
                typeof open === 'boolean' ? open : !navList.classList.contains('active');

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

    /* ===========================
       INITIALISATIE STAPPENFORMULIER
    =========================== */
    showStep(currentStep);

    /* ===========================
       RDW KENTEKEN LOOKUP
    =========================== */
    const kentekenInput = document.getElementById('kenteken');
    if (kentekenInput) {
        kentekenInput.addEventListener('input', function () {
            const kenteken = kentekenInput.value.trim();
            if (kenteken.length >= 6) {
                fetchVehicleData(kenteken);
            }
        });
    }

    /* ===========================
       ADRES LOOKUP
    =========================== */
    const postcodeInput = document.getElementById('postcode');
    const huisnummerInput = document.getElementById('huisnummer');

    if (postcodeInput && huisnummerInput) {
        postcodeInput.addEventListener('input', checkAddress);
        huisnummerInput.addEventListener('input', checkAddress);
    }

    function checkAddress() {
        const postcode = postcodeInput.value.replace(/\s/g, '');
        const huisnummer = huisnummerInput.value;
        if (postcode.length === 6 && huisnummer) {
            fetchAddress(postcode, huisnummer);
        }
    }

    async function fetchAddress(postcode, huisnummer) {
        const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.response.numFound > 0) {
                const adres = data.response.docs[0];
                const volledigAdres = `${adres.straatnaam} ${adres.huisnummer}, ${adres.woonplaatsnaam}`;
                document.getElementById('volledig-adres').value = volledigAdres;
            } else {
                document.getElementById('volledig-adres').value = 'Adres niet gevonden';
            }
        } catch (error) {
            console.error('Fout bij ophalen adres:', error);
            document.getElementById('volledig-adres').value = 'Fout bij ophalen adres';
        }
    }

    /* ===========================
       ZAKELIJK / PARTICULIER
    =========================== */
    const particulierRadio = document.getElementById('particulier');
    const zakelijkRadio = document.getElementById('zakelijk');
    const bedrijfsnaamContainer = document.getElementById('bedrijfsnaam-container');

    function toggleBedrijfsnaam() {
        if (!zakelijkRadio || !bedrijfsnaamContainer) return;

        if (zakelijkRadio.checked) {
            bedrijfsnaamContainer.classList.remove('hidden');
        } else {
            bedrijfsnaamContainer.classList.add('hidden');
        }
    }

    if (particulierRadio) particulierRadio.addEventListener('change', toggleBedrijfsnaam);
    if (zakelijkRadio) zakelijkRadio.addEventListener('change', toggleBedrijfsnaam);
    toggleBedrijfsnaam();

    /* ===========================
       DATUM VERZOEK VANDAAG
    =========================== */
    const datumVerzoek = document.getElementById('datum-verzoek');
    if (datumVerzoek) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        datumVerzoek.value = formattedDate;
    }
});

/* ===========================
   HULPFUNCTIE UITSLUITEN VELDEN
=========================== */
function shouldIncludeField(key, value) {
    const excludedFields = [
        'main_coverage',
        'extra_schadeverzekering',
        'extra_rechtsbijstand',
        'ford-dekker',
        'waarheid',
        'cf-turnstile-response'
    ];

    return value && value !== 'on' && !excludedFields.includes(key);
}

/* ===========================
   STAPPENFORMULIER
=========================== */
function showStep(n) {
    let steps = document.getElementsByClassName('step-content');

    for (let i = 0; i < steps.length; i++) {
        steps[i].style.display = 'none';
    }

    if (steps[n]) {
        steps[n].style.display = 'block';
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.style.display = n === 0 ? 'none' : 'inline';
    }

    if (nextBtn) {
        nextBtn.style.display = n === steps.length - 1 ? 'none' : 'inline';
    }

    updateStepIndicator(n);
}

function nextPrev(n) {
    let steps = document.getElementsByClassName('step-content');
    if (!steps[currentStep]) return false;

    steps[currentStep].style.display = 'none';
    currentStep = currentStep + n;

    if (currentStep >= steps.length) {
        return false;
    }

    if (currentStep < 0) {
        currentStep = 0;
    }

    showStep(currentStep);
}

function updateStepIndicator(n) {
    let indicators = document.getElementsByClassName('step');

    for (let i = 0; i < indicators.length; i++) {
        indicators[i].classList.remove('active-step');
    }

    if (indicators[n]) {
        indicators[n].classList.add('active-step');
    }
}

/* ===========================
   TURNSTILE CONTROLE
=========================== */
function checkTurnstile() {
    const form = document.getElementById('quote-form');
    const tokenField = form ? form.querySelector('input[name="cf-turnstile-response"]') : null;
    const turnstileToken = tokenField ? tokenField.value.trim() : '';

    if (!turnstileToken) {
        alert('Bevestig eerst de beveiligingscontrole.');
        return false;
    }

    return true;
}

/* ===========================
   RDW API
=========================== */
async function fetchVehicleData(kenteken) {
    const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken.replace(/-/g, '')}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const vehicle = data[0];
            document.getElementById('merk').value = vehicle.merk || 'Onbekend';
            document.getElementById('model').value = vehicle.handelsbenaming || 'Onbekend';
        } else {
            document.getElementById('merk').value = 'Kenteken niet gevonden';
            document.getElementById('model').value = '';
        }
    } catch (error) {
        console.error('Fout bij ophalen voertuiggegevens:', error);
        document.getElementById('merk').value = 'Fout bij ophalen';
        document.getElementById('model').value = '';
    }
}

/* ===========================
   MODAL SAMENVATTING
=========================== */
function showModal() {
    if (!checkTurnstile()) return;

    const form = document.getElementById('quote-form');
    const formData = new FormData(form);
    let summaryHtml = '<strong>Ingevulde gegevens:</strong><ul>';

    for (let [key, value] of formData.entries()) {
        if (shouldIncludeField(key, value)) {
            summaryHtml += `<li>${key}: ${value}</li>`;
        }
    }

    const mainCoverage = formData.get('main_coverage');
    summaryHtml += `<li>Hoofddekking: ${mainCoverage || ''}</li>`;

    const extraSchadeverzekering = formData.has('extra_schadeverzekering') ? 'Ja' : 'Nee';
    summaryHtml += `<li>Schadeverzekering voor Inzittenden: ${extraSchadeverzekering}</li>`;

    const extraRechtsbijstand = formData.has('extra_rechtsbijstand') ? 'Ja' : 'Nee';
    summaryHtml += `<li>Rechtsbijstand: ${extraRechtsbijstand}</li>`;

    const fordDekker = formData.has('ford-dekker') ? 'Ja' : 'Nee';
    summaryHtml += `<li>Verzekerde voertuig betreft een auto gekocht bij de Dekkerautogroep: ${fordDekker}</li>`;

    const waarheid = formData.has('waarheid') ? 'Ja' : 'Nee';
    summaryHtml += `<li>Gegevens naar waarheid ingevuld: ${waarheid}</li>`;

    summaryHtml += '</ul>';

    document.getElementById('summary').innerHTML = summaryHtml;
    document.getElementById('confirmationModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    document.getElementById('resultMessage').style.display = 'none';
}

/* ===========================
   VERZENDEN
=========================== */
function handleSubmit(isConfirmed) {
    const loadingScreen = document.getElementById('loadingScreen');
    const resultTextElement = document.getElementById('resultText');
    document.getElementById('confirmationModal').style.display = 'none';

    if (!isConfirmed) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            resultTextElement.innerHTML =
                'U wordt teruggeleid naar het formulier om uw antwoorden te controleren.';
            document.getElementById('resultMessage').style.display = 'block';
        }, 300);
        return;
    }

    if (!checkTurnstile()) return;

    requestAnimationFrame(() => {
        loadingScreen.style.transition = 'none';
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';

        setTimeout(() => {
            loadingScreen.style.transition = 'opacity 0.3s ease';
        }, 0);
    });

    const form = document.getElementById('quote-form');
    const formData = new FormData(form);
    const tokenField = form.querySelector('input[name="cf-turnstile-response"]');
    const turnstileToken = tokenField ? tokenField.value.trim() : '';

    let emailBody = 'Offerteverzoek Dekkerautoverzekering\n\n';
    const email = formData.get('email');

    if (!email) {
        console.error('FOUT: Geen e-mailadres opgehaald uit het formulier!');
        loadingScreen.classList.add('hidden');

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            resultTextElement.innerHTML =
                'FOUT: Geen e-mailadres opgegeven. Vul een geldig e-mailadres in.';
            document.getElementById('resultMessage').style.display = 'block';
        }, 300);

        return;
    }

    for (let [key, value] of formData.entries()) {
        if (shouldIncludeField(key, value)) {
            emailBody += `${key}: ${value}\n`;
        }
    }

    const mainCoverage = formData.get('main_coverage');
    emailBody += `Hoofddekking: ${mainCoverage || ''}\n`;

    const extraSchadeverzekering = formData.has('extra_schadeverzekering') ? 'Ja' : 'Nee';
    emailBody += `Schadeverzekering voor Inzittenden: ${extraSchadeverzekering}\n`;

    const extraRechtsbijstand = formData.has('extra_rechtsbijstand') ? 'Ja' : 'Nee';
    emailBody += `Rechtsbijstand: ${extraRechtsbijstand}\n`;

    const fordDekker = formData.has('ford-dekker') ? 'Ja' : 'Nee';
    emailBody += `Verzekerde voertuig betreft een Ford gekocht bij de Dekkerautogroep: ${fordDekker}\n`;

    const waarheid = formData.has('waarheid') ? 'Ja' : 'Nee';
    emailBody += `Gegevens naar waarheid ingevuld: ${waarheid}\n`;

    console.log('Start verzending...');

    emailjs
        .send('service_cjvbpt6', 'template_lglwx6m', {
            message: emailBody,
            reply_to: email,
            turnstile_token: turnstileToken
        })
        .then(() => {
            console.log('Service e-mail succesvol verzonden');
            return emailjs.send('service_cjvbpt6', 'template_20jbe7c', {
                to_email: email,
                email: email,
                message: 'Bedankt voor uw offerteverzoek!\n\nHieronder uw ingevulde gegevens:\n' + emailBody,
                turnstile_token: turnstileToken
            });
        })
        .then(() => {
            console.log('Klant e-mail succesvol verzonden');

            loadingScreen.classList.add('hidden');

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resultTextElement.innerHTML = `
                    <strong>Uw offerteverzoek is verzonden!</strong><br><br>
                    Wij danken u voor uw interesse.<br>
                    Een bevestiging is gestuurd naar ${email}.<br>
                    Binnen 2 werkdagen ontvangt u een offerte.
                `;
                document.getElementById('resultMessage').style.display = 'block';
                document.getElementById('quote-form').style.display = 'none';

                const navigationButtons = document.querySelector('.navigation-buttons');
                if (navigationButtons) {
                    navigationButtons.style.display = 'none';
                }

                if (window.turnstile) {
                    window.turnstile.reset();
                }

                setTimeout(() => {
                    loadingScreen.style.display = 'flex';
                    loadingScreen.classList.remove('hidden');

                    setTimeout(() => {
                        window.location.href = 'https://www.klaasvis.nl';
                    }, 3000);
                }, 2000);
            }, 300);
        })
        .catch((error) => {
            console.error('Fout bij verzenden:', error);

            loadingScreen.classList.add('hidden');

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resultTextElement.innerHTML = `
                    Er is een fout opgetreden: ${error.text || error}<br>
                    Controleer de console (F12) voor meer info.
                `;
                document.getElementById('resultMessage').style.display = 'block';

                if (window.turnstile) {
                    window.turnstile.reset();
                }
            }, 300);
        });
}

/* ===========================
   CHATBASE
=========================== */
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
                if (prop === 'q') {
                    return target.q;
                }
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
