// AuditFlow Pro – Enterprise Global Engine V2
// Structured methodology + action engine + persistent header

// ===============================
// GLOBAL QUESTION BANK (Curated)
// ===============================

const questionBank = {
  "Site & Environment": [
    "Access routes clearly marked and unobstructed?",
    "Emergency exits accessible and appropriately signed?",
    "Fire detection systems functional and periodically tested?",
    "Environmental hazards identified and controlled?",
    "Lighting levels adequate for operational tasks?",
    "Housekeeping standards consistently maintained?",
    "Visitor access controls implemented?",
    "Perimeter security measures effective?",
    "Welfare facilities available and maintained?",
    "Incident reporting mechanism accessible?"
  ],
  "Equipment & Infrastructure": [
    "Critical equipment maintained per schedule?",
    "Inspection records available and current?",
    "Electrical systems protected against overload?",
    "Machinery guarding intact and effective?",
    "Emergency shutdown mechanisms functional?",
    "Calibration processes documented?",
    "Asset tracking system implemented?",
    "Maintenance responsibilities clearly assigned?",
    "Utilities monitored for reliability?",
    "Contingency plans for infrastructure failure documented?"
  ],
  "Operational Controls": [
    "Standard operating procedures documented?",
    "Procedures aligned with actual practice?",
    "Change management controls implemented?",
    "Operational risk assessments conducted?",
    "Control measures reviewed periodically?",
    "Communication protocols clearly defined?",
    "Incident escalation pathways documented?",
    "Supervisory oversight adequate?",
    "Compliance monitoring mechanism active?",
    "Performance metrics regularly reviewed?"
  ],
  "People & Process": [
    "Roles and responsibilities clearly defined?",
    "Training records maintained?",
    "Competency verification processes implemented?",
    "Governance oversight effective?",
    "Internal audit programme established?",
    "Corrective action tracking system active?",
    "Management review process documented?",
    "Whistleblowing or reporting channels available?",
    "Continuous improvement mechanisms active?",
    "Ethical conduct policies communicated?"
  ]
};

const sectionNames = Object.keys(questionBank);

// ===============================
// STATE
// ===============================

let state = {
  status: "DRAFT",
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  actions: [],
  modified: false,
  sectionIntroVisible: true
};

let actionCounter = 1;
let pendingActionContext = null;

// ===============================
// INIT
// ===============================

function init() {
  document.getElementById("auditDate").innerText =
    new Date().toLocaleDateString("en-GB");

  wireNav();
  wireEngine();
  render();
}

window.onload = init;

// ===============================
// NAVIGATION
// ===============================

function wireNav() {
  document.querySelectorAll(".navitem").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".navitem").forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      const view = item.dataset.view;

      document.getElementById("auditView").style.display = view === "audit" ? "block" : "none";
      document.getElementById("actionsView").style.display = view === "actions" ? "block" : "none";
      document.getElementById("summaryView").style.display = view === "summary" ? "block" : "none";

      if (view === "actions") renderActions();
      if (view === "summary") renderSummary();
    });
  });
}

// ===============================
// ENGINE WIRING
// ===============================

function wireEngine() {
  document.getElementById("startAuditBtn").onclick = startAudit;
  document.getElementById("yesBtn").onclick = () => answer("YES");
  document.getElementById("noBtn").onclick = () => answer("NO");
  document.getElementById("naBtn").onclick = () => answer("NA");
  document.getElementById("previousBtn").onclick = previous;
  document.getElementById("exportBtn").onclick = () => window.print();
}

// ===============================
// START AUDIT
// ===============================

function startAudit() {
  const name = document.getElementById("auditName").value.trim();
  const error = document.getElementById("nameError");

  if (!name) {
    error.innerText = "Audit name required to create formal record.";
    return;
  }

  error.innerText = "";
  state.status = "IN PROGRESS";
  state.sectionIntroVisible = true;

  document.getElementById("engineBlock").style.display = "block";
  document.getElementById("startAuditBtn").style.display = "none";

  render();
}

// ===============================
// ANSWERING
// ===============================

function answer(value) {
  if (state.status !== "IN PROGRESS") return;

  const key = state.currentSectionIndex + "-" + state.currentQuestionIndex;
  state.answers[key] = value;

  if (value === "NO") {
    openActionPanel();
  } else {
    autoAdvance();
  }
}

// ===============================
// ACTION PANEL
// ===============================

function openActionPanel() {
  const sectionName = sectionNames[state.currentSectionIndex];
  const questionText =
    questionBank[sectionName][state.currentQuestionIndex];

  pendingActionContext = {
    section: sectionName,
    questionText
  };

  const container = document.querySelector(".section-card");

  container.innerHTML = `
    <div class="section-header">Action Required</div>
    <div class="section-meta">${sectionName}</div>
    <div style="margin-bottom:12px;"><strong>${questionText}</strong></div>

    <label>Severity *</label>
    <select id="severitySelect">
      <option value="">Select severity</option>
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
      <option>Critical</option>
    </select>

    <label>Rationale (optional)</label>
    <textarea id="rationaleInput"></textarea>

    <label>Recommended Action (optional)</label>
    <textarea id="recommendInput"></textarea>

    <button id="confirmActionBtn" class="primary-btn">Confirm Action</button>
  `;

  document.getElementById("confirmActionBtn").onclick = confirmAction;
}

function confirmAction() {
  const severity = document.getElementById("severitySelect").value;
  if (!severity) return;

  const rationale = document.getElementById("rationaleInput").value;
  const recommend = document.getElementById("recommendInput").value;

  const action = {
    id: "A-" + String(actionCounter++).padStart(3, "0"),
    section: pendingActionContext.section,
    questionText: pendingActionContext.questionText,
    severity,
    status: "Open",
    created: new Date().toISOString(),
    closed: null,
    rationale,
    recommendedAction: recommend
  };

  state.actions.push(action);

  autoAdvance();
  render();
}

// ===============================
// FLOW
// ===============================

function autoAdvance() {
  const sectionName = sectionNames[state.currentSectionIndex];
  const total = questionBank[sectionName].length;

  if (state.currentQuestionIndex < total - 1) {
    state.currentQuestionIndex++;
    render();
  } else {
    nextSection();
  }
}

function nextSection() {
  if (state.currentSectionIndex < sectionNames.length - 1) {
    state.currentSectionIndex++;
    state.currentQuestionIndex = 0;
    state.sectionIntroVisible = true;
    render();
  } else {
    state.status = "COMPLETE";
    render();
  }
}

function previous() {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex--;
    render();
  }
}

// ===============================
// RENDER
// ===============================

function render() {
  renderPersistentHeader();
  renderStatus();
  renderSection();
}

function renderPersistentHeader() {
  document.getElementById("headerAuditName").innerText =
    document.getElementById("auditName").value || "—";

  document.getElementById("headerClientName").innerText =
    document.getElementById("clientName").value || "—";

  document.getElementById("headerStatus").innerText = state.status;

  document.getElementById("headerOpenActions").innerText =
    state.actions.filter(a => a.status === "Open").length;
}

function renderStatus() {
  const badge = document.getElementById("statusBadge");
  badge.className = "status-badge " + state.status.toLowerCase();
  badge.innerText = state.status;
}

function renderSection() {
  const sectionName = sectionNames[state.currentSectionIndex];

  if (state.sectionIntroVisible) {
    showSectionIntro(sectionName);
    return;
  }

  document.getElementById("sectionHeader").innerText = sectionName;

  const total = questionBank[sectionName].length;
  const answered = getAnswered(state.currentSectionIndex);
  const open = state.actions.filter(a => a.status === "Open").length;

  document.getElementById("sectionMeta").innerText =
    "Progress: " + answered + " of " + total + " • Open Actions: " + open;

  document.getElementById("questionText").innerText =
    questionBank[sectionName][state.currentQuestionIndex];
}

function showSectionIntro(sectionName) {
  const container = document.querySelector(".section-card");

  container.innerHTML = `
    <div class="section-header">${sectionName}</div>
    <div style="margin:12px 0;">
      This section evaluates structural, operational and governance controls
      within ${sectionName.toLowerCase()}.
    </div>
    <button id="beginSectionBtn" class="primary-btn">Begin Section</button>
  `;

  document.getElementById("beginSectionBtn").onclick = () => {
    state.sectionIntroVisible = false;
    render();
  };
}

function getAnswered(sectionIndex) {
  let count = 0;
  const sectionName = sectionNames[sectionIndex];
  const total = questionBank[sectionName].length;

  for (let i = 0; i < total; i++) {
    if (state.answers[sectionIndex + "-" + i]) count++;
  }
  return count;
}

// ===============================
// ACTIONS TAB
// ===============================

function renderActions() {
  const container = document.getElementById("actionsList");
  container.innerHTML = "";

  const openActions = state.actions.filter(a => a.status === "Open");

  const summary = document.createElement("div");
  summary.innerText = "Open Actions: " + openActions.length;
  container.appendChild(summary);

  openActions.forEach(action => {
    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #e3e6ee";
    div.style.padding = "12px 0";

    div.innerHTML =
      `<strong>${action.id}</strong><br>
       ${action.section}<br>
       ${action.questionText}<br>
       Severity: ${action.severity}`;

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    closeBtn.onclick = () => {
      action.status = "Closed";
      action.closed = new Date().toISOString();
      if (state.status === "COMPLETE") {
        state.status = "MODIFIED";
      }
      renderActions();
      renderPersistentHeader();
    };

    div.appendChild(closeBtn);
    container.appendChild(div);
  });
}

// ===============================
// SUMMARY TAB
// ===============================

function renderSummary() {
  const container = document.getElementById("summaryContent");
  container.innerHTML = "";

  sectionNames.forEach((name, index) => {
    const div = document.createElement("div");
    div.innerText =
      name + " — " +
      getAnswered(index) + "/" +
      questionBank[name].length + " answered";
    container.appendChild(div);
  });
}