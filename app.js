// =========================================
// AuditFlow Pro v2 – Enterprise Foundation
// Multi-Audit | Structured Controls | Clean Architecture
// =========================================

// ------------------------------
// STORAGE
// ------------------------------

const STORAGE_KEY = "auditflowpro_v2";

function loadAudits() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAudits(audits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
}

// ------------------------------
// GLOBAL STATE
// ------------------------------

let state = {
  audits: loadAudits(),
  activeAuditId: null
};

// ------------------------------
// CONTROL LIBRARY (GLOBAL MODEL)
// ------------------------------

const controlLibrary = [
  {
    section: "Site & Environment",
    controls: [
      { id: "SE-01", statement: "Access routes are clearly marked and unobstructed.", criticality: "Critical" },
      { id: "SE-02", statement: "Emergency exits are accessible and appropriately signed.", criticality: "Critical" },
      { id: "SE-03", statement: "Fire detection systems are functional and periodically tested.", criticality: "Critical" }
    ]
  },
  {
    section: "Equipment & Infrastructure",
    controls: [
      { id: "EI-01", statement: "Critical equipment is maintained per schedule.", criticality: "Critical" },
      { id: "EI-02", statement: "Inspection records are available and current.", criticality: "Standard" }
    ]
  }
];

// ------------------------------
// CREATE NEW AUDIT
// ------------------------------

function createAudit(title, client) {
  const id = "AUD-" + Date.now();

  const newAudit = {
    id,
    title,
    client,
    created: new Date().toISOString(),
    completed: null,
    status: "Draft",
    controls: generateControlSet(),
    findings: [],
    riskScore: 0,
    overallRating: null
  };

  state.audits.push(newAudit);
  saveAudits(state.audits);
  state.activeAuditId = id;

  renderAuditList();
  renderActiveAudit();
}

// ------------------------------
// GENERATE CONTROL SET
// ------------------------------

function generateControlSet() {
  let result = [];

  controlLibrary.forEach(section => {
    section.controls.forEach(control => {
      result.push({
        section: section.section,
        id: control.id,
        statement: control.statement,
        criticality: control.criticality,
        response: null,
        severity: null
      });
    });
  });

  return result;
}

// ------------------------------
// SET ACTIVE AUDIT
// ------------------------------

function setActiveAudit(id) {
  state.activeAuditId = id;
  renderActiveAudit();
}

// ------------------------------
// GET ACTIVE AUDIT
// ------------------------------

function getActiveAudit() {
  return state.audits.find(a => a.id === state.activeAuditId);
}

// ------------------------------
// RECORD RESPONSE
// ------------------------------

function recordResponse(controlId, response) {
  const audit = getActiveAudit();
  if (!audit) return;

  const control = audit.controls.find(c => c.id === controlId);
  control.response = response;

  if (response === "No") {
    generateFinding(audit, control);
  }

  calculateRisk(audit);
  saveAudits(state.audits);
  renderActiveAudit();
}

// ------------------------------
// GENERATE FINDING
// ------------------------------

function generateFinding(audit, control) {
  const severity = deriveSeverity(control);

  audit.findings.push({
    id: "F-" + String(audit.findings.length + 1).padStart(3, "0"),
    controlId: control.id,
    section: control.section,
    statement: control.statement,
    severity,
    status: "Open",
    owner: "",
    dueDate: ""
  });
}

// ------------------------------
// SEVERITY ENGINE
// ------------------------------

function deriveSeverity(control) {
  if (control.criticality === "Critical") return "High";
  return "Medium";
}

// ------------------------------
// RISK SCORING
// ------------------------------

function calculateRisk(audit) {
  let score = 0;

  audit.findings.forEach(f => {
    if (f.severity === "High") score += 3;
    if (f.severity === "Medium") score += 2;
  });

  audit.riskScore = score;

  if (score === 0) audit.overallRating = "Low";
  else if (score < 5) audit.overallRating = "Moderate";
  else audit.overallRating = "Elevated";
}

// ------------------------------
// RENDER AUDIT LIST
// ------------------------------

function renderAuditList() {
  const container = document.getElementById("auditList");
  if (!container) return;

  container.innerHTML = "";

  state.audits.forEach(audit => {
    container.innerHTML += `
      <div onclick="setActiveAudit('${audit.id}')">
        <strong>${audit.title}</strong><br>
        Client: ${audit.client}<br>
        Status: ${audit.status}
        <hr>
      </div>
    `;
  });
}

// ------------------------------
// RENDER ACTIVE AUDIT
// ------------------------------

function renderActiveAudit() {
  const audit = getActiveAudit();
  if (!audit) return;

  const container = document.getElementById("auditEngine");
  if (!container) return;

  container.innerHTML = `
    <h2>${audit.title}</h2>
    <p>Client: ${audit.client}</p>
    <p>Status: ${audit.status}</p>
    <p>Overall Risk: ${audit.overallRating || "Not Assessed"}</p>
    <hr>
  `;

  audit.controls.forEach(control => {
    container.innerHTML += `
      <div>
        <strong>${control.section}</strong><br>
        ${control.statement}<br>
        <button onclick="recordResponse('${control.id}','Yes')">Yes</button>
        <button onclick="recordResponse('${control.id}','No')">No</button>
        <button onclick="recordResponse('${control.id}','N/A')">N/A</button>
        <hr>
      </div>
    `;
  });
}

// ------------------------------
// INITIALISE
// ------------------------------

window.onload = function () {
  renderAuditList();
};