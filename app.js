(function () {
  const STORAGE_KEY = "auditflow_v1_store";

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

  // --- DOM ---
  const navBlock = document.getElementById("navBlock");
  const overallBadge = document.getElementById("overallBadge");
  const actionsBadge = document.getElementById("actionsBadge");

  const auditList = document.getElementById("auditList");
  const btnNewAudit = document.getElementById("btnNewAudit");

  const mainTitle = document.getElementById("mainTitle");
  const mainSub = document.getElementById("mainSub");
  const activeAuditPill = document.getElementById("activeAuditPill");

  const viewIdentity = document.getElementById("viewIdentity");
  const viewAudit = document.getElementById("viewAudit");
  const viewActions = document.getElementById("viewActions");

  const auditName = document.getElementById("auditName");
  const clientName = document.getElementById("clientName");
  const auditDate = document.getElementById("auditDate");
  const btnCreateAudit = document.getElementById("btnCreateAudit");
  const identityHint = document.getElementById("identityHint");

  const sectionList = document.getElementById("sectionList");
  const sectionTitle = document.getElementById("sectionTitle");
  const auditMetaLine = document.getElementById("auditMetaLine");
  const progressPill = document.getElementById("progressPill");

  const qIndex = document.getElementById("qIndex");
  const qRecorded = document.getElementById("qRecorded");
  const questionText = document.getElementById("questionText");
  const hintText = document.getElementById("hintText");

  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");
  const btnNa = document.getElementById("btnNa");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnDeleteAudit = document.getElementById("btnDeleteAudit");

  const badges = {
    fire: document.getElementById("badge-fire"),
    electrical: document.getElementById("badge-electrical"),
    environment: document.getElementById("badge-environment"),
    ppe: document.getElementById("badge-ppe")
  };

  const actionsSummaryPill = document.getElementById("actionsSummaryPill");
  const actionsTbody = document.getElementById("actionsTbody");

  // --- Store ---
  function uid() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function blankAuditRecord({ name, client, date }) {
    const responses = {};
    Object.keys(TEMPLATE).forEach((sectionKey) => {
      responses[sectionKey] = TEMPLATE[sectionKey].questions.map(() => null);
    });

    return {
      id: uid(),
      name: name || "Untitled Audit",
      client: client || "",
      date: date || "",
      status: "IN_PROGRESS",   // IN_PROGRESS | COMPLETE (later)
      activeSection: "fire",
      activeIndex: 0,
      responses,
      actions: []
    };
  }

  function blankStore() {
    return {
      storeVersion: 1,
      activeView: "audit",     // audit | actions
      activeAuditId: null,
      audits: []
    };
  }

  function loadStore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankStore();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.audits)) return blankStore();
      if (parsed.activeView !== "audit" && parsed.activeView !== "actions") parsed.activeView = "audit";
      if (typeof parsed.activeAuditId !== "string" && parsed.activeAuditId !== null) parsed.activeAuditId = null;
      return parsed;
    } catch {
      return blankStore();
    }
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadStore();

  function getActiveAudit() {
    if (!state.activeAuditId) return null;
    return state.audits.find(a => a.id === state.activeAuditId) || null;
  }

  function ensureActiveAuditValid() {
    if (!state.activeAuditId) return;
    const exists = state.audits.some(a => a.id === state.activeAuditId);
    if (!exists) state.activeAuditId = null;
  }

  // --- Helpers ---
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function answeredCountForAudit(audit) {
    let answered = 0;
    let total = 0;
    Object.keys(TEMPLATE).forEach((sectionKey) => {
      const qTotal = TEMPLATE[sectionKey].questions.length;
      total += qTotal;
      const arr = (audit.responses && audit.responses[sectionKey]) ? audit.responses[sectionKey] : Array(qTotal).fill(null);
      arr.forEach(v => { if (v) answered += 1; });
    });
    return { answered, total };
  }

  function sectionAnsweredCount(audit, sectionKey) {
    const total = TEMPLATE[sectionKey].questions.length;
    const arr = (audit.responses && audit.responses[sectionKey]) ? audit.responses[sectionKey] : Array(total).fill(null);
    let answered = 0;
    arr.forEach(v => { if (v) answered += 1; });
    return { answered, total };
  }

  function openActionCount(audit) {
    return (audit.actions || []).filter(a => a.status === "OPEN").length;
  }

  function getQuestionText(sectionKey, questionIndex) {
    const section = TEMPLATE[sectionKey];
    if (!section) return "";
    return section.questions[questionIndex] || "";
  }

  function upsertActionForQuestion(audit, sectionKey, questionIndex) {
    const issueText = getQuestionText(sectionKey, questionIndex);
    if (!issueText) return;

    const existing = (audit.actions || []).find(x => x.sectionKey === sectionKey && x.questionIndex === questionIndex);
    if (existing) {
      if (!existing.issueText) existing.issueText = issueText;
      if (!existing.status) existing.status = "OPEN";
      return;
    }

    audit.actions.push({
      id: uid(),
      sectionKey,
      questionIndex,
      issueText,
      status: "OPEN"
    });
  }

  function maybeManageActionFromResponse(audit, sectionKey, questionIndex, value) {
    // V1: NO creates action; changing away from NO does not auto-delete (audit trail)
    if (value === "NO") upsertActionForQuestion(audit, sectionKey, questionIndex);
  }

  // --- Render ---
  function renderNav() {
    const items = navBlock.querySelectorAll(".navitem");
    items.forEach((el) => {
      const v = el.getAttribute("data-view");
      el.classList.toggle("active", v === state.activeView);
    });
  }

  function renderAuditList() {
    ensureActiveAuditValid();

    if (state.audits.length === 0) {
      auditList.innerHTML = `
        <div style="color:var(--muted); font-size:13px; padding:6px 2px;">
          No audits yet. Create one to begin.
        </div>
      `;
      return;
    }

    const items = state.audits.slice().reverse(); // newest first
    auditList.innerHTML = items.map(a => {
      const { answered, total } = answeredCountForAudit(a);
      const active = a.id === state.activeAuditId ? "active" : "";
      const client = a.client ? a.client : "No client";
      const date = a.date ? a.date : "No date";
      return `
        <div class="audititem ${active}" data-audit-id="${a.id}">
          <div class="stack" style="min-width:0;">
            <div class="truncate" style="font-weight:800;">${escapeHtml(a.name)}</div>
            <div class="audit-meta truncate">${escapeHtml(client)} • ${escapeHtml(date)}</div>
          </div>
          <span class="badge">${answered}/${total}</span>
        </div>
      `;
    }).join("");
  }

  function renderBadges() {
    const audit = getActiveAudit();
    if (!audit) {
      overallBadge.textContent = "0 answered";
      actionsBadge.textContent = "0 open";
      return;
    }
    const { answered, total } = answeredCountForAudit(audit);
    overallBadge.textContent = `${answered} answered`;
    actionsBadge.textContent = `${openActionCount(audit)} open`;
  }

  function showIdentityView() {
    viewIdentity.style.display = "";
    viewAudit.style.display = "none";
    viewActions.style.display = "none";

    mainTitle.textContent = "Audit";
    mainSub.textContent = "Create a new audit to begin.";
    activeAuditPill.textContent = "No audit selected";
  }

  function showAuditView() {
    viewIdentity.style.display = "none";
    viewAudit.style.display = "";
    viewActions.style.display = "none";
  }

  function showActionsView() {
    viewIdentity.style.display = "none";
    viewAudit.style.display = "none";
    viewActions.style.display = "";
  }

  function renderAuditWork() {
    const audit = getActiveAudit();
    if (!audit) {
      showIdentityView();
      return;
    }

    // Ensure response arrays exist per template
    Object.keys(TEMPLATE).forEach(sectionKey => {
      const qCount = TEMPLATE[sectionKey].questions.length;
      if (!audit.responses) audit.responses = {};
      if (!Array.isArray(audit.responses[sectionKey])) audit.responses[sectionKey] = Array(qCount).fill(null);
      audit.responses[sectionKey] = audit.responses[sectionKey].slice(0, qCount);
      while (audit.responses[sectionKey].length < qCount) audit.responses[sectionKey].push(null);
    });
    if (!audit.actions || !Array.isArray(audit.actions)) audit.actions = [];

    // Pill and header
    activeAuditPill.textContent = `${audit.name} • ${audit.client || "No client"}`;
    mainTitle.textContent = audit.name;
    mainSub.textContent = "Multiple audits. “No” creates an action automatically.";

    // Meta line
    const metaParts = [
      audit.client ? audit.client : "No client",
      audit.date ? audit.date : "No date",
      audit.status === "IN_PROGRESS" ? "In progress" : "Complete"
    ];
    auditMetaLine.textContent = metaParts.join(" • ");

    // Progress
    const { answered, total } = answeredCountForAudit(audit);
    progressPill.textContent = `${answered}/${total} answered`;

    // Section badges + active
    const sections = sectionList.querySelectorAll(".section");
    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      el.classList.toggle("active", key === audit.activeSection);
    });

    Object.keys(TEMPLATE).forEach(sectionKey => {
      const sc = sectionAnsweredCount(audit, sectionKey);
      if (badges[sectionKey]) badges[sectionKey].textContent = `${sc.answered}/${sc.total}`;
    });

    // Current question
    const questions = TEMPLATE[audit.activeSection].questions;
    const totalQ = questions.length;
    const idx = Math.max(0, Math.min(totalQ - 1, audit.activeIndex));

    audit.activeIndex = idx;

    sectionTitle.textContent = TEMPLATE[audit.activeSection].title;

    questionText.textContent = questions[idx];
    qIndex.textContent = `Question ${idx + 1} of ${totalQ}`;

    const recorded = audit.responses[audit.activeSection][idx];
    qRecorded.textContent = recorded ? `Recorded: ${recorded}` : "No response recorded";

    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === totalQ - 1;

    hintText.textContent = "V1 rule: selecting “No” creates an action (kept even if you later change the answer).";
  }

  function renderActions() {
    const audit = getActiveAudit();
    if (!audit) {
      showIdentityView();
      return;
    }

    showActionsView();

    activeAuditPill.textContent = `${audit.name} • ${audit.client || "No client"}`;
    mainTitle.textContent = "Action Register";
    mainSub.textContent = "Actions are created automatically when a response is “No”.";

    const open = openActionCount(audit);
    actionsSummaryPill.textContent = `${open} open`;

    const actions = (audit.actions || []).slice().reverse();
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

  function render() {
    renderNav();
    renderAuditList();
    renderBadges();

    if (!state.activeAuditId) {
      showIdentityView();
      return;
    }

    if (state.activeView === "actions") renderActions();
    else {
      showAuditView();
      renderAuditWork();
    }
  }

  // --- Actions ---
  function setActiveView(view) {
    state.activeView = view;
    saveStore();
    render();
  }

  function setActiveAudit(id) {
    state.activeAuditId = id;
    saveStore();
    render();
  }

  function createAuditFromInputs() {
    const name = (auditName.value || "").trim();
    const client = (clientName.value || "").trim();
    const date = (auditDate.value || "").trim();

    if (!name) {
      identityHint.textContent = "Audit name is required.";
      return;
    }

    const audit = blankAuditRecord({ name, client, date });
    state.audits.push(audit);
    state.activeAuditId = audit.id;
    state.activeView = "audit";

    // Reset inputs
    auditName.value = "";
    clientName.value = "";
    auditDate.value = "";

    identityHint.textContent = "Created.";

    saveStore();
    render();
  }

  function deleteActiveAudit() {
    const audit = getActiveAudit();
    if (!audit) return;

    // Basic confirm (browser native)
    const ok = confirm(`Delete audit "${audit.name}"? This cannot be undone.`);
    if (!ok) return;

    state.audits = state.audits.filter(a => a.id !== audit.id);
    state.activeAuditId = null;
    state.activeView = "audit";

    saveStore();
    render();
  }

  function recordResponse(value) {
    const audit = getActiveAudit();
    if (!audit) return;

    const s = audit.activeSection;
    const i = audit.activeIndex;

    audit.responses[s][i] = value;
    maybeManageActionFromResponse(audit, s, i, value);

    saveStore();
    render();
  }

  function setActiveSection(sectionKey) {
    const audit = getActiveAudit();
    if (!audit) return;
    audit.activeSection = sectionKey;
    audit.activeIndex = 0;
    saveStore();
    render();
  }

  function setActiveIndex(delta) {
    const audit = getActiveAudit();
    if (!audit) return;

    const total = TEMPLATE[audit.activeSection].questions.length;
    audit.activeIndex = Math.max(0, Math.min(total - 1, audit.activeIndex + delta));

    saveStore();
    render();
  }

  function toggleActionStatus(actionId) {
    const audit = getActiveAudit();
    if (!audit) return;

    const action = (audit.actions || []).find(a => a.id === actionId);
    if (!action) return;

    action.status = action.status === "CLOSED" ? "OPEN" : "CLOSED";
    saveStore();
    render();
  }

  // --- Events ---
  navBlock.addEventListener("click", (e) => {
    const item = e.target.closest(".navitem");
    if (!item) return;
    const view = item.getAttribute("data-view");
    if (!view) return;
    setActiveView(view);
  });

  auditList.addEventListener("click", (e) => {
    const item = e.target.closest(".audititem");
    if (!item) return;
    const id = item.getAttribute("data-audit-id");
    if (!id) return;
    setActiveAudit(id);
  });

  btnNewAudit.addEventListener("click", () => {
    state.activeAuditId = null;
    state.activeView = "audit";
    saveStore();
    render();
  });

  btnCreateAudit.addEventListener("click", createAuditFromInputs);

  if (sectionList) {
    sectionList.addEventListener("click", (e) => {
      const item = e.target.closest(".section");
      if (!item) return;
      const key = item.getAttribute("data-section");
      if (!key) return;
      setActiveView("audit");
      setActiveSection(key);
    });
  }

  btnYes.addEventListener("click", () => recordResponse("YES"));
  btnNo.addEventListener("click", () => recordResponse("NO"));
  btnNa.addEventListener("click", () => recordResponse("N/A"));

  btnPrev.addEventListener("click", () => setActiveIndex(-1));
  btnNext.addEventListener("click", () => setActiveIndex(1));

  btnDeleteAudit.addEventListener("click", deleteActiveAudit);

  actionsTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action-id]");
    if (!btn) return;
    toggleActionStatus(btn.getAttribute("data-action-id"));
  });

  // --- Init ---
  render();
})();