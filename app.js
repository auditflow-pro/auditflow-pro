/* AuditFlow Pro v3.2 Executive Outcome Layer */

const VERSION = "v3.2";

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

/* REGISTRATION */

function renderRegistration(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Audit Registration</h2>

      <div class="field"><label>Consultant Name *</label><input id="consultant"></div>
      <div class="field"><label>Organisation *</label><input id="organisation"></div>
      <div class="field"><label>Client / Site *</label><input id="site"></div>
      <div class="field"><label>Audit Title *</label><input id="title"></div>
      <div class="field">
        <label>Assessment Date *</label>
        <input type="date" id="date" value="${new Date().toISOString().slice(0,10)}">
      </div>

      <div class="actions">
        <button onclick="registerInstrument()">Register Instrument</button>
      </div>

      <div class="actions">
        <button class="secondary" onclick="goRecords()">Audit Records</button>
      </div>
    </div>
  `;
}

function registerInstrument() {
  const consultant = document.getElementById("consultant").value.trim();
  const organisation = document.getElementById("organisation").value.trim();
  const site = document.getElementById("site").value.trim();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;

  if (!consultant || !organisation || !site || !title || !date) {
    alert("All fields are mandatory.");
    return;
  }

  const afp = generateAFP();

  state.activeAudit = {
    afp,
    consultant,
    organisation,
    site,
    title,
    date,
    controls: {},
    status: "In Progress",
    version: VERSION,
    createdAt: new Date().toISOString()
  };

  audits.unshift(state.activeAudit);
  saveLedger();

  state.view = "workflow";
  render();
}

/* WORKFLOW */

function renderWorkflow(container) {
  let html = `
    <div class="panel">
      <h2>Audit Controls</h2>
      <div class="meta-block">
        <strong>${state.activeAudit.afp}</strong><br>
        ${state.activeAudit.site} — ${state.activeAudit.date}
      </div>
  `;

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
  saveLedger();
}

/* ENGINE */

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

  let band;
  if (ratio >= 0.7) band = "Critical";
  else if (ratio >= 0.5) band = "High";
  else if (ratio >= 0.25) band = "Moderate";
  else band = "Low";

  if (highestWeighted >= 20) band = "High";
  if (lifeFireEscalation) band = "Critical";

  return { band, ratio, highestWeighted, lifeFireEscalation };
}

/* COMPLETION */

function completeAudit() {
  const result = calculateExposure();
  const audit = state.activeAudit;

  audit.exposure = result.band;
  audit.ratio = result.ratio;
  audit.highestWeighted = result.highestWeighted;
  audit.lifeFireEscalation = result.lifeFireEscalation;
  audit.status = "Completed";
  audit.completedAt = new Date().toISOString();

  saveLedger();

  state.view = "outcome";
  render();
}

/* OUTCOME */

function renderOutcome(container) {
  const a = state.activeAudit;

  const percent = (a.ratio * 100).toFixed(1);

  let basis = [];
  if (a.lifeFireEscalation)
    basis.push("Life or Fire severity threshold triggered automatic Critical escalation.");
  if (a.highestWeighted >= 20)
    basis.push("Highest weighted control exceeded high-risk threshold (≥20).");
  if (a.ratio >= 0.7)
    basis.push("Aggregate weighted ratio exceeded 0.70 Critical threshold.");
  else if (a.ratio >= 0.5)
    basis.push("Aggregate weighted ratio exceeded 0.50 High threshold.");

  container.innerHTML = `
    <div class="panel">
      <h2>Exposure Determination</h2>

      <div class="meta-block">
        <strong>${a.afp}</strong><br>
        ${a.consultant}<br>
        ${a.organisation}<br>
        ${a.site}<br>
        ${a.date}
      </div>

      <div class="meta-block">
        <strong>Exposure Classification:</strong> ${a.exposure}
      </div>

      <div class="meta-block">
        <strong>Aggregate Weighted Ratio:</strong> ${a.ratio.toFixed(3)} (${percent}%)
      </div>

      <div class="meta-block">
        <strong>Highest Weighted Control:</strong> ${a.highestWeighted}
      </div>

      <div class="meta-block">
        <strong>Escalation Trigger Applied:</strong> ${a.lifeFireEscalation ? "Yes" : "No"}
      </div>

      <div class="meta-block">
        <strong>Determination Basis:</strong>
        <ul>
          ${basis.map(b => `<li>${b}</li>`).join("")}
        </ul>
      </div>

      <div class="meta-block">
        <strong>Engine Version:</strong> ${a.version}
      </div>

      <div class="actions">
        <button onclick="goRecords()">Audit Records</button>
      </div>
    </div>
  `;
}

/* RECORDS */

function renderRecords(container) {
  let html = `<div class="panel"><h2>Audit Records</h2>`;

  audits.forEach(a => {
    html += `
      <div class="section-title">${a.afp} — ${a.exposure || a.status}</div>
      <div class="meta-block">
        ${a.site} — ${a.date}<br>
        Completed: ${a.completedAt ? a.completedAt.slice(0,10) : "In Progress"}<br>
        Engine: ${a.version}
      </div>
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