const $ = (s)=>document.querySelector(s);
const API = (p, opt={}) => fetch(p, { credentials:'include', ...opt });

// Login
$('#btn-login').addEventListener('click', async () => {
  const email = $('#login-email').value.trim();
  const password = $('#login-pass').value;
  const r = await API('/api/auth/login', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ email, password })
  });
  const j = await r.json();
  $('#login-msg').textContent = j.ok ? 'Erfolgreich eingeloggt.' : (j.message || 'Fehler');
  if (j.ok) {
    $('#login-section').classList.add('hidden');
    $('#content-section').classList.remove('hidden');
  }
});

// Content laden
$('#btn-load').addEventListener('click', async () => {
  const name = $('#content-select').value;
  const r = await API('/api/cms/content/'+encodeURIComponent(name));
  const j = await r.json();
  if (j.ok) $('#content-area').value = JSON.stringify(j.data, null, 2);
  $('#content-msg').textContent = j.ok ? 'Geladen' : (j.message || 'Fehler');
});

// Content speichern
$('#btn-save').addEventListener('click', async () => {
  const name = $('#content-select').value;
  let data;
  try { data = JSON.parse($('#content-area').value); }
  catch { $('#content-msg').textContent = 'JSON ungültig'; return; }
  const r = await API('/api/cms/content/'+encodeURIComponent(name), {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(data)
  });
  const j = await r.json();
  $('#content-msg').textContent = j.ok ? 'Gespeichert' : (j.message || 'Fehler');
});
