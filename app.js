(function () {
  const STORAGE_KEY = "auditflow_v1_audit";

  // V1: fixed template in code (we add checklist import later)
  const TEMPLATE = {
    fire: {
      title: "Fire Safety",
      questions: [
        "Fire extinguishers present and accessible?",
        "Fire exits clearly marked and unobstructed?",
        "Emergency lighting operational?",
        "Evacuation plan displayed?"
      ]
    },
    electrical: {
      title: "Electrical Safety",
      questions: [
        "Electrical cables free from damage?",
        "Sockets not overloaded?",
        "Distribution boards accessible?",
        "PAT testing records available?"
      ]
    },
    environment: {
      title: "Workplace Environment",
      questions: [
        "Floors free from trip hazards?",
        "Adequate lighting levels?",
        "Ventilation sufficient?",
        "Noise levels within safe limits?"
      ]
    },
    ppe: {
      title: "PPE & Signage",
      questions: [
        "PPE available where required?",
        "Safety signage visible and correct?",
        "First aid kit stocked and accessible?",
        "Accident/incident recording method available?"
      ]
    }
  };

  const sectionList = document.getElementById("sectionList");
  const sectionTitle = document.getElementById("sectionTitle");
  const overallBadge = document.getElementById("overallBadge");

  const qIndex = document.getElementById("qIndex");
  const qRecorded = document.getElementById("qRecorded");
  const questionText = document.getElementById("questionText");
  const hintText = document.getElementById("hintText");

  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");
  const btnNa = document.getElementById("btnNa");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const badges = {
    fire: document.getElementById("badge-fire"),
    electrical: document.getElementById("badge-electrical"),
    environment: document.getElementById("badge-environment"),
    ppe: document.getElementById("badge-ppe")
  };

  function blankAudit() {
    const responses = {};
    Object.keys(TEMPLATE).forEach((sectionKey) => {
      responses[sectionKey] = TEMPLATE[sectionKey].questions.map(() => null);
    });
    return {
      templateVersion: 1,
      activeSection: "fire",
      activeIndex: 0,
      responses
    };
  }

  function loadAudit() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankAudit();
    try {
      const parsed = JSON.parse(raw);

      // Minimal validation / fallback
      if (!parsed || !parsed.responses) return blankAudit();

      // Ensure all sections/questions exist
      Object.keys(TEMPLATE).forEach((sectionKey) => {
        const qCount = TEMPLATE[sectionKey].questions.length;
        if (!parsed.responses[sectionKey] || !Array.isArray(parsed.responses[sectionKey])) {
          parsed.responses[sectionKey] = Array(qCount).fill(null);
        } else {
          // Normalise length
          parsed.responses[sectionKey] = parsed.responses[sectionKey].slice(0, qCount);
          while (parsed.responses[sectionKey].length < qCount) parsed.responses[sectionKey].push(null);
        }
      });

      if (!TEMPLATE[parsed.activeSection]) parsed.activeSection = "fire";
      if (typeof parsed.activeIndex !== "number") parsed.activeIndex = 0;

      return parsed;
    } catch {
      return blankAudit();
    }
  }

  function saveAudit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadAudit();

  function countAnswered(sectionKey) {
    const arr = state.responses[sectionKey] || [];
    let answered = 0;
    arr.forEach((v) => { if (v) answered += 1; });
    return { answered, total: arr.length };
  }

  function updateBadges() {
    let overallAnswered = 0;
    let overallTotal = 0;

    Object.keys(TEMPLATE).forEach((sectionKey) => {
      const { answered, total } = countAnswered(sectionKey);
      overallAnswered += answered;
      overallTotal += total;
      if (badges[sectionKey]) badges[sectionKey].textContent = `${answered}/${total}`;
    });

    overallBadge.textContent = `${overallAnswered} answered`;
    hintText.textContent = "Responses persist. Next: action register once responses are stable.";
  }

  function setActiveSection(sectionKey) {
    state.activeSection = sectionKey;
    state.activeIndex = 0;
    saveAudit();
    render();
  }

  function setActiveIndex(newIndex) {
    const total = TEMPLATE[state.activeSection].questions.length;
    state.activeIndex = Math.max(0, Math.min(total - 1, newIndex));
    saveAudit();
    render();
  }

  function recordResponse(value) {
    const s = state.activeSection;
    const i = state.activeIndex;
    state.responses[s][i] = value;
    saveAudit();
    render();
  }

  function render() {
    // Sidebar active
    const sections = sectionList.querySelectorAll(".section");
    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      el.classList.toggle("active", key === state.activeSection);
    });

    // Header
    sectionTitle.textContent = TEMPLATE[state.activeSection].title;

    // Question + meta
    const questions = TEMPLATE[state.activeSection].questions;
    const total = questions.length;
    const idx = state.activeIndex;

    questionText.textContent = questions[idx];
    qIndex.textContent = `Question ${idx + 1} of ${total}`;

    const recorded = state.responses[state.activeSection][idx];
    qRecorded.textContent = recorded ? `Recorded: ${recorded}` : "No response recorded";

    // Nav buttons
    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === total - 1;

    updateBadges();
  }

  // Events
  sectionList.addEventListener("click", (e) => {
    const item = e.target.closest(".section");
    if (!item) return;
    const key = item.getAttribute("data-section");
    if (!key) return;
    setActiveSection(key);
  });

  btnYes.addEventListener("click", () => recordResponse("YES"));
  btnNo.addEventListener("click", () => recordResponse("NO"));
  btnNa.addEventListener("click", () => recordResponse("N/A"));

  btnPrev.addEventListener("click", () => setActiveIndex(state.activeIndex - 1));
  btnNext.addEventListener("click", () => setActiveIndex(state.activeIndex + 1));

  // Initial render
  render();
})();