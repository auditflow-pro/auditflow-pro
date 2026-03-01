const STORAGE_KEY = "auditflowpro_v3_clean";

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
  const d = new Date();
  return d.toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("auditDate").value = todayISO();
  renderAuditList();
});

function createAudit() {
  const clientName = document.getElementById("clientName").value.trim();
  const auditTitle = document.getElementById("auditTitle").value.trim();
  const auditDate = document.getElementById("auditDate").value;

  if (!clientName || !auditTitle || !auditDate) {
    alert("Client name, audit title, and date are required.");
    return;
  }

  const auditId = "A-" + Date.now();

  const audit = {
    id: auditId,
    clientName,
    title: auditTitle,
    date: auditDate,
    riskScore: 0,
    exposurePercent: 0,
    rating: "Controlled Risk"
  };

  state.audits.push(audit);
  state.activeAuditId = auditId;

  document.getElementById("clientName").value = "";
  document.getElementById("auditTitle").value = "";
  document.getElementById("auditDate").value = todayISO();

  saveState();
  renderAuditList();
  renderActiveAudit();
}

function renderAuditList() {
  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(audit => {
    container.innerHTML += `
      <div class="audit-item" onclick="setActiveAudit('${audit.id}')">
        <strong>${audit.title}</strong><br>
        ${audit.clientName} | ${audit.date}
      </div>
    `;
  });
}

function setActiveAudit(id) {
  state.activeAuditId = id;
  renderActiveAudit();
}

function renderActiveAudit() {
  const audit = state.audits.find(a => a.id === state.activeAuditId);
  if (!audit) return;

  const container = document.getElementById("auditEngine");
  container.innerHTML = `
    <h2>${audit.title}</h2>
    <p><strong>Client:</strong> ${audit.clientName}</p>
    <p><strong>Date:</strong> ${audit.date}</p>
    <p><strong>Rating:</strong> ${audit.rating}</p>
  `;
}