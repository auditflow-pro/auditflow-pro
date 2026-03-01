/* =========================================
   AUDITFLOW PRO — STAGE 01 ENGINE v500
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("commenceBtn");

  btn.addEventListener("click", () => {

    const client = document.getElementById("clientName").value.trim();
    const location = document.getElementById("siteLocation").value.trim();
    const ref = document.getElementById("assessmentRef").value.trim();
    const date = document.getElementById("assessmentDate").value;

    if (!client || !location || !ref || !date) {
      alert("All scope fields must be defined before proceeding.");
      return;
    }

    alert("Structured assessment phase will initialise.");

  });

});