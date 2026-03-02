const instrumentVersion = "v1.0";

const instrument = [
    {
        domain: "Site & Environment",
        questions: [
            { text: "Fire detection system fully operational?", tier: 4 },
            { text: "Emergency exits unobstructed?", tier: 4 },
            { text: "General housekeeping maintained?", tier: 2 }
        ]
    }
];

let state = { answers: {}, recordId: "", timestamp: "", exposure: "" };

const startBtn = document.getElementById("startBtn");
["consultantName","clientName","auditTitle","assessmentDate"]
.forEach(id => document.getElementById(id).addEventListener("input", validateRegistration));

startBtn.addEventListener("click", startAssessment);
document.getElementById("sealBtn").addEventListener("click", () => {
    document.getElementById("sealModal").classList.remove("hidden");
});
document.getElementById("cancelSealBtn").addEventListener("click", () => {
    document.getElementById("sealModal").classList.add("hidden");
});
document.getElementById("confirmSealBtn").addEventListener("click", sealAssessment);
document.getElementById("exportBtn").addEventListener("click", () => window.print());

function validateRegistration() {
    const valid =
        consultantName.value.trim() &&
        clientName.value.trim() &&
        auditTitle.value.trim() &&
        assessmentDate.value;

    startBtn.disabled = !valid;
}

function setStep(activeId) {
    document.querySelectorAll(".progress-flow .step")
        .forEach(step => step.classList.remove("active"));
    document.getElementById(activeId).classList.add("active");
}

function startAssessment() {
    registrationPanel.classList.add("hidden");
    assessmentSection.classList.remove("hidden");
    setStep("step-assessment");
    renderDomains();
}

function renderDomains() {
    const container = document.getElementById("domainsContainer");
    container.innerHTML = "";

    instrument.forEach((domain, dIndex) => {
        const block = document.createElement("div");
        block.className = "domain-block";

        const title = document.createElement("h3");
        title.textContent = domain.domain;
        block.appendChild(title);

        domain.questions.forEach((q, qIndex) => {
            const qBlock = document.createElement("div");
            qBlock.className = "question-block";

            const qText = document.createElement("div");
            qText.textContent = q.text;
            qBlock.appendChild(qText);

            ["YES","NO","N/A"].forEach(option => {
                const btn = document.createElement("button");
                btn.className = "answer-btn";
                btn.textContent = option;
                btn.onclick = () => handleAnswer(dIndex,qIndex,option,btn,qBlock);
                qBlock.appendChild(btn);
            });

            block.appendChild(qBlock);
        });

        container.appendChild(block);
    });
}

function handleAnswer(dIndex,qIndex,value,btn,qBlock){
    const key = `${dIndex}_${qIndex}`;
    state.answers[key] = value;

    qBlock.querySelectorAll(".answer-btn").forEach(b => b.className="answer-btn");

    if(value==="YES") btn.classList.add("selected-yes");
    if(value==="NO") btn.classList.add("selected-no");
    if(value==="N/A") btn.classList.add("selected-na");

    let recorded = qBlock.querySelector(".answer-recorded");
    if(!recorded){
        recorded=document.createElement("div");
        recorded.className="answer-recorded";
        qBlock.appendChild(recorded);
    }
    recorded.textContent=`Recorded: ${value}`;

    evaluateExposure();
}

function evaluateExposure(){
    let critical=false;
    instrument.forEach((domain,dIndex)=>{
        domain.questions.forEach((q,qIndex)=>{
            if(q.tier===4 && state.answers[`${dIndex}_${qIndex}`]==="NO"){
                critical=true;
            }
        });
    });

    state.exposure = critical ? "Critical Exposure" : "Controlled Exposure";

    const block=document.getElementById("globalExposure");
    block.classList.remove("hidden");
    block.innerHTML=`Formal Exposure Determination:<br>${state.exposure}`;
}

function sealAssessment(){
    document.getElementById("sealModal").classList.add("hidden");
    state.recordId=generateRecordId();
    state.timestamp=formatTimestamp(new Date());

    assessmentSection.classList.add("hidden");
    documentSection.classList.remove("hidden");
    setStep("step-issuance");

    generateDocument();
}

function generateRecordId(){
    const now=new Date();
    return `AFP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
}

function formatTimestamp(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function generateDocument(){
    const content=document.getElementById("documentContent");

    content.innerHTML=`
        <h2>Exposure Determination Record</h2>
        <div style="font-weight:bold;letter-spacing:0.5px;margin-bottom:15px;">
            AuditFlow Pro — Professional Instrument System
        </div>

        <div style="border-left:6px solid #1b1e24;padding:15px;margin-bottom:20px;font-size:18px;font-weight:bold;">
            Formal Exposure Determination: ${state.exposure}
        </div>

        <p><strong>Instrument Version:</strong> ${instrumentVersion}</p>
        <p><strong>Record ID:</strong> ${state.recordId}</p>
        <p><strong>Determination Timestamp:</strong> ${state.timestamp}</p>

        <hr>

        <p>This determination has been produced using calibrated weighted exposure analysis across structured compliance domains.</p>

        <h3>Disclaimer</h3>
        <p style="font-size:13px;">
        This instrument provides a structured exposure determination based on recorded responses at the time of assessment. 
        It does not replace statutory compliance obligations or jurisdiction-specific regulatory requirements.
        </p>

        <hr>

        <h3>Execution & Acceptance</h3>
        <p>Consultant Signature: ________________________ Date: ____________</p>
        <p>Client Representative Signature: ________________________ Date: ____________</p>

        <hr>
        <p style="font-size:12px;">Issued by AuditFlow Pro</p>
    `;
}