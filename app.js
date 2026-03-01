const STORAGE_KEY = "auditflowpro_v7_clean";

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

  const preserveCaps = ["CG","ISO","HSE","UK","USA","QA","EU"];
  const preserveTitle = ["Ltd","PLC","LLC","Inc"];

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
  const client = document.getElementById("clientName");
  const title = document.getElementById("auditTitle");

  client.addEventListener("input", function() {
    const pos = client.selectionStart;
    client.value = smartCapitalise(client.value);
    client.setSelectionRange(pos,pos);
  });

  title.addEventListener("input", function() {
    const pos = title.selectionStart;
    title.value = smartCapitalise(title.value);
    title.setSelectionRange(pos,pos);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("auditDate").value = todayISO();
  attachCapitalisation();
  renderAuditList();
});

/* CREATE */

function createAudit() {

  const clientName = smartCapitalise(
    document.getElementById("clientName").value.trim()
  );

  const auditTitle = smartCapitalise(
    document.getElementById("auditTitle").value.trim()
  );

  const auditDate = document.getElementById("auditDate").value;

  if (!clientName || !auditTitle || !auditDate) {
    alert("All fields are required.");
    return;
  }

  const audit = {
    id: "A-" + Date.now(),
    clientName: clientName,
    title: auditTitle,
    date: auditDate,
    rating: "Controlled Risk"
  };

  state.audits.push(audit);
  state.activeAuditId = audit.id;

  document.getElementById("clientName").value = "";
  document.getElementById("auditTitle").value = "";
  document.getElementById("auditDate").value = todayISO();

  saveState();
  renderAuditList();
  renderActiveAudit();
}

/* LIST */

function renderAuditList() {

  const container = document.getElementById("auditList");
  container.innerHTML = "";

  state.audits.forEach(function(audit) {

    const div = document.createElement("div");
    div.className = "audit-item";

    div.innerHTML =
      "<strong>" + audit.title + "</strong><br>" +
      audit.clientName + " | " + audit.date;

    div.onclick = function() {
      state.activeAuditId = audit.id;
      renderActiveAudit();
    };

    container.appendChild(div);
  });
}

/* ACTIVE */

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
    "<p><strong>Status:</strong> " + audit.rating + "</p>";
}