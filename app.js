// =========================================
// AuditFlow Pro v2 – Enterprise Severity Engine
// Multi-Audit | Structured Controls | Weighted Risk Model
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
// CONTROL LIBRARY
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
// CREATE AUDIT
// ------------------------------

function createAudit(title, client) {
  if (!title) return;

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
    overallRating: "Not Assessed"
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
// ACTIVE AUDIT HELPERS
// ------------------------------

function setActiveAudit(id) {
  state.activeAuditId = id;
  renderActiveAudit();
}

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
// ENTERPRISE SEVERITY ENGINE
// ------------------------------

function deriveSeverity(control) {

  if (control.criticality === "Critical") {
    return "High";
  }

  if (control.criticality === "Standard") {
    return "Medium";
  }

  return "Low";
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
    severity: severity,
    status: "Open",
    owner: "",
    dueDate: ""
  });
}

// ------------------------------
// WEIGHTED RISK SCORING
// ------------------------------

function calculateRisk(audit) {

  let score = 0;

  audit.findings.forEach(f => {

    if (f.severity === "Critical") score += 5;
    if (f.severity === "High") score += 3;
    if (f.severity === "Medium") score += 2;
    if (f.severity === "Low") score += 1;

  });

  audit.riskScore = score;

  // Enterprise Threshold Model

  if (score === 0) {
    audit.overallRating = "Low";
  } else if (score <= 4) {
    audit.overallRating = "Moderate";
  } else if (score <= 10) {
    audit.overallRating = "Elevated";
  } else {
    audit.overallRating = "High";
  }
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
        Status: ${audit.status}<br>
        Overall Risk: ${audit.overallRating}
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
    <p>Overall Risk Rating: ${audit.overallRating}</p>
    <p>Risk Score: ${audit.riskScore}</p>
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