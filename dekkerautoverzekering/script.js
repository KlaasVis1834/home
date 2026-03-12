console.log('JS: Script geladen');

document.addEventListener('DOMContentLoaded', () => {
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
            console.log('Hamburger: Geklikt');
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
    } else {
        console.warn('Hamburger of nav-list niet gevonden');
    }

    /* ===========================
       CAR SELECTOR
    =========================== */
    const carButtons = document.querySelectorAll('.car-btn');
    const carImages = document.querySelectorAll('.car-img');

    if (carButtons.length && carImages.length) {
        carButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const car = button.dataset.car;
                console.log(`Car: Geklikt op ${car}`);

                carButtons.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');

                carImages.forEach((img) => img.classList.remove('active'));

                const targetImg = document.querySelector(`.car-img[data-car="${car}"]`);
                if (targetImg) {
                    targetImg.classList.add('active');
                    console.log(`Car: Toon ${targetImg.alt}`);
                } else {
                    console.warn(`Car: Afbeelding voor ${car} niet gevonden`);
                }
            });
        });
    } else {
        console.warn('Car: Knoppen of afbeeldingen niet gevonden');
    }
});
