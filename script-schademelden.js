document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('.nav-list').classList.toggle('active');
});

function showModal() {
    const form = document.getElementById('schade-form');
    const formData = new FormData(form);
    let summaryHtml = "<strong>Ingevulde gegevens:</strong><ul>";

    for (let [key, value] of formData.entries()) {
        if (value && value !== 'on') {
            summaryHtml += `<li>${key}: ${value}</li>`;
        }
    }

    summaryHtml += "</ul>";

    document.getElementById('summary').innerHTML = summaryHtml;
    document.getElementById('confirmationModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    document.getElementById('resultMessage').style.display = 'none';
}

function handleSubmit(isConfirmed) {
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

        const form = document.getElementById('schade-form');
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!email) {
            console.error("FOUT: Geen e-mailadres opgehaald uit het formulier!");
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resultTextElement.innerHTML = 'FOUT: Geen e-mailadres opgegeven. Vul een geldig e-mailadres in.';
                document.getElementById('resultMessage').style.display = 'block';
            }, 300);
            return;
        }

        const clientData = {
            to_email: email,
            name: formData.get('name'),
            email: email,
            phone: formData.get('phone') || 'Niet opgegeven',
            insurance: formData.get('insurance'),
            polisnummer: formData.get('polisnummer'),
            datum: formData.get('datum'),
            beschrijving: formData.get('beschrijving')
        };

        const adminMessage = `
Nieuwe schademelding ontvangen:

- Naam: ${formData.get('name')}
- E-mail: ${email}
- Telefoon: ${formData.get('phone') || 'Niet opgegeven'}
- Verzekering: ${formData.get('insurance')}
- Polisnummer: ${formData.get('polisnummer')}
- Schadedatum: ${formData.get('datum')}
- Beschrijving: ${formData.get('beschrijving')}
`;

        emailjs.send('service_h6az3sj', 'template_naxxu2a', clientData)
            .then(function(response) {
                console.log('E-mail naar klant verzonden:', response);
                return emailjs.send('service_h6az3sj', 'template_yqe7y7e', {
                    to_email: 'mbuijs@klaasvis.nl',
                    message: adminMessage
                });
            })
            .then(function(response) {
                console.log('E-mail naar mbuijs@klaasvis.nl verzonden:', response);
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    resultTextElement.innerHTML = `
                        <strong>Uw schademelding is verzonden!</strong><br><br>
                        Wij nemen zo spoedig mogelijk contact met u op.
                    `;
                    document.getElementById('resultMessage').style.display = 'block';
                    document.getElementById('schade-form').style.display = 'none';
                }, 300);
            })
            .catch(function(error) {
                console.error('EmailJS fout:', error);
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    resultTextElement.innerHTML = `
                        Er is een fout opgetreden bij het verzenden: ${error.text}<br>
                        Probeer het later opnieuw.
                    `;
                    document.getElementById('resultMessage').style.display = 'block';
                }, 300);
            });
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

document.getElementById('schade-form').addEventListener('submit', function(event) {
    event.preventDefault();
    showModal();
});