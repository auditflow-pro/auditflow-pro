const STORAGE_KEY = "auditflow-ledger-v6.0";
const COUNTER_KEY = "auditflow-counter-v6.0";

const ledgerEl = document.getElementById("ledger");
const afpDisplay = document.getElementById("afpDisplay");
const modal = document.getElementById("confirmModal");

let deleteTargetId = null;

function getLedger() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveLedger(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCounter() {
  return parseInt(localStorage.getItem(COUNTER_KEY)) || 0;
}

function incrementCounter() {
  const next = getCounter() + 1;
  localStorage.setItem(COUNTER_KEY, next);
  return next;
}

function formatAFP(num) {
  return "AFP-" + String(num).padStart(6, "0");
}

function renderLedger() {
  const ledger = getLedger();
  ledgerEl.innerHTML = "";

  if (ledger.length === 0) {
    ledgerEl.innerHTML = "<p>No registered instruments.</p>";
    return;
  }

  ledger.forEach(item => {
    const div = document.createElement("div");
    div.className = "ledger-item";
    div.innerHTML = `
      <strong>${item.afp}</strong><br>
      ${item.title}<br>
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

document.getElementById("confirmDelete").addEventListener("click", () => {
  let ledger = getLedger();
  ledger = ledger.filter(item => item.id !== deleteTargetId);
  saveLedger(ledger);
  modal.classList.add("hidden");
  renderLedger();
});

document.getElementById("cancelDelete").addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.getElementById("saveBtn").addEventListener("click", () => {

  const ledger = getLedger();
  const counter = incrementCounter();
  const afpRef = formatAFP(counter);

  const newAudit = {
    id: Date.now().toString(),
    afp: afpRef,
    consultant: document.getElementById("consultant").value,
    organisation: document.getElementById("organisation").value,
    client: document.getElementById("client").value,
    title: document.getElementById("title").value,
    date: document.getElementById("date").value
  };

  ledger.unshift(newAudit);
  saveLedger(ledger);

  afpDisplay.textContent = afpRef;
  afpDisplay.classList.remove("hidden");

  document.querySelectorAll("input").forEach(i => i.setAttribute("readonly", true));

  renderLedger();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.querySelectorAll("input").forEach(input => {
    input.removeAttribute("readonly");
    if (input.id !== "consultant") input.value = "";
  });
  afpDisplay.classList.add("hidden");
});

renderLedger();