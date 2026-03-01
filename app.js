// ===============================
// AuditFlow Pro – Enterprise Engine + Report
// ===============================

const questionBank = {
  "Site & Environment": [
    "Access routes clearly marked and unobstructed?",
    "Emergency exits accessible and appropriately signed?",
    "Fire detection systems functional and periodically tested?",
    "Environmental hazards identified and controlled?",
    "Lighting levels adequate for operational tasks?"
  ],
  "Equipment & Infrastructure": [
    "Critical equipment maintained per schedule?",
    "Inspection records available and current?",
    "Electrical systems protected against overload?",
    "Machinery guarding intact and effective?",
    "Emergency shutdown mechanisms functional?"
  ]
};

let state = {
  status: "DRAFT",
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  actions: []
};

let actionCounter = 1;

// ===============================
// INIT
// ===============================

function init() {
  document.getElementById("auditDate").innerText =
    new Date().toLocaleDateString("en-GB");

  wireNav();
  wireEngine();
  renderPersistentHeader();
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

      if (view === "summary") renderSummary();
      if (view === "actions") renderActions();
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
  document.getElementById("engineBlock").style.display = "block";
  document.getElementById("startAuditBtn").style.display = "none";

  renderPersistentHeader();
  renderQuestion();
}

// ===============================
// QUESTIONS
// ===============================

function renderQuestion() {
  const sections = Object.keys(questionBank);
  const sectionName = sections[state.currentSectionIndex];
  const question = questionBank[sectionName][state.currentQuestionIndex];

  document.getElementById("sectionHeader").innerText = sectionName;
  document.getElementById("questionText").innerText = question;
}

function answer(value) {
  const key = state.currentSectionIndex + "-" + state.currentQuestionIndex;
  state.answers[key] = value;

  if (value === "NO") {
    createAction();
  }

  next();
}

function createAction() {
  const sections = Object.keys(questionBank);
  const sectionName = sections[state.currentSectionIndex];
  const question = questionBank[sectionName][state.currentQuestionIndex];

  state.actions.push({
    id: "A-" + String(actionCounter++).padStart(3, "0"),
    section: sectionName,
    questionText: question,
    recommendedAction: "",
    status: "Open"
  });

  renderPersistentHeader();
}

function next() {
  const sections = Object.keys(questionBank);
  const sectionName = sections[state.currentSectionIndex];

  if (state.currentQuestionIndex < questionBank[sectionName].length - 1) {
    state.currentQuestionIndex++;
  } else if (state.currentSectionIndex < sections.length - 1) {
    state.currentSectionIndex++;
    state.currentQuestionIndex = 0;
  } else {
    state.status = "COMPLETE";
  }

  renderPersistentHeader();
  renderQuestion();
}

function previous() {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex--;
    renderQuestion();
  }
}

// ===============================
// HEADER
// ===============================

function renderPersistentHeader() {
  document.getElementById("headerAuditName").innerText =
    document.getElementById("auditName").value || "—";

  document.getElementById("headerClientName").innerText =
    document.getElementById("clientName").value || "—";

  document.getElementById("headerStatus").innerText = state.status;
  document.getElementById("headerOpenActions").innerText =
    state.actions.filter(a => a.status === "Open").length;
}

// ===============================
// ACTIONS VIEW
// ===============================

function renderActions() {
  const container = document.getElementById("actionsList");
  container.innerHTML = "";

  state.actions.forEach(a => {
    container.innerHTML += `
      <div>
        <strong>${a.section}</strong><br>
        ${a.questionText}<br>
        Status: ${a.status}
        <hr>
      </div>
    `;
  });
}

// ===============================
// SUMMARY REPORT
// ===============================

function renderSummary() {
  const container = document.getElementById("summaryContent");
  container.innerHTML = "";

  const auditName = document.getElementById("auditName").value || "—";
  const client = document.getElementById("clientName").value || "—";
  const date = document.getElementById("auditDate").innerText;
  const findings = state.actions.filter(a => a.status === "Open");

  container.innerHTML += `
    <h1>Operational Assessment Report</h1>
    <p><strong>Audit:</strong> ${auditName}</p>
    <p><strong>Client:</strong> ${client}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Status:</strong> ${state.status}</p>
    <hr>
    <h2>Findings</h2>
  `;

  findings.forEach(f => {
    container.innerHTML += `
      <p><strong>${f.section}</strong>: ${f.questionText}</p>
    `;
  });
}