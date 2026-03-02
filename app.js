let state = 0; // 0 Landing, 1 Registration, 2 Assessment, 3 Determination, 4 Snapshot

let auditMeta = {};
let findings = {};
let overrideTriggered = false;

const domains = [
  "Site & Environment",
  "Equipment & Infrastructure",
  "Operational Controls",
  "People & Process"
];

const severityMap = { Low:1, Moderate:2, High:3, Critical:4 };
const controlMap = {
  "Compliant":0.5,
  "Improvement Required":1,
  "Non-Compliant":1.5,
  "Critical Failure":2
};

function render() {
  const header = document.getElementById("headerContent");
  const main = document.getElementById("main");

  header.innerHTML = "";
  main.innerHTML = "";

  main.classList.add("fade");

  setTimeout(() => {
    if (state === 0) renderLanding(header, main);
    if (state === 1) renderRegistration(header, main);
    if (state === 2) renderAssessment(header, main);
    if (state === 3) renderDetermination(header, main);
    if (state === 4) renderSnapshot(header, main);
    main.classList.add("show");
  }, 50);
}

function renderLanding(header, main) {
  header.innerHTML = `<h1>AuditFlow Pro</h1>
  <div class="sub">Calibrated Exposure Determination Instrument</div>`;

  main.innerHTML = `
  <div class="panel">
    <p>This instrument enables structured exposure assessment across calibrated domains.</p>
    <button class="primary" onclick="nextState()">Initiate Audit</button>
  </div>
  `;
}

function renderRegistration(header, main) {
  header.innerHTML = `<h1>Audit Registration</h1>`;

  main.innerHTML = `
  <div class="panel">
    <input id="client" placeholder="Client Name" autocapitalize="words">
    <input id="title" placeholder="Audit Title" autocapitalize="words">
    <input id="date" type="date">
    <button class="primary" onclick="registerAudit()">Register Audit</button>
  </div>
  `;
}

function registerAudit() {
  auditMeta.client = document.getElementById("client").value;
  auditMeta.title = document.getElementById("title").value;
  auditMeta.date = document.getElementById("date").value;
  domains.forEach(d => findings[d] = []);
  nextState();
}

function renderAssessment(header, main) {
  header.innerHTML = `
    <h1>Audit Record</h1>
    <div class="sub">
      Client: ${auditMeta.client} | Title: ${auditMeta.title} | Date: ${auditMeta.date}
    </div>
  `;

  domains.forEach(domain => {
    main.innerHTML += `
    <div class="panel">
      <h3>${domain}</h3>
      <div id="list-${domain}"></div>
      <button onclick="addFinding('${domain}')">Add Finding</button>
      <div class="footer-line">
        Domain Exposure Determination:
        <span id="status-${domain}">Not Determined</span>
      </div>
    </div>
    `;
  });

  main.innerHTML += `<button class="primary" onclick="nextState()">Proceed to Determination</button>`;
}

function addFinding(domain) {
  const desc = prompt("Finding Description:");
  const sev = prompt("Severity (Low/Moderate/High/Critical):");
  const ctrl = prompt("Control Status (Compliant/Improvement Required/Non-Compliant/Critical Failure):");

  if (!desc || !sev || !ctrl) return;

  findings[domain].push({ desc, sev, ctrl });
  renderAssessment(document.getElementById("headerContent"), document.getElementById("main"));
}

function renderDetermination(header, main) {
  header.innerHTML = `
    <h1>Exposure Determination</h1>
    <div class="sub">
      Client: ${auditMeta.client} | Title: ${auditMeta.title}
    </div>
  `;

  let total = 0;
  let count = 0;
  overrideTriggered = false;

  domains.forEach(domain => {
    findings[domain].forEach(f => {
      if (f.sev === "Critical" && f.ctrl === "Critical Failure") {
        overrideTriggered = true;
      }
      total += severityMap[f.sev] * controlMap[f.ctrl];
      count++;
    });
  });

  let result = "Not Determined";
  if (count > 0) {
    result = overrideTriggered ? "Severe" : mapExposure(total / count);
  }

  main.innerHTML = `
    <div class="panel">
      <h2>Determination Record</h2>
      <p><strong>Overall Exposure Classification:</strong> ${result}</p>
      ${overrideTriggered ? `<p><strong>Override Trigger Applied:</strong> Critical severity finding with Critical Failure control status identified.</p>` : ""}
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <button class="primary" onclick="nextState()">Proceed to Executive Snapshot</button>
    </div>
  `;
}

function renderSnapshot(header, main) {
  header.innerHTML = `
    <h1>Executive Snapshot</h1>
    <div class="sub">
      ${auditMeta.client} — ${auditMeta.title}
    </div>
  `;

  main.innerHTML = `
  <div class="panel">
    <p>This snapshot summarises exposure classification and structural findings.</p>
    <button onclick="state=0; render();">Close Audit</button>
  </div>
  `;
}

function mapExposure(score) {
  if (score < 1.5) return "Controlled";
  if (score < 3) return "Elevated";
  if (score < 5) return "Significant";
  return "Severe";
}

function nextState() {
  state++;
  render();
}

render();