import { toast } from './toast.js';


function normalizeDate(v) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}` : v;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");
  if (!form) return;

  // Anti-Spam Felder initialisieren
  form.elements["hp"].value = "";
  form.elements["ts"].value = Date.now();

  // Zeiten laden (falls du /available nutzt)
  const dateIn = form.elements["date"];
  const timeEl = form.elements["time"];
  dateIn?.addEventListener("change", async (e) => {
    const iso = normalizeDate(e.target.value);
    if (!iso) { timeEl.innerHTML = `<option value="">Bitte gültiges Datum</option>`; return; }
    timeEl.innerHTML = `<option>Lade verfügbare Uhrzeiten…</option>`;
    try {
      const r = await fetch(`/api/appointments/available?date=${encodeURIComponent(iso)}`);
      const times = await r.json().catch(() => []);
      timeEl.innerHTML = `<option value="">Uhrzeit wählen</option>`;
      (times || []).forEach(t => {
        const opt = document.createElement("option");
        opt.value = t; opt.textContent = t; timeEl.appendChild(opt);
      });
      if (!times?.length) {
        const opt = document.createElement("option");
        opt.disabled = true; opt.textContent = "Keine freien Zeiten"; timeEl.appendChild(opt);
      }
    } catch {
      timeEl.innerHTML = `<option>Fehler beim Laden</option>`;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isoDate = normalizeDate(form.elements["date"].value);

    const payload = {
      name:  form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      date:  isoDate,
      time:  form.elements["time"].value,
      hp:    form.elements["hp"].value || "",
      ts:    Number(form.elements["ts"].value || 0),
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let j = {}; try { j = JSON.parse(text); } catch {}
      if (res.ok && (j.ok || j.success)) {
        form.reset();
        form.elements["hp"].value = "";
        form.elements["ts"].value = Date.now();
        timeEl.innerHTML = `<option value="">Uhrzeit wählen</option>`;
        toast("✅ Termin angefragt");
      } else {
        console.warn("Termin 400/Fehler:", res.status, text);
        toast(res.status === 429 ? "⏳ Zu viele Anfragen" : "❌ Termin fehlgeschlagen");
      }
    } catch (err) {
      console.error("Termin Fehler:", err);
      toast("❌ Serverfehler");
    }
  });
});
