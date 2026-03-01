const STORAGE_KEY = "auditflowpro_v9_slate";

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
  renderAuditList();
});

/* CREATE */

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
    riskScore: 0,
    exposure: 0
  };

  state.audits.push(audit);
  state.activeAuditId = audit.id;

  saveState();

  document.getElementById("clientName").value = "";
  document.getElementById("auditTitle").value = "";
  document.getElementById("auditDate").value = todayISO();

  renderAuditList();
  openAudit(audit.id);
}

/* LIST */

function renderAuditList() {
  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(audit => {

    const div = document.createElement("div");
    div.className = "audit-item";

    div.innerHTML =
      "<div class='audit-row'>" +
      "<strong>" + audit.title + "</strong>" +
      "<span class='badge'>" + audit.status + "</span>" +
      "</div>" +
      "<div class='audit-sub'>" +
      audit.client + " | " + audit.date +
      "</div>";

    div.onclick = function() {
      openAudit(audit.id);
    };

    container.appendChild(div);
  });
}

/* OPEN AUDIT */

function openAudit(id) {

  state.activeAuditId = id;

  const audit = state.audits.find(a => a.id === id);
  if (!audit) return;

  const container = document.getElementById("auditEngine");
  container.classList.remove("hidden");

  container.innerHTML =
    "<div class='audit-header'>" +
      "<div class='audit-header-left'>" +
        "<h2>" + audit.title + "</h2>" +
        "<div class='audit-meta'>" +
          audit.client + " | " + audit.date +
        "</div>" +
      "</div>" +
      "<div class='audit-header-right'>" +
        "<button class='secondary'>Snapshot</button>" +
        "<button class='secondary'>Actions</button>" +
        "<button class='primary'>Mark Complete</button>" +
      "</div>" +
    "</div>" +

    "<div class='executive'>" +
      "<h3>Executive Risk Overview</h3>" +
      "<p>Total Risk Score: " + audit.riskScore + "</p>" +
      "<p>Exposure Level: " + audit.exposure + "%</p>" +
      "<p>Status: " + audit.status + "</p>" +
    "</div>" +

    "<div class='audit-body'>" +
      "<p>Structured audit sections load here.</p>" +
    "</div>";
}