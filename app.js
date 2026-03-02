const domainsConfig = {
  "Site & Environment": 1.0,
  "Equipment & Infrastructure": 1.1,
  "Operational Controls": 1.3,
  "People & Process": 1.2
};

const severityMap = { Low:1, Moderate:2, High:3, Critical:4 };
const controlMap = {
  "Compliant":0.5,
  "Improvement Required":1,
  "Non-Compliant":1.5,
  "Critical Failure":2
};

let findings = {};
let currentDomain = null;

function init() {
  const container = document.getElementById("domains");

  Object.keys(domainsConfig).forEach(domain => {
    findings[domain] = [];
    container.appendChild(createDomainPanel(domain));
  });

  document.getElementById("determineBtn").addEventListener("click", determineExposure);
  document.getElementById("cancelModal").addEventListener("click", closeModal);
  document.getElementById("saveFinding").addEventListener("click", saveFinding);
}

function createDomainPanel(domain) {
  const panel = document.createElement("div");
  panel.className = "domain-panel";

  panel.innerHTML = `
    <h3>${domain}</h3>
    <div id="register-${domain}"></div>
    <button onclick="openModal('${domain}')">Add Finding</button>
    <div class="domain-footer">
      <div class="exposure-line">
        Domain Exposure Determination: 
        <span id="status-${domain}">Not Determined</span>
      </div>
    </div>
  `;

  return panel;
}

function openModal(domain) {
  currentDomain = domain;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("modalDesc").value = "";
}

function saveFinding() {
  const desc = document.getElementById("modalDesc").value;
  const sev = document.getElementById("modalSeverity").value;
  const ctrl = document.getElementById("modalControl").value;

  if (!desc) return;

  findings[currentDomain].push({ desc, sev, ctrl });
  closeModal();
  renderDomain(currentDomain);
}

function renderDomain(domain) {
  const container = document.getElementById(`register-${domain}`);
  container.innerHTML = "";

  findings[domain].forEach((f, index) => {
    const entry = document.createElement("div");
    entry.className = "finding-entry";
    entry.innerHTML = `
      <strong>${domain.split(" ")[0]}-${index+1}</strong>
      Severity: ${f.sev}<br>
      Control Status: ${f.ctrl}<br>
      Summary: ${f.desc}
    `;
    container.appendChild(entry);
  });

  updateDomainStatus(domain);
}

function updateDomainStatus(domain) {
  const list = findings[domain];

  if (list.length === 0) {
    document.getElementById(`status-${domain}`).textContent = "Not Determined";
    return;
  }

  let total = 0;
  list.forEach(f => {
    total += severityMap[f.sev] * controlMap[f.ctrl] * domainsConfig[domain];
  });

  const avg = total / list.length;
  document.getElementById(`status-${domain}`).textContent = mapExposure(avg);
}

function mapExposure(score) {
  if (score < 1.5) return "Controlled";
  if (score < 3) return "Elevated";
  if (score < 5) return "Significant";
  return "Severe";
}

function determineExposure() {
  let override = false;
  let total = 0;
  let count = 0;

  Object.keys(findings).forEach(domain => {
    findings[domain].forEach(f => {
      if (f.sev === "Critical" && f.ctrl === "Critical Failure") override = true;
      total += severityMap[f.sev] * controlMap[f.ctrl] * domainsConfig[domain];
      count++;
    });
  });

  let result = "Not Determined";

  if (count > 0) {
    result = override ? "Severe" : mapExposure(total / count);
  }

  renderDetermination(result, override);
}

function renderDetermination(result, override) {
  const record = document.getElementById("determinationRecord");
  const timestamp = new Date().toLocaleString();

  record.innerHTML = `
    <div class="record-panel">
      <h3>Determination Record</h3>
      <p><strong>Overall Exposure Classification:</strong> ${result}</p>
      ${override ? `<p><strong>Override Trigger:</strong> Critical severity finding with Critical Failure control status identified.</p>` : ""}
      <p><strong>Determination Timestamp:</strong> ${timestamp}</p>
    </div>
  `;
}

init();