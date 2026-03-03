const ledgerKey = "afp_ledger_v3_2";
const legacyKeys = ["afp_ledger_v3_1", "afp_ledger_v3"];

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

function generateID() {
  return "AFP-" + Date.now();
}

/* ---------- DATE NORMALISATION ---------- */

function toISO(dateString) {

  if (!dateString) return "";

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // DD/MM/YYYY
  const slashMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [ , d, m, y ] = slashMatch;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  // D MMM YYYY
  const monthMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };

  const textMatch = dateString.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})$/);
  if (textMatch) {
    const [ , d, mText, y ] = textMatch;
    return `${y}-${monthMap[mText]}-${d.padStart(2,'0')}`;
  }

  return dateString;
}

/* ---------- MIGRATION ---------- */

function migrateLedger() {

  let combined = [];

  legacyKeys.forEach(key => {
    const old = JSON.parse(localStorage.getItem(key));
    if (old && Array.isArray(old)) {
      combined = combined.concat(old);
    }
  });

  const current = JSON.parse(localStorage.getItem(ledgerKey));
  if (current && Array.isArray(current)) {
    combined = combined.concat(current);
  }

  if (combined.length === 0) return;

  const migrated = combined.map(entry => ({
    ...entry,
    date: toISO(entry.date)
  }));

  localStorage.setItem(ledgerKey, JSON.stringify(migrated));

  legacyKeys.forEach(key => localStorage.removeItem(key));
}

/* ---------- LEDGER ---------- */

function loadLedger() {
  const ledger = JSON.parse(localStorage.getItem(ledgerKey)) || [];
  ledgerDiv.innerHTML = "";

  if (ledger.length === 0) {
    ledgerDiv.innerHTML = "<p>No saved audits.</p>";
    return;
  }

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
}

/* ---------- SAVE ---------- */

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
    date: toISO(date.value)
  };

  ledger.unshift(newEntry);
  localStorage.setItem(ledgerKey, JSON.stringify(ledger));

  showToast("Audit saved to ledger.");
  loadLedger();
});

/* ---------- RESET ---------- */

resetBtn.addEventListener("click", () => {
  consultant.value = "";
  organisation.value = "";
  client.value = "";
  title.value = "";
  date.value = "";
});

/* ---------- INIT ---------- */

migrateLedger();
loadLedger();