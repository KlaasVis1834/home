// downloads.js
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = $('#downloads-search');
    const showAllBtn = $('#show-all');
    const cards = $$('.download-card');
    const categories = $$('.downloads-category');

    function normalize(text) {
      return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filterCards(query) {
      const q = normalize(query.trim());
      if (!q) {
        // laat alle categorieën zien en alle kaarten
        categories.forEach(c => c.style.display = '');
        cards.forEach(card => card.style.display = '');
        return;
      }

      // filter kaarten op titel / meta
      cards.forEach(card => {
        const title = normalize(card.querySelector('.download-title')?.textContent || '');
        const meta = normalize(card.querySelector('.download-meta')?.textContent || '');
        const match = title.includes(q) || meta.includes(q);
        card.style.display = match ? '' : 'none';
      });

      // verberg categorie als geen zichtbare kaarten
      categories.forEach(cat => {
        const visible = Array.from(cat.querySelectorAll('.download-card')).some(c => c.style.display !== 'none');
        cat.style.display = visible ? '' : 'none';
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => filterCards(e.target.value));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.target.value = '';
          filterCards('');
        }
      });
    }

    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        filterCards('');
        // scroll naar top van downloads
        window.scrollTo({ top: document.querySelector('.downloads-list').offsetTop - 100, behavior: 'smooth' });
      });
    }

    // kleine enhancement: als bestand niet gevonden is, geef message
    const listContainer = document.querySelector('.downloads-list');
    const observer = new MutationObserver(() => {
      const anyVisible = Array.from(cards).some(c => c.style.display !== 'none');
      const notFoundElId = 'downloads-not-found';
      let notFoundEl = document.getElementById(notFoundElId);

      if (!anyVisible) {
        if (!notFoundEl) {
          notFoundEl = document.createElement('div');
          notFoundEl.id = notFoundElId;
          notFoundEl.style.marginTop = '1rem';
          notFoundEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-muted') || '#64748b';
          notFoundEl.textContent = 'Geen documenten gevonden voor deze zoekopdracht.';
          listContainer.appendChild(notFoundEl);
        }
      } else {
        if (notFoundEl) notFoundEl.remove();
      }
    });

    observer.observe(listContainer, { childList: true, subtree: true });
  });
})();
