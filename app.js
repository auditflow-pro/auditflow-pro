/* =========================================
   AUDITFLOW PRO — REGISTRATION ENGINE v600
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("commenceBtn");

  btn.addEventListener("click", () => {

    const client = document.getElementById("clientName").value.trim();
    const location = document.getElementById("siteLocation").value.trim();
    let ref = document.getElementById("assessmentRef").value.trim();
    const date = document.getElementById("assessmentDate").value;

    if (!client || !location || !ref || !date) {
      return;
    }

    // Normalize reference code only (professional discipline)
    ref = ref.toUpperCase();
    document.getElementById("assessmentRef").value = ref;

    // Placeholder transition — replace with assessment load
    window.location.hash = "assessment";

  });

});