const questions = [
  { text: "Fire detection system operational?", weight: 3 },
  { text: "Emergency exits unobstructed?", weight: 3 },
  { text: "Electrical systems maintained?", weight: 2 },
  { text: "Housekeeping standards acceptable?", weight: 1 }
];

let responses = {};
let determinationResult = "";
let recordID = "";
let sealTimestamp = "";

/* NAVIGATION */

startAudit.onclick = () => {
  if (!consultantName.value || !orgName.value || !clientName.value || !auditTitle.value || !assessmentDate.value) {
    alert("All registration fields must be completed.");
    return;
  }

  registration.classList.add("hidden");
  assessment.classList.remove("hidden");
  renderQuestions();
};

backToRegistration.onclick = () => {
  assessment.classList.add("hidden");
  registration.classList.remove("hidden");
};

backToAssessment.onclick = () => {
  determination.classList.add("hidden");
  assessment.classList.remove("hidden");
};

/* RENDER QUESTIONS */

function renderQuestions() {
  questionsContainer.innerHTML = "";
  questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.className = "question";
    block.innerHTML = `
      <div><strong>${q.text}</strong></div>
      <div class="answer-row">
        <button class="yes">YES</button>
        <button class="no">NO</button>
        <button class="na">N/A</button>
      </div>
    `;
    questionsContainer.appendChild(block);

    const buttons = block.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.onclick = () => {
        buttons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        responses[i] = btn.textContent;
      };
    });
  });
}

/* DETERMINATION ENGINE */

completeAudit.onclick = () => {

  let score = 0;

  questions.forEach((q, i) => {
    if (responses[i] === "NO") {
      score += q.weight;
    }
  });

  if (score >= 5) {
    determinationResult = "CRITICAL EXPOSURE IDENTIFIED";
  } else if (score >= 3) {
    determinationResult = "MAJOR EXPOSURE IDENTIFIED";
  } else if (score >= 1) {
    determinationResult = "MODERATE EXPOSURE IDENTIFIED";
  } else {
    determinationResult = "CONTROLLED EXPOSURE STATUS";
  }

  assessment.classList.add("hidden");
  determination.classList.remove("hidden");

  determinationBlock.innerHTML = `
    <div class="determination-box">
      FORMAL EXPOSURE DETERMINATION: ${determinationResult}
    </div>
  `;
};

/* SEAL */

sealAudit.onclick = () => {

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,"0");
  const d = String(now.getDate()).padStart(2,"0");
  const h = String(now.getHours()).padStart(2,"0");
  const min = String(now.getMinutes()).padStart(2,"0");

  recordID = `AFP-${y}${m}${d}-${h}${min}`;
  sealTimestamp = now.toISOString();

  determination.classList.add("hidden");
  record.classList.remove("hidden");

  recordContent.innerHTML = `
    <h2>Exposure Determination Record</h2>

    <p><strong>Record ID:</strong> ${recordID}</p>
    <p><strong>Instrument Version:</strong> v1.0</p>
    <p><strong>Seal Timestamp:</strong> ${sealTimestamp}</p>

    <hr>

    <p><strong>Consultant:</strong> ${consultantName.value}</p>
    <p><strong>Organisation:</strong> ${orgName.value}</p>
    <p><strong>Client:</strong> ${clientName.value}</p>
    <p><strong>Audit:</strong> ${auditTitle.value}</p>
    <p><strong>Date:</strong> ${assessmentDate.value}</p>

    <hr>

    ${questions.map((q,i)=>`
      <p><strong>${q.text}</strong> — ${responses[i] || "N/A"}</p>
    `).join("")}

    <hr>

    <div class="determination-box">
      FORMAL EXPOSURE DETERMINATION: ${determinationResult}
    </div>

    <p><strong>Methodology:</strong> Determination generated using calibrated weighted exposure criteria embedded within AuditFlow Pro.</p>

    <p><strong>Disclaimer:</strong> This instrument provides a structured exposure determination based on recorded responses at the time of assessment. It does not replace statutory compliance obligations or jurisdiction-specific regulatory requirements.</p>

    <p>This record has been formally sealed and time-stamped. Any alteration invalidates the record ID.</p>

    <div class="signature-line"></div>
    <p>Consultant Signature</p>

    <div class="signature-line"></div>
    <p>Client Representative Signature</p>
  `;
};

exportPDF.onclick = () => window.print();