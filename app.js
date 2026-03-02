const questions = [
  "Fire detection system operational?",
  "Emergency exits unobstructed?",
  "Electrical systems maintained?",
  "Housekeeping standards acceptable?"
];

let responses = {};
let recordData = {};

document.getElementById("assessmentDate").addEventListener("click", () => {
  const date = prompt("Enter assessment date (YYYY-MM-DD):");
  if (date) document.getElementById("assessmentDate").value = date;
});

document.getElementById("startAudit").onclick = () => {
  if (!orgName.value || !clientName.value || !auditTitle.value || !assessmentDate.value) {
    alert("All registration fields must be completed.");
    return;
  }

  document.getElementById("registration").classList.add("hidden");
  document.getElementById("assessment").classList.remove("hidden");

  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const block = document.createElement("div");
    block.className = "question-block";
    block.innerHTML = `
      <div><strong>${q}</strong></div>
      <div class="answer-buttons">
        <button class="answer-yes">YES</button>
        <button class="answer-no">NO</button>
        <button class="answer-na">N/A</button>
      </div>
    `;
    container.appendChild(block);

    const buttons = block.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.onclick = () => {
        buttons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        responses[index] = btn.textContent;
      };
    });
  });
};

document.getElementById("completeAudit").onclick = () => {
  document.getElementById("assessment").classList.add("hidden");
  document.getElementById("determination").classList.remove("hidden");

  let critical = Object.values(responses).includes("NO");
  document.getElementById("determinationResult").innerHTML =
    critical ? "<strong>Critical Exposure Identified</strong>" :
               "<strong>No Critical Exposure Identified</strong>";
};

document.getElementById("sealAudit").onclick = () => {
  document.getElementById("determination").classList.add("hidden");
  document.getElementById("record").classList.remove("hidden");

  let html = `
    <p><strong>Organisation:</strong> ${orgName.value}</p>
    <p><strong>Client:</strong> ${clientName.value}</p>
    <p><strong>Audit:</strong> ${auditTitle.value}</p>
    <p><strong>Date:</strong> ${assessmentDate.value}</p>
    <hr>
  `;

  questions.forEach((q, i) => {
    html += `<p><strong>${q}</strong> — ${responses[i] || "N/A"}</p>`;
  });

  document.getElementById("recordContent").innerHTML = html;
};

document.getElementById("exportPDF").onclick = () => {
  window.print();
};