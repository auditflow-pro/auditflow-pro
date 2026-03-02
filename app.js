/* ==========================================
   AuditFlow Pro v3.0
   Phase 2 — Audit Ledger Architecture
========================================== */

const VERSION = "3.0";
const LEDGER_KEY = `AFP_v${VERSION}_LEDGER`;
const DRAFT_KEY = `AFP_v${VERSION}_DRAFT`;

/* ===============================
   Field Map
================================= */

const fieldMap = {
    consultant: document.getElementById("consultant"),
    organisation: document.getElementById("organisation"),
    client: document.getElementById("client"),
    auditTitle: document.getElementById("auditTitle"),
    assessmentDate: document.getElementById("assessmentDate")
};

/* ===============================
   Utility
================================= */

function generateAuditID() {
    return "AFP-" + Date.now();
}

function getLedger() {
    return JSON.parse(localStorage.getItem(LEDGER_KEY)) || [];
}

function saveLedger(ledger) {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
}

/* ===============================
   Draft Persistence
================================= */

function saveDraft() {
    const draft = {};
    Object.keys(fieldMap).forEach(key => {
        draft[key] = fieldMap[key].value;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!draft) return;

    Object.keys(fieldMap).forEach(key => {
        if (draft[key]) fieldMap[key].value = draft[key];
    });
}

/* ===============================
   Save Audit to Ledger
================================= */

function saveAudit() {

    const audit = {};

    Object.keys(fieldMap).forEach(key => {
        audit[key] = fieldMap[key].value.trim();
    });

    if (Object.values(audit).some(v => !v)) {
        alert("All fields must be completed before saving.");
        return;
    }

    audit.id = generateAuditID();
    audit.timestamp = new Date().toISOString();
    audit.version = VERSION;

    const ledger = getLedger();
    ledger.unshift(audit);
    saveLedger(ledger);

    localStorage.removeItem(DRAFT_KEY);
    renderLedger();

    alert("Audit saved to ledger.");
}

/* ===============================
   Render Ledger
================================= */

function renderLedger() {
    const ledgerList = document.getElementById("ledgerList");
    ledgerList.innerHTML = "";

    const ledger = getLedger();

    if (ledger.length === 0) {
        ledgerList.innerHTML = "<p>No saved audits.</p>";
        return;
    }

    ledger.forEach(audit => {

        const div = document.createElement("div");
        div.className = "ledger-item";

        div.innerHTML = `
            <strong>${audit.auditTitle}</strong><br>
            ${audit.client}<br>
            ${audit.assessmentDate}<br>
            <small>${audit.id}</small>
        `;

        ledgerList.appendChild(div);
    });
}

/* ===============================
   New Audit Reset
================================= */

function startNewAudit() {
    Object.values(fieldMap).forEach(field => field.value = "");
    localStorage.removeItem(DRAFT_KEY);
}

/* ===============================
   Event Listeners
================================= */

Object.values(fieldMap).forEach(field => {
    field.addEventListener("input", saveDraft);
});

document.getElementById("saveAuditBtn").addEventListener("click", saveAudit);
document.getElementById("newAuditBtn").addEventListener("click", startNewAudit);

/* ===============================
   Init
================================= */

loadDraft();
renderLedger();