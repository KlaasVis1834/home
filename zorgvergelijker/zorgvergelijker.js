/* ===========================
   HAMBURGER MENU
=========================== */
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');

if (hamburger && navList) {
  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !navList.classList.contains('active');
    navList.classList.toggle('active', isOpen);
    hamburger.textContent = isOpen ? '✕' : '☰';
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  hamburger.addEventListener('click', () => toggleMenu());
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hamburger') && !e.target.closest('.nav-list')) {
      toggleMenu(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });
}
