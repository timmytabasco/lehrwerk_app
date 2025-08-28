

// ====== API-Basis ======
const API_BASE = 'http://178.254.25.12:3000';

// ====== DOM ======
const listEl  = document.querySelector('#materials-list');
const emptyEl = document.querySelector('#materials-empty');

// ====== Helpers ======
function getBaseName(p) {
  // holt den Dateinamen aus einem Pfad wie "/materials/ordner/hello.txt"
  if (!p) return '';
  const parts = p.split('/');
  return parts[parts.length - 1];
}

function niceFileName(title, original) {
  // schöner Dateiname für den Download (optional; Browser können den ignorieren)
  const t = (title || 'material').trim().replace(/\s+/g, '_');
  const hasExt = /\.[A-Za-z0-9]+$/.test(original || '');
  return hasExt ? t + original.slice(original.lastIndexOf('.')) : t;
}

function viewUrl(pathFromDb) {
  // zeigt die Datei inline (z. B. Text/PDF/Bild)
  if (!pathFromDb) return '#';
  return pathFromDb.startsWith('http') ? pathFromDb : `${API_BASE}${pathFromDb}`;
}

function downloadUrl(pathFromDb) {
  // erzwingt Download über Backend-Route /dl/:name
  const base = getBaseName(pathFromDb);
  if (!base) return '#';
  return `${API_BASE}/dl/${encodeURIComponent(base)}`;
}

// ====== Karte ======
function cardTpl(m) {
  const title = m.title || 'Ohne Titel';
  const hrefView = viewUrl(m.path);
  const hrefDl   = downloadUrl(m.path);
  const dlName   = niceFileName(title, getBaseName(m.path));

  return `
    <article class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <h2 class="text-lg font-semibold text-neutral-900 line-clamp-2">${title}</h2>

      <div class="mt-4 flex items-center gap-3">
        <!-- Download (erzwingt Speichern) -->
        <a href="${hrefDl}" download="${dlName}"
           class="rounded-lg bg-rose-700 px-4 py-2 text-sm text-white hover:bg-rose-800">
          Download
        </a>

        <!-- Optional: Anzeigen (im Tab öffnen) -->
        <a href="${hrefView}" target="_blank" rel="noopener"
           class="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50">
          Öffnen
        </a>
      </div>
    </article>
  `;
}

// ====== Daten laden ======
async function loadMaterials() {
  try {
    const res  = await fetch(`${API_BASE}/api/materials`);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      emptyEl && emptyEl.classList.remove('hidden');
      return;
    }

    listEl.innerHTML = data.map(cardTpl).join('');
  } catch (err) {
    console.error(err);
    if (emptyEl) {
      emptyEl.textContent = 'Fehler beim Laden der Materialien.';
      emptyEl.classList.remove('hidden');
    }
  }
}

// Nur ausführen, wenn die Liste existiert
if (listEl) loadMaterials();
