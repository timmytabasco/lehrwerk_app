// ---------- AWARDS (Slider + Lightbox) ----------
async function renderAwards() {
  const slider = document.getElementById('awards-slider');
  const arrowLeft = document.getElementById('arrow-left');
  const arrowRight = document.getElementById('arrow-right');
  if (!slider) return;

  try {
    const res = await fetch('/data/ueberuns.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = data.awards || [];

    slider.innerHTML = items.map(item => `
      <figure class="w-80 flex-shrink-0 snap-center rounded-2xl overflow-hidden shadow-lg
                     bg-white border border-neutral-200 p-6 text-center">
        <div class="overflow-hidden">
          <img src="${item.image?.src}" alt="${item.image?.alt || item.title}"
               class="award-img w-full aspect-[4/3] object-contain bg-neutral-50 cursor-pointer" />
        </div>
        <figcaption class="mt-3">
          <h3 class="font-semibold text-lg text-neutral-800">${item.title}</h3>
          <p class="text-sm text-neutral-600">
            ${item.issuer ?? ''} ${item.year ? `· ${item.year}` : ''}
          </p>
        </figcaption>
      </figure>
    `).join('');

    // Pfeile
    const getStep = () => {
      const card = slider.querySelector('figure');
      return card ? Math.ceil(card.getBoundingClientRect().width + 24) : 320;
    };
    arrowLeft.onclick  = () => slider.scrollBy({ left: -getStep(), behavior: 'smooth' });
    arrowRight.onclick = () => slider.scrollBy({ left:  getStep(), behavior: 'smooth' });

    const updateArrows = () => {
      arrowLeft.classList.toggle('hidden', slider.scrollLeft <= 0);
      arrowRight.classList.toggle('hidden', slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5);
    };
    slider.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();

    // Klick → Lightbox
    slider.querySelectorAll('.award-img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

  } catch (e) {
    console.error('Awards error:', e);
    slider.innerHTML = `<p class="text-center text-red-700 w-full">Die Auszeichnungen konnten nicht geladen werden.</p>`;
  }
}

async function renderRooms() {
  const container = document.getElementById('rooms-gallery');
  if (!container) return;

  try {
    const res = await fetch('/data/ueberuns.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rooms = data.rooms || [];

    container.innerHTML = rooms.map(r => `
      <div class="overflow-hidden rounded-xl shadow-md cursor-pointer">
        <img src="${r.src}" alt="${r.alt || ''}"
             class="room-img w-full h-64 object-cover transition-transform duration-200 hover:scale-[1.03]" />
      </div>
    `).join('');

    // Klick → Lightbox
    container.querySelectorAll('.room-img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

  } catch (err) {
    console.error('Rooms render error:', err);
    container.innerHTML = `<p class="text-center text-red-700">Die Galerie konnte nicht geladen werden.</p>`;
  }
}

// ---------- Lightbox (für beide) ----------
function openLightbox(src, alt='') {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 bg-black/70 z-[60]';

  const big = document.createElement('img');
  big.src = src; big.alt = alt;
  big.className = [
    'fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'max-h-[90vh] max-w-[92vw] object-contain',
    'rounded-lg shadow-2xl border border-neutral-200 cursor-zoom-out',
    'transition-transform duration-200'
  ].join(' ');

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.body.append(backdrop, big);

  const close = () => {
    big.remove(); backdrop.remove();
    document.body.style.overflow = prevOverflow;
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => e.key === 'Escape' && close();

  backdrop.addEventListener('click', close);
  big.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderAwards();
  renderRooms();
});


document.addEventListener('DOMContentLoaded', () => {
    const c = document.getElementById('contact_form_start');
    if (c) c.value = Date.now();
    const a = document.getElementById('appt_form_start');
    if (a) a.value = Date.now();
  });
