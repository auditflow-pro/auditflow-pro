/* =========================
   STATE ENGINE
========================= */

let state = 0;
let recordStatus = "Draft";
let recordID = null;
let determinationTimestamp = null;

let auditMeta = {};
let findings = {};

const domains = [
  "Site & Environment",
  "Equipment & Infrastructure",
  "Operational Controls",
  "People & Process"
];

const impactScale = { Minor:1, "Medical Treatment":2, "Major Injury / Shutdown":3, Catastrophic:4 };
const likelihoodScale = { Rare:1, Possible:2, Likely:3, "Almost Certain":4 };
const controlScale = { Effective:0.5, "Partially Effective":1, Weak:1.5, Failing:2 };

/* =========================
   RENDER CORE
========================= */

function render() {
  renderHeader();
  renderMain();
}

function renderHeader() {
  const header = document.getElementById("header");

  if (state === 0) {
    header.innerHTML = `
      <h1>AuditFlow Pro</h1>
      <div class="meta">Professional Exposure Determination Instrument</div>
    `;
    return;
  }

  header.innerHTML = `
    <h1>Exposure Determination Instrument</h1>
    <div class="meta">
      Record ID: ${recordID}<br>
      Client: ${auditMeta.client} | Title: ${auditMeta.title} | Date: ${auditMeta.date}
    </div>
    <div class="status">Record Status: ${recordStatus}</div>
  `;
}

function renderMain() {
  const main = document.getElementById("main");
  main.innerHTML = "";

  if (state === 0) renderLanding(main);
  if (state === 1) renderRegistration(main);
  if (state === 2) renderAssessment(main);
  if (state === 3) renderDetermination(main);
  if (state === 4) renderSnapshot(main);
}

/* =========================
   LANDING
========================= */

function renderLanding(main) {
  main.innerHTML = `
    <div class="panel">
      <p>This instrument provides calibrated exposure determination for professional compliance environments.</p>
      <button class="primary" onclick="nextState()">Initiate Audit</button>
    </div>
  `;
}

/* =========================
   REGISTRATION
========================= */

function renderRegistration(main) {
  main.innerHTML = `
    <div class="panel">
      <h2>Audit Registration</h2>
      <input id="client" placeholder="Client Name">
      <input id="title" placeholder="Audit Title">
      <input id="date" type="date">
      <button class="primary" onclick="registerAudit()">Register Audit</button>
    </div>
  `;
}

function generateRecordID() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const h = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  return `AF-${y}${m}${d}-${h}${min}${s}`;
}

function registerAudit() {
  auditMeta.client = document.getElementById("client").value;
  auditMeta.title = document.getElementById("title").value;
  auditMeta.date = document.getElementById("date").value;

  recordID = generateRecordID();
  recordStatus = "Active";
  domains.forEach(d => findings[d] = []);

  nextState();
}

/* =========================
   ASSESSMENT
========================= */

function renderAssessment(main) {
  domains.forEach(domain => {
    main.innerHTML += `
      <div class="panel">
        <h3>${domain}</h3>
        <div id="findings-${domain}"></div>
        <button class="small" onclick="toggleEntry('${domain}')">Add Finding</button>

        <div id="entry-${domain}" class="hidden">
          <textarea id="desc-${domain}" placeholder="Finding Description"></textarea>
          <select id="impact-${domain}">
            <option>Minor</option>
            <option>Medical Treatment</option>
            <option>Major Injury / Shutdown</option>
            <option>Catastrophic</option>
          </select>
          <select id="likelihood-${domain}">
            <option>Rare</option>
            <option>Possible</option>
            <option>Likely</option>
            <option>Almost Certain</option>
          </select>
          <select id="control-${domain}">
            <option>Effective</option>
            <option>Partially Effective</option>
            <option>Weak</option>
            <option>Failing</option>
          </select>
          <button class="primary small" onclick="saveFinding('${domain}')">Save</button>
        </div>

        <div class="domain-footer">
          Exposure: <span id="status-${domain}">Not Determined</span>
        </div>
      </div>
    `;
  });

  main.innerHTML += `<button class="primary" onclick="sealDetermination()">Seal Determination</button>`;

  updateExposure();
}

function toggleEntry(domain) {
  document.getElementById(`entry-${domain}`).classList.toggle("hidden");
}

function saveFinding(domain) {
  const desc = document.getElementById(`desc-${domain}`).value;
  const impact = document.getElementById(`impact-${domain}`).value;
  const likelihood = document.getElementById(`likelihood-${domain}`).value;
  const control = document.getElementById(`control-${domain}`).value;

  findings[domain].push({desc, impact, likelihood, control});
  render();
}

function updateExposure() {
  domains.forEach(domain => {
    if (!findings[domain] || findings[domain].length === 0) return;
    let total = 0;
    findings[domain].forEach(f => {
      total += impactScale[f.impact] * likelihoodScale[f.likelihood] * controlScale[f.control];
    });
    const avg = total / findings[domain].length;
    document.getElementById(`status-${domain}`).innerText = classify(avg);
  });
}

function classify(score) {
  if (score < 3) return "Controlled";
  if (score < 8) return "Elevated";
  if (score < 15) return "Significant";
  return "Severe";
}

/* =========================
   SEAL
========================= */

function sealDetermination() {
  determinationTimestamp = new Date().toLocaleString();
  recordStatus = "Sealed";
  state = 4;
  render();
}

/* =========================
   SNAPSHOT
========================= */

function renderSnapshot(main) {

  main.innerHTML = `
    <div class="panel">
      <h2>Executive Snapshot</h2>
      <p><strong>Determination Timestamp:</strong> ${determinationTimestamp}</p>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="panel">
      <h3>Signatures</h3>
      <p>Consultant Signature: ____________________________</p>
      <p>Name: ____________________________</p>
      <p>Date: ____________________________</p>

      <br>

      <p>Client Representative Signature: ____________________________</p>
      <p>Name: ____________________________</p>
      <p>Date: ____________________________</p>
    </div>

    <footer>
      <div>AuditFlow Pro — Exposure Determination Instrument</div>
      <div>Record ID: ${recordID}</div>
      <div>Printed: ${new Date().toLocaleString()}</div>
    </footer>
  `;
}

/* ========================= */

function nextState() {
  state++;
  render();
}

render();