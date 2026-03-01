const STORAGE_KEY = "auditflowpro_v6_safe";

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

/* SMART CAPITALISATION */

function smartCapitalise(str) {
  if (!str) return str;

  const preserveCaps = ["CG", "ISO", "HSE", "UK", "USA", "QA", "EU"];
  const preserveTitle = ["Ltd", "PLC", "LLC", "Inc"];

  return str.split(" ").map(function(word) {
    if (!word) return word;

    const upper = word.toUpperCase();

    if (preserveCaps.includes(upper)) return upper;
    if (preserveTitle.includes(word)) return word;
    if (word === upper && word.length <= 5) return upper;

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ");
}

function attachCapitalisation() {
  const clientInput = document.getElementById("clientName");
  const auditInput = document.getElementById("auditTitle");

  clientInput.addEventListener("input", function() {
    const pos = clientInput.selectionStart;
    clientInput.value = smartCapitalise(clientInput.value);
    clientInput.setSelectionRange(pos, pos);
  });

  auditInput.addEventListener("input", function() {
    const pos = auditInput.selectionStart;
    auditInput.value = smartCapitalise(auditInput.value);
    auditInput.setSelectionRange(pos, pos);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("auditDate").value = todayISO();
  attachCapitalisation();
  renderAuditList();
});

/* CREATE AUDIT */

function createAudit() {
  const clientName = smartCapitalise(
    document.getElementById("clientName").value.trim()
  );

  const auditTitle = smartCapitalise(
    document.getElementById("auditTitle").value.trim()
  );

  const auditDate = document.getElementById("auditDate").value;

  if (!clientName || !auditTitle || !auditDate) {
    alert("Client name, audit title, and date are required.");
    return;
  }

  const auditId = "A-" + Date.now();

  const audit = {
    id: auditId,
    clientName: clientName,
    title: auditTitle,
    date: auditDate,
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

/* RENDER LIST */

function renderAuditList() {
  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(function(audit) {

    const div = document.createElement("div");
    div.className = "audit-item";
    div.onclick = function() {
      setActiveAudit(audit.id);
    };

    div.innerHTML =
      "<strong>" + audit.title + "</strong><br>" +
      audit.clientName + " | " + audit.date;

    container.appendChild(div);
  });
}

/* SET ACTIVE */

function setActiveAudit(id) {
  state.activeAuditId = id;
  renderActiveAudit();
}

/* RENDER ACTIVE */

function renderActiveAudit() {
  const audit = state.audits.find(function(a) {
    return a.id === state.activeAuditId;
  });

  if (!audit) return;

  const container = document.getElementById("auditEngine");

  container.innerHTML =
    "<h2>" + audit.title + "</h2>" +
    "<p><strong>Client:</strong> " + audit.clientName + "</p>" +
    "<p><strong>Date:</strong> " + audit.date + "</p>" +
    "<p><strong>Rating:</strong> " + audit.rating + "</p>";
}