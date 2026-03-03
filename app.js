const STORAGE_KEY = "auditflow-ledger-v5.0";

const ledgerEl = document.getElementById("ledger");
const modal = document.getElementById("confirmModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

let deleteTargetId = null;

function getLedger() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveLedger(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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
      <strong>${item.title}</strong><br>
      ${item.client}<br>
      ${item.date}<br><br>
      <button class="danger" data-id="${item.id}">Delete</button>
    `;
    ledgerEl.appendChild(div);
  });

  document.querySelectorAll(".danger").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteTargetId = btn.getAttribute("data-id");
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

document.getElementById("saveBtn").addEventListener("click", () => {
  const ledger = getLedger();

  const newAudit = {
    id: Date.now().toString(),
    consultant: document.getElementById("consultant").value,
    organisation: document.getElementById("organisation").value,
    client: document.getElementById("client").value,
    title: document.getElementById("title").value,
    date: document.getElementById("date").value
  };

  ledger.unshift(newAudit);
  saveLedger(ledger);
  renderLedger();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.querySelectorAll("input").forEach(input => {
    if (input.id !== "consultant") input.value = "";
  });
});

renderLedger();