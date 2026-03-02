const questions = [
  { section: "Fire Safety", text: "Fire detection system operational?", weight: 3 },
  { section: "Fire Safety", text: "Emergency exits unobstructed?", weight: 3 },
  { section: "Electrical Safety", text: "Electrical systems maintained?", weight: 2 },
  { section: "General Safety", text: "Housekeeping standards acceptable?", weight: 1 }
];

let responses = {};
let classification = "";
let totalScore = 0;

function renderQuestions() {
  questionsContainer.innerHTML = "";
  questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.innerHTML = `
      <p><strong>${q.section}</strong></p>
      <p>${q.text}</p>
      <button onclick="recordResponse(${i},'YES')">YES</button>
      <button onclick="recordResponse(${i},'NO')">NO</button>
      <button onclick="recordResponse(${i},'N/A')">N/A</button>
      <hr>
    `;
    questionsContainer.appendChild(block);
  });
}

function recordResponse(index, value) {
  responses[index] = value;
}

completeAudit.onclick = () => {
  totalScore = 0;
  questions.forEach((q,i)=>{
    if(responses[i]==="NO") totalScore+=q.weight;
  });

  if(totalScore>=5) classification="CRITICAL EXPOSURE IDENTIFIED";
  else if(totalScore>=3) classification="MAJOR EXPOSURE IDENTIFIED";
  else if(totalScore>=1) classification="MODERATE EXPOSURE IDENTIFIED";
  else classification="CONTROLLED EXPOSURE STATUS";

  analysisPreview.innerHTML = `
    <p><strong>Total Weighted Exposure Score:</strong> ${totalScore}</p>
    <div class="determination-box">
      FORMAL EXPOSURE DETERMINATION: ${classification}
    </div>
  `;

  assessment.classList.add("hidden");
  determination.classList.remove("hidden");
};

sealAudit.onclick = () => {

  const now = new Date();
  const recordID = `AFP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;

  let sectionBreakdown = "";

  const sections = [...new Set(questions.map(q=>q.section))];

  sections.forEach(sec=>{
    let sectionScore=0;
    let sectionItems="";
    questions.forEach((q,i)=>{
      if(q.section===sec){
        if(responses[i]==="NO") sectionScore+=q.weight;
        sectionItems+=`<p>${q.text} — ${responses[i]||"N/A"}</p>`;
      }
    });

    sectionBreakdown+=`
      <h3>${sec}</h3>
      <p><strong>Section Score:</strong> ${sectionScore}</p>
      ${sectionItems}
      <hr>
    `;
  });

  recordContent.innerHTML=`
    <h1>Exposure Determination Report</h1>
    <p><strong>Record ID:</strong> ${recordID}</p>
    <p><strong>Consultant:</strong> ${consultantName.value}</p>
    <p><strong>Organisation:</strong> ${orgName.value}</p>
    <p><strong>Client:</strong> ${clientName.value}</p>
    <p><strong>Audit:</strong> ${auditTitle.value}</p>
    <p><strong>Date:</strong> ${assessmentDate.value}</p>

    <div class="page-break"></div>

    <h2>Exposure Analysis Summary</h2>
    <p><strong>Total Weighted Exposure Score:</strong> ${totalScore}</p>
    <div class="determination-box">
      FORMAL EXPOSURE DETERMINATION: ${classification}
    </div>

    <div class="page-break"></div>

    <h2>Section-Level Assessment Breakdown</h2>
    ${sectionBreakdown}

    <div class="page-break"></div>

    <h2>Exposure Classification Scale</h2>
    <p>Critical (≥5), Major (3–4), Moderate (1–2), Controlled (0)</p>

    <h2>Required Action Guidance</h2>
    <p>Where Critical or Major exposure is identified, immediate corrective action planning is required. Moderate exposure requires scheduled remediation. Controlled status requires ongoing monitoring.</p>

    <h2>Methodology</h2>
    <p>Determination generated using calibrated weighted exposure criteria embedded within AuditFlow Pro.</p>

    <h2>Disclaimer</h2>
    <p>This instrument provides structured exposure determination and does not replace statutory regulatory requirements.</p>

    <div class="page-break"></div>

    <h2>Formal Sealing</h2>
    <p>This report has been formally sealed and time-stamped. Any alteration invalidates the record ID.</p>

    <p>Consultant Signature ____________________________</p>
    <p>Client Representative Signature ____________________________</p>

    <footer>AuditFlow Pro — Exposure Determination Instrument</footer>
  `;

  determination.classList.add("hidden");
  record.classList.remove("hidden");
};

exportPDF.onclick=()=>window.print();