/* =========================
   AUDITFLOW PRO v1203
   LOCKED STRUCTURAL BUILD
========================= */

const INSTRUMENT_VERSION = "1.2";

let state = 0;
let recordStatus = "Draft";
let recordID = null;
let determinationTimestamp = null;

let auditMeta = {};
let responses = {};

let globalExposure = "Controlled";
let lifeSafetyGlobal = false;

/* =========================
   DOMAIN CONFIG
========================= */

const domains = [
  {
    name: "Site & Environment",
    questions: [
      { text: "Is housekeeping maintained to safe standard?", tier: 1 },
      { text: "Are access routes clearly marked?", tier: 1 },
      { text: "Is lighting adequate for safe operation?", tier: 1 },
      { text: "Are environmental hazards controlled?", tier: 2 },
      { text: "Are pedestrian and vehicle routes segregated?", tier: 2 },
      { text: "Are required inspections completed?", tier: 3 },
      { text: "Are statutory compliance notices up to date?", tier: 3 },
      { text: "Are emergency escape routes unobstructed and compliant?", tier: 4 }
    ]
  },
  {
    name: "Equipment & Infrastructure",
    questions: [
      { text: "Is equipment maintained?", tier: 1 },
      { text: "Are inspection records available?", tier: 1 },
      { text: "Are maintenance intervals adhered to?", tier: 2 },
      { text: "Are guarding systems intact?", tier: 2 },
      { text: "Are statutory inspections current?", tier: 3 },
      { text: "Are load ratings displayed?", tier: 3 },
      { text: "Are emergency shutdown mechanisms functional?", tier: 4 }
    ]
  },
  {
    name: "Operational Controls",
    questions: [
      { text: "Are SOPs documented?", tier: 1 },
      { text: "Are permits used where required?", tier: 2 },
      { text: "Are isolation procedures followed?", tier: 3 },
      { text: "Are emergency procedures tested?", tier: 3 },
      { text: "Are critical safety controls tested and effective?", tier: 4 }
    ]
  },
  {
    name: "People & Process",
    questions: [
      { text: "Are training records maintained?", tier: 1 },
      { text: "Are inductions completed?", tier: 2 },
      { text: "Are competency assessments current?", tier: 3 },
      { text: "Are high-risk task personnel formally competent?", tier: 4 }
    ]
  }
];

/* ========================= */

function render() {

  if (state !== 3) {
    document.body.classList.remove("document-mode");
  }

  renderHeader();
  renderMain();
}

function renderHeader() {

  const header = document.getElementById("header");

  if (state === 3) {
    header.innerHTML = "";
    return;
  }

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
      Instrument Version: ${INSTRUMENT_VERSION}<br>
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
  if (state === 3) renderDocument(main);
}

/* ========================= */

function renderLanding(main) {

  main.innerHTML = `
    <div class="panel">
      <p>This instrument applies calibrated weighted exposure determination across structured compliance domains.</p>
      <button class="primary" onclick="nextState()">Initiate Audit</button>
    </div>
  `;
}

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

  return "AF-" +
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    "-" +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
}

function registerAudit() {

  auditMeta.client = document.getElementById("client").value;
  auditMeta.title = document.getElementById("title").value;
  auditMeta.date = document.getElementById("date").value;

  recordID = generateRecordID();
  recordStatus = "Active";

  domains.forEach(d => {
    responses[d.name] = d.questions.map(() => null);
  });

  nextState();
}

/* ========================= */

function calculateDomainExposure(domain) {

  let score = 0;
  let lifeSafetyFailure = false;

  domain.questions.forEach((q, i) => {

    const answer = responses[domain.name][i];

    if (answer === "NO") {

      if (q.tier === 4) {
        lifeSafetyFailure = true;
        score += 5;
      }
      else if (q.tier === 3) score += 3;
      else if (q.tier === 2) score += 2;
      else score += 1;
    }

  });

  let level = "Controlled";

  if (score === 0) level = "Controlled";
  else if (score <= 2) level = "Low Exposure";
  else if (score <= 5) level = "Moderate Exposure";
  else if (score <= 8) level = "Significant Exposure";
  else level = "Critical Exposure";

  return { level, flag: lifeSafetyFailure };
}

function calculateGlobalExposure() {

  const ranking = {
    "Controlled": 0,
    "Low Exposure": 1,
    "Moderate Exposure": 2,
    "Significant Exposure": 3,
    "Critical Exposure": 4
  };

  let highest = "Controlled";
  lifeSafetyGlobal = false;

  domains.forEach(domain => {

    const result = calculateDomainExposure(domain);

    if (result.flag) lifeSafetyGlobal = true;

    if (ranking[result.level] > ranking[highest]) {
      highest = result.level;
    }

  });

  if (lifeSafetyGlobal && highest !== "Critical Exposure") {
    highest = "Significant Exposure";
  }

  globalExposure = highest;
}

/* ========================= */

function renderAssessment(main) {

  calculateGlobalExposure();

  domains.forEach(domain => {

    main.innerHTML += `<div class="panel"><h3>${domain.name}</h3>`;

    domain.questions.forEach((q, index) => {

      main.innerHTML += `
        <div>
          ${q.text}
          <select onchange="responses['${domain.name}'][${index}] = this.value; render();">
            <option value="">--</option>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
            <option value="NA">N/A</option>
          </select>
        </div>
      `;
    });

    const exposure = calculateDomainExposure(domain);

    if (exposure.flag) {
      main.innerHTML += `<div class="flag">Life Safety Control Failure Identified</div>`;
    }

    main.innerHTML += `
      <div><strong>Domain Exposure:</strong> ${exposure.level}</div>
    </div>`;
  });

  main.innerHTML += `
    <div class="panel">
      <h3>Global Exposure Determination</h3>
      ${lifeSafetyGlobal ? `<div class="flag">Life Safety Escalation Applied</div>` : ""}
      <div><strong>Overall Exposure Classification:</strong> ${globalExposure}</div>
    </div>
  `;

  main.innerHTML += `<button class="primary" onclick="seal()">Seal Determination</button>`;
}

function seal() {

  calculateGlobalExposure();

  if (globalExposure === "Critical Exposure") {
    const confirmSeal = confirm("Critical Exposure identified. Confirm formal sealing?");
    if (!confirmSeal) return;
  }

  determinationTimestamp = new Date().toLocaleString();
  recordStatus = "Sealed";
  state = 3;
  render();
}

/* =========================
   DOCUMENT MODE
========================= */

function renderDocument(main) {

  document.body.classList.add("document-mode");

  calculateGlobalExposure();

  main.innerHTML = `
    <div class="document-container">

      <h1>AuditFlow Pro</h1>
      <div>Exposure Determination Instrument</div>
      <div>Instrument Version: ${INSTRUMENT_VERSION}</div>

      <hr>

      <p class="record-id"><strong>Record ID:</strong> ${recordID}</p>
      <p><strong>Client:</strong> ${auditMeta.client}</p>
      <p><strong>Audit Title:</strong> ${auditMeta.title}</p>
      <p><strong>Audit Date:</strong> ${auditMeta.date}</p>
      <p><strong>Determination Timestamp:</strong> ${determinationTimestamp}</p>

      <hr>

      <h2>Formal Determination</h2>

      <p>
      Based on calibrated weighted assessment across structured compliance domains,
      the overall exposure classification at time of sealing is:
      </p>

      <p><strong>${globalExposure}</strong></p>

      ${lifeSafetyGlobal ? `
        <p><strong>Life Safety Escalation Triggered.</strong>
        Tier-4 control failure(s) identified during assessment.</p>
      ` : ""}

      <hr>

      <h2>Execution</h2>

      <p>Consultant Name:</p>
      <p>Signature: ________________________________</p>
      <p>Date: ________________________________</p>

      <br>

      <p>Client Representative Name:</p>
      <p>Signature: ________________________________</p>
      <p>Date: ________________________________</p>

      <hr>

      <div class="document-footer">
        Printed: ${new Date().toLocaleString()}
      </div>

      <div style="margin-top:20px;">
        <button onclick="window.print()">Print / Save as PDF</button>
      </div>

    </div>
  `;
}

function nextState() {
  state++;
  render();
}

render();