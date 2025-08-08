document.addEventListener("DOMContentLoaded", () => {
  const appointmentForm = document.getElementById("appointment-form");
  const appointmentMsg = document.getElementById("appointment-message");

  appointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      name: form.name.value,
      email: form.email.value,
      date: form.date.value,
      time: form.time.value
    };

    appointmentMsg.classList.add("hidden");

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if(result.success) {
        appointmentForm.reset();
        appointmentMsg.textContent = "✅ Termin erfolgreich gebucht!";
        appointmentMsg.className = "text-green-700 bg-green-100 rounded px-4 py-2 mt-2";
      } else {
        appointmentMsg.textContent = "❌ Fehler: Termin nicht möglich.";
        appointmentMsg.className = "text-red-700 bg-red-100 rounded px-4 py-2 mt-2";
      }

    } catch (err) {
      console.error("FEHLER:", err);
      appointmentMsg.textContent = "❌ Technischer Fehler – bitte später erneut versuchen.";
      appointmentMsg.className = "text-red-700 bg-red-100 rounded px-4 py-2 mt-2";
    }
  });

  // Datumsauswahl → Uhrzeiten aktualisieren
  document.getElementById("datepicker").addEventListener("change", async (e) => {
    const date = e.target.value;
    const timeSelect = document.getElementById("time-select");

    timeSelect.innerHTML = `<option>Lade verfügbare Uhrzeiten...</option>`;

    try {
      const res = await fetch(`/api/appointments/available?date=${date}`);
      const times = await res.json();

      timeSelect.innerHTML = `<option value="">Uhrzeit wählen</option>`;
      times.forEach(time => {
        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        timeSelect.appendChild(opt);
      });

      if (times.length === 0) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = "Keine freien Zeiten";
        timeSelect.appendChild(opt);
      }

    } catch (err) {
      console.error("Uhrzeiten-Fehler:", err);
      timeSelect.innerHTML = `<option>Fehler beim Laden</option>`;
    }
  });
});
