let state = 0;
let auditMeta = {};
let findings = {};

const domains = [
  "Site & Environment",
  "Equipment & Infrastructure",
  "Operational Controls",
  "People & Process"
];

const impactScale = {
  "Minor": 1,
  "Medical Treatment": 2,
  "Major Injury / Shutdown": 3,
  "Catastrophic": 4
};

const likelihoodScale = {
  "Rare": 1,
  "Possible": 2,
  "Likely": 3,
  "Almost Certain": 4
};

const controlScale = {
  "Effective": 0.5,
  "Partially Effective": 1,
  "Weak": 1.5,
  "Failing": 2
};

function render() {
  const header = document.getElementById("headerContent");
  const main = document.getElementById("main");

  header.innerHTML = "";
  main.innerHTML = "";

  if (state === 0) renderLanding(header, main);
  if (state === 1) renderRegistration(header, main);
  if (state === 2) renderAssessment(header, main);
  if (state === 3) renderDetermination(header, main);
  if (state === 4) renderSnapshot(header, main);
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
    <input id="client" placeholder="Client Name">
    <input id="title" placeholder="Audit Title">
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
        <button class="primary small" onclick="saveFinding('${domain}')">Save Finding</button>
      </div>

      <div class="domain-footer">
        Domain Exposure: <span id="status-${domain}">Not Determined</span>
      </div>
    </div>
    `;
  });

  main.innerHTML += `<button class="primary" onclick="nextState()">Proceed to Determination</button>`;
  updateAllDomainExposure();
}

function toggleEntry(domain) {
  const el = document.getElementById(`entry-${domain}`);
  el.classList.toggle("hidden");
}

function saveFinding(domain) {
  const desc = document.getElementById(`desc-${domain}`).value;
  const impact = document.getElementById(`impact-${domain}`).value;
  const likelihood = document.getElementById(`likelihood-${domain}`).value;
  const control = document.getElementById(`control-${domain}`).value;

  findings[domain].push({ desc, impact, likelihood, control });
  renderAssessment(document.getElementById("headerContent"), document.getElementById("main"));
}

function updateAllDomainExposure() {
  domains.forEach(domain => {
    const list = findings[domain];
    if (list.length === 0) return;

    let total = 0;
    list.forEach(f => {
      total += impactScale[f.impact] * likelihoodScale[f.likelihood] * controlScale[f.control];
    });

    const avg = total / list.length;
    document.getElementById(`status-${domain}`).innerText = classify(avg);
  });
}

function classify(score) {
  if (score < 3) return "Controlled";
  if (score < 8) return "Elevated";
  if (score < 15) return "Significant";
  return "Severe";
}

function renderDetermination(header, main) {
  header.innerHTML = `
    <h1>Exposure Determination</h1>
    <div class="sub">
      Client: ${auditMeta.client} | Title: ${auditMeta.title}
    </div>
  `;

  main.innerHTML = `
    <div class="panel">
      <h2>Determination Record</h2>
      <p>Exposure analysis completed.</p>
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

function nextState() {
  state++;
  render();
}

render();