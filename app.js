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

/* ===============================
   CONTROL LIBRARY (40 Controls)
   =============================== */

function buildControlLibrary() {
  const controls = [];

  SECTIONS.forEach(section => {
    for (let i = 1; i <= 10; i++) {

      // Deterministic impact spread 1–4
      const impact = ((i - 1) % 4) + 1;

      controls.push({
        id: section.substring(0,2) + "-" + i,
        section,
        statement: `${section} Control ${i}`,
        impact,
        response: null,
        score: 0
      });
    }
  });

  return controls;
}

/* ===============================
   CLIENT REGISTRY
   =============================== */

function populateClientSelect() {
  const select = document.getElementById("clientSelect");
  select.innerHTML = `<option value="">Select Existing Client</option>`;

  state.clients.forEach(client => {
    select.innerHTML += `<option value="${client.id}">${client.name}</option>`;
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
  const controls = buildControlLibrary();
  const likelihood = 3;

  const audit = {
    id: auditId,
    clientId,
    title: auditTitle,
    status: "Draft",
    controls,
    likelihood,
    riskScore: 0,
    maxRisk: calculateMaxRisk(controls, likelihood),
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

/* ===============================
   RISK ENGINE
   =============================== */

function calculateMaxRisk(controls, likelihood) {
  return controls.reduce((total, control) => {
    return total + (control.impact * likelihood);
  }, 0);
}

function getLastAuditForClient(clientId) {
  const audits = state.audits
    .filter(a => a.clientId === clientId)
    .sort((a, b) => b.id.localeCompare(a.id));

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
  if (!audit) return;

  const control = audit.controls.find(c => c.id === controlId);
  if (!control) return;

  control.response = response;
  control.score = response === "No"
    ? control.impact * audit.likelihood
    : 0;

  recalcAudit(audit);
  saveState();
  renderActiveAudit();
}

function recalcAudit(audit) {
  audit.riskScore = audit.controls.reduce((total, c) => {
    return total + c.score;
  }, 0);

  audit.exposurePercent = Math.round(
    (audit.riskScore / audit.maxRisk) * 100
  );

  audit.rating = deriveRating(audit.exposurePercent);
}

function deriveRating(percent) {
  if (percent <= 20) return "Controlled Risk";
  if (percent <= 40) return "Emerging Risk";
  if (percent <= 60) return "Material Risk";
  if (percent <= 80) return "Significant Exposure";
  return "Critical Exposure";
}

/* ===============================
   RENDERING
   =============================== */

function renderAuditList() {
  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(audit => {

    const delta = audit.previousExposure !== null
      ? ` | Previous: ${audit.previousExposure}%`
      : "";

    container.innerHTML += `
      <div class="audit-item" onclick="setActiveAudit('${audit.id}')">
        <strong>${audit.title}</strong>
        (${audit.rating} ${audit.exposurePercent}%)${delta}
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
    audit.exposurePercent <= 80 ? "high" :
    "critical";

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

    const sectionScore = sectionControls.reduce((total, c) => {
      return total + c.score;
    }, 0);

    container.innerHTML += `
      <div class="section-header">${section}</div>
      <div class="section-summary">
        Section Score: ${sectionScore}
      </div>
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

/* ===============================
   INITIALISE
   =============================== */

populateClientSelect();
renderAuditList();