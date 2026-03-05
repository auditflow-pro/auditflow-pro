document.addEventListener("DOMContentLoaded", () => {

if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("service-worker.js?v=7");
}

});

function startAudit() {

const audit = {
consultant: document.getElementById("consultant").value,
organisation: document.getElementById("organisation").value,
client: document.getElementById("client").value,
title: document.getElementById("auditTitle").value,
date: document.getElementById("assessmentDate").value,
timestamp: Date.now()
};

localStorage.setItem("audit_active", JSON.stringify(audit));

window.location.href = "assessment.html";

}

function viewRecords() {
window.location.href = "report.html";
}