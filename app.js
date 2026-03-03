/* =========================================================
   AUDITFLOW PRO — v3.6 ENGINE LOCK
   £149-Level Ledger & Registration Engine
   ========================================================= */

const ledgerEl = document.getElementById("ledger");
const modal = document.getElementById("confirmModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

const consultantInput = document.getElementById("consultant");
const organisationInput = document.getElementById("organisation");
const clientInput = document.getElementById("client");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");

let deleteTargetId = null;

/* ---------- SAFE STORAGE LAYER ---------- */

function getLedger() {
  try {
    const data = localStorage.getItem("auditLedger");
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Ledger corrupted. Resetting.");
    localStorage.removeItem("auditLedger");
    return [];
  }
}

function saveLedger(data) {
  localStorage.setItem("auditLedger", JSON.stringify(data));
}

/* ---------- AUDIT REFERENCE GENERATOR ---------- */

function generateAuditReference() {
  const timestamp = new Date();
  const year = timestamp.getFullYear();
  const month = String(timestamp.getMonth() + 1).padStart(2, "0");
  const day = String(timestamp.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `AFP-${year}${month}${day}-${random}`;
}

/* ---------- VALIDATION ---------- */

function validateInputs() {
  if (!consultantInput.value.trim()) return false;
  if (!organisationInput.value.trim()) return false;
  if (!clientInput.value.trim()) return false;
  if (!titleInput.value.trim()) return false;
  if (!dateInput.value) return false;
  return true;
}

/* ---------- LEDGER RENDER ---------- */

function renderLedger() {
  const ledger = getLedger();
  ledgerEl.innerHTML = "";

  if (ledger.length === 0) {
    ledgerEl.innerHTML = "<p>No saved audits.</p>";
    return;
  }

  ledger.forEach(item => {
    const div = document.createElement("div");
    div.className = "ledger-item";
    div.innerHTML = `
      <strong>${item.reference}</strong><br>
      ${item.title}<br>
      ${item.client}<br>
      ${item.date}<br><br>
      <button class="danger" data-id="${item.id}">Delete</button>
    `;
    ledgerEl.appendChild(div);
  });

  document.querySelectorAll(".ledger-item .danger").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteTargetId = btn.getAttribute("data-id");
      modal.classList.remove("hidden");
    });
  });
}

/* ---------- DELETE FLOW ---------- */

confirmBtn.addEventListener("click", () => {
  if (!deleteTargetId) return;

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

/* ---------- SAVE FLOW ---------- */

document.getElementById("saveBtn").addEventListener("click", () => {

  if (!validateInputs()) {
    alert("All fields must be completed before saving.");
    return;
  }

  const ledger = getLedger();

  const newAudit = {
    id: crypto.randomUUID(),
    reference: generateAuditReference(),
    consultant: consultantInput.value.trim(),
    organisation: organisationInput.value.trim(),
    client: clientInput.value.trim(),
    title: titleInput.value.trim(),
    date: dateInput.value
  };

  ledger.unshift(newAudit);
  saveLedger(ledger);

  renderLedger();
});

/* ---------- RESET FLOW ---------- */

document.getElementById("resetBtn").addEventListener("click", () => {

  organisationInput.value = "";
  clientInput.value = "";
  titleInput.value = "";
  dateInput.value = "";

});

/* ---------- INITIAL LOAD ---------- */

renderLedger();