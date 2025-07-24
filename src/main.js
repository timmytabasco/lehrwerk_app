import './style.css'

// Elemente greifen
const hamburgerBtn = document.querySelector('#hamburger');
const mobileMenu = document.querySelector('#mobile-menu');
const mobileOverlay = document.querySelector('#mobile-overlay');
const menuItems = document.querySelectorAll('.menu-item');
const hamburgerLine1 = document.querySelector('#hamburger-line-1');
const hamburgerLine2 = document.querySelector('#hamburger-line-2');
const hamburgerLine3 = document.querySelector('#hamburger-line-3');

let isMenuOpen = false;

// Menü öffnen
function openMenu() {
  isMenuOpen = true;

  // Hamburger zu X
  hamburgerLine1.classList.add('rotate-45', 'translate-y-2');
  hamburgerLine2.classList.add('opacity-0');
  hamburgerLine3.classList.add('-rotate-45', '-translate-y-2');

  // Overlay zeigen
  mobileOverlay.classList.remove('pointer-events-none', 'opacity-0');
  mobileOverlay.classList.add('opacity-100');

  // Menü öffnen via Klassen 
  mobileMenu.classList.remove('max-h-0');
  mobileMenu.style.maxHeight = 'calc(100vh - 11rem)'; // oder '104px'


  // Menü-Items animieren
  menuItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.remove('opacity-0', 'translate-y-8', 'scale-90');
      item.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    }, 150 + (index * 100));
  });

  // Scroll sperren
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

// Menü schließen
function closeMenu() {
  isMenuOpen = false;

  // Hamburger zurück
  hamburgerLine1.classList.remove('rotate-45', 'translate-y-2');
  hamburgerLine2.classList.remove('opacity-0');
  hamburgerLine3.classList.remove('-rotate-45', '-translate-y-2');

  // Overlay ausblenden
  mobileOverlay.classList.add('opacity-0', 'pointer-events-none');
  mobileOverlay.classList.remove('opacity-100');

  // Menü-Items verstecken
  menuItems.forEach(item => {
    item.classList.add('opacity-0', 'translate-y-8', 'scale-90');
    item.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
  });

  // Menü schließen via Klassen
 mobileMenu.classList.add('max-h-0');
mobileMenu.style.maxHeight = '0px';


  // Scroll wieder erlauben
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

// Hamburger klick
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMenuOpen ? closeMenu() : openMenu();
  });
}

// Overlay klick
if (mobileOverlay) {
  mobileOverlay.addEventListener('click', closeMenu);
}

// Menüpunkte klicken
menuItems.forEach(item => {
  const link = item.querySelector('a');
  if (link) {
    link.addEventListener('click', () => {
      closeMenu();
    });
  }
});

// Escape-Taste
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen) {
    closeMenu();
  }
});

// Scroll-Anpassung bei Bildschirmwechsel
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024 && isMenuOpen) {
    closeMenu();
  }
});

// Scroll beim Laden (mobil-sicher)
window.addEventListener('load', () => {
  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';
  document.body.style.width = 'auto';

  setTimeout(() => {
    window.scrollBy(0, 1); // Safari-Nudge
    window.scrollTo({
      top: 64,
      behavior: 'instant',
    });
  }, 100);
});

// Scroll zu „Start“
document.querySelectorAll('a[href="#start"], a[href="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => {
      window.scrollTo({
        top: 64,
        behavior: "smooth"
      });
    }, 200);
  });
});

// Typewriter
document.addEventListener("DOMContentLoaded", function () {
  const target = document.getElementById("typewriter");

  if (target) {
    const text = "Mach den ersten Schritt in die Digitalisierung!👨‍💻";
    let index = 0;

    function type() {
      if (index < text.length) {
        target.textContent += text.charAt(index);
        index++;
        setTimeout(type, 30);
      }
    }

    type();
  }
});
