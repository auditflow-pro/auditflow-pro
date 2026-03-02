const questions = [
  "Fire detection system operational?",
  "Emergency exits unobstructed?",
  "Electrical systems maintained?",
  "Housekeeping standards acceptable?"
];

let responses = {};
let recordID = "";
let sealTimestamp = "";

const container = document.getElementById("questionsContainer");

document.getElementById("startAudit").onclick = () => {
  if (!orgName.value || !clientName.value || !auditTitle.value || !assessmentDate.value) {
    alert("All registration fields must be completed.");
    return;
  }

  document.getElementById("registration").classList.add("hidden");
  document.getElementById("assessment").classList.remove("hidden");

  container.innerHTML = "";

  questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.className = "question";
    block.innerHTML = `
      <div><strong>${q}</strong></div>
      <div class="answer-row">
        <button class="yes">YES</button>
        <button class="no">NO</button>
        <button class="na">N/A</button>
      </div>
    `;
    container.appendChild(block);

    const buttons = block.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.onclick = () => {
        buttons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        responses[i] = btn.textContent;
      };
    });
  });
};

document.getElementById("completeAudit").onclick = () => {
  document.getElementById("assessment").classList.add("hidden");
  document.getElementById("determination").classList.remove("hidden");

  const critical = Object.values(responses).includes("NO");

  document.getElementById("determinationBlock").innerHTML =
    `<div class="determination-box">
      FORMAL EXPOSURE DETERMINATION: 
      ${critical ? "CRITICAL EXPOSURE IDENTIFIED" : "NO CRITICAL EXPOSURE IDENTIFIED"}
    </div>`;
};

document.getElementById("sealAudit").onclick = () => {
  recordID = "AFP-" + Date.now();
  sealTimestamp = new Date().toISOString();

  document.getElementById("determination").classList.add("hidden");
  document.getElementById("record").classList.remove("hidden");

  let html = `
    <h2>Exposure Determination Record</h2>
    <p><strong>Record ID:</strong> ${recordID}</p>
    <p><strong>Instrument Version:</strong> v1.0</p>
    <p><strong>Seal Timestamp:</strong> ${sealTimestamp}</p>
    <hr>
    <p><strong>Organisation:</strong> ${orgName.value}</p>
    <p><strong>Client:</strong> ${clientName.value}</p>
    <p><strong>Audit:</strong> ${auditTitle.value}</p>
    <p><strong>Date:</strong> ${assessmentDate.value}</p>
    <hr>
  `;

  questions.forEach((q, i) => {
    html += `<p><strong>${q}</strong> — ${responses[i] || "N/A"}</p>`;
  });

  html += `
    <hr>
    <div class="determination-box">
      FORMAL EXPOSURE DETERMINATION CONFIRMED
    </div>

    <p><strong>Disclaimer:</strong> 
    This instrument provides a structured exposure determination based on recorded responses at the time of assessment. It does not replace statutory compliance obligations or jurisdiction-specific regulatory requirements.</p>

    <div class="signature-block">
      <div class="signature-line"></div>
      <p>Consultant Signature</p>

      <div class="signature-line"></div>
      <p>Client Representative Signature</p>
    </div>
  `;

  document.getElementById("recordContent").innerHTML = html;
};

document.getElementById("exportPDF").onclick = () => {
  window.print();
};