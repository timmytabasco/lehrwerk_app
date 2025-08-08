document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const contactMsg = document.getElementById("contact-message");

  if (!contactForm || !contactMsg) {
    console.warn("⚠️ Kontaktformular oder Nachrichtenelement fehlt.");
    return;
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value
    };

    contactMsg.classList.add("hidden");

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        form.reset();
        showMessage("✅ Nachricht erfolgreich gesendet!", "success");
      } else {
        showMessage("❌ Fehler beim Absenden.", "error");
      }
    } catch (err) {
      console.error("❌ Fehler:", err);
      showMessage("❌ Serverfehler – bitte später erneut versuchen.", "error");
    }
  });

  function showMessage(text, type) {
    contactMsg.textContent = text;
    contactMsg.className = "mt-2 rounded px-4 py-2 text-sm font-semibold";

    if (type === "success") {
      contactMsg.classList.add("text-green-700", "bg-green-100");
    } else {
      contactMsg.classList.add("text-red-700", "bg-red-100");
    }

    contactMsg.classList.remove("hidden");

    // optional automatisch ausblenden
    setTimeout(() => {
      contactMsg.classList.add("hidden");
    }, 6000);
  }
});
