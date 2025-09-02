document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Anti-Spam Felder initialisieren
  form.elements["hp"].value = "";
  form.elements["ts"].value = Date.now();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name:    form.elements["name"].value.trim(),
      email:   form.elements["email"].value.trim(),
      message: form.elements["message"].value.trim(),
      hp:      form.elements["hp"].value || "",
      ts:      Number(form.elements["ts"].value || 0),
    };

    try {
      const res = await fetch("/api/contact", {
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
        alert("✅ Nachricht gesendet");
      } else {
        console.warn("Kontakt 400/Fehler:", res.status, text);
        alert("❌ Senden fehlgeschlagen");
      }
    } catch (err) {
      console.error("Kontakt Fehler:", err);
      alert("❌ Serverfehler");
    }
  });
});
