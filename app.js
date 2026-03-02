const domainsConfig = {
  "Site & Environment": 1.0,
  "Equipment & Infrastructure": 1.1,
  "Operational Controls": 1.3,
  "People & Process": 1.2
};

const severityMap = {
  "Low": 1,
  "Moderate": 2,
  "High": 3,
  "Critical": 4
};

const controlMap = {
  "Compliant": 0.5,
  "Improvement Required": 1,
  "Non-Compliant": 1.5,
  "Critical Failure": 2
};

let findings = {};

function init() {
  const container = document.getElementById("domains");
  Object.keys(domainsConfig).forEach(domain => {
    findings[domain] = [];
    container.appendChild(createDomainPanel(domain));
  });

  document.getElementById("determineBtn").addEventListener("click", determineExposure);
}

function createDomainPanel(domain) {
  const panel = document.createElement("div");
  panel.className = "domain-panel";

  const header = document.createElement("div");
  header.className = "domain-header";

  const title = document.createElement("h3");
  title.textContent = domain;

  const status = document.createElement("div");
  status.id = `status-${domain}`;
  status.className = "exposure-status";
  status.textContent = "Not Determined";

  header.appendChild(title);
  header.appendChild(status);

  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <tr>
      <th>Description</th>
      <th>Severity</th>
      <th>Control</th>
      <th>Add</th>
    </tr>
    <tr>
      <td><input type="text" id="desc-${domain}"></td>
      <td>
        <select id="sev-${domain}">
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </td>
      <td>
        <select id="ctrl-${domain}">
          <option>Compliant</option>
          <option>Improvement Required</option>
          <option>Non-Compliant</option>
          <option>Critical Failure</option>
        </select>
      </td>
      <td><button onclick="addFinding('${domain}')">+</button></td>
    </tr>
  `;

  panel.appendChild(header);
  panel.appendChild(table);

  return panel;
}

function addFinding(domain) {
  const desc = document.getElementById(`desc-${domain}`).value;
  const sev = document.getElementById(`sev-${domain}`).value;
  const ctrl = document.getElementById(`ctrl-${domain}`).value;

  if (!desc) return;

  findings[domain].push({ desc, sev, ctrl });
  document.getElementById(`desc-${domain}`).value = "";

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

function determineExposure() {
  let override = false;
  let total = 0;
  let count = 0;

  Object.keys(findings).forEach(domain => {
    findings[domain].forEach(f => {
      if (f.sev === "Critical" && f.ctrl === "Critical Failure") {
        override = true;
      }
      total += severityMap[f.sev] * controlMap[f.ctrl] * domainsConfig[domain];
      count++;
    });
  });

  let result = "Not Determined";

  if (count > 0) {
    if (override) {
      result = "Severe";
    } else {
      result = mapExposure(total / count);
    }
  }

  renderDetermination(result, override);
}

function mapExposure(score) {
  if (score < 1.5) return "Controlled";
  if (score < 3) return "Elevated";
  if (score < 5) return "Significant";
  return "Severe";
}

function renderDetermination(result, override) {
  const record = document.getElementById("determinationRecord");
  const timestamp = new Date().toLocaleString();

  record.innerHTML = `
    <div class="record-panel">
      <h3>Determination Record</h3>
      <p><strong>Overall Exposure Classification:</strong> ${result}</p>
      ${override ? `<p><strong>Override Trigger Applied:</strong> Critical severity finding with Critical Failure control status identified.</p>` : ""}
      <p><strong>Determination Timestamp:</strong> ${timestamp}</p>
    </div>
  `;
}

init();