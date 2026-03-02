document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("commenceBtn");
  const registrationBlock = document.getElementById("registrationBlock");
  const assessmentStage = document.getElementById("assessmentStage");
  const registrationNote = document.getElementById("registrationNote");

  btn.addEventListener("click", () => {

    const client = document.getElementById("clientName").value.trim();
    const location = document.getElementById("siteLocation").value.trim();
    let ref = document.getElementById("assessmentRef").value.trim();
    const date = document.getElementById("assessmentDate").value;

    if (!client || !location || !ref || !date) {
      registrationNote.textContent = "All scope parameters must be defined prior to commencement.";
      return;
    }

    // Normalize reference
    ref = ref.toUpperCase();
    document.getElementById("assessmentRef").value = ref;

    // Lock registration
    registrationBlock.classList.add("locked");
    const inputs = registrationBlock.querySelectorAll("input");
    inputs.forEach(input => input.setAttribute("readonly", true));

    // Replace note with lock indicator
    registrationNote.textContent = "Registration Locked";
    registrationNote.classList.add("lock-indicator");

    // Hide button
    btn.style.display = "none";

    // Reveal Stage 02
    assessmentStage.classList.remove("hidden");

  });

});