const STORAGE_KEY = "auditflowpro_v10_dashboard";

let state = loadState();

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    audits: [],
    activeAuditId: null
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("auditDate").value = todayISO();
  renderAll();
});

function renderAll() {
  renderDashboard();
  renderAuditList();
}

function createAudit() {

  const client = document.getElementById("clientName").value.trim();
  const title = document.getElementById("auditTitle").value.trim();
  const date = document.getElementById("auditDate").value;

  if (!client || !title || !date) {
    alert("All fields required.");
    return;
  }

  const audit = {
    id: "A-" + Date.now(),
    client: client,
    title: title,
    date: date,
    status: "Draft",
    exposure: 0
  };

  state.audits.push(audit);
  state.activeAuditId = audit.id;

  saveState();

  document.getElementById("clientName").value = "";
  document.getElementById("auditTitle").value = "";
  document.getElementById("auditDate").value = todayISO();

  renderAll();
  openAudit(audit.id);
}

/* DASHBOARD */

function renderDashboard() {

  const total = state.audits.length;
  const draft = state.audits.filter(a => a.status === "Draft").length;
  const final = state.audits.filter(a => a.status === "Final").length;

  let avgExposure = 0;

  if (total > 0) {
    const sum = state.audits.reduce((acc,a) => acc + a.exposure, 0);
    avgExposure = Math.round(sum / total);
  }

  document.getElementById("metricTotal").innerText = total;
  document.getElementById("metricDraft").innerText = draft;
  document.getElementById("metricFinal").innerText = final;

  const exposureEl = document.getElementById("metricExposure");
  exposureEl.innerText = avgExposure + "%";

  exposureEl.className = "metric-value";

  if (avgExposure >= 70) exposureEl.classList.add("risk-high");
  else if (avgExposure >= 30) exposureEl.classList.add("risk-medium");
  else exposureEl.classList.add("risk-low");
}

/* LEDGER */

function renderAuditList() {

  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(audit => {

    const div = document.createElement("div");
    div.className = "audit-item";

    div.innerHTML =
      "<div class='ledger-row'>" +
        "<div>" +
          "<strong>" + audit.title + "</strong><br>" +
          "<span class='ledger-sub'>" + audit.client + " | " + audit.date + "</span>" +
        "</div>" +
        "<div>" +
          "<span class='badge'>" + audit.status + "</span><br>" +
          "<span class='exposure'>" + audit.exposure + "%</span>" +
        "</div>" +
      "</div>";

    div.onclick = function() {
      openAudit(audit.id);
    };

    container.appendChild(div);
  });
}

/* OPEN AUDIT */

function openAudit(id) {

  const audit = state.audits.find(a => a.id === id);
  if (!audit) return;

  const container = document.getElementById("auditEngine");
  container.classList.remove("hidden");

  container.innerHTML =
    "<div class='audit-header'>" +
      "<div>" +
        "<h2>" + audit.title + "</h2>" +
        "<div class='ledger-sub'>" + audit.client + " | " + audit.date + "</div>" +
      "</div>" +
      "<div>" +
        "<button class='secondary'>Snapshot</button>" +
        "<button class='secondary'>Actions</button>" +
        "<button class='primary'>Mark Complete</button>" +
      "</div>" +
    "</div>" +

    "<div class='executive'>" +
      "<h3>Executive Risk Overview</h3>" +
      "<p>Exposure: " + audit.exposure + "%</p>" +
      "<p>Status: " + audit.status + "</p>" +
    "</div>";
}