const STORAGE_KEY = "auditflowpro_enterprise_v2";

function loadAudits() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAudits(audits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
}

let state = {
  audits: loadAudits(),
  activeAuditId: null
};

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

function createAudit(title, client) {
  if (!title) return;

  const id = "AUD-" + Date.now();

  const newAudit = {
    id,
    title,
    client,
    status: "Draft",
    controls: generateControls(),
    likelihood: 3,
    riskScore: 0,
    maxRisk: calculateMaxRisk(),
    exposurePercent: 0,
    rating: "Controlled Risk"
  };

  state.audits.push(newAudit);
  state.activeAuditId = id;
  saveAudits(state.audits);

  renderAuditList();
  renderActiveAudit();
}

function generateControls() {
  let list = [];
  controlLibrary.forEach(section => {
    section.controls.forEach(c => {
      list.push({
        section: section.section,
        id: c.id,
        statement: c.statement,
        impact: c.impact,
        response: null,
        score: 0
      });
    });
  });
  return list;
}

function calculateMaxRisk() {
  let total = 0;
  controlLibrary.forEach(section => {
    section.controls.forEach(c => {
      total += c.impact * 3;
    });
  });
  return total;
}

function setActiveAudit(id) {
  state.activeAuditId = id;
  renderActiveAudit();
}

function getActiveAudit() {
  return state.audits.find(a => a.id === state.activeAuditId);
}

function recordResponse(controlId, response) {
  const audit = getActiveAudit();
  if (!audit) return;

  if (audit.status === "Complete") audit.status = "Draft";

  const control = audit.controls.find(c => c.id === controlId);
  control.response = response;

  if (response === "No") {
    control.score = control.impact * audit.likelihood;
  } else {
    control.score = 0;
  }

  recalc(audit);
  saveAudits(state.audits);
  renderActiveAudit();
}

function recalc(audit) {
  let total = 0;
  audit.controls.forEach(c => total += c.score);
  audit.riskScore = total;
  audit.exposurePercent = Math.round((total / audit.maxRisk) * 100);
  audit.rating = deriveRating(audit.exposurePercent);
}

function deriveRating(p) {
  if (p <= 20) return "Controlled Risk";
  if (p <= 40) return "Emerging Risk";
  if (p <= 60) return "Material Risk";
  if (p <= 80) return "Significant Exposure";
  return "Critical Exposure";
}

function completeAudit() {
  const audit = getActiveAudit();
  audit.status = "Complete";
  saveAudits(state.audits);
  renderActiveAudit();
}

function renderAuditList() {
  const container = document.getElementById("auditList");
  container.innerHTML = "";
  state.audits.forEach(audit => {
    container.innerHTML += `
      <div onclick="setActiveAudit('${audit.id}')">
        <strong>${audit.title}</strong><br>
        ${audit.rating} (${audit.exposurePercent}%)
        <hr>
      </div>
    `;
  });
}

function renderActiveAudit() {
  const audit = getActiveAudit();
  if (!audit) return;

  const container = document.getElementById("auditEngine");

  const barClass =
    audit.exposurePercent <= 20 ? "low" :
    audit.exposurePercent <= 60 ? "medium" :
    audit.exposurePercent <= 80 ? "high" : "critical";

  container.innerHTML = `
    <h2>${audit.title}
      <span class="badge ${audit.status === "Draft" ? "draft" : "final"}">
        ${audit.status === "Draft" ? "Provisional" : "Final"}
      </span>
    </h2>
    <p><strong>Client:</strong> ${audit.client}</p>

    <details open>
      <summary>Risk Model & Methodology</summary>
      <p><strong>Formula:</strong> Risk Score = Impact × Likelihood</p>
      <p><strong>Likelihood (Failure):</strong> 3</p>

      <h4>Impact Scale</h4>
      <table>
        <tr><th>Impact</th><th>Definition</th></tr>
        <tr><td>4</td><td>Life Safety / Legal Exposure / Operational Continuity Threat</td></tr>
        <tr><td>3</td><td>Regulatory / Major Operational Disruption</td></tr>
        <tr><td>2</td><td>Process Weakness / Performance Risk</td></tr>
        <tr><td>1</td><td>Minor Control Improvement</td></tr>
      </table>

      <h4>Exposure Bands</h4>
      <table>
        <tr><th>% Exposure</th><th>Rating</th></tr>
        <tr><td>0–20%</td><td>Controlled Risk</td></tr>
        <tr><td>21–40%</td><td>Emerging Risk</td></tr>
        <tr><td>41–60%</td><td>Material Risk</td></tr>
        <tr><td>61–80%</td><td>Significant Exposure</td></tr>
        <tr><td>81–100%</td><td>Critical Exposure</td></tr>
      </table>
    </details>

    <h3>Executive Risk Overview</h3>
    <p><strong>Total Risk Score:</strong> ${audit.riskScore} / ${audit.maxRisk}</p>
    <p><strong>Risk Exposure:</strong> ${audit.exposurePercent}%</p>
    <p><strong>Overall Rating:</strong> ${audit.rating}</p>

    <div class="risk-bar-container">
      <div class="risk-bar ${barClass}" style="width:${audit.exposurePercent}%"></div>
    </div>

    <button onclick="completeAudit()">Mark Audit Complete</button>
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

window.onload = function() {
  renderAuditList();
};