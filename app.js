/* =========================
   INSTRUMENT CORE
========================= */

const INSTRUMENT_VERSION = "1.0";

let state = 0;
let recordStatus = "Draft";
let recordID = null;
let determinationTimestamp = null;
let overrideData = null;

let auditMeta = {};
let responses = {};

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

/* =========================
   RENDER ENGINE
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
  if (state === 3) renderSnapshot(main);
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
  return "AF-" + now.getFullYear() +
    String(now.getMonth()+1).padStart(2,'0') +
    String(now.getDate()).padStart(2,'0') + "-" +
    String(now.getHours()).padStart(2,'0') +
    String(now.getMinutes()).padStart(2,'0') +
    String(now.getSeconds()).padStart(2,'0');
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

function renderAssessment(main) {

  domains.forEach(domain => {

    main.innerHTML += `<div class="panel"><h3>${domain.name}</h3>`;

    domain.questions.forEach((q, index) => {

      main.innerHTML += `
        <div>
          ${q.text}
          <select onchange="setResponse('${domain.name}', ${index}, this.value)">
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

  main.innerHTML += `<button class="primary" onclick="seal()">Seal Determination</button>`;
}

/* ========================= */

function setResponse(domainName, index, value) {
  responses[domainName][index] = value;
  render();
}

function calculateDomainExposure(domain) {

  let score = 0;
  let lifeSafetyFailure = false;

  domain.questions.forEach((q, i) => {
    const answer = responses[domain.name][i];
    if (answer === "NO") {
      if (q.tier === 4) {
        lifeSafetyFailure = true;
        score += 5;
      } else if (q.tier === 3) score += 3;
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

  if (lifeSafetyFailure && level === "Moderate Exposure") {
    level = "Significant Exposure";
  }

  return { level, flag: lifeSafetyFailure };
}

/* ========================= */

function seal() {
  determinationTimestamp = new Date().toLocaleString();
  recordStatus = "Sealed";
  state = 3;
  render();
}

/* ========================= */

function renderSnapshot(main) {

  main.innerHTML = `
    <div class="panel">
      <h2>Executive Determination Record</h2>
      <p><strong>Instrument Version:</strong> ${INSTRUMENT_VERSION}</p>
      <p><strong>Record ID:</strong> ${recordID}</p>
      <p><strong>Determination Timestamp:</strong> ${determinationTimestamp}</p>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="panel">
      <h3>Signatures</h3>
      <p>Consultant Signature: ________________________</p>
      <p>Name: ________________________</p>
      <p>Date: ________________________</p>
      <br>
      <p>Client Representative Signature: ________________________</p>
      <p>Name: ________________________</p>
      <p>Date: ________________________</p>
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