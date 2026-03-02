document.addEventListener("DOMContentLoaded", () => {

  const registerBtn = document.getElementById("registerBtn");
  const unlockRegistrationBtn = document.getElementById("unlockRegistrationBtn");

  const formSection = document.getElementById("registrationFormSection");
  const summarySection = document.getElementById("registrationSummarySection");
  const architectureSection = document.getElementById("architectureSection");
  const architectureSummarySection = document.getElementById("architectureSummarySection");
  const assessmentSection = document.getElementById("assessmentSection");

  const confirmArchitectureBtn = document.getElementById("confirmArchitectureBtn");
  const weightInputs = document.querySelectorAll(".weight-input");
  const weightTotal = document.getElementById("weightTotal");

  /* -------- REGISTRATION -------- */

  registerBtn.addEventListener("click", () => {

    const client = document.getElementById("clientName").value.trim();
    const location = document.getElementById("siteLocation").value.trim();
    const ref = document.getElementById("assessmentRef").value.trim();
    const date = document.getElementById("assessmentDate").value;

    if (!client || !location || !ref || !date) return;

    document.getElementById("summaryClient").textContent = client;
    document.getElementById("summaryLocation").textContent = location;
    document.getElementById("summaryRef").textContent = ref.toUpperCase();
    document.getElementById("summaryDate").textContent =
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

    formSection.classList.add("hidden");
    summarySection.classList.remove("hidden");
    architectureSection.classList.remove("hidden");
  });

  unlockRegistrationBtn.addEventListener("click", () => {
    summarySection.classList.add("hidden");
    architectureSection.classList.add("hidden");
    architectureSummarySection.classList.add("hidden");
    assessmentSection.classList.add("hidden");
    formSection.classList.remove("hidden");
  });

  /* -------- ARCHITECTURE -------- */

  function updateTotal() {
    let total = 0;
    weightInputs.forEach(input => {
      total += parseInt(input.value) || 0;
    });

    weightTotal.textContent = "Total Allocation: " + total + "%";

    if (total === 100) {
      weightTotal.classList.add("valid");
      confirmArchitectureBtn.disabled = false;
    } else {
      weightTotal.classList.remove("valid");
      confirmArchitectureBtn.disabled = true;
    }
  }

  weightInputs.forEach(input => {
    input.addEventListener("input", updateTotal);
  });

  updateTotal();

  confirmArchitectureBtn.addEventListener("click", () => {

    let total = 0;
    weightInputs.forEach(input => total += parseInt(input.value) || 0);
    if (total !== 100) return;

    const summaryContainer = document.getElementById("architectureSummaryContent");
    summaryContainer.innerHTML = "";

    weightInputs.forEach(input => {
      const domainLabel = input.closest(".architecture-grid")
        .querySelector(`[data-domain="${input.dataset.domain}"]`);
    });

    const domains = [
      "Site & Environment",
      "Equipment & Infrastructure",
      "Operational Controls",
      "People & Process"
    ];

    weightInputs.forEach((input, index) => {

      const item = document.createElement("div");
      item.classList.add("record-item");

      const label = document.createElement("div");
      label.classList.add("meta-label");
      label.textContent = domains[index];

      const value = document.createElement("div");
      value.classList.add("meta-value");
      value.textContent = input.value + "% weighting";

      item.appendChild(label);
      item.appendChild(value);

      summaryContainer.appendChild(item);

      input.setAttribute("readonly", true);
    });

    architectureSection.classList.add("hidden");
    architectureSummarySection.classList.remove("hidden");
    assessmentSection.classList.remove("hidden");

  });

});