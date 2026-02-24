(function () {
  const STORAGE_KEY = "auditflow_v3_store";

  // Status ladder
  const STATUS = {
    IN_PROGRESS: "IN_PROGRESS",
    READY_REVIEW: "READY_REVIEW",
    COMPLETE: "COMPLETE"
  };

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

  function $(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element: #${id}`);
    return el;
  }

  const errorBanner = document.getElementById("errorBanner");
  function showError(msg) {
    if (!errorBanner) return;
    errorBanner.style.display = "block";
    errorBanner.textContent = msg;
  }

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
      status: STATUS.IN_PROGRESS,
      activeSection: "fire",
      activeIndex: 0,
      responses,
      actions: [] // { id, sectionKey, questionIndex, issueText, status: OPEN|CLOSED }
    };
  }

  function blankStore() {
    return {
      storeVersion: 3,
      activeView: "audit",     // audit | actions | summary
      activeAuditId: null,
      audits: []
    };
  }

  // Backward compatible load (migrates older stores into v3 key)
  function loadStore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.audits)) return parsed;
      } catch {}
    }

    // Try to import older stores if present
    const legacyKeys = ["auditflow_v2_store", "auditflow_v1_store"];
    for (const k of legacyKeys) {
      const r = localStorage.getItem(k);
      if (!r) continue;
      try {
        const p = JSON.parse(r);
        if (p && Array.isArray(p.audits)) {
          // migrate minimal fields
          p.storeVersion = 3;
          p.activeView = ["audit","actions","summary"].includes(p.activeView) ? p.activeView : "audit";
          p.audits.forEach(a => {
            if (!a.status) a.status = STATUS.IN_PROGRESS;
            // map old COMPLETE/IN_PROGRESS
            if (a.status === "COMPLETE") a.status = STATUS.COMPLETE;
            if (a.status === "IN_PROGRESS") a.status = STATUS.IN_PROGRESS;
            if (a.status !== STATUS.IN_PROGRESS && a.status !== STATUS.READY_REVIEW && a.status !== STATUS.COMPLETE) {
              a.status = STATUS.IN_PROGRESS;
            }
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          return p;
        }
      } catch {}
    }

    return blankStore();
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

  // DOM bind
  let navBlock, overallBadge, actionsBadge, summaryBadge;
  let auditList, btnNewAudit;
  let mainTitle, mainSub, activeAuditPill;

  let viewIdentity, viewAudit, viewActions, viewSummary;
  let auditName, clientName, auditDate, btnCreateAudit, identityHint;

  let sectionList, sectionTitle, auditMetaLine, progressPill;
  let qIndex, qRecorded, questionText, hintText;
  let btnYes, btnNo, btnNa, btnPrev, btnNext, btnDeleteAudit;

  let badges;
  let actionsSummaryPill, actionsTbody;

  let statusPill, summaryIdentity, summaryProgress, summaryOpenActions, summaryTbody, btnToggleComplete, summaryGateHint;

  function bindDom() {
    navBlock = $("navBlock");
    overallBadge = $("overallBadge");
    actionsBadge = $("actionsBadge");
    summaryBadge = $("summaryBadge");

    auditList = $("auditList");
    btnNewAudit = $("btnNewAudit");

    mainTitle = $("mainTitle");
    mainSub = $("mainSub");
    activeAuditPill = $("activeAuditPill");

    viewIdentity = $("viewIdentity");
    viewAudit = $("viewAudit");
    viewActions = $("viewActions");
    viewSummary = $("viewSummary");

    auditName = $("auditName");
    clientName = $("clientName");
    auditDate = $("auditDate");
    btnCreateAudit = $("btnCreateAudit");
    identityHint = $("identityHint");

    sectionList = $("sectionList");
    sectionTitle = $("sectionTitle");
    auditMetaLine = $("auditMetaLine");
    progressPill = $("progressPill");

    qIndex = $("qIndex");
    qRecorded = $("qRecorded");
    questionText = $("questionText");
    hintText = $("hintText");

    btnYes = $("btnYes");
    btnNo = $("btnNo");
    btnNa = $("btnNa");
    btnPrev = $("btnPrev");
    btnNext = $("btnNext");
    btnDeleteAudit = $("btnDeleteAudit");

    badges = {
      fire: $("badge-fire"),
      electrical: $("badge-electrical"),
      environment: $("badge-environment"),
      ppe: $("badge-ppe")
    };

    actionsSummaryPill = $("actionsSummaryPill");
    actionsTbody = $("actionsTbody");

    statusPill = $("statusPill");
    summaryIdentity = $("summaryIdentity");
    summaryProgress = $("summaryProgress");
    summaryOpenActions = $("summaryOpenActions");
    summaryTbody = $("summaryTbody");
    btnToggleComplete = $("btnToggleComplete");
    summaryGateHint = document.getElementById("summaryGateHint"); // optional
  }

  function statusLabel(s) {
    if (s === STATUS.COMPLETE) return "Complete";
    if (s === STATUS.READY_REVIEW) return "Ready for Review";
    return "In progress";
  }

  function statusPillClass(s) {
    if (s === STATUS.COMPLETE) return "complete";
    if (s === STATUS.READY_REVIEW) return "review";
    return "progress";
  }

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
        <div style="color:var(--muted); font-size:13px; padding:6px 2px; font-weight:650;">
          No audits yet. Create one to begin.
        </div>
      `;
      return;
    }

    const items = state.audits.slice().reverse();
    auditList.innerHTML = items.map(a => {
      const { answered, total } = answeredCountForAudit(a);
      const active = a.id === state.activeAuditId ? "active" : "";
      const client = a.client ? a.client : "No client";
      const date = a.date ? a.date : "No date";
      return `
        <div class="audititem ${active}" data-audit-id="${a.id}">
          <div class="stack" style="min-width:0;">
            <div class="truncate" style="font-weight:950;">${escapeHtml(a.name)}</div>
            <div class="audit-meta truncate">${escapeHtml(client)} • ${escapeHtml(date)} • ${escapeHtml(statusLabel(a.status))}</div>
          </div>
          <span class="badge">${answered}/${total}</span>
        </div>
      `;
    }).join("");
  }

  function renderHeaderBadges() {
    const audit = getActiveAudit();
    if (!audit) {
      overallBadge.textContent = "0 answered";
      actionsBadge.textContent = "0 open";
      summaryBadge.textContent = "—";
      return;
    }
    const { answered, total } = answeredCountForAudit(audit);
    overallBadge.textContent = `${answered} answered`;
    actionsBadge.textContent = `${openActionCount(audit)} open`;
    summaryBadge.textContent = `${answered}/${total}`;
  }

  function showOnly(view) {
    viewIdentity.style.display = "none";
    viewAudit.style.display = "none";
    viewActions.style.display = "none";
    viewSummary.style.display = "none";

    if (view === "identity") viewIdentity.style.display = "";
    if (view === "audit") viewAudit.style.display = "";
    if (view === "actions") viewActions.style.display = "";
    if (view === "summary") viewSummary.style.display = "";
  }

  function renderIdentity() {
    mainTitle.textContent = "Audit";
    mainSub.textContent = "Create a new audit record.";
    activeAuditPill.textContent = "No audit selected";
    showOnly("identity");
  }

  function normaliseAudit(audit) {
    Object.keys(TEMPLATE).forEach(sectionKey => {
      const qCount = TEMPLATE[sectionKey].questions.length;
      if (!audit.responses) audit.responses = {};
      if (!Array.isArray(audit.responses[sectionKey])) audit.responses[sectionKey] = Array(qCount).fill(null);
      audit.responses[sectionKey] = audit.responses[sectionKey].slice(0, qCount);
      while (audit.responses[sectionKey].length < qCount) audit.responses[sectionKey].push(null);
    });
    if (!audit.actions || !Array.isArray(audit.actions)) audit.actions = [];
    if (!audit.status) audit.status = STATUS.IN_PROGRESS;

    // Enforce rule on load: if complete but has open actions, downgrade to Ready for Review
    if (audit.status === STATUS.COMPLETE && openActionCount(audit) > 0) {
      audit.status = STATUS.READY_REVIEW;
    }
  }

  function renderAudit() {
    const audit = getActiveAudit();
    if (!audit) return renderIdentity();

    normaliseAudit(audit);
    showOnly("audit");

    activeAuditPill.textContent = `${audit.name} • ${audit.client || "No client"}`;
    mainTitle.textContent = audit.name;
    mainSub.textContent = "Independent audit record. “No” creates an action.";

    const metaParts = [
      audit.client ? audit.client : "No client",
      audit.date ? audit.date : "No date",
      statusLabel(audit.status)
    ];
    auditMetaLine.textContent = metaParts.join(" • ");

    const { answered, total } = answeredCountForAudit(audit);
    progressPill.textContent = `${answered}/${total} answered`;

    const sections = sectionList.querySelectorAll(".section");
    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      el.classList.toggle("active", key === audit.activeSection);
    });

    Object.keys(TEMPLATE).forEach(sectionKey => {
      const sc = sectionAnsweredCount(audit, sectionKey);
      if (badges[sectionKey]) badges[sectionKey].textContent = `${sc.answered}/${sc.total}`;
    });

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

    hintText.textContent = "Audit trail rule: “No” creates an action and it remains until closed.";
  }

  function renderActions() {
    const audit = getActiveAudit();
    if (!audit) return renderIdentity();

    normaliseAudit(audit);
    showOnly("actions");

    activeAuditPill.textContent = `${audit.name} • ${audit.client || "No client"}`;
    mainTitle.textContent = "Action Register";
    mainSub.textContent = "Close actions to reach “Complete”.";

    const open = openActionCount(audit);
    actionsSummaryPill.textContent = `${open} open`;

    const actions = (audit.actions || []).slice().reverse();
    if (actions.length === 0) {
      actionsTbody.innerHTML = `
        <tr><td colspan="4" style="color:var(--muted); padding:14px 8px;">No actions yet.</td></tr>
      `;
      return;
    }

    actionsTbody.innerHTML = actions.map(a => {
      const sectionTitleText = (TEMPLATE[a.sectionKey] && TEMPLATE[a.sectionKey].title) ? TEMPLATE[a.sectionKey].title : a.sectionKey;
      const statusText = a.status === "CLOSED" ? "Closed" : "Open";
      const toggleLabel = a.status === "CLOSED" ? "Reopen" : "Close";
      return `
        <tr>
          <td>${escapeHtml(a.issueText)}</td>
          <td>${escapeHtml(sectionTitleText)}</td>
          <td>${escapeHtml(statusText)}</td>
          <td><button class="smallactionbtn" data-action-id="${a.id}">${toggleLabel}</button></td>
        </tr>
      `;
    }).join("");
  }

  function renderSummary() {
    const audit = getActiveAudit();
    if (!audit) return renderIdentity();

    normaliseAudit(audit);
    showOnly("summary");

    activeAuditPill.textContent = `${audit.name} • ${audit.client || "No client"}`;
    mainTitle.textContent = "Summary";
    mainSub.textContent = "Client-ready audit summary and completion gate.";

    const { answered, total } = answeredCountForAudit(audit);
    const open = openActionCount(audit);

    // Status pill
    statusPill.textContent = statusLabel(audit.status);
    statusPill.className = `pill ${statusPillClass(audit.status)}`;

    summaryIdentity.textContent = `${audit.name} • ${audit.client || "No client"} • ${audit.date || "No date"}`;
    summaryProgress.textContent = `${answered}/${total} answered`;
    summaryOpenActions.textContent = `${open} open actions`;

    summaryTbody.innerHTML = Object.keys(TEMPLATE).map(sectionKey => {
      const sc = sectionAnsweredCount(audit, sectionKey);
      return `<tr><td>${escapeHtml(TEMPLATE[sectionKey].title)}</td><td>${sc.answered}/${sc.total}</td></tr>`;
    }).join("");

    // Button label + gate hint
    let btnText = "Move to Ready for Review";
    let gate = "";

    if (audit.status === STATUS.IN_PROGRESS) {
      btnText = "Move to Ready for Review";
      gate = "Use Ready for Review before client delivery.";
    } else if (audit.status === STATUS.READY_REVIEW) {
      btnText = "Mark Audit Complete";
      if (open > 0) {
        gate = "Completion is blocked: close all open actions first.";
      } else {
        gate = "Completion available: no open actions remain.";
      }
    } else if (audit.status === STATUS.COMPLETE) {
      btnText = "Reopen Audit";
      gate = "Reopening returns audit to In progress.";
    }

    btnToggleComplete.textContent = btnText;
    if (summaryGateHint) summaryGateHint.textContent = gate;
  }

  function render() {
    renderNav();
    renderAuditList();
    renderHeaderBadges();

    const audit = getActiveAudit();
    if (!audit) {
      renderIdentity();
      saveStore();
      return;
    }

    if (state.activeView === "actions") renderActions();
    else if (state.activeView === "summary") renderSummary();
    else renderAudit();

    saveStore();
  }

  // Mutations
  function setActiveView(view) {
    state.activeView = view;
    render();
  }

  function setActiveAudit(id) {
    state.activeAuditId = id;
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

    auditName.value = "";
    clientName.value = "";
    auditDate.value = "";
    identityHint.textContent = "Created.";

    render();
  }

  function deleteActiveAudit() {
    const audit = getActiveAudit();
    if (!audit) return;

    const ok = confirm(`Delete audit "${audit.name}"? This cannot be undone.`);
    if (!ok) return;

    state.audits = state.audits.filter(a => a.id !== audit.id);
    state.activeAuditId = null;
    state.activeView = "audit";
    render();
  }

  function recordResponse(value) {
    const audit = getActiveAudit();
    if (!audit) return;

    normaliseAudit(audit);

    const s = audit.activeSection;
    const i = audit.activeIndex;

    audit.responses[s][i] = value;
    maybeManageActionFromResponse(audit, s, i, value);

    // If audit is COMPLETE and a new NO creates an open action, downgrade automatically
    if (audit.status === STATUS.COMPLETE && openActionCount(audit) > 0) {
      audit.status = STATUS.READY_REVIEW;
    }

    render();
  }

  function setActiveSection(sectionKey) {
    const audit = getActiveAudit();
    if (!audit) return;
    normaliseAudit(audit);
    audit.activeSection = sectionKey;
    audit.activeIndex = 0;
    state.activeView = "audit";
    render();
  }

  function setActiveIndex(delta) {
    const audit = getActiveAudit();
    if (!audit) return;

    normaliseAudit(audit);

    const total = TEMPLATE[audit.activeSection].questions.length;
    audit.activeIndex = Math.max(0, Math.min(total - 1, audit.activeIndex + delta));
    render();
  }

  function toggleActionStatus(actionId) {
    const audit = getActiveAudit();
    if (!audit) return;

    normaliseAudit(audit);

    const action = (audit.actions || []).find(a => a.id === actionId);
    if (!action) return;

    action.status = action.status === "CLOSED" ? "OPEN" : "CLOSED";

    // If re-opened while COMPLETE, immediately downgrade
    if (audit.status === STATUS.COMPLETE && openActionCount(audit) > 0) {
      audit.status = STATUS.READY_REVIEW;
    }

    render();
  }

  function toggleCompletionState() {
    const audit = getActiveAudit();
    if (!audit) return;

    normaliseAudit(audit);

    const open = openActionCount(audit);

    if (audit.status === STATUS.IN_PROGRESS) {
      audit.status = STATUS.READY_REVIEW;
      render();
      return;
    }

    if (audit.status === STATUS.READY_REVIEW) {
      if (open > 0) {
        alert("Cannot mark Complete while there are open actions. Close all open actions first.");
        return;
      }
      audit.status = STATUS.COMPLETE;
      render();
      return;
    }

    if (audit.status === STATUS.COMPLETE) {
      audit.status = STATUS.IN_PROGRESS;
      render();
      return;
    }
  }

  function newAuditMode() {
    state.activeAuditId = null;
    state.activeView = "audit";
    render();
  }

  // Events
  function wireEvents() {
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

    btnNewAudit.addEventListener("click", newAuditMode);
    btnCreateAudit.addEventListener("click", createAuditFromInputs);

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

    btnPrev.addEventListener("click", () => setActiveIndex(-1));
    btnNext.addEventListener("click", () => setActiveIndex(1));

    btnDeleteAudit.addEventListener("click", deleteActiveAudit);

    actionsTbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action-id]");
      if (!btn) return;
      toggleActionStatus(btn.getAttribute("data-action-id"));
    });

    btnToggleComplete.addEventListener("click", toggleCompletionState);
  }

  // Boot
  try {
    bindDom();
    wireEvents();
    render();
  } catch (err) {
    showError(`JS error: ${err && err.message ? err.message : String(err)}`);
  }
})();