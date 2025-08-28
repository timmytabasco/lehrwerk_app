import './style.css'; // Importiere globale Styles (Tailwind CSS)

// =====================================================
// 1. DOM-ELEMENTE SELEKTIONEN
// =====================================================

// Mobile Menu Elemente
const hamburgerBtn = document.querySelector('#hamburger');
const mobileMenu = document.querySelector('#mobile-menu');
const mobileOverlay = document.querySelector('#mobile-overlay');
const menuItems = document.querySelectorAll('.menu-item');
const hamburgerLine1 = document.querySelector('#hamburger-line-1');
const hamburgerLine2 = document.querySelector('#hamburger-line-2');
const hamburgerLine3 = document.querySelector('#hamburger-line-3');

// Modal Elemente
const openBtn = document.getElementById('open-impressum');
const closeBtn = document.getElementById('close-impressum');
const modal = document.getElementById('impressum-modal');
const openDatenschutzBtn = document.getElementById('open-datenschutz');
const closeDatenschutzBtn = document.getElementById('close-datenschutz');
const datenschutzModal = document.getElementById('datenschutz-modal');

// Tab & Content Elemente
const tabButtons = document.querySelectorAll('.tab-button');
const specButtons = document.querySelectorAll('.spec-btn');
const detailBox = document.getElementById('detail-box');

// =====================================================
// 2. GLOBALE VARIABLEN
// =====================================================

let isMenuOpen = false;

// =====================================================
// 3. UTILITY FUNKTIONEN
// =====================================================

function isHomePage() {
  return window.location.pathname === '/' || 
         window.location.pathname.endsWith('/index.html');
}

// =====================================================
// 4. MOBILE MENU FUNKTIONEN
// =====================================================

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

function initMobileMenuEvents() {
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

  // Keyboard und Resize Events
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
}

// =====================================================
// 5. MODAL FUNKTIONEN
// =====================================================

function initImpressumModal() {
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
}

function initDatenschutzModal() {
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
}

function initGenericModals() {
  // Öffnen von Modals
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

  // Schließen von Modals
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
}

// =====================================================
// 6. TAB SYSTEM FUNKTIONEN
// =====================================================

function initTabButtons() {
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
}

function initSpecializationButtons() {
  specButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      const key = btn.dataset.content;
      const course = contentMap[tab]?.[key];

      detailBox.innerHTML = course
        ? `
          <h2 class="text-2xl font-bold mb-4 text-red-700">${course.title}</h2>
          <div class="space-y-5">
            ${course.content
              .replace(/<h3>/g, '<h3 class="font-semibold mt-6 mb-2 text-red-700 text-lg">')
              .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4">')
              .replace(/<p>/g, '<p class="mb-4">')
              .replace(/<p class="mb-2">/g, '<p class="mb-2">')
              .replace(/<a /g, '<a class="underline text-blue-700" ')
            }
          </div>
        `
        : '<p class="text-gray-700">Keine Informationen vorhanden.</p>';

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
}

function initializeTabFromURL() {
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab');

  if (initialTab === 'kfm') {
    document.querySelector('[data-tab="kfm"]')?.click();
  } else {
    document.querySelector('[data-tab="fi"]')?.click(); // Default
  }
}

// =====================================================
// 7. NAVIGATION FUNKTIONEN
// =====================================================

function initStartNavigationLinks() {
  document.querySelectorAll('.nav-start').forEach(link => {
    const isStartseite = isHomePage();
    
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
}

// =====================================================
// 8. SPEZIALEFFEKTE
// =====================================================

function initTypewriter() {
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
}

// =====================================================
// 9. DATEN LADEN FUNKTIONEN
// =====================================================

function loadLegalContent() {
  const impressumModal = document.getElementById('impressum-modal');
  const datenschutzModal = document.getElementById('datenschutz-modal');
  const impressumBox = document.getElementById('impressum-box');
  const datenschutzBox = document.getElementById('datenschutz-box');

  const openImpressumBtn = document.getElementById('open-impressum');
  const closeImpressumBtn = document.getElementById('close-impressum');
  const openDatenschutzBtn = document.getElementById('open-datenschutz');
  const closeDatenschutzBtn = document.getElementById('close-datenschutz');

  // Inhalte laden
  fetch('/data/rechtliches.json')
    .then(res => res.json())
    .then(data => {
      const recht = data.recht;

      if (recht.impressum && impressumBox) {
        impressumBox.innerHTML = `<h2 class="text-xl font-bold mb-4">${recht.impressum.title}</h2>${recht.impressum.content}`;
      }

      if (recht.datenschutz && datenschutzBox) {
        datenschutzBox.innerHTML = `<h2 class="text-xl font-bold mb-4">${recht.datenschutz.title}</h2>${recht.datenschutz.content}`;
      }
    })
    .catch(err => {
      if (impressumBox) impressumBox.innerHTML = "<p>Fehler beim Laden des Impressums.</p>";
      if (datenschutzBox) datenschutzBox.innerHTML = "<p>Fehler beim Laden der Datenschutzerklärung.</p>";
      console.error('Fehler beim Laden von rechtliches.json:', err);
    });

  // Event Listeners
  if (openImpressumBtn && impressumModal) {
    openImpressumBtn.addEventListener('click', () => {
      impressumModal.classList.remove('hidden');
    });
  }

  if (openDatenschutzBtn && datenschutzModal) {
    openDatenschutzBtn.addEventListener('click', () => {
      datenschutzModal.classList.remove('hidden');
    });
  }

  if (closeImpressumBtn && impressumModal) {
    closeImpressumBtn.addEventListener('click', () => {
      impressumModal.classList.add('hidden');
    });
  }

  if (closeDatenschutzBtn && datenschutzModal) {
    closeDatenschutzBtn.addEventListener('click', () => {
      datenschutzModal.classList.add('hidden');
    });
  }
}

function loadInfoModals() {
  fetch('/data/modals.json')
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById("info-modals");
      const modalRoot = document.getElementById("modals-root");

      Object.entries(data).forEach(([id, item]) => {
        // --- Grid-Karte ---
        const card = document.createElement("div");
        card.className = "bg-white p-6 rounded-xl shadow hover:shadow-lg transition group";
        card.innerHTML = `
          <h3 class="text-xl font-semibold text-rose-800 mb-2">${item.icon} ${item.title}</h3>
          <p class="mb-2">${item.teaser}</p>
          <button data-modal-target="modal-${id}" class="mt-2 text-sm text-rose-700 hover:underline">
            ${item.linkText}
          </button>
        `;
        grid.appendChild(card);

        // --- Modal ---
        const modal = document.createElement("div");
        modal.id = "modal-" + id;
        modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden opacity-0 pointer-events-none transition";
        modal.innerHTML = `
          <div class="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <button class="text-5xl absolute top-3 right-3 text-gray-500 close-modal">&times;</button>
            <h2 class="text-2xl font-bold mb-4">${item.title}</h2>
            <div class="modal-content">${item.content}</div>
          </div>
        `;
        modalRoot.appendChild(modal);
      });

      // --- Event Listener für Öffnen ---
      document.querySelectorAll("[data-modal-target]").forEach(btn => {
        btn.addEventListener("click", () => {
          const target = document.getElementById(btn.dataset.modalTarget);
          if (target) {
            target.classList.remove("hidden", "opacity-0", "pointer-events-none");
            target.classList.add("opacity-100");
          }
        });
      });

      // --- Event Listener für Schließen ---
      document.querySelectorAll(".close-modal").forEach(btn => {
        btn.addEventListener("click", () => {
          const modal = btn.closest(".fixed");
          if (modal) {
            modal.classList.add("opacity-0", "pointer-events-none");
            setTimeout(() => modal.classList.add("hidden"), 300);
          }
        });
      });
    })
    .catch(err => console.error("Fehler beim Laden von modals.json:", err));
}


function loadCoursePreview() {
  fetch('/data/kursvorschau.json')
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById('coursepreview-grid');
      if (!grid) return;
      
      grid.innerHTML = '';
      data.forEach(card => {
        grid.innerHTML += `
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-rose-200 border border-rose-100 transition-transform hover:scale-105">
            <h3 class="text-2xl font-semibold text-rose-800 mb-4">${card.headline}</h3>
            <ul class="list-disc pl-3 mb-4">
              ${card.courses.map(course => 
                course.trim() === "" ? 
                `<li class="invisible">-</li>` : 
                `<li>${course}</li>`
              ).join('')}
            </ul>
            <span class="block my-3">${card.duration}</span>
            <a href="${card.link}" class="inline-block mt-2 px-6 py-2 bg-rose-700 text-white rounded-lg">
              ${card.buttonText}
            </a>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error('Fehler beim Laden von kursvorschau.json:', err);
    });
}




// =====================================================
// 10. EXTERNE BIBLIOTHEKEN INITIALISIERUNG
// =====================================================

function initFlatpickr() {
  if (typeof flatpickr !== 'undefined') {
    flatpickr("#datepicker", {
      minDate: "today",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates, dateStr) {
        fetch('/api/appointments/available?date=' + dateStr)
          .then(r => r.json())
          .then(times => {
            const sel = document.getElementById('time-select');
            if (sel) {
              sel.innerHTML = '<option value="">Uhrzeit wählen</option>' +
                times.map(t => `<option value="${t}">${t}</option>`).join('');
            }
          })
          .catch(err => {
            console.error('Fehler beim Laden der verfügbaren Zeiten:', err);
          });
      }
    });
  }
}

// =====================================================
// 11. WINDOW EVENTS
// =====================================================

function initWindowEvents() {
  window.addEventListener('load', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    
    setTimeout(() => {
      window.scrollBy(0, 1);
      window.scrollTo({ top: 64, behavior: 'instant' });
    }, 100);
  });
}

// =====================================================
// 12. HAUPTINITIALISIERUNG
// =====================================================

function initializeApp() {
  // Core Funktionalitäten
  initMobileMenuEvents();
  initImpressumModal();
  initDatenschutzModal();
  initGenericModals();
  initStartNavigationLinks();
  
  // Tab System (falls vorhanden)
  if (tabButtons.length > 0) {
    initTabButtons();
  }
  
  if (specButtons.length > 0) {
    initSpecializationButtons();
  }
  
  // Homepage spezifische Events
  if (isHomePage()) {
    initWindowEvents();
  }
  
  // Externe Bibliotheken
  initFlatpickr();
}

// =====================================================
// 13. DOCUMENT READY EVENT LISTENERS
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  // Spezialeffekte
  initTypewriter();
  
  // Tab System
  initializeTabFromURL();
  
  // Daten laden
  loadLegalContent();
  loadInfoModals();
  loadCoursePreview();
  
});

// =====================================================
// 14. APP START
// =====================================================

// Hauptinitialisierung starten
initializeApp();


// Lernmaterial-Modal – eigene Variablenamen
const btnMaterials      = document.querySelector('#btn-materials');
const materialsModal    = document.querySelector('#materials-modal');
const materialsForm     = document.querySelector('#materials-form');
const materialsInput    = document.querySelector('#materials-code-input');
const materialsCancel   = document.querySelector('#materials-cancel');
const materialsError    = document.querySelector('#materials-error');

const MATERIALS_CODE = 'LEHRWERK2025'; // deinen Code hier

function openMaterialsModal() {
  materialsModal.classList.remove('hidden');
  materialsModal.classList.add('flex');
  materialsError.classList.add('hidden');
  materialsInput.value = '';
  setTimeout(() => materialsInput.focus(), 50);
}
function closeMaterialsModal() {
  materialsModal.classList.add('hidden');
  materialsModal.classList.remove('flex');
}

btnMaterials?.addEventListener('click', (e) => {
  e.preventDefault();
  openMaterialsModal();
});
materialsCancel?.addEventListener('click', closeMaterialsModal);
materialsModal?.addEventListener('click', (e) => {
  if (e.target === materialsModal) closeMaterialsModal(); // Overlay-Klick
});

materialsForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = materialsInput.value.trim();

  try {
    const res = await fetch('/api/materials-auth/check-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();

    if (data.ok) {
      sessionStorage.setItem('materials_ok', '1');
      window.location.href = '/materials.html';
    } else {
      materialsError.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Fehler bei Auth:', err);
    materialsError.classList.remove('hidden');
  }
});


if (window.location.pathname.endsWith('/materials.html')) {
  const ok = sessionStorage.getItem('materials_ok') === '1';
  if (!ok) {
    window.location.href = '/#materials-locked';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') materialsModal && materialsModal.classList.add('hidden');
});

materialsInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') materialsForm.requestSubmit();
});

