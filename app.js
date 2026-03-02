const VERSION = "3.1";
const LEDGER_KEY = `AFP_v${VERSION}_LEDGER`;
const DRAFT_KEY = `AFP_v${VERSION}_DRAFT`;

const fieldMap = {
    consultant: document.getElementById("consultant"),
    organisation: document.getElementById("organisation"),
    client: document.getElementById("client"),
    auditTitle: document.getElementById("auditTitle"),
    assessmentDate: document.getElementById("assessmentDate")
};

function generateAuditID() {
    return "AFP-" + Date.now();
}

function getLedger() {
    return JSON.parse(localStorage.getItem(LEDGER_KEY)) || [];
}

function saveLedger(ledger) {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
}

function saveDraft() {
    const draft = {};
    Object.keys(fieldMap).forEach(k => draft[k] = fieldMap[k].value);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!draft) return;
    Object.keys(fieldMap).forEach(k => {
        if (draft[k]) fieldMap[k].value = draft[k];
    });
}

function saveAudit() {

    const audit = {};
    Object.keys(fieldMap).forEach(k => audit[k] = fieldMap[k].value.trim());

    if (Object.values(audit).some(v => !v)) {
        showToast("All fields must be completed.");
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
    showToast("Audit saved to ledger.");
}

function renderLedger() {
    const ledgerList = document.getElementById("ledgerList");
    ledgerList.innerHTML = "";

    const ledger = getLedger();
    if (!ledger.length) {
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

function startNewAudit() {
    Object.values(fieldMap).forEach(f => f.value = "");
    localStorage.removeItem(DRAFT_KEY);
}

function showToast(message) {

    const existing = document.getElementById("toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "toast";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#111";
    toast.style.color = "#fff";
    toast.style.padding = "14px 20px";
    toast.style.borderRadius = "14px";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
    toast.style.zIndex = "9999";
    toast.innerText = message;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

Object.values(fieldMap).forEach(f => f.addEventListener("input", saveDraft));
document.getElementById("saveAuditBtn").addEventListener("click", saveAudit);
document.getElementById("newAuditBtn").addEventListener("click", startNewAudit);

loadDraft();
renderLedger();

if (!fieldMap.assessmentDate.value) {
    const today = new Date();
    fieldMap.assessmentDate.value =
        today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}