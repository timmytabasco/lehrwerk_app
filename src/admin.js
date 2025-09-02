// =========================
// admin.js (CMS)
// =========================


// ---- Helpers ----
const $ = (s) => document.querySelector(s);
const PAGE_SIZE = 10; // Pager-Größe für CMS-Listen

function showApp() {
  $('#login-section')?.classList.add('hidden');
  $('#content-section')?.classList.remove('hidden');
  $('#materials-section')?.classList.remove('hidden');
  $('#btn-logout')?.classList.remove('hidden');
  $('#images-section')?.classList.remove('hidden');
  $('#pwd-section')?.classList.remove('hidden');
  $('#contacts-section')?.classList.remove('hidden');
  $('#appointments-section')?.classList.remove('hidden');
  wireImagesUI(); 
  renderImages();
}

function showLogin() {
  $('#content-section')?.classList.add('hidden');
  $('#materials-section')?.classList.add('hidden');
  $('#login-section')?.classList.remove('hidden');
  $('#btn-logout')?.classList.add('hidden');
  $('#images-section')?.classList.add('hidden');
  $('#pwd-section')?.classList.add('hidden');
  $('#contacts-section')?.classList.add('hidden');
  $('#appointments-section')?.classList.add('hidden');
}

// zentraler Fetch-Wrapper: inkl. Cookies & 401-Handling
async function APIJson(url, opt = {}) {
  const r = await fetch(url, {
    credentials: 'include',
    ...opt
  });
  if (r.status === 401) {
    // Session ungültig -> UI sperren
    showLogin();
    throw new Error('Unauthenticated');
  }
  // Bei 204 kein JSON
  if (r.status === 204) return { ok: true };
  return r.json();
}

// ---- Login ----
$('#btn-login')?.addEventListener('click', async () => {
  const email = $('#login-email').value.trim().toLowerCase();
  const password = $('#login-pass').value;

  const j = await APIJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).catch(err => ({ ok: false, message: String(err) }));

  $('#login-msg').textContent = j.ok ? 'Erfolgreich eingeloggt.' : (j.message || 'Fehler');
  if (j.ok) {
    showApp();
    loadCourses();
    loadMaterials();
    loadContacts();
    loadAppointments();
  }
});

// Optional: Logout-Button (nur wenn in HTML vorhanden)
$('#btn-logout')?.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  showLogin();
});

// ---- Content: Laden ----
$('#btn-load')?.addEventListener('click', async () => {
  const name = $('#content-select').value;
  const j = await APIJson('/api/cms/content/' + encodeURIComponent(name))
    .catch(err => ({ ok: false, message: String(err) }));
  if (j.ok) {
    $('#content-area').value = JSON.stringify(j.data, null, 2);
    $('#content-msg').textContent = 'Geladen';
  } else {
    $('#content-msg').textContent = j.message || 'Fehler';
  }
});

// ---- Content: Speichern ----
$('#btn-save')?.addEventListener('click', async () => {
  const name = $('#content-select').value;
  let data;
  try {
    data = JSON.parse($('#content-area').value);
  } catch {
    $('#content-msg').textContent = 'JSON ungültig';
    return;
  }

  const j = await APIJson('/api/cms/content/' + encodeURIComponent(name), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => ({ ok: false, message: String(err) }));

  $('#content-msg').textContent = j.ok ? 'Gespeichert' : (j.message || 'Fehler');
});

// ---- Helper-Funktionen für Material-Pfade ----

/**
 * Konvertiert DB-Pfad zu Storage-URL für Anzeige
 * DB: "materials/12345_file.pdf" -> URL: "/storage/materials/12345_file.pdf"
 */
function toStorageUrl(pathFromDb) {
  if (!pathFromDb) return '#';
  if (/^https?:\/\//i.test(pathFromDb)) return pathFromDb;
  let cleanPath = pathFromDb.replace(/^\.?\/*/, '');
  if (!cleanPath.startsWith('storage/')) {
    cleanPath = 'storage/' + cleanPath;
  }
  return '/' + cleanPath;
}

/**
 * Konvertiert DB-Pfad zu Download-URL
 * DB: "materials/12345_file.pdf" -> URL: "/dl/12345_file.pdf"
 */
function toDownloadUrl(pathFromDb) {
  if (!pathFromDb) return '#';
  const basename = pathFromDb.split('/').pop(); // Nur den Dateinamen
  return `/dl/${encodeURIComponent(basename)}`;
}

/**
 * Generiert schönen Download-Namen aus Titel
 */
function niceFileName(title, originalPath) {
  const cleanTitle = (title || 'material')
    .trim()
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '')
    .replace(/\s+/g, '_');
  const basename = originalPath ? originalPath.split('/').pop() : '';
  const ext = basename.includes('.') ? basename.split('.').pop() : '';
  return ext ? `${cleanTitle}.${ext}` : cleanTitle;
}

// ---- Materialien: Liste laden ----
async function loadMaterials() {
  const box = $('#materials-list');
  if (!box) return;

  box.innerHTML = '<p class="text-stone-500">Lade Materialien...</p>';

  const j = await APIJson('/api/cms/materials')
    .catch(err => ({ ok: false, message: String(err) }));

  if (!j.ok || !Array.isArray(j.items)) {
    box.innerHTML = '<p class="text-red-500">Fehler beim Laden der Materialien</p>';
    return;
  }

  if (j.items.length === 0) {
    box.innerHTML = '<p class="text-stone-500">Keine Materialien vorhanden</p>';
    return;
  }

  box.innerHTML = j.items.map(item => {
    const storageUrl   = toStorageUrl(item.path);
    const downloadUrl  = toDownloadUrl(item.path);
    const downloadName = niceFileName(item.title, item.path);
    const fileExt      = item.path ? item.path.split('.').pop()?.toLowerCase() || '' : '';

    // Kursname oder Fallback
    const courseInfo = item.course_name
      ? escapeHtml(item.course_name)
      : 'Kein Kurs';

    return `
      <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b last:border-b-0">
        <div class="flex-1">
          <div class="font-semibold text-gray-900">${escapeHtml(item.title)}</div>
          <div class="text-sm text-stone-500 mt-1">
            ${courseInfo} • ${fileExt ? fileExt.toUpperCase() : ''}
          </div>
          ${item.created_at
            ? `<div class="text-xs text-stone-400 mt-1">Erstellt: ${formatTs(item.created_at)}</div>` : ''}
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Anzeigen -->
          <a href="${storageUrl}"
             target="_blank"
             rel="noopener"
             class="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
            Öffnen
          </a>

          <!-- Download -->
          <a href="${downloadUrl}"
             download="${downloadName}"
             class="px-3 py-1 bg-rose-700 text-white rounded hover:bg-rose-800 text-sm">
            Download
          </a>

          <!-- Löschen -->
          <button data-id="${item.id}"
                  class="btn-del px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 text-sm">
            Löschen
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Event-Listener für Löschen-Buttons
  box.querySelectorAll('.btn-del').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      const title = b.closest('.py-4').querySelector('.font-semibold').textContent;

      if (!confirm(`Material "${title}" wirklich löschen?`)) return;

      b.textContent = 'Lösche...';
      b.disabled = true;

      const del = await APIJson('/api/cms/materials/' + id, { method: 'DELETE' })
        .catch(err => ({ ok: false, message: String(err) }));

      if (del.ok) {
        loadMaterials(); // Liste neu laden
      } else {
        alert(del.message || 'Löschen fehlgeschlagen');
        b.textContent = 'Löschen';
        b.disabled = false;
      }
    });
  });
}

$('#btn-refresh-mats')?.addEventListener('click', loadMaterials);

// ---- Materialien: Upload ----
$('#upload-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const courseId = $('#mat-course').value.trim(); // darf leer sein
  const title = $('#mat-title').value.trim();
  const fileInput = $('#mat-file');
  const file = fileInput.files[0];

  // Validierung (Kurs NICHT mehr Pflicht)
  if (!title)  return alert('Bitte Titel eingeben');
  if (!file)   return alert('Bitte Datei auswählen');

  const formData = new FormData();
  if (courseId) formData.append('course_id', courseId); // nur mitsenden, wenn gewählt
  formData.append('title', title);
  formData.append('file', file);

  const submitBtn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('button');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Uploade...';
  submitBtn.disabled = true;

  try {
    const j = await APIJson('/api/cms/materials', { method: 'POST', body: formData });
    if (j.ok) {
      // Formular zurücksetzen
      $('#mat-course').value = '';
      $('#mat-title').value = '';
      fileInput.value = '';
      alert('Material erfolgreich hochgeladen!');
      loadMaterials();
    } else {
      alert(j.message || 'Upload fehlgeschlagen');
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('Upload fehlgeschlagen: ' + err.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Passwort ändern
$('#btn-pwd')?.addEventListener('click', async () => {
  const cur  = $('#pwd-current')?.value || '';
  const nxt  = $('#pwd-next')?.value || '';
  const nxt2 = $('#pwd-next2')?.value || '';
  const msg  = $('#pwd-msg');
  const say = (t, cls='text-sm text-stone-500') => { msg.textContent = t; msg.className = cls; };

  // einfache Validierung
  if (!cur || !nxt || !nxt2) return say('Bitte alle Felder ausfüllen.', 'text-sm text-rose-600');
  if (nxt !== nxt2)          return say('Neues Passwort stimmt nicht überein.', 'text-sm text-rose-600');
  if (nxt.length < 8)        return say('Neues Passwort zu kurz (min. 8 Zeichen).', 'text-sm text-rose-600');

  // Button während des Requests deaktivieren
  const btn = $('#btn-pwd');
  const btnLabel = btn.textContent;
  btn.disabled = true; btn.textContent = 'Ändere…';

  try {
    say('Sende …');
    const r = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ current: cur, next: nxt })
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      // bevorzugt Server-Meldung anzeigen
      return say(j.message || `Fehler (${r.status})`, 'text-sm text-rose-600');
    }

    say('Passwort geändert. Bitte neu einloggen.', 'text-sm text-green-700');

    // Felder leeren
    $('#pwd-current').value = '';
    $('#pwd-next').value = '';
    $('#pwd-next2').value = '';

    // Session beenden & zurück zum Login
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    showLogin();
  } catch (e) {
    say('Serverfehler beim Ändern.', 'text-sm text-rose-600');
  } finally {
    btn.disabled = false;
    btn.textContent = btnLabel;
  }
});

// ---- XSS-Helper ----
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// ---- Format-Helfer für Timestamps (Contacts/Appointments) ----
// ersetzt die alte formatTs-Funktion
function formatTs(v) {
  if (!v) return '';
  try {
    let d;

    if (v instanceof Date) {
      d = v;
    } else if (typeof v === 'string') {
      // ISO mit Z: 2025-09-02T08:02:41.000Z -> korrekt als UTC parsen
      if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
        d = new Date(v); // behält die UTC-Info
      } else {
        // MySQL-Format: 'YYYY-MM-DD HH:MM:SS' -> als lokale Zeit interpretieren
        const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
        if (m) {
          d = new Date(
            Number(m[1]),
            Number(m[2]) - 1,
            Number(m[3]),
            Number(m[4]),
            Number(m[5]),
            Number(m[6])
          );
        } else {
          d = new Date(v);
        }
      }
    } else {
      d = new Date(v);
    }

    if (isNaN(d)) return String(v);
    // Immer in Europe/Berlin anzeigen (inkl. Sommerzeit)
    return d.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', hour12: false });
  } catch {
    return String(v);
  }
}


// ---- Bilder-Management ----
async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/images', { method: 'POST', body: fd });
  if (!r.ok) throw new Error('Upload fehlgeschlagen');
  return r.json(); // { filename, url }
}

async function fetchImages() {
  const r = await fetch('/api/images');
  if (!r.ok) throw new Error('Liste fehlgeschlagen');
  return r.json(); // [{filename, url}, ...]
}

async function deleteImage(filename) {
  const r = await fetch(`/api/images/${encodeURIComponent(filename)}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Löschen fehlgeschlagen');
  return r.json();
}

async function renderImages() {
  const container = document.querySelector('#images-list');
  if (!container) return; // falls der Bereich auf der Seite nicht existiert

  container.innerHTML = "<p class='col-span-full text-sm text-stone-500'>Lade…</p>";

  try {
    const imgs = await fetchImages();
    if (!Array.isArray(imgs) || imgs.length === 0) {
      container.innerHTML = "<p class='col-span-full text-sm text-stone-500'>Keine Bilder vorhanden</p>";
      return;
    }

    container.innerHTML = "";
    imgs.forEach(img => {
      const card = document.createElement('div');
      card.className = "relative bg-white rounded-xl shadow p-2 flex flex-col items-center";

      const image = document.createElement('img');
      image.src = img.url;
      image.alt = img.filename;
      image.className = "w-full h-32 object-contain mb-2";

      const name = document.createElement('div');
      name.textContent = img.filename;
      name.className = "text-xs text-stone-500 mb-2 break-all text-center";

      const btn = document.createElement('button');
      btn.textContent = "Löschen";
      btn.className = "px-2 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700";
      btn.onclick = async () => {
        if (confirm(`Bild ${img.filename} wirklich löschen?`)) {
          btn.disabled = true;
          btn.textContent = 'Lösche…';
          try {
            await deleteImage(img.filename);
            await renderImages();
          } catch (e) {
            alert(e.message || 'Löschen fehlgeschlagen');
          }
        }
      };

      card.appendChild(image);
      card.appendChild(name);
      card.appendChild(btn);
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = "<p class='col-span-full text-sm text-rose-600'>Fehler beim Laden</p>";
    console.error(err);
  }
}

// ---- Kurse laden ----
async function loadCourses() {
  const select = $('#mat-course');
  if (!select) return;

  // Platzhalter leeren + Standardoption
  select.innerHTML = '<option value="">– bitte wählen –</option>';

  try {
    const j = await APIJson('/api/courses');
    if (!j.ok || !Array.isArray(j.items) || j.items.length === 0) {
      select.innerHTML += '<option disabled>— keine Kurse gefunden —</option>';
      return;
    }

    j.items.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Fehler beim Laden der Kurse:', err);
    select.innerHTML += '<option disabled>— Fehler beim Laden —</option>';
  }
}

// UI verkabeln (IDs müssen zu deinem admin.html passen)
function wireImagesUI() {
  // **Formular**-Upload (empfohlen)
  const form = document.querySelector('#img-upload-form');
  const fileInput = document.querySelector('#img-file');
  if (form && fileInput) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) return;
      try {
        await uploadImage(file);
        fileInput.value = "";
        await renderImages();
      } catch (e) {
        alert(e.message || 'Upload fehlgeschlagen');
      }
    });
  }

  // **Refresh**-Button
  const btnRefresh = document.querySelector('#btn-refresh-imgs');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', renderImages);
  }
}

// Beim Login anzeigen + einmal laden
(function hookImagesIntoApp() {
  const _showApp = showApp;
  window.showApp = function () {
    _showApp();
    // Bereich einblenden (falls dein showApp das nicht schon macht)
    document.querySelector('#images-section')?.classList.remove('hidden');
    renderImages();
  };

  const _showLogin = showLogin;
  window.showLogin = function () {
    _showLogin();
    document.querySelector('#images-section')?.classList.add('hidden');
  };
})();

// =========================
// Contacts (CMS)
// =========================
let contactsOffset = 0;
let contactsTotal = 0;

async function loadContacts() {
  const q = $('#contacts-q')?.value?.trim() || '';

  const url = new URL('/api/cms/contacts', location.origin);
  url.searchParams.set('limit', PAGE_SIZE);
  url.searchParams.set('offset', contactsOffset);
  if (q) url.searchParams.set('q', q);

  const j = await APIJson(url, { method: 'GET' })
    .catch(err => ({ ok:false, message:String(err) }));
  if (!j || j.error) {
    console.error('Fehler Kontakte:', j?.error || j?.message);
    renderContacts([]);
    renderContactsPager();
    return;
  }

  contactsTotal = Number(j.total || 0);
  renderContacts(j.items || []);
  renderContactsPager();
}

// ersetze deine formatDateDe durch diese "safe" Version
function formatDateDe(v) {
  if (!v) return '';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y,m,d] = v.split('-');
    return `${d}.${m}.${y}`; // 05.09.2025
  }
  try { return new Date(v).toLocaleDateString('de-DE'); }
  catch { return String(v); }
}


function renderContacts(items) {
  const tbody = document.querySelector('#contacts-table');
  if (!tbody) return;
  if (!Array.isArray(items) || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-3 py-2 text-sm text-stone-500">Keine Einträge</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(r => `
    <tr class="hover:bg-gray-50">
      <td class="px-3 py-2 align-middle whitespace-nowrap tabular-nums text-neutral-700">${r.id}</td>
      <td class="px-3 py-2 align-middle">
        <div class="font-semibold">${escapeHtml(r.name)}</div>
        <div class="text-xs text-neutral-500">${escapeHtml(r.email)}</div>
      </td>
      <td class="px-3 py-2 align-middle whitespace-nowrap">${escapeHtml(r.phone || '')}</td>
      <td class="px-3 py-2 align-middle max-w-[480px] whitespace-pre-wrap">${escapeHtml(r.message || '')}</td>
      <td class="px-3 py-2 align-middle whitespace-nowrap tabular-nums">${formatTs(r.created_at)}</td>
      <td class="px-3 py-2 align-middle text-right">
        <button class="btn btn-xs btn-error" data-contact-del="${r.id}">Löschen</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-contact-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-contact-del');
      if (!confirm(`Kontaktanfrage #${id} löschen?`)) return;
      const res = await APIJson(`/api/cms/contacts/${id}`, { method: 'DELETE' })
        .catch(err => ({ ok:false, message:String(err) }));
      if (res && res.ok) loadContacts();
    });
  });
}


function renderContactsPager() {
  const pageEl = $('#contacts-page');
  const page = Math.floor(contactsOffset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(contactsTotal / PAGE_SIZE));
  if (pageEl) pageEl.textContent = `Seite ${page} / ${pages}`;
  $('#contacts-prev').disabled = contactsOffset <= 0;
  $('#contacts-next').disabled = contactsOffset + PAGE_SIZE >= contactsTotal;
}

$('#contacts-search')?.addEventListener('click', () => { contactsOffset = 0; loadContacts(); });
$('#contacts-prev')?.addEventListener('click', () => { contactsOffset = Math.max(0, contactsOffset - PAGE_SIZE); loadContacts(); });
$('#contacts-next')?.addEventListener('click', () => { contactsOffset = contactsOffset + PAGE_SIZE; loadContacts(); });

// =========================
// Appointments (CMS)
// =========================
let apptsOffset = 0;
let apptsTotal = 0;

async function loadAppointments() {
  const q = $('#appts-q')?.value?.trim() || '';
  const date_from = $('#appts-from')?.value || '';
  const date_to = $('#appts-to')?.value || '';

  const url = new URL('/api/cms/appointments', location.origin);
  url.searchParams.set('limit', PAGE_SIZE);
  url.searchParams.set('offset', apptsOffset);
  if (q) url.searchParams.set('q', q);
  if (date_from) url.searchParams.set('date_from', date_from);
  if (date_to) url.searchParams.set('date_to', date_to);

  const j = await APIJson(url, { method: 'GET' })
    .catch(err => ({ ok:false, message:String(err) }));
  if (!j || j.error) {
    console.error('Fehler Termine:', j?.error || j?.message);
    renderAppointments([]);
    renderApptsPager();
    return;
  }

  apptsTotal = Number(j.total || 0);
  renderAppointments(j.items || []);
  renderApptsPager();
}

function renderAppointments(items) {
  const tbody = document.querySelector('#appts-table');
  if (!tbody) return;
  if (!Array.isArray(items) || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-3 py-2 text-sm text-stone-500">Keine Einträge</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(r => `
    <tr class="hover:bg-gray-50">
      <td class="px-3 py-2 align-middle whitespace-nowrap tabular-nums text-neutral-700">${r.id}</td>
      <td class="px-3 py-2 align-middle">
        <div class="font-semibold">${escapeHtml(r.name)}</div>
        <div class="text-xs text-neutral-500">${escapeHtml(r.email)}</div>
      </td>
      <td class="px-3 py-2 align-middle whitespace-nowrap">${formatDateDe(r.appointment_date) || ''}</td>
      <td class="px-3 py-2 align-middle whitespace-nowrap tabular-nums">${(r.appointment_time || '').slice(0,5)}</td>
      <td class="px-3 py-2 align-middle whitespace-nowrap tabular-nums">${formatTs(r.created_at)}</td>
      <td class="px-3 py-2 align-middle text-right">
        <button class="btn btn-xs btn-error" data-appt-del="${r.id}">Löschen</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-appt-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-appt-del');
      if (!confirm(`Termin #${id} löschen?`)) return;
      const res = await APIJson(`/api/cms/appointments/${id}`, { method: 'DELETE' })
        .catch(err => ({ ok:false, message:String(err) }));
      if (res && res.ok) loadAppointments();
    });
  });
}


function renderApptsPager() {
  const pageEl = $('#appts-page');
  const page = Math.floor(apptsOffset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(apptsTotal / PAGE_SIZE));
  if (pageEl) pageEl.textContent = `Seite ${page} / ${pages}`;
  $('#appts-prev').disabled = apptsOffset <= 0;
  $('#appts-next').disabled = apptsOffset + PAGE_SIZE >= apptsTotal;
}

$('#appts-search')?.addEventListener('click', () => { apptsOffset = 0; loadAppointments(); });
$('#appts-prev')?.addEventListener('click', () => { apptsOffset = Math.max(0, apptsOffset - PAGE_SIZE); loadAppointments(); });
$('#appts-next')?.addEventListener('click', () => { apptsOffset = apptsOffset + PAGE_SIZE; loadAppointments(); });

// ---- Autostart: Session prüfen ----
(async () => {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) {
      showApp();
      loadCourses();
      loadMaterials?.();
      renderImages?.();
      loadContacts?.();
      loadAppointments?.();
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
})();
