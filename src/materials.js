// materials.js

// ====== DOM ======
const listEl  = document.querySelector('#materials-list');
const emptyEl = document.querySelector('#materials-empty');

// ====== Helpers ======
function getBaseName(p) {
  if (!p) return '';
  const parts = p.split('/');
  return parts[parts.length - 1];
}

function getExt(p) {
  const b = getBaseName(p);
  const i = b.lastIndexOf('.');
  return i !== -1 ? b.slice(i + 1).toLowerCase() : '';
}

function niceFileName(title, original) {
  const t = (title || 'material').trim().replace(/\s+/g, '_');
  const hasExt = /\.[A-Za-z0-9]+$/.test(original || '');
  return hasExt ? t + original.slice(original.lastIndexOf('.')) : t;
}

/**
 * Mappt DB-Pfade auf eine öffentlich abrufbare URL unter /storage/...
 * - HTTP(S) bleibt unverändert (externe Ressourcen)
 * - Pfade wie "materials/a.pdf" -> "/storage/materials/a.pdf"
 * - Pfade wie "/storage/materials/a.pdf" -> bleiben so
 */
function toStorageUrl(pathFromDb) {
  if (!pathFromDb) return '#';
  if (/^https?:\/\//i.test(pathFromDb)) return pathFromDb;

  // führende ./ oder / entfernen
  let p = String(pathFromDb).replace(/^\.?\/*/, '');
  // wenn noch kein "storage/" Prefix, ergänzen
  if (!p.startsWith('storage/')) {
    p = 'storage/' + p;
  }
  return '/' + p;
}

/**
 * Download-Link: nur der Basename wird an /dl/:name gehängt.
 * Achtung: Server erlaubt bewusst NUR sichere Basenames.
 */
function toDownloadUrl(pathFromDb) {
  const base = getBaseName(pathFromDb);
  if (!base) return '#';
  return `/dl/${encodeURIComponent(base)}`;
}

// Optionale kleine Icon-Auswahl nach Dateiendung (nur visuell)
function fileBadge(ext) {
  const map = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📈',
    pptx: '📈',
    txt: '🧾',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
    mp4: '🎞️',
    mp3: '🎧',
    wav: '🎧',
    zip: '🗜️',
    rar: '🗜️'
  };
  return map[ext] || '📦';
}

// ====== Template ======
function cardTpl(m) {
  const title     = (m.title || 'Ohne Titel').toString();
  const original  = (m.path || '').toString();
  const hrefView  = toStorageUrl(original);
  const hrefDl    = toDownloadUrl(original);
  const dlName    = niceFileName(title, getBaseName(original));
  const ext       = getExt(original);
  const badge     = fileBadge(ext);

  const safeTitle = escapeHtml(title);

  return `
    <article class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <h2 class="text-lg font-semibold text-neutral-900 line-clamp-2 flex items-center gap-2">
        <span>${badge}</span>
        <span title="${safeTitle}">${safeTitle}</span>
      </h2>

      <div class="mt-4 flex items-center gap-3">
        <!-- Download (erzwingt Speichern) -->
        <a href="${hrefDl}" download="${dlName}"
           class="rounded-lg bg-rose-700 px-4 py-2 text-sm text-white hover:bg-rose-800">
          Download
        </a>

        <!-- Anzeigen (im neuen Tab öffnen) -->
        <a href="${hrefView}" target="_blank" rel="noopener"
           class="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50">
          Öffnen
        </a>
      </div>

      <p class="mt-3 text-xs text-neutral-500 break-all">
        ${ext ? ext.toUpperCase() + ' · ' : ''}${getBaseName(original) || 'ohne Dateiname'}
      </p>
    </article>
  `;
}

// Einfache HTML-Escape, damit Titel nicht als HTML interpretiert werden
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ====== Daten laden & rendern ======
async function loadMaterials() {
  if (!listEl) return;

  // Optional: kleines Skelett während des Ladens
  listEl.innerHTML = skeletonCards(6);

  try {
    const res = await fetch('/api/materials', { credentials: 'include' });
    console.log('[materials] status', res.status);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const body = await res.json();
    console.log('[materials] json', body);

    const items = Array.isArray(body)
      ? body
      : Array.isArray(body.items)
        ? body.items
        : Array.isArray(body.data)
          ? body.data
          : [];

    if (!items.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.textContent = 'Keine Materialien gefunden.';
        emptyEl.classList.remove('hidden');
      }
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    listEl.innerHTML = items.map(cardTpl).join('');
  } catch (err) {
    console.error('[materials] load error', err);
    listEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.textContent = 'Fehler beim Laden der Materialien.';
      emptyEl.classList.remove('hidden');
    }
  }
}

// Kleines Lade-Skelett
function skeletonCards(n = 3) {
  return Array.from({ length: n }).map(() => `
    <article class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm animate-pulse">
      <div class="h-5 w-2/3 bg-neutral-200 rounded"></div>
      <div class="mt-4 flex gap-3">
        <div class="h-9 w-24 bg-neutral-200 rounded-lg"></div>
        <div class="h-9 w-24 bg-neutral-100 border rounded-lg"></div>
      </div>
      <div class="mt-3 h-3 w-1/2 bg-neutral-200 rounded"></div>
    </article>
  `).join('');
}

// ====== Init ======
loadMaterials();
