/* ========================================
   AUDITFLOW PRO — ENTRY GATE ENGINE v300
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("initiateBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "registration.html";
    });
  }
});