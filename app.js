/* ========================================
   AUDITFLOW PRO — INSTRUMENT ENGINE v200
======================================== */

const STORAGE_KEY = "auditflowpro_v200_instrument";

let state = {
  audits: [],
  activeAuditId: null
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("auditDate").value = todayISO();
  document.getElementById("registerBtn").addEventListener("click", registerAudit);
});

/* ===============================
   AUDIT ID GENERATION
================================ */

function generateAuditId(dateStr) {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateKey = y + m + d;

  let counter = localStorage.getItem("AFP-" + dateKey) || 0;
  counter++;
  localStorage.setItem("AFP-" + dateKey, counter);

  const seq = String(counter).padStart(3, "0");

  return `AFP-${dateKey}-${seq}`;
}

/* ===============================
   REGISTRATION
================================ */

function registerAudit() {

  const client = document.getElementById("clientName").value.trim();
  const title = document.getElementById("auditTitle").value.trim();
  const location = document.getElementById("auditLocation").value.trim();
  const assessor = document.getElementById("auditAssessor").value.trim();
  const date = document.getElementById("auditDate").value;

  if (!client || !title || !date) {
    alert("Client Name, Audit Title and Date are required.");
    return;
  }

  const audit = {
    id: generateAuditId(date),
    client,
    title,
    location,
    assessor,
    date,
    version: "1.0",
    status: "Draft",
    totalScore: 0,
    maxScore: 0,
    exposure: 0,
    classification: "Low"
  };

  state.audits.push(audit);
  state.activeAuditId = audit.id;

  updateMetaDisplay(audit);
}

/* ===============================
   EXPOSURE ENGINE
================================ */

function calculateExposure(audit) {
  if (audit.maxScore === 0) return 0;
  return Math.round((audit.totalScore / audit.maxScore) * 100);
}

function classifyExposure(value) {
  if (value <= 5) return "Low";
  if (value <= 20) return "Moderate";
  if (value <= 45) return "Elevated";
  return "High";
}

/* ===============================
   META PANEL UPDATE
================================ */

function updateMetaDisplay(audit) {
  document.getElementById("metaId").textContent = audit.id;
  document.getElementById("metaStatus").textContent = audit.status;
  document.getElementById("metaVersion").textContent = audit.version;
  document.getElementById("metaExposure").textContent = audit.exposure + "%";
  document.getElementById("metaClass").textContent = audit.classification;
}

/* ===============================
   UTIL
================================ */

function todayISO() {
  return new Date().toISOString().split("T")[0];
}