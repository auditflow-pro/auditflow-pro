const VERSION = "v2.0";

let state = {
  view: "registration",
  activeAudit: null,
  audits: JSON.parse(localStorage.getItem("afp_audits")) || []
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

function saveState() {
  localStorage.setItem("afp_audits", JSON.stringify(state.audits));
}

function generateAFP() {
  const now = new Date();
  const datePart = now.toISOString().slice(0,10).replace(/-/g,'');
  const sequence = Math.floor(Math.random()*9000)+1000;
  return `AFP-${datePart}-${sequence}`;
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
      <div class="field"><label>Consultant</label><input id="consultant"></div>
      <div class="field"><label>Organisation</label><input id="organisation"></div>
      <div class="field"><label>Client / Site</label><input id="client"></div>
      <div class="field"><label>Audit Title</label><input id="title"></div>
      <div class="field"><label>Date</label><input id="date" type="date"></div>
      <div class="actions"><button onclick="startAudit()">Begin Audit</button></div>
      <div class="actions"><button class="secondary" onclick="goRecords()">Audit Records</button></div>
    </div>
  `;
}

function startAudit() {
  const audit = {
    afp: generateAFP(),
    createdAt: new Date().toISOString(),
    controls: {},
    status: "In Progress"
  };

  state.activeAudit = audit;
  state.view = "workflow";
  render();
}

function renderWorkflow(container) {
  let html = `<div class="panel"><h2>Audit Controls</h2>`;
  controls.forEach(c => {
    html += `
      <div class="section-title">${c.label}</div>
      <div class="field"><label>Severity</label>
        <select onchange="updateControl('${c.id}','severity',this.value)">
          <option value="0">None</option>
          <option value="1">Minor</option>
          <option value="2">Moderate</option>
          <option value="3">Significant</option>
          <option value="4">Major</option>
          <option value="5">Critical</option>
        </select>
      </div>
      <div class="field"><label>Likelihood</label>
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
  let total = 0;
  let highest = 0;

  controls.forEach(c => {
    const data = state.activeAudit.controls[c.id];
    if (!data) return;
    const base = (data.severity || 0) * (data.likelihood || 1);
    const weighted = base * multipliers[c.category];
    total += weighted;
    if (weighted > highest) highest = weighted;
  });

  if (highest >= 20) return "Critical";
  if (total >= 100) return "High";
  if (total >= 50) return "Moderate";
  return "Low";
}

function completeAudit() {
  const band = calculateExposure();
  state.activeAudit.exposure = band;
  state.activeAudit.completedAt = new Date().toISOString();
  state.activeAudit.status = "Completed";

  state.audits.unshift(state.activeAudit);
  saveState();

  state.view = "outcome";
  render();
}

function renderOutcome(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Exposure Result</h2>
      <div class="field"><strong>AFP Reference:</strong> ${state.activeAudit.afp}</div>
      <div class="field"><strong>Exposure Band:</strong> ${state.activeAudit.exposure}</div>
      <div class="actions"><button onclick="goRecords()">View Records</button></div>
    </div>
  `;
}

function renderRecords(container) {
  let html = `<div class="panel"><h2>Audit Records</h2>`;
  state.audits.forEach(a => {
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
  state.audits = state.audits.filter(a => a.afp !== afp);
  saveState();
  render();
}

function goRecords() { state.view = "records"; render(); }
function goRegistration() { state.view = "registration"; render(); }

render();