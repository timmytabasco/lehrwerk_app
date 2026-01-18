
function loadFAQContent() {
  fetch('/data/faq.json')
    .then(res => res.json())
    .then(data => {
      
      const html = data.map((item, i) => `
        <div class="mb-4 bg-white rounded-xl shadow">
          <button
            type="button"
            class="w-full text-left text-xl font-semibold text-red-800 px-6 py-4 focus:outline-none flex justify-between items-center"
            data-faq-toggle="${i}"
          >
            ${item.question}
            <span class="ml-2 text-neutral-400 text-2xl">&#x25BC;</span>
          </button>
          <div
            class="px-6 pb-4 pt-2 text-gray-800 hidden"
            id="faq-answer-${i}"
          >
            ${item.answer}
          </div>
        </div>
      `).join('');
      
      const faqElement = document.getElementById('faq-content');
      if (faqElement) {
        faqElement.innerHTML = html;
      }

      // Toggle-Logik: Antwort ein-/ausblenden
      data.forEach((item, i) => {
        const btn = document.querySelector(`[data-faq-toggle="${i}"]`);
        const ans = document.getElementById(`faq-answer-${i}`);
        if (btn && ans) {
          btn.addEventListener('click', () => {
            ans.classList.toggle('hidden');
          });
        }
      });
    })
    .catch(err => {
      console.error('Fehler beim Laden von faq.json:', err);
    });
} 
loadFAQContent();