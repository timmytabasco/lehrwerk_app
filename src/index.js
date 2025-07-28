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

// Öffnen und Schließen des Impressums

const openBtn = document.getElementById('open-impressum');
const closeBtn = document.getElementById('close-impressum');
const modal = document.getElementById('impressum-modal');

if (openBtn && closeBtn && modal) {
  openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('opacity-100');
    document.body.style.overflow = 'auto';
  });

  // Optional: Klick außerhalb schließt das Modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeBtn.click();
    }
  });

  // ESC-Taste schließt das Modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('opacity-100')) {
      closeBtn.click();
    }
  });
}

const openDatenschutzBtn = document.getElementById('open-datenschutz');
const closeDatenschutzBtn = document.getElementById('close-datenschutz');
const datenschutzModal = document.getElementById('datenschutz-modal');

if (openDatenschutzBtn && closeDatenschutzBtn && datenschutzModal) {
  openDatenschutzBtn.addEventListener('click', () => {
    datenschutzModal.classList.remove('hidden');
    // Optional für weichen Übergang:
    requestAnimationFrame(() => {
      datenschutzModal.classList.add('opacity-100');
    });
  });

  closeDatenschutzBtn.addEventListener('click', () => {
    datenschutzModal.classList.remove('opacity-100');
    setTimeout(() => {
      datenschutzModal.classList.add('hidden');
    }, 300); // muss zur transition-opacity duration passen
  });
}

// JS für Modal-Interaktion 

document.querySelectorAll('[data-modal-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.modalTarget;
    const modal = document.getElementById(targetId);
    if (modal) {
      modal.classList.remove('hidden');
      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
      });
    }
  });
});

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.fixed');
    if (modal) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300); // muss zu deiner Transition-Zeit passen
    }
  });
});


document.querySelectorAll('.nav-start').forEach(link => {
  const isStartseite =
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/index.html');

  if (isStartseite) {
    // Scroll auf Startseite (nicht ganz oben, sondern z. B. 64px)
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Optional: Menü schließen, wenn du mobile Menü hast
      if (typeof closeMenu === 'function') closeMenu();

      setTimeout(() => {
        window.scrollTo({
          top: 80,
          behavior: "smooth"
        });
      }, 200);
    });
  } else {
    // Auf anderen Seiten → zurück zur Startseite
    link.setAttribute('href', '/index.html');
  }
});
