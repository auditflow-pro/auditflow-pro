document.addEventListener("DOMContentLoaded", () => {

  const registerBtn = document.getElementById("registerBtn");
  const unlockBtn = document.getElementById("unlockBtn");

  const formSection = document.getElementById("registrationFormSection");
  const summarySection = document.getElementById("registrationSummarySection");
  const assessmentSection = document.getElementById("assessmentSection");

  const note = document.getElementById("registrationNote");

  registerBtn.addEventListener("click", () => {

    const client = document.getElementById("clientName").value.trim();
    const location = document.getElementById("siteLocation").value.trim();
    let ref = document.getElementById("assessmentRef").value.trim();
    const date = document.getElementById("assessmentDate").value;

    if (!client || !location || !ref || !date) {
      note.textContent = "All scope parameters must be defined prior to commencement.";
      return;
    }

    ref = ref.toUpperCase();

    document.getElementById("summaryClient").textContent = client;
    document.getElementById("summaryLocation").textContent = location;
    document.getElementById("summaryRef").textContent = ref;
    document.getElementById("summaryDate").textContent =
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

    formSection.classList.add("hidden");
    summarySection.classList.remove("hidden");
    assessmentSection.classList.remove("hidden");

  });

  unlockBtn.addEventListener("click", () => {
    summarySection.classList.add("hidden");
    assessmentSection.classList.add("hidden");
    formSection.classList.remove("hidden");
  });

});