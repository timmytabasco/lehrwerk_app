// ---- Helpers ----
const $ = (s) => document.querySelector(s);

function showApp() {
  $('#login-section')?.classList.add('hidden');
  $('#content-section')?.classList.remove('hidden');
  $('#materials-section')?.classList.remove('hidden');
  $('#btn-logout')?.classList.remove('hidden');
}

function showLogin() {
  $('#content-section')?.classList.add('hidden');
  $('#materials-section')?.classList.add('hidden');
  $('#login-section')?.classList.remove('hidden');
  $('#btn-logout')?.classList.add('hidden');
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
    loadMaterials();
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
  const cleanTitle = (title || 'material').trim().replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '').replace(/\s+/g, '_');
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
    const storageUrl = toStorageUrl(item.path);
    const downloadUrl = toDownloadUrl(item.path);
    const downloadName = niceFileName(item.title, item.path);
    const fileExt = item.path ? item.path.split('.').pop()?.toLowerCase() || '' : '';
    
    return `
      <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b last:border-b-0">
        <div class="flex-1">
          <div class="font-semibold text-gray-900">${escapeHtml(item.title)}</div>
          <div class="text-sm text-stone-500 mt-1">
            Course: ${item.course_id} • 
            ${fileExt ? fileExt.toUpperCase() + ' • ' : ''}
            ${item.path ? item.path.split('/').pop() : 'Unbekannt'}
          </div>
          ${item.created_at ? `<div class="text-xs text-stone-400 mt-1">Erstellt: ${new Date(item.created_at).toLocaleString('de-DE')}</div>` : ''}
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
             class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
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
  
  const courseId = $('#mat-course').value.trim();
  const title = $('#mat-title').value.trim();
  const fileInput = $('#mat-file');
  const file = fileInput.files[0];
  
  // Validierung
  if (!courseId) {
    alert('Bitte Course-ID eingeben');
    return;
  }
  
  if (!title) {
    alert('Bitte Titel eingeben');
    return;
  }
  
  if (!file) {
    alert('Bitte Datei auswählen');
    return;
  }

  // FormData für Upload erstellen
  const formData = new FormData();
  formData.append('course_id', courseId);
  formData.append('title', title);
  formData.append('file', file);

  // Upload-Button deaktivieren
  const submitBtn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('button');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Uploade...';
  submitBtn.disabled = true;

  try {
    const j = await APIJson('/api/cms/materials', { 
      method: 'POST', 
      body: formData 
    });

    if (j.ok) {
      // Formular zurücksetzen
      $('#mat-course').value = '';
      $('#mat-title').value = '';
      fileInput.value = '';
      
      // Erfolgsmeldung
      alert('Material erfolgreich hochgeladen!');
      
      // Liste neu laden
      loadMaterials();
    } else {
      alert(j.message || 'Upload fehlgeschlagen');
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('Upload fehlgeschlagen: ' + err.message);
  } finally {
    // Button wieder aktivieren
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ---- XSS-Helper ----
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// ---- Autostart: prüfen, ob Session schon aktiv ist ----
(async () => {
  try {
    const j = await APIJson('/api/cms/materials'); // 200 wenn Cookie gültig
    if (j.ok) { 
      showApp(); 
      loadMaterials(); 
    } else { 
      showLogin(); 
    }
  } catch {
    showLogin();
  }
})();