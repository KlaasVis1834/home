document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    // Placeholder RSS-feed URL - vervang door een echte URL, zoals die van verzekeringsnieuws.nl
    const rssFeedUrl = 'https://www.verzekeringsnieuws.nl/rss'; 

    // Functie om nieuws op te halen en te tonen
    async function fetchNews() {
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssFeedUrl);
            const response = await fetch(proxyUrl);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');

            if (items.length === 0) {
                newsContainer.innerHTML = '<p>Geen nieuws beschikbaar op dit moment.</p>';
                return;
            }

            items.forEach(item => {
                const title = item.querySelector('title')?.textContent || 'Geen titel';
                const link = item.querySelector('link')?.textContent || '#';
                const pubDate = item.querySelector('pubDate')?.textContent || 'Onbekende datum';
                const description = item.querySelector('description')?.textContent || 'Geen beschrijving';

                const newsItem = document.createElement('div');
                newsItem.classList.add('col-md-4', 'news-card');
                newsItem.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title"><a href="${link}" target="_blank">${title}</a></h5>
                            <p class="card-text">${description.substring(0, 100)}...</p>
                            <p class="card-text"><small class="text-muted">${new Date(pubDate).toLocaleDateString()} - Bron: ${new URL(link).hostname}</small></p>
                        </div>
                    </div>
                `;

                newsContainer.appendChild(newsItem);
            });
        } catch (error) {
            console.error('Fout bij ophalen nieuws:', error);
            newsContainer.innerHTML = '<p>Er is een fout opgetreden bij het ophalen van het nieuws.</p>';
        }
    }

    // Contactformulier logica (werkt met Formspree)
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                alert('Bericht succesvol verzonden!');
                contactForm.reset();
            } else {
                alert('Er ging iets mis. Probeer het opnieuw.');
            }
        } catch (error) {
            console.error('Fout bij verzenden formulier:', error);
            alert('Er ging iets mis. Probeer het opnieuw.');
        }
    });

    // Roep de nieuwsfunctie aan
    fetchNews();
});