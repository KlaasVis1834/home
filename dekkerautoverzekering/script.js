console.log('JS: Script geladen');

// Menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        console.log('Menu: Toggle geklikt');
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
} else {
    console.warn('Menu: Toggle of nav niet gevonden');
}

// Car selector
const carButtons = document.querySelectorAll('.car-btn');
const carImages = document.querySelectorAll('.car-img');

if (carButtons.length && carImages.length) {
    carButtons.forEach(button => {
        button.addEventListener('click', () => {
            const car = button.dataset.car;
            console.log(`Car: Geklikt op ${car}`);

            // Update knoppen
            carButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update afbeeldingen
            carImages.forEach(img => img.classList.remove('active'));
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