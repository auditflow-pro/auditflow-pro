// =========================================
// AuditFlow Pro v3 – Enterprise Risk Matrix Engine
// Multi-Audit | Impact x Likelihood | Adjustable Thresholds
// =========================================

// ------------------------------
// STORAGE
// ------------------------------

const STORAGE_KEY = "auditflowpro_v3";

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
// CONTROL LIBRARY (WITH IMPACT)
// ------------------------------

const controlLibrary = [
  {
    section: "Site & Environment",
    controls: [
      { id: "SE-01", statement: "Access routes are clearly marked and unobstructed.", impact: 4 },
      { id: "SE-02", statement: "Emergency exits are accessible and appropriately signed.", impact: 4 },
      { id: "SE-03", statement: "Fire detection systems are functional and periodically tested.", impact: 4 }
    ]
  },
  {
    section: "Equipment & Infrastructure",
    controls: [
      { id: "EI-01", statement: "Critical equipment is maintained per schedule.", impact: 3 },
      { id: "EI-02", statement: "Inspection records are available and current.", impact: 2 }
    ]
  }
];

// ------------------------------
// DEFAULT RISK CONFIGURATION
// ------------------------------

function defaultRiskConfig() {
  return {
    likelihoodFailure: 3,
    severityThresholds: {
      critical: 10,
      high: 7,
      medium: 4
    }
  };
}

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
    overallRating: "Not Assessed",
    riskConfig: defaultRiskConfig()
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
        impact: control.impact,
        response: null,
        riskScore: 0,
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
    applyRiskMatrix(audit, control);
  } else {
    control.riskScore = 0;
    control.severity = null;
  }

  calculateOverallRisk(audit);
  saveAudits(state.audits);
  renderActiveAudit();
}

// ------------------------------
// RISK MATRIX CALCULATION
// ------------------------------

function applyRiskMatrix(audit, control) {

  const likelihood = audit.riskConfig.likelihoodFailure;
  const score = control.impact * likelihood;

  control.riskScore = score;
  control.severity = deriveSeverity(score, audit.riskConfig.severityThresholds);

  upsertFinding(audit, control);
}

// ------------------------------
// DERIVE SEVERITY
// ------------------------------

function deriveSeverity(score, thresholds) {

  if (score >= thresholds.critical) return "Critical";
  if (score >= thresholds.high) return "High";
  if (score >= thresholds.medium) return "Medium";
  return "Low";
}

// ------------------------------
// UPSERT FINDING
// ------------------------------

function upsertFinding(audit, control) {

  const existing = audit.findings.find(f => f.controlId === control.id);

  if (existing) {
    existing.severity = control.severity;
    existing.riskScore = control.riskScore;
  } else {
    audit.findings.push({
      id: "F-" + String(audit.findings.length + 1).padStart(3, "0"),
      controlId: control.id,
      section: control.section,
      statement: control.statement,
      impact: control.impact,
      riskScore: control.riskScore,
      severity: control.severity,
      status: "Open",
      owner: "",
      dueDate: ""
    });
  }
}

// ------------------------------
// OVERALL RISK CALCULATION
// ------------------------------

function calculateOverallRisk(audit) {

  let total = 0;

  audit.findings.forEach(f => {
    total += f.riskScore;
  });

  audit.riskScore = total;

  if (total === 0) {
    audit.overallRating = "Low";
  } else if (total < 10) {
    audit.overallRating = "Moderate";
  } else if (total < 25) {
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
        Overall Risk: ${audit.overallRating}<br>
        Risk Score: ${audit.riskScore}
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
    <p>Total Risk Score: ${audit.riskScore}</p>
    <hr>
  `;

  audit.controls.forEach(control => {

    container.innerHTML += `
      <div>
        <strong>${control.section}</strong><br>
        ${control.statement}<br>
        Impact Level: ${control.impact}<br>
        ${control.severity ? `Severity: ${control.severity} (Score ${control.riskScore})<br>` : ""}
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