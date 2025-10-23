let currentStep = 0;
showStep(currentStep);

// Initialize SignaturePad globally
var canvas = document.getElementById('signature-pad');
var signaturePad = new SignaturePad(canvas);

// Functie om handtekening te uploaden naar Cloudinary
async function uploadSignature(signatureBase64) {
    try {
        // Log de Base64-string om te controleren
        console.log('Base64 handtekening:', signatureBase64.substring(0, 50) + '...');
        if (!signatureBase64.startsWith('data:image/png;base64,')) {
            throw new Error('Ongeldige Base64-string: Verwacht data:image/png;base64,');
        }

        // Genereer een unieke public_id zonder slashes
        const publicId = 'handtekening_' + Date.now();

        const response = await fetch('https://api.cloudinary.com/v1_1/dqvftnitv/image/upload', {
            method: 'POST',
            body: JSON.stringify({
                file: signatureBase64,
                upload_preset: 'signatureupload', // Nieuwe preset
                public_id: publicId
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Log de HTTP-status
        console.log('Cloudinary response status:', response.status, response.statusText);

        const result = await response.json();
        console.log('Cloudinary response:', result);

        if (result.secure_url) {
            console.log('Handtekening geüpload naar Cloudinary:', result.secure_url);
            return result.secure_url;
        } else {
            throw new Error(`Cloudinary upload mislukt: Geen secure_url ontvangen. Fout: ${JSON.stringify(result.error || result)}`);
        }
    } catch (error) {
        console.error('Fout bij het uploaden van handtekening naar Cloudinary:', error);
        throw error;
    }
}

function showStep(n) {
    let steps = document.getElementsByClassName("step-content");
    for (let i = 0; i < steps.length; i++) {
        steps[i].style.display = 'none';
    }
    steps[n].style.display = 'block';
    
    if (n == 0) {
        document.getElementById("prevBtn").style.display = 'none';
    } else {
        document.getElementById("prevBtn").style.display = 'inline';
    }
    if (n == (steps.length - 1)) {
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
    if (currentStep >= steps.length) {
        return false;
    }
    showStep(currentStep);
}

function updateStepIndicator(n) {
    let indicators = document.getElementsByClassName("step");
    for (let i = 0; i < indicators.length; i++) {
        indicators[i].classList.remove("active-step");
    }
    indicators[n].classList.add("active-step");
}

// SignaturePad clear knop
var clearButton = document.getElementById('clear-signature');
clearButton.addEventListener('click', function() {
    signaturePad.clear();
});

// Regelmatige bestuurder logica
document.querySelectorAll('input[name="regelmatige-bestuurder"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
        const value = event.target.value;
        const info = document.getElementById("regelmatige-bestuurder-info");
        if (value === "no") {
            info.classList.add("active");
        } else {
            info.classList.remove("active");
        }
    });
});

// Dekking logica
document.addEventListener('DOMContentLoaded', function() {
    const dekkingRadios = document.getElementsByName('dekking');
    const dekkingOmschrijving = document.getElementById('dekking-omschrijving');

    dekkingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'anders') {
                dekkingOmschrijving.style.display = 'block';
            } else {
                dekkingOmschrijving.style.display = 'none';
            }
        });
    });

    const checkedDekking = document.querySelector('input[name="dekking"]:checked');
    if (checkedDekking && checkedDekking.value === 'anders') {
        dekkingOmschrijving.style.display = 'block';
    } else {
        dekkingOmschrijving.style.display = 'none';
    }

    // Tooltip-functionaliteit voor info-iconen
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const tooltip = this.nextElementSibling;
            if (tooltip && tooltip.classList.contains('tooltip-text')) {
                tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Sluit tooltips als er buiten wordt geklikt
    document.addEventListener('click', function(event) {
        if (!event.target.classList.contains('info-icon')) {
            document.querySelectorAll('.tooltip-text').forEach(tooltip => {
                tooltip.style.display = 'none';
            });
        }
    });
});

// Schade-ervaring en schadevrije jaren logica
document.addEventListener('DOMContentLoaded', function() {
    const schadeErvaringRadios = document.getElementsByName('schade-ervaring');
    const schadeErvaringInfo = document.getElementById('schade-ervaring-info');
    
    schadeErvaringRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                schadeErvaringInfo.style.display = 'block';
            } else {
                schadeErvaringInfo.style.display = 'none';
            }
        });
    });

    const schadeVrijeJarenRadios = document.getElementsByName('schadevrije-jaren');
    const schadeVrijeJarenInfo = document.getElementById('schadevrije-jaren-info');
    
    schadeVrijeJarenRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                schadeVrijeJarenInfo.style.display = 'block';
            } else {
                schadeVrijeJarenInfo.style.display = 'none';
            }
        });
    });

    schadeErvaringRadios.forEach(radio => {
        if (radio.checked && radio.value === 'yes') {
            schadeErvaringInfo.style.display = 'block';
        }
    });

    schadeVrijeJarenRadios.forEach(radio => {
        if (radio.checked && radio.value === 'yes') {
            schadeVrijeJarenInfo.style.display = 'block';
        }
    });
});

// Opzegservice logica
const schadevrijeJarenYes = document.getElementById('schadevrije-jaren-yes');
const schadevrijeJarenNo = document.getElementById('schadevrije-jaren-no');
const opzegserviceContainer = document.getElementById('opzegservice-container');
const opzegserviceYes = document.getElementById('opzegservice-yes');
const opzegserviceNo = document.getElementById('opzegservice-no');
const opzegserviceDetails = document.getElementById('opzegservice-details');

function toggleOpzegservice() {
    if (schadevrijeJarenYes.checked) {
        opzegserviceContainer.style.display = 'block';
    } else {
        opzegserviceContainer.style.display = 'none';
        opzegserviceDetails.style.display = 'none';
    }
}

function toggleOpzegserviceDetails() {
    if (opzegserviceYes.checked) {
        opzegserviceDetails.style.display = 'block';
    } else {
        opzegserviceDetails.style.display = 'none';
    }
}

schadevrijeJarenYes.addEventListener('change', toggleOpzegservice);
schadevrijeJarenNo.addEventListener('change', toggleOpzegservice);
opzegserviceYes.addEventListener('change', toggleOpzegserviceDetails);
opzegserviceNo.addEventListener('change', toggleOpzegserviceDetails);

toggleOpzegservice();
toggleOpzegserviceDetails();

// Zakelijk aanschaf logica
const particulierRadio = document.getElementById('particulier');
const zakelijkRadio = document.getElementById('zakelijk');
const zakelijkInfo = document.getElementById('zakelijk-info');
const rechtsvormSelect = document.getElementById('rechtsvorm');
const rechtsvormOmschrijvingContainer = document.getElementById('rechtsvorm-omschrijving-container');
const aantalBelanghebbendenInput = document.getElementById('aantal-belanghebbenden');
const belanghebbendenInfo = document.getElementById('belanghebbenden-info');

function toggleZakelijkInfo() {
    if (zakelijkRadio.checked) {
        zakelijkInfo.style.display = 'block';
    } else {
        zakelijkInfo.style.display = 'none';
        rechtsvormOmschrijvingContainer.style.display = 'none';
        belanghebbendenInfo.innerHTML = '';
    }
}

function toggleRechtsvormOmschrijving() {
    const selectedValue = rechtsvormSelect.value;
    if (selectedValue === 'anders') {
        rechtsvormOmschrijvingContainer.style.display = 'block';
    } else {
        rechtsvormOmschrijvingContainer.style.display = 'block';
    }
}

function updateBelanghebbendenInfo() {
    const aantal = aantalBelanghebbendenInput.value;
    belanghebbendenInfo.innerHTML = '';

    for (let i = 1; i <= aantal; i++) {
        const belanghebbendeContainer = document.createElement('div');
        belanghebbendeContainer.classList.add('belanghebbende-container');
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = `Belanghebbende ${i} Voor- en achternaam:`;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = `ubo${i}-naam`;
        nameInput.id = `belanghebbende-${i}-naam`;

        const addressLabel = document.createElement('label');
        addressLabel.textContent = `Belanghebbende ${i} Adres:`;
        const addressInput = document.createElement('input');
        addressInput.type = 'text';
        addressInput.name = `ubo${i}-adres`;
        addressInput.id = `belanghebbende-${i}-adres`;

        const postalCodeLabel = document.createElement('label');
        postalCodeLabel.textContent = `Belanghebbende ${i} Postcode en Woonplaats:`;
        const postalCodeInput = document.createElement('input');
        postalCodeInput.type = 'text';
        postalCodeInput.name = `ubo${i}-postcode`;
        postalCodeInput.id = `belanghebbende-${i}-postcode`;

        const birthDateLabel = document.createElement('label');
        birthDateLabel.textContent = `Belanghebbende ${i} Geboortedatum:`;
        const birthDateInput = document.createElement('input');
        birthDateInput.type = 'date';
        birthDateInput.name = `ubo${i}-geboortedatum`;
        birthDateInput.id = `belanghebbende-${i}-geboortedatum`;

        belanghebbendeContainer.appendChild(nameLabel);
        belanghebbendeContainer.appendChild(nameInput);
        belanghebbendeContainer.appendChild(addressLabel);
        belanghebbendeContainer.appendChild(addressInput);
        belanghebbendeContainer.appendChild(postalCodeLabel);
        belanghebbendeContainer.appendChild(postalCodeInput);
        belanghebbendeContainer.appendChild(birthDateLabel);
        belanghebbendeContainer.appendChild(birthDateInput);

        belanghebbendenInfo.appendChild(belanghebbendeContainer);
    }
}

particulierRadio.addEventListener('change', toggleZakelijkInfo);
zakelijkRadio.addEventListener('change', toggleZakelijkInfo);
rechtsvormSelect.addEventListener('change', toggleRechtsvormOmschrijving);
aantalBelanghebbendenInput.addEventListener('input', updateBelanghebbendenInfo);

toggleZakelijkInfo();

// Extra info toggle logica
document.addEventListener('DOMContentLoaded', function() {
    function toggleAdditionalInfo(radioGroupName, infoDivId) {
        const radios = document.getElementsByName(radioGroupName);
        const infoDiv = document.getElementById(infoDivId);
        
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    infoDiv.style.display = 'block';
                } else {
                    infoDiv.style.display = 'none';
                }
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

    // Stel de standaarddatum in voor "datum-aanvraag"
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('datum-aanvraag').value = formattedDate;
});

// Modal en verzend logica
function showModal() {
    const form = document.getElementById('insurance-form');
    const formData = new FormData(form);
    let summaryHtml = "<strong>Ingevulde gegevens:</strong><ul>";
    const aanschaf = formData.get('aanschaf');

    // Verzamel dekking specifiek voor weergave
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
        if (value && value !== 'on') {
            if ((key === 'rechtsvorm' || key === 'rechtsvorm-omschrijving' || key.startsWith('ubo')) && aanschaf !== 'zakelijk') {
                continue;
            }
            if (key === 'main_coverage' || key === 'extra_schadeverzekering' || key === 'extra_rechtsbijstand') {
                continue;
            }
            if (key === 'dekking') {
                summaryHtml += `<li>Gewenste dekking: ${dekkingText}</li>`;
            } else {
                summaryHtml += `<li>${key}: ${value}</li>`;
            }
        }
    }
    summaryHtml += "</ul>";

    if (!signaturePad.isEmpty()) {
        summaryHtml += "<p><strong>Handtekening:</strong> Aanwezig</p>";
    } else {
        summaryHtml += "<p><strong>Handtekening:</strong> Niet aanwezig</p>";
    }

    document.getElementById('summary').innerHTML = summaryHtml;
    document.getElementById('confirmationModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    document.getElementById('resultMessage').style.display = 'none';
}

async function handleSubmit(isConfirmed) {
    const loadingScreen = document.getElementById('loadingScreen');
    const resultTextElement = document.getElementById('resultText');
    document.getElementById('confirmationModal').style.display = 'none';

    if (isConfirmed) {
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

        console.log("E-mailadres uit formulier:", email);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.error("FOUT: Ongeldig of ontbrekend e-mailadres!");
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resultTextElement.innerHTML = 'FOUT: Geen geldig e-mailadres opgegeven. Vul een geldig e-mailadres in.';
                document.getElementById('resultMessage').style.display = 'block';
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
            if (value && value !== 'on') {
                if ((key === 'rechtsvorm' || key === 'rechtsvorm-omschrijving' || key.startsWith('ubo')) && aanschaf === 'particulier') {
                    continue;
                }
                if (key === 'main_coverage' || key === 'extra_schadeverzekering' || key === 'extra_rechtsbijstand') {
                    continue;
                }
                if (key === 'dekking') {
                    emailBody += `Gewenste dekking: ${dekkingText}\n`;
                } else {
                    emailBody += `${key}: ${value}\n`;
                }
            }
        }

        try {
            let signatureUrl = '';
            if (!signaturePad.isEmpty()) {
                const signatureBase64 = signaturePad.toDataURL('image/png');
                try {
                    signatureUrl = await uploadSignature(signatureBase64);
                    emailBody += `\nHandtekening: Bekijk de handtekening via deze link: ${signatureUrl}\n`;
                    document.getElementById('signature_url').value = signatureUrl;
                } catch (uploadError) {
                    console.warn('Handtekening upload mislukt, e-mail wordt verzonden zonder handtekening:', uploadError);
                    emailBody += `\nHandtekening: Kon niet worden geüpload vanwege een fout: ${uploadError.message}\n`;
                }
            } else {
                emailBody += `\nHandtekening: Niet aanwezig\n`;
            }

            console.log("E-mailinhoud:", emailBody);
            // Log de EmailJS-parameters
            const emailParams = {
                message: emailBody,
                reply_to: email,
                signature_url: signatureUrl || ''
            };
            console.log("EmailJS parameters:", emailParams);

            console.log("Start verzending...");
            await emailjs.send("service_37glay9", "template_igkvytp", emailParams);

            console.log("Service e-mail succesvol verzonden");
            await emailjs.send("service_37glay9", "template_vjmqckj", {
                to_email: email,
                email: email,
                message: "Bedankt voor uw aanvraag!\n\nHieronder uw ingevulde gegevens:\n" + emailBody
            });

            console.log("Klant e-mail succesvol verzonden");
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resultTextElement.innerHTML = `
                    <strong>Uw aanvraag is verzonden!</strong><br><br>
                    Wij danken u voor het vertrouwen.<br>
                    Een bevestiging is gestuurd naar ${email}.<br>
                    Uw auto is in voorlopige dekking per ingangsdatum. Binnen 10 werkdagen ontvangt u de polisstukken.
                `;
                document.getElementById('resultMessage').style.display = 'block';
                document.getElementById('insurance-form').style.display = 'none';
                document.querySelector('.navigation-buttons').style.display = 'none';

                setTimeout(() => {
                    loadingScreen.style.display = 'flex';
                    loadingScreen.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = 'https://www.klaasvis.nl';
                    }, 3000);
                }, 2000);
            }, 300);
        } catch (error) {
            console.error("Fout bij verzenden:", error);
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resultTextElement.innerHTML = `
                    Er is een fout opgetreden: ${error.message || error}<br>
                    Controleer de console (F12) voor meer info.
                `;
                document.getElementById('resultMessage').style.display = 'block';
            }, 300);
        }
    } else {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            resultTextElement.innerHTML = `
                U wordt teruggeleid naar het formulier om uw antwoorden te controleren.
            `;
            document.getElementById('resultMessage').style.display = 'block';
        }, 300);
    }
}

// Voeg event listener toe aan de submit-knop
document.querySelector('.submit-button').addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Klik op verzenden, modal wordt geopend");
    showModal();
});

// Chatbase chatbot integratie
(function() {
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
    const onLoad = function() {
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
