document.addEventListener("DOMContentLoaded", () => {
  // === KONTAKTFORMULAR ===
  const contactForm = document.getElementById("contact-form");
  const contactMsg  = document.getElementById("contact-message");

  if (contactForm && contactMsg) {
    const hpContact = document.getElementById("hp-contact");
    const tsContact = document.getElementById("ts-contact");
    if (tsContact) tsContact.value = Date.now();
    if (hpContact) hpContact.value = "";

    // Timestamp auffrischen, wenn Nutzer ins Formular klickt
    contactForm.addEventListener("focusin", () => {
      if (tsContact) tsContact.value = Date.now();
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;

      const data = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        message: form.message.value,
        hp: form.hp?.value || "",
        ts: Number(form.ts?.value || 0),
      };

      contactMsg.classList.add("hidden");

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
          form.reset();
          if (tsContact) tsContact.value = Date.now();
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
      setTimeout(() => contactMsg.classList.add("hidden"), 6000);
    }
  }

  // === TERMINFORMULAR ===
  const appointmentForm = document.getElementById("appointment-form");
  const hpAppointment   = document.getElementById("hp-appointment");
  const tsAppointment   = document.getElementById("ts-appointment");

  if (appointmentForm) {
    if (tsAppointment) tsAppointment.value = Date.now();
    if (hpAppointment) hpAppointment.value = "";

    // Timestamp auffrischen, wenn Nutzer ins Formular klickt
    appointmentForm.addEventListener("focusin", () => {
      if (tsAppointment) tsAppointment.value = Date.now();
    });

    appointmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;

      const payload = {
        name: f["appointment-name"].value,
        email: f["appointment-email"].value,
        date: f["date"].value,
        time: f["time"].value,
        hp: f.hp?.value || "",
        ts: Number(f.ts?.value || 0),
      };

      try {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          f.reset();
          if (tsAppointment) tsAppointment.value = Date.now();
          alert("✅ Termin wurde angefragt!");
        } else {
          alert("❌ Fehler beim Absenden der Terminanfrage.");
        }
      } catch (err) {
        console.error("❌ Fehler:", err);
        alert("❌ Serverfehler bei Terminbuchung.");
      }
    });
  }
});
