// AuditFlow Pro — v3.7 Atomic Shell

const LEDGER_KEY = "auditflow-ledger-v1";

const ledgerEl = document.getElementById("ledger");
const modal = document.getElementById("confirmModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

let deleteTargetId = null;

/* -------------------------
   LEDGER STORAGE HANDLING
--------------------------*/

function getLedger() {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLedger(data) {
  localStorage.setItem(LEDGER_KEY, JSON.stringify(data));
}

/* -------------------------
   RENDER LEDGER
--------------------------*/

function renderLedger() {
  const ledger = getLedger();
  ledgerEl.innerHTML = "";

  if (!ledger.length) {
    ledgerEl.innerHTML = "<p>No saved audits.</p>";
    return;
  }

  ledger.forEach(item => {
    const div = document.createElement("div");
    div.className = "ledger-item";

    div.innerHTML = `
      <strong>${escapeHTML(item.title || "Untitled Audit")}</strong><br>
      ${escapeHTML(item.client || "No Client")}<br>
      ${item.date || "No Date"}<br><br>
      <button class="danger delete-btn" data-id="${item.id}">Delete</button>
    `;

    ledgerEl.appendChild(div);
  });

  attachDeleteHandlers();
}

/* -------------------------
   DELETE HANDLING
--------------------------*/

function attachDeleteHandlers() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteTargetId = btn.dataset.id;
      modal.classList.remove("hidden");
    });
  });
}

confirmBtn.addEventListener("click", () => {
  let ledger = getLedger();
  ledger = ledger.filter(item => item.id !== deleteTargetId);
  saveLedger(ledger);
  deleteTargetId = null;
  modal.classList.add("hidden");
  renderLedger();
});

cancelBtn.addEventListener("click", () => {
  deleteTargetId = null;
  modal.classList.add("hidden");
});

/* -------------------------
   SAVE NEW AUDIT
--------------------------*/

document.getElementById("saveBtn").addEventListener("click", () => {

  const consultant = document.getElementById("consultant").value.trim();
  const organisation = document.getElementById("organisation").value.trim();
  const client = document.getElementById("client").value.trim();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;

  if (!consultant || !title) {
    alert("Consultant name and audit title are required.");
    return;
  }

  const newAudit = {
    id: crypto.randomUUID(),
    consultant,
    organisation,
    client,
    title,
    date,
    created: new Date().toISOString()
  };

  const ledger = getLedger();
  ledger.unshift(newAudit);
  saveLedger(ledger);

  renderLedger();
});

/* -------------------------
   RESET FORM
--------------------------*/

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("organisation").value = "";
  document.getElementById("client").value = "";
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
});

/* -------------------------
   UTILITIES
--------------------------*/

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

/* -------------------------
   INITIALISE
--------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  renderLedger();
});