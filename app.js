(function () {

  const STORAGE_KEY = "auditflow_v3_store";

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
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function uid() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function blankAuditRecord({ name }) {
    return {
      id: uid(),
      name,
      client: "",
      date: "",
      status: STATUS.IN_PROGRESS,
      activeSection: "fire",
      activeIndex: 0,
      responses: {
        fire: Array(TEMPLATE.fire.questions.length).fill(null)
      },
      actions: []
    };
  }

  function blankStore() {
    return {
      activeAuditId: null,
      audits: []
    };
  }

  function loadStore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankStore();
    try {
      return JSON.parse(raw);
    } catch {
      return blankStore();
    }
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadStore();

  function getActiveAudit() {
    return state.audits.find(a => a.id === state.activeAuditId) || null;
  }

  function answeredCountForAudit(audit) {
    let answered = 0;
    let total = 0;
    Object.values(audit.responses).forEach(arr => {
      total += arr.length;
      arr.forEach(v => { if (v) answered++; });
    });
    return { answered, total };
  }

  function sectionStats(audit, sectionKey) {
    const arr = audit.responses[sectionKey];
    const total = arr.length;
    const answered = arr.filter(Boolean).length;
    const open = audit.actions.filter(a =>
      a.sectionKey === sectionKey && a.status === "OPEN"
    ).length;
    return { answered, total, open };
  }

  function openActionCount(audit) {
    return audit.actions.filter(a => a.status === "OPEN").length;
  }

  function renderContextStrip(audit) {
    const context = $("sectionContext");
    if (!context) return;

    const sectionKey = audit.activeSection;
    const section = TEMPLATE[sectionKey];
    const stats = sectionStats(audit, sectionKey);
    const totalOpen = openActionCount(audit);

    context.textContent =
      `${section.title} • ${stats.answered} / ${stats.total} answered • ` +
      `${stats.open} open in section (${totalOpen} total) • ` +
      `${statusLabel(audit.status)}`;
  }

  function statusLabel(s) {
    if (s === STATUS.COMPLETE) return "Complete";
    if (s === STATUS.READY_REVIEW) return "Ready for Review";
    return "In progress";
  }

  function renderAudit() {
    const audit = getActiveAudit();
    if (!audit) return;

    const question = TEMPLATE.fire.questions[audit.activeIndex];
    $("questionText").textContent = question;

    renderContextStrip(audit);
    saveStore();
  }

  function recordResponse(value) {
    const audit = getActiveAudit();
    if (!audit) return;

    audit.responses.fire[audit.activeIndex] = value;

    if (value === "NO") {
      audit.actions.push({
        id: uid(),
        sectionKey: "fire",
        questionIndex: audit.activeIndex,
        status: "OPEN"
      });
    }

    if (audit.status === STATUS.COMPLETE && openActionCount(audit) > 0) {
      audit.status = STATUS.READY_REVIEW;
    }

    renderAudit();
  }

  function nextQuestion(delta) {
    const audit = getActiveAudit();
    if (!audit) return;
    const total = TEMPLATE.fire.questions.length;
    audit.activeIndex = Math.max(0, Math.min(total - 1, audit.activeIndex + delta));
    renderAudit();
  }

  function createAudit() {
    const audit = blankAuditRecord({ name: "New Audit" });
    state.audits.push(audit);
    state.activeAuditId = audit.id;
    renderAudit();
  }

  function init() {
    $("btnYes").onclick = () => recordResponse("YES");
    $("btnNo").onclick = () => recordResponse("NO");
    $("btnNa").onclick = () => recordResponse("N/A");
    $("btnPrev").onclick = () => nextQuestion(-1);
    $("btnNext").onclick = () => nextQuestion(1);
    $("btnNewAudit").onclick = createAudit;

    if (!state.activeAuditId) {
      createAudit();
    } else {
      renderAudit();
    }
  }

  init();

})();