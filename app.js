(function () {
  const sectionList = document.getElementById("sectionList");
  const questionText = document.getElementById("questionText");
  const hintText = document.getElementById("hintText");

  const STORAGE_KEY = "auditflow_v1_responses";

  const demoQuestions = {
    fire: "Fire extinguishers present and accessible?",
    electrical: "Electrical cables free from damage?",
    environment: "Floors free from trip hazards?",
    ppe: "PPE available where required?"
  };

  // Load stored responses or initialise
  function loadResponses() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        fire: null,
        electrical: null,
        environment: null,
        ppe: null
      };
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {
        fire: null,
        electrical: null,
        environment: null,
        ppe: null
      };
    }
  }

  function saveResponses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  }

  const responses = loadResponses();
  let activeSection = "fire";

  function setActiveSection(sectionKey) {
    activeSection = sectionKey;

    const sections = sectionList.querySelectorAll(".section");
    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      el.classList.toggle("active", key === sectionKey);
    });

    questionText.textContent =
      demoQuestions[sectionKey] || "Question not found.";

    const r = responses[sectionKey];
    const responseText = r ? `Recorded: ${r}` : "No response recorded yet.";
    hintText.textContent = responseText;
  }

  function recordResponse(value) {
    responses[activeSection] = value;
    saveResponses();
    setActiveSection(activeSection);
  }

  sectionList.addEventListener("click", (e) => {
    const item = e.target.closest(".section");
    if (!item) return;
    const key = item.getAttribute("data-section");
    if (!key) return;
    setActiveSection(key);
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("yes")) recordResponse("YES");
    else if (btn.classList.contains("no")) recordResponse("NO");
    else if (btn.classList.contains("na")) recordResponse("N/A");
  });

  setActiveSection("fire");
})();