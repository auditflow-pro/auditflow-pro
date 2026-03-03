const STORAGE_KEY = "auditflow-ledger-v4";

const ledgerEl = document.getElementById("ledger");
const modal = document.getElementById("confirmModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

let deleteId = null;

function getLedger() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLedger(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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
      <strong>${item.title}</strong><br>
      ${item.client}<br>
      ${item.date}<br><br>
      <button class="danger" onclick="triggerDelete('${item.id}')">Delete</button>
    `;

    ledgerEl.appendChild(div);
  });
}

function triggerDelete(id) {
  deleteId = id;
  modal.classList.remove("hidden");
}

confirmBtn.addEventListener("click", () => {
  let ledger = getLedger();
  ledger = ledger.filter(item => item.id !== deleteId);
  saveLedger(ledger);
  modal.classList.add("hidden");
  renderLedger();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const consultant = document.getElementById("consultant").value.trim();
  const client = document.getElementById("client").value.trim();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;

  if (!consultant || !title) {
    alert("Consultant name and audit title are required.");
    return;
  }

  const ledger = getLedger();

  ledger.unshift({
    id: crypto.randomUUID(),
    consultant,
    client,
    title,
    date
  });

  saveLedger(ledger);
  renderLedger();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("organisation").value = "";
  document.getElementById("client").value = "";
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
});

document.addEventListener("DOMContentLoaded", renderLedger);