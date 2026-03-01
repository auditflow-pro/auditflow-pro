const STORAGE_KEY = "auditflowpro_v1_foundation";

let state = loadState();

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    clients: [],
    audits: [],
    activeAuditId: null
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const SECTIONS = [
  "Site & Environment",
  "Equipment & Infrastructure",
  "Operational Controls",
  "People & Process"
];

function buildControlLibrary() {
  const controls = [];
  SECTIONS.forEach(section => {
    for (let i = 1; i <= 10; i++) {
      controls.push({
        id: section.substring(0,2) + "-" + i,
        section,
        statement: `${section} Control ${i}`,
        impact: (i % 4) + 1,
        response: null,
        score: 0
      });
    }
  });
  return controls;
}

function populateClientSelect() {
  const select = document.getElementById("clientSelect");
  select.innerHTML = `<option value="">Select Existing Client</option>`;
  state.clients.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
}

function createAudit() {
  const select = document.getElementById("clientSelect");
  const newClientName = document.getElementById("newClientName").value.trim();
  const auditTitle = document.getElementById("newAuditTitle").value.trim();

  if (!auditTitle) return;

  let clientId;

  if (newClientName) {
    clientId = "C-" + Date.now();
    state.clients.push({ id: clientId, name: newClientName });
  } else {
    clientId = select.value;
    if (!clientId) return;
  }

  const previousAudit = getLastAuditForClient(clientId);

  const auditId = "A-" + Date.now();

  const audit = {
    id: auditId,
    clientId,
    title: auditTitle,
    status: "Draft",
    controls: buildControlLibrary(),
    likelihood: 3,
    riskScore: 0,
    maxRisk: calculateMaxRisk(),
    exposurePercent: 0,
    rating: "Controlled Risk",
    previousExposure: previousAudit ? previousAudit.exposurePercent : null
  };

  state.audits.push(audit);
  state.activeAuditId = auditId;

  document.getElementById("newClientName").value = "";
  document.getElementById("newAuditTitle").value = "";

  saveState();
  populateClientSelect();
  renderAuditList();
  renderActiveAudit();
}

function calculateMaxRisk() {
  return 40 * 4 * 3 / 4; 
}

function getLastAuditForClient(clientId) {
  const audits = state.audits
    .filter(a => a.clientId === clientId)
    .sort((a,b) => b.id.localeCompare(a.id));
  return audits[0] || null;
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
  const control = audit.controls.find(c => c.id === controlId);

  control.response = response;
  control.score = response === "No" ? control.impact * audit.likelihood : 0;

  recalcAudit(audit);
  saveState();
  renderActiveAudit();
}

function recalcAudit(audit) {
  audit.riskScore = audit.controls.reduce((t,c) => t + c.score, 0);
  audit.exposurePercent = Math.round((audit.riskScore / audit.maxRisk) * 100);
  audit.rating = deriveRating(audit.exposurePercent);
}

function deriveRating(p) {
  if (p <= 20) return "Controlled Risk";
  if (p <= 40) return "Emerging Risk";
  if (p <= 60) return "Material Risk";
  if (p <= 80) return "Significant Exposure";
  return "Critical Exposure";
}

function renderAuditList() {
  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(a => {
    const delta = a.previousExposure !== null
      ? ` | Previous: ${a.previousExposure}%`
      : "";

    container.innerHTML += `
      <div class="audit-item" onclick="setActiveAudit('${a.id}')">
        <strong>${a.title}</strong> (${a.rating} ${a.exposurePercent}%)${delta}
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

  const previousLine = audit.previousExposure !== null
    ? `<p><strong>Previous Exposure:</strong> ${audit.previousExposure}%</p>`
    : "";

  container.innerHTML = `
    <h2>${audit.title}
      <span class="badge draft">${audit.status}</span>
    </h2>

    <div>
      <p><strong>Total Score:</strong> ${audit.riskScore} / ${audit.maxRisk}</p>
      <p><strong>Exposure:</strong> ${audit.exposurePercent}%</p>
      <p><strong>Rating:</strong> ${audit.rating}</p>
      ${previousLine}

      <div class="risk-bar-container">
        <div class="risk-bar ${barClass}" style="width:${audit.exposurePercent}%"></div>
      </div>
    </div>
  `;

  SECTIONS.forEach(section => {
    const sectionControls = audit.controls.filter(c => c.section === section);
    const sectionScore = sectionControls.reduce((t,c) => t + c.score, 0);

    container.innerHTML += `
      <div class="section-header">${section}</div>
      <div class="section-summary">Section Score: ${sectionScore}</div>
    `;

    sectionControls.forEach(control => {
      container.innerHTML += `
        <div class="control-block">
          ${control.statement} (Impact ${control.impact})
          <button onclick="recordResponse('${control.id}','Yes')">Yes</button>
          <button onclick="recordResponse('${control.id}','No')">No</button>
          <button onclick="recordResponse('${control.id}','N/A')">N/A</button>
        </div>
      `;
    });
  });
}

populateClientSelect();
renderAuditList();