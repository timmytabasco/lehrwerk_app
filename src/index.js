import './style.css'; // Importiere globale Styles (Tailwind CSS + eigene CSS-Regeln)

// ==== DOM-Elemente selektieren ====
const hamburgerBtn = document.querySelector('#hamburger');
const mobileMenu = document.querySelector('#mobile-menu');
const mobileOverlay = document.querySelector('#mobile-overlay');
const menuItems = document.querySelectorAll('.menu-item');
const hamburgerLine1 = document.querySelector('#hamburger-line-1');
const hamburgerLine2 = document.querySelector('#hamburger-line-2');
const hamburgerLine3 = document.querySelector('#hamburger-line-3');

let isMenuOpen = false;

function openMenu() {
  isMenuOpen = true;
  hamburgerLine1.classList.add('rotate-45', 'translate-y-2');
  hamburgerLine2.classList.add('opacity-0');
  hamburgerLine3.classList.add('-rotate-45', '-translate-y-2');
  mobileOverlay.classList.remove('pointer-events-none', 'opacity-0');
  mobileOverlay.classList.add('opacity-100');
  mobileMenu.classList.remove('max-h-0');
  mobileMenu.style.maxHeight = 'calc(100vh - 11rem)';
  menuItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.remove('opacity-0', 'translate-y-8', 'scale-90');
      item.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    }, 150 + (index * 100));
  });
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

function closeMenu() {
  isMenuOpen = false;
  hamburgerLine1.classList.remove('rotate-45', 'translate-y-2');
  hamburgerLine2.classList.remove('opacity-0');
  hamburgerLine3.classList.remove('-rotate-45', '-translate-y-2');
  mobileOverlay.classList.add('opacity-0', 'pointer-events-none');
  mobileOverlay.classList.remove('opacity-100');
  menuItems.forEach(item => {
    item.classList.add('opacity-0', 'translate-y-8', 'scale-90');
    item.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
  });
  mobileMenu.classList.add('max-h-0');
  mobileMenu.style.maxHeight = '0px';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMenuOpen ? closeMenu() : openMenu();
  });
}

if (mobileOverlay) {
  mobileOverlay.addEventListener('click', closeMenu);
}

menuItems.forEach(item => {
  const link = item.querySelector('a');
  if (link) {
    link.addEventListener('click', () => {
      closeMenu();
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen) {
    closeMenu();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024 && isMenuOpen) {
    closeMenu();
  }
});

window.addEventListener('load', () => {
  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';
  document.body.style.width = 'auto';
  setTimeout(() => {
    window.scrollBy(0, 1);
    window.scrollTo({ top: 64, behavior: 'instant' });
  }, 100);
});

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
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeBtn.click();
    }
  });
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
    requestAnimationFrame(() => {
      datenschutzModal.classList.add('opacity-100');
    });
  });
  closeDatenschutzBtn.addEventListener('click', () => {
    datenschutzModal.classList.remove('opacity-100');
    setTimeout(() => {
      datenschutzModal.classList.add('hidden');
    }, 300);
  });
}

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
      }, 300);
    }
  });
});

document.querySelectorAll('.nav-start').forEach(link => {
  const isStartseite =
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/index.html');
  if (isStartseite) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof closeMenu === 'function') closeMenu();
      setTimeout(() => {
        window.scrollTo({ top: 80, behavior: "smooth" });
      }, 200);
    });
  } else {
    link.setAttribute('href', '/index.html');
  }
});

const tabButtons = document.querySelectorAll('.tab-button');
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;
    detailBox.innerHTML = '<p class="text-gray-700">Wähle eine Spezialisierung aus, um weitere Informationen anzuzeigen.</p>';
    document.getElementById('fi-list').classList.toggle('hidden', target !== 'fi');
    document.getElementById('kfm-list').classList.toggle('hidden', target !== 'kfm');
    tabButtons.forEach(btn => btn.classList.remove('bg-rose-700', 'text-white'));
    button.classList.add('bg-rose-700', 'text-white');
  });
});

// ==== Inhalte dynamisch anzeigen (nachdem JSON geladen wurde) ====
const specButtons = document.querySelectorAll('.spec-btn');
const detailBox = document.getElementById('detail-box');

let contentMap = {};

fetch('/data/kurse.json')
  .then(res => res.json())
  .then(data => {
    contentMap = data;
    specButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
const key = btn.dataset.content;
const course = contentMap[tab]?.[key];

// Inhalt aktualisieren
detailBox.innerHTML = course
  ? `<h2 class="text-xl font-bold mb-2">${course.title}</h2>${course.content}`
  : '<p>Keine Informationen vorhanden.</p>';

// Alle Buttons zurücksetzen
specButtons.forEach(b => {
  b.classList.remove('bg-rose-700', 'text-white');
  b.classList.add('bg-white', 'text-gray-800');
});

// Aktiven Button hervorheben
btn.classList.remove('bg-white', 'text-gray-800');
btn.classList.add('bg-rose-700', 'text-white');

      });
    });
  });

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab');
  if (initialTab === 'kfm') {
    document.querySelector('[data-tab="kfm"]').click();
  } else {
    document.querySelector('[data-tab="fi"]').click();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Modal-Elemente
  const impressumModal = document.getElementById('impressum-modal');
  const datenschutzModal = document.getElementById('datenschutz-modal');
  const impressumBox = document.getElementById('impressum-box');
  const datenschutzBox = document.getElementById('datenschutz-box');

  // Buttons
  const openImpressumBtn = document.getElementById('open-impressum');
  const closeImpressumBtn = document.getElementById('close-impressum');
  const openDatenschutzBtn = document.getElementById('open-datenschutz');
  const closeDatenschutzBtn = document.getElementById('close-datenschutz');

  // Inhalte laden
  fetch('/data/rechtliches.json')
    .then(res => res.json())
    .then(data => {
      const recht = data.recht;

      if (recht.impressum) {
        impressumBox.innerHTML = `<h2 class="text-xl font-bold mb-4">${recht.impressum.title}</h2>${recht.impressum.content}`;
      }

      if (recht.datenschutz) {
        datenschutzBox.innerHTML = `<h2 class="text-xl font-bold mb-4">${recht.datenschutz.title}</h2>${recht.datenschutz.content}`;
      }
    })
    .catch(err => {
      impressumBox.innerHTML = "<p>Fehler beim Laden des Impressums.</p>";
      datenschutzBox.innerHTML = "<p>Fehler beim Laden der Datenschutzerklärung.</p>";
      console.error('Fehler beim Laden von rechtliches.json:', err);
    });

  // Öffnen
  openImpressumBtn.addEventListener('click', () => {
    impressumModal.classList.remove('hidden');
  });

  openDatenschutzBtn.addEventListener('click', () => {
    datenschutzModal.classList.remove('hidden');
  });

  // Schließen
  closeImpressumBtn.addEventListener('click', () => {
    impressumModal.classList.add('hidden');
  });

  closeDatenschutzBtn.addEventListener('click', () => {
    datenschutzModal.classList.add('hidden');
  });
});
