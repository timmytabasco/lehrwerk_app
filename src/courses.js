document.addEventListener("DOMContentLoaded", async () => {
  const tabContainer = document.getElementById("course-tabs");
  const listFi = document.getElementById("fi-list");
  const listKfm = document.getElementById("kfm-list");
  const detailBox = document.getElementById("detail-box");

  let grouped = {};

  try {
    const res = await fetch("/data/kurse.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Fehler beim Laden der Kurse.");
    const courses = await res.json();

    // Flat Array → grouped Object
    grouped = courses.reduce((acc, course) => {
      if (!acc[course.category]) acc[course.category] = {};
      acc[course.category][course.specialization] = {
        title: course.title,
        content: course.content
      };
      return acc;
    }, {});
    console.log("Kurse geladen:", grouped);
  } catch (err) {
    console.error("FETCH-FEHLER:", err);
    detailBox.innerHTML = `<p class="text-red-600 font-mono">Fehler beim Laden: ${err.message}</p>`;
    return;
  }

  if (!grouped || Object.keys(grouped).length === 0) {
    detailBox.innerHTML = `<p class="text-gray-600 italic">Aktuell sind keine Kursinformationen verfügbar.</p>`;
    return;
  }

  createTabs(grouped);
  renderSpecButtons(grouped);
  handleInteraction();
  activateFromUrl(); // Tab & Kurs aus URL wählen

  // -------------------------------
  // Tabs erstellen
  function createTabs(groupedCourses) {
    tabContainer.innerHTML = "";
    Object.keys(groupedCourses).forEach((category, i) => {
      const button = document.createElement("button");
      button.dataset.tab = category;
      button.textContent = category === "fi" ? "Technisch" : "Kaufmännisch";

      button.classList.add(
        "tab-button",
        "px-4", "py-2", "rounded-lg", "font-semibold",
        "transition", "hover:bg-rose-700", "hover:text-white"
      );

      if (i === 0) {
        button.classList.add("bg-rose-700", "text-white");
      } else {
        button.classList.add("bg-neutral-300", "text-gray-800");
      }

      tabContainer.appendChild(button);
    });
  }

  // -------------------------------
  // Spezialisierungen rendern
  function renderSpecButtons(groupedCourses) {
    for (const [category, specs] of Object.entries(groupedCourses)) {
      const targetList = category === "fi" ? listFi : listKfm;
      targetList.innerHTML = "";

      for (const [specKey, course] of Object.entries(specs)) {
        const btn = document.createElement("button");
        btn.classList.add(
          "spec-btn",
          "px-4", "py-2", "rounded-lg", "font-semibold",
          "transition", "hover:bg-rose-700", "hover:text-white",
          "bg-neutral-300", "text-gray-800",
          "text-left", "w-full", "whitespace-normal", "break-words", "min-h-[48px]"
        );
        btn.dataset.tab = category;
        btn.dataset.content = specKey;
        btn.textContent = course.title;
        targetList.appendChild(btn);
      }
    }
  }

  // -------------------------------
  // Klick-Handling Tabs & Spezialisierungen
  function handleInteraction() {
    document.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".tab-button");
      if (tabBtn) {
        const currentTab = tabBtn.dataset.tab;

        document.querySelectorAll(".tab-button").forEach(btn => {
          btn.classList.remove("bg-rose-700", "text-white");
          btn.classList.add("bg-neutral-300", "text-gray-800");
        });
        tabBtn.classList.add("bg-rose-700", "text-white");

        listFi.classList.toggle("hidden", currentTab !== "fi");
        listKfm.classList.toggle("hidden", currentTab !== "kfm");

        detailBox.innerHTML = `<p class="text-gray-700">Wähle eine Spezialisierung aus, um weitere Informationen anzuzeigen.</p>`;
      }

      const specBtn = e.target.closest(".spec-btn");
      if (specBtn) {
        document.querySelectorAll(".spec-btn").forEach(btn => {
          btn.classList.remove("bg-rose-700", "text-white");
          btn.classList.add("bg-neutral-300", "text-gray-800");
        });

        specBtn.classList.remove("bg-neutral-300", "text-gray-800");
        specBtn.classList.add("bg-rose-700", "text-white");

        const { tab, content } = specBtn.dataset;
        const selected = grouped[tab][content];

        detailBox.innerHTML = `
          <h2 class="text-2xl font-bold mb-4">${selected.title}</h2>
          <div class="prose space-y-3 text-gray-800 leading-relaxed">${selected.content}</div>
        `;
      }
    });
  }

  // -------------------------------
  // Tab/Kurs aus URL-Parametern aktivieren (?tab=kfm&course=dim)
  function activateFromUrl() {
    const p = new URLSearchParams(location.search);
    const tab = (p.get("tab") === "kfm") ? "kfm" : "fi"; // Default fi
    const course = p.get("course"); // optional

    setActiveTab(tab);

    if (course) {
      const btn = document.querySelector(`.spec-btn[data-tab="${tab}"][data-content="${course}"]`);
      if (btn) { btn.click(); return; }
    }

    // Falls kein Kurs angegeben → ersten öffnen
    const firstBtn = document.querySelector(`.spec-btn[data-tab="${tab}"]`);
    if (firstBtn) firstBtn.click();
  }

  function setActiveTab(tab) {
    document.querySelectorAll(".tab-button").forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle("bg-rose-700", isActive);
      btn.classList.toggle("text-white", isActive);
      btn.classList.toggle("bg-neutral-300", !isActive);
      btn.classList.toggle("text-gray-800", !isActive);
    });
    listFi.classList.toggle("hidden", tab !== "fi");
    listKfm.classList.toggle("hidden", tab !== "kfm");
    detailBox.innerHTML = `<p class="text-gray-700">Wähle eine Spezialisierung aus, um weitere Informationen anzuzeigen.</p>`;
  }
});
