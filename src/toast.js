// src/toast.js
const esc = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

// sorgt dafür, dass es immer einen Root-Container gibt
function ensureRoot() {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
    document.body.appendChild(root);
  }
  return root;
}

/**
 * toast("Text", "success" | "error" | "info" | "warning", { duration: 4000 })
 */
export function toast(msg, type = 'success', opts = {}) {
  const { duration = 4000 } = opts;
  const root = ensureRoot();

  const base = 'pointer-events-auto rounded-xl px-4 py-3 shadow-lg text-sm transition ' +
               'opacity-0 translate-y-2';
  const styles = {
    success: 'bg-green-600 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-neutral-800 text-white',
    warning: 'bg-amber-500 text-white'
  };
  const icon = {
    success: '✓',
    error:   '✕',
    info:    'i',
    warning: '!'
  }[type] || '✓';

  const el = document.createElement('div');
  el.className = base + ' ' + (styles[type] || styles.success);
  el.setAttribute('role','status');
  el.setAttribute('aria-live','polite');

  el.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="mt-0.5 inline-block w-5 text-center">${icon}</span>
      <div class="flex-1">${esc(msg)}</div>
      <button class="ml-2 opacity-80 hover:opacity-100">×</button>
    </div>
  `;

  const remove = () => {
    el.classList.add('opacity-0','translate-y-2');
    setTimeout(() => el.remove(), 200);
  };
  el.querySelector('button').addEventListener('click', remove);

  root.appendChild(el);
  // animiere rein
  requestAnimationFrame(() => el.classList.remove('opacity-0','translate-y-2'));
  // auto close
  if (duration > 0) setTimeout(remove, duration);
}
