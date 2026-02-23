(function () {
  const STORAGE_KEY = "auditflow_v1_audit";

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
  const navBlock = document.getElementById("navBlock");

  const viewAudit = document.getElementById("viewAudit");
  const viewActions = document.getElementById("viewActions");

  const mainTitle = document.getElementById("mainTitle");
  const mainSub = document.getElementById("mainSub");

  const overallBadge = document.getElementById("overallBadge");
  const actionsBadge = document.getElementById("actionsBadge");

  const qIndex = document.getElementById("qIndex");
  const qRecorded = document.getElementById("qRecorded");
  const questionText = document.getElementById("questionText");
  const hintText = document.getElementById("hintText");

  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");
  const btnNa = document.getElementById("btnNa");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const actionsSummaryPill = document.getElementById("actionsSummaryPill");
  const actionsTbody = document.getElementById("actionsTbody");

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
      activeView: "audit",       // "audit" | "actions"
      activeSection: "fire",
      activeIndex: 0,
      responses,
      actions: []                // { id, sectionKey, questionIndex, issueText, status }
    };
  }

  function loadAudit() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankAudit();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.responses) return blankAudit();

      // Ensure expected shape
      if (!parsed.actions || !Array.isArray(parsed.actions)) parsed.actions = [];
      if (parsed.activeView !== "audit" && parsed.activeView !== "actions") parsed.activeView = "audit";

      Object.keys(TEMPLATE).forEach((sectionKey) => {
        const qCount = TEMPLATE[sectionKey].questions.length;
        if (!parsed.responses[sectionKey] || !Array.isArray(parsed.responses[sectionKey])) {
          parsed.responses[sectionKey] = Array(qCount).fill(null);
        } else {
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

  function uid() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function countAnswered(sectionKey) {
    const arr = state.responses[sectionKey] || [];
    let answered = 0;
    arr.forEach((v) => { if (v) answered += 1; });
    return { answered, total: arr.length };
  }

  function getQuestionText(sectionKey, questionIndex) {
    const section = TEMPLATE[sectionKey];
    if (!section) return "";
    return section.questions[questionIndex] || "";
  }

  function upsertActionForQuestion(sectionKey, questionIndex) {
    const issueText = getQuestionText(sectionKey, questionIndex);
    if (!issueText) return;

    const existing = state.actions.find(a => a.sectionKey === sectionKey && a.questionIndex === questionIndex);
    if (existing) {
      // If an action exists, keep it (do not duplicate)
      if (!existing.issueText) existing.issueText = issueText;
      if (!existing.status) existing.status = "OPEN";
      return;
    }

    state.actions.push({
      id: uid(),
      sectionKey,
      questionIndex,
      issueText,
      status: "OPEN"
    });
  }

  function maybeManageActionFromResponse(sectionKey, questionIndex, value) {
    // V1 rule: "NO" creates action; changing away from NO does NOT auto-delete (keeps audit trail)
    if (value === "NO") upsertActionForQuestion(sectionKey, questionIndex);
  }

  function openActionCount() {
    return state.actions.filter(a => a.status === "OPEN").length;
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
    actionsBadge.textContent = `${openActionCount()} open`;

    const open = openActionCount();
    actionsSummaryPill.textContent = `${open} open`;
  }

  function setActiveView(view) {
    state.activeView = view;
    saveAudit();
    render();
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

    maybeManageActionFromResponse(s, i, value);

    saveAudit();
    render();
  }

  function renderNav() {
    const items = navBlock.querySelectorAll(".navitem");
    items.forEach((el) => {
      const v = el.getAttribute("data-view");
      el.classList.toggle("active", v === state.activeView);
    });
  }

  function renderAuditView() {
    viewAudit.style.display = "";
    viewActions.style.display = "none";

    // Sidebar section active
    const sections = sectionList.querySelectorAll(".section");
    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      el.classList.toggle("active", key === state.activeSection);
    });

    mainTitle.textContent = TEMPLATE[state.activeSection].title;
    mainSub.textContent = "Answer questions on-site. “No” creates an action automatically.";

    const questions = TEMPLATE[state.activeSection].questions;
    const total = questions.length;
    const idx = state.activeIndex;

    questionText.textContent = questions[idx];
    qIndex.textContent = `Question ${idx + 1} of ${total}`;

    const recorded = state.responses[state.activeSection][idx];
    qRecorded.textContent = recorded ? `Recorded: ${recorded}` : "No response recorded";

    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === total - 1;

    hintText.textContent = "V1 rule: selecting “No” creates an action (kept even if you later change the answer).";
  }

  function renderActionsView() {
    viewAudit.style.display = "none";
    viewActions.style.display = "";

    mainTitle.textContent = "Action Register";
    mainSub.textContent = "Actions are created automatically when a response is “No”.";

    // Render actions table
    const actions = state.actions.slice().reverse(); // newest first
    if (actions.length === 0) {
      actionsTbody.innerHTML = `
        <tr>
          <td colspan="4" style="color:var(--muted); padding:14px 8px;">No actions yet.</td>
        </tr>
      `;
      return;
    }

    actionsTbody.innerHTML = actions.map(a => {
      const sectionTitle = (TEMPLATE[a.sectionKey] && TEMPLATE[a.sectionKey].title) ? TEMPLATE[a.sectionKey].title : a.sectionKey;
      const statusPill = a.status === "CLOSED"
        ? `<span class="pill closed">Closed</span>`
        : `<span class="pill open">Open</span>`;

      const toggleLabel = a.status === "CLOSED" ? "Reopen" : "Close";

      return `
        <tr>
          <td>${escapeHtml(a.issueText)}</td>
          <td>${escapeHtml(sectionTitle)}</td>
          <td>${statusPill}</td>
          <td><button class="smallbtn" data-action-id="${a.id}">${toggleLabel}</button></td>
        </tr>
      `;
    }).join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function render() {
    renderNav();
    updateBadges();

    if (state.activeView === "actions") renderActionsView();
    else renderAuditView();
  }

  // Events
  navBlock.addEventListener("click", (e) => {
    const item = e.target.closest(".navitem");
    if (!item) return;
    const view = item.getAttribute("data-view");
    if (!view) return;
    setActiveView(view);
  });

  sectionList.addEventListener("click", (e) => {
    const item = e.target.closest(".section");
    if (!item) return;
    const key = item.getAttribute("data-section");
    if (!key) return;
    setActiveView("audit");
    setActiveSection(key);
  });

  btnYes.addEventListener("click", () => recordResponse("YES"));
  btnNo.addEventListener("click", () => recordResponse("NO"));
  btnNa.addEventListener("click", () => recordResponse("N/A"));

  btnPrev.addEventListener("click", () => setActiveIndex(state.activeIndex - 1));
  btnNext.addEventListener("click", () => setActiveIndex(state.activeIndex + 1));

  actionsTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-action-id");
    const action = state.actions.find(a => a.id === id);
    if (!action) return;

    action.status = action.status === "CLOSED" ? "OPEN" : "CLOSED";
    saveAudit();
    render();
  });

  // Initial render
  render();
})();