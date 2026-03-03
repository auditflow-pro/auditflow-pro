/* AuditFlow Pro v3.0 Deterministic Engine */

const VERSION = "v3.0";

let audits = JSON.parse(localStorage.getItem("afp_audits")) || [];
let sequence = parseInt(localStorage.getItem("afp_sequence")) || 0;

let state = {
  view: "registration",
  activeAudit: null
};

const multipliers = {
  life: 2.0,
  fire: 2.0,
  structural: 1.8,
  safeguarding: 1.8,
  electrical: 1.5,
  general: 1.0
};

const controls = [
  { id: "lifeSafety", label: "Life Safety Risk", category: "life" },
  { id: "fireEgress", label: "Fire & Egress", category: "fire" },
  { id: "structural", label: "Structural Integrity", category: "structural" },
  { id: "electrical", label: "Electrical / Mechanical", category: "electrical" },
  { id: "hazard", label: "Hazardous Substances", category: "general" },
  { id: "operations", label: "Operational Controls", category: "general" },
  { id: "records", label: "Documentation & Records", category: "general" },
  { id: "governance", label: "Governance & Oversight", category: "general" },
  { id: "safeguarding", label: "Safeguarding", category: "safeguarding" },
  { id: "training", label: "Training & Competency", category: "general" }
];

function saveLedger() {
  localStorage.setItem("afp_audits", JSON.stringify(audits));
  localStorage.setItem("afp_sequence", sequence.toString());
}

function generateAFP() {
  sequence += 1;
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g,'');
  saveLedger();
  return `AFP-${datePart}-${sequence.toString().padStart(4,'0')}`;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (state.view === "registration") renderRegistration(app);
  if (state.view === "workflow") renderWorkflow(app);
  if (state.view === "outcome") renderOutcome(app);
  if (state.view === "records") renderRecords(app);
}

function renderRegistration(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Audit Registration</h2>
      <div class="actions"><button onclick="startAudit()">Begin Audit</button></div>
      <div class="actions"><button class="secondary" onclick="goRecords()">Audit Records</button></div>
    </div>
  `;
}

function startAudit() {
  state.activeAudit = {
    afp: generateAFP(),
    controls: {},
    createdAt: new Date().toISOString(),
    status: "In Progress"
  };
  state.view = "workflow";
  render();
}

function renderWorkflow(container) {
  let html = `<div class="panel"><h2>Audit Controls</h2>`;

  controls.forEach(c => {
    html += `
      <div class="section-title">${c.label}</div>
      <div class="field">
        <label>Severity</label>
        <select onchange="updateControl('${c.id}','severity',this.value)">
          <option value="0">None</option>
          <option value="1">Minor</option>
          <option value="2">Moderate</option>
          <option value="3">Significant</option>
          <option value="4">Major</option>
          <option value="5">Critical</option>
        </select>
      </div>
      <div class="field">
        <label>Likelihood</label>
        <select onchange="updateControl('${c.id}','likelihood',this.value)">
          <option value="1">Rare</option>
          <option value="2">Unlikely</option>
          <option value="3">Possible</option>
          <option value="4">Likely</option>
          <option value="5">Almost Certain</option>
        </select>
      </div>
    `;
  });

  html += `<div class="actions"><button onclick="completeAudit()">Complete Audit</button></div></div>`;
  container.innerHTML = html;
}

function updateControl(id, field, value) {
  if (!state.activeAudit.controls[id]) state.activeAudit.controls[id] = {};
  state.activeAudit.controls[id][field] = parseInt(value);
}

function calculateExposure() {
  let totalWeighted = 0;
  let maxPossible = 0;
  let highestWeighted = 0;
  let lifeFireEscalation = false;

  controls.forEach(c => {
    const data = state.activeAudit.controls[c.id];
    if (!data) return;

    const severity = data.severity || 0;
    const likelihood = data.likelihood || 1;

    const base = severity * likelihood;
    const weighted = base * multipliers[c.category];

    totalWeighted += weighted;
    maxPossible += 25 * multipliers[c.category];

    if (weighted > highestWeighted) highestWeighted = weighted;

    if ((c.category === "life" || c.category === "fire") && severity >= 4) {
      lifeFireEscalation = true;
    }
  });

  const ratio = totalWeighted / maxPossible;

  let aggregateBand;
  if (ratio >= 0.7) aggregateBand = "Critical";
  else if (ratio >= 0.5) aggregateBand = "High";
  else if (ratio >= 0.25) aggregateBand = "Moderate";
  else aggregateBand = "Low";

  if (highestWeighted >= 20) aggregateBand = "High";
  if (lifeFireEscalation) aggregateBand = "Critical";

  return aggregateBand;
}

function completeAudit() {
  const band = calculateExposure();
  state.activeAudit.exposure = band;
  state.activeAudit.completedAt = new Date().toISOString();
  state.activeAudit.status = "Completed";

  audits.unshift(state.activeAudit);
  saveLedger();

  state.view = "outcome";
  render();
}

function renderOutcome(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Exposure Result</h2>
      <div class="field"><strong>AFP:</strong> ${state.activeAudit.afp}</div>
      <div class="field"><strong>Exposure:</strong> ${state.activeAudit.exposure}</div>
      <div class="actions"><button onclick="goRecords()">Audit Records</button></div>
    </div>
  `;
}

function renderRecords(container) {
  let html = `<div class="panel"><h2>Audit Records</h2>`;

  audits.forEach(a => {
    html += `
      <div class="section-title">${a.afp} — ${a.exposure}</div>
      <div class="actions">
        <button class="danger" onclick="deleteAudit('${a.afp}')">Delete</button>
      </div>
    `;
  });

  html += `<div class="actions"><button onclick="goRegistration()">New Audit</button></div></div>`;
  container.innerHTML = html;
}

function deleteAudit(afp) {
  audits = audits.filter(a => a.afp !== afp);
  saveLedger();
  render();
}

function goRecords() { state.view = "records"; render(); }
function goRegistration() { state.view = "registration"; render(); }

render();