const STORAGE_KEY = "afp-ledger";

const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const ledgerDiv = document.getElementById("ledger");
const toast = document.getElementById("toast");

function getLedger() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function setLedger(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function renderLedger() {
  const ledger = getLedger();
  ledgerDiv.innerHTML = "";

  if (ledger.length === 0) {
    ledgerDiv.innerHTML = "<p>No saved audits.</p>";
    return;
  }

  ledger.slice().reverse().forEach(item => {
    const div = document.createElement("div");
    div.className = "ledger-item";

    div.innerHTML = `
      <h3>${item.title || "Untitled"}</h3>
      <p>${item.client}</p>
      <p>${item.date}</p>
      <p>${item.id}</p>
      <button class="delete-btn" data-id="${item.id}">Delete</button>
    `;

    ledgerDiv.appendChild(div);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this audit permanently?")) {
        deleteAudit(id);
      }
    });
  });
}

function deleteAudit(id) {
  let ledger = getLedger();
  ledger = ledger.filter(item => item.id !== id);
  setLedger(ledger);
  renderLedger();
  showToast("Audit deleted.");
}

saveBtn.addEventListener("click", () => {
  const consultant = document.getElementById("consultant").value;
  const organisation = document.getElementById("organisation").value;
  const client = document.getElementById("client").value;
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;

  if (!date) {
    alert("Please select a date.");
    return;
  }

  const id = "AFP-" + Date.now();

  const newEntry = {
    id,
    consultant,
    organisation,
    client,
    title,
    date
  };

  const ledger = getLedger();
  ledger.push(newEntry);
  setLedger(ledger);

  renderLedger();
  showToast("Audit saved to ledger.");
});

resetBtn.addEventListener("click", () => {
  document.querySelectorAll("input").forEach(input => input.value = "");
});

renderLedger();