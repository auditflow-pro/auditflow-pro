const ledgerKey = "afp_ledger_v3_1";

const consultant = document.getElementById("consultant");
const organisation = document.getElementById("organisation");
const client = document.getElementById("client");
const title = document.getElementById("title");
const date = document.getElementById("date");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const ledgerDiv = document.getElementById("ledger");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function loadLedger() {
  const ledger = JSON.parse(localStorage.getItem(ledgerKey)) || [];
  ledgerDiv.innerHTML = "";

  ledger.forEach(entry => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${entry.title}</strong><br>
      ${entry.client}<br>
      ${entry.date}<br>
      ${entry.id}
    `;
    ledgerDiv.appendChild(card);
  });

  if (ledger.length === 0) {
    ledgerDiv.innerHTML = "<p>No saved audits.</p>";
  }
}

function generateID() {
  return "AFP-" + Date.now();
}

saveBtn.addEventListener("click", () => {

  if (!date.value) {
    showToast("Assessment date required.");
    return;
  }

  const ledger = JSON.parse(localStorage.getItem(ledgerKey)) || [];

  const newEntry = {
    id: generateID(),
    consultant: consultant.value,
    organisation: organisation.value,
    client: client.value,
    title: title.value,
    date: date.value  // ISO YYYY-MM-DD
  };

  ledger.unshift(newEntry);
  localStorage.setItem(ledgerKey, JSON.stringify(ledger));

  showToast("Audit saved to ledger.");
  loadLedger();
});

resetBtn.addEventListener("click", () => {
  consultant.value = "";
  organisation.value = "";
  client.value = "";
  title.value = "";
  date.value = "";
});

loadLedger();