const listEl  = document.querySelector('#materials-list');
const emptyEl = document.querySelector('#materials-empty');

function cardTpl(m) {
  const title = m.title || 'Ohne Titel';
  const href  = m.path || '#';
  return `
    <article class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <h2 class="text-lg font-semibold text-neutral-900 line-clamp-2">${title}</h2>
      <a href="${href}" class="mt-4 inline-block rounded-lg bg-rose-700 px-4 py-2 text-sm text-white hover:bg-rose-800">
        Download
      </a>
    </article>
  `;
}

async function loadMaterials() {
  try {
    const res  = await fetch('http://localhost:3000/api/materials');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      emptyEl.classList.remove('hidden');   
      return;
    }

    listEl.innerHTML = data.map(cardTpl).join('');
  } catch (err) {
    console.error(err);
    emptyEl.textContent = 'Fehler beim Laden der Materialien.';
    emptyEl.classList.remove('hidden');
  }
}

loadMaterials();
