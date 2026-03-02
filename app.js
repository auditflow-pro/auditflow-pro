const instrumentVersion = "v1.0";

const instrumentDefinition = [
    {
        domain: "Site & Environment",
        tier4: true,
        questions: [
            { text: "Fire detection system fully operational?", tier: 4 },
            { text: "Emergency exits unobstructed?", tier: 4 },
            { text: "General housekeeping maintained?", tier: 2 }
        ]
    }
];

let state = {
    answers: {},
    initialAnswers: {},
    sealed: false,
    recordId: null,
    sealTimestamp: null
};

document.getElementById("startAuditBtn").addEventListener("click", startAssessment);
document.getElementById("sealBtn").addEventListener("click", sealAssessment);
document.getElementById("exportBtn").addEventListener("click", () => {
    document.getElementById("exportOptions").classList.remove("hidden");
});
document.getElementById("cancelExportBtn").addEventListener("click", () => {
    document.getElementById("exportOptions").classList.add("hidden");
});
document.getElementById("printBtn").addEventListener("click", () => window.print());

function startAssessment() {
    const consultant = document.getElementById("consultantName").value;
    const client = document.getElementById("clientName").value;
    const title = document.getElementById("auditTitle").value;
    const date = document.getElementById("assessmentDate").value;

    if (!consultant || !client || !title || !date) {
        alert("All registration fields must be completed.");
        return;
    }

    document.getElementById("registrationPanel").classList.add("hidden");
    document.getElementById("assessmentSection").classList.remove("hidden");

    renderDomains();
}

function renderDomains() {
    const container = document.getElementById("domainsContainer");
    container.innerHTML = "";

    instrumentDefinition.forEach((domainObj, domainIndex) => {
        const block = document.createElement("div");
        block.className = "domain-block";

        const title = document.createElement("h3");
        title.textContent = domainObj.domain;
        block.appendChild(title);

        domainObj.questions.forEach((question, qIndex) => {
            const qBlock = document.createElement("div");
            qBlock.className = "question-block";

            const qText = document.createElement("div");
            qText.className = "question-text";
            qText.textContent = question.text;
            qBlock.appendChild(qText);

            ["YES", "NO", "N/A"].forEach(option => {
                const btn = document.createElement("button");
                btn.className = "answer-btn";
                btn.textContent = option;

                btn.addEventListener("click", () => handleAnswer(domainIndex, qIndex, option, btn, qBlock));
                qBlock.appendChild(btn);
            });

            block.appendChild(qBlock);
        });

        container.appendChild(block);
    });
}

function handleAnswer(domainIndex, qIndex, value, btn, qBlock) {
    const key = `${domainIndex}_${qIndex}`;

    if (!state.initialAnswers[key]) {
        state.initialAnswers[key] = value;
    }

    state.answers[key] = value;

    const buttons = qBlock.querySelectorAll(".answer-btn");
    buttons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    let recordLine = qBlock.querySelector(".answer-recorded");
    if (!recordLine) {
        recordLine = document.createElement("div");
        recordLine.className = "answer-recorded";
        qBlock.appendChild(recordLine);
    }

    recordLine.textContent = `Answer Recorded: ${value}`;

    let modifiedLine = qBlock.querySelector(".modified-flag");
    if (state.initialAnswers[key] !== value) {
        if (!modifiedLine) {
            modifiedLine = document.createElement("div");
            modifiedLine.className = "modified-flag";
            modifiedLine.textContent = "Status: Modified";
            qBlock.appendChild(modifiedLine);
        }
    } else if (modifiedLine) {
        modifiedLine.remove();
    }

    evaluateExposure();
}

function evaluateExposure() {
    const exposureBlock = document.getElementById("globalExposureBlock");
    exposureBlock.classList.remove("hidden");

    let critical = false;

    instrumentDefinition.forEach((domainObj, dIndex) => {
        domainObj.questions.forEach((q, qIndex) => {
            const key = `${dIndex}_${qIndex}`;
            if (q.tier === 4 && state.answers[key] === "NO") {
                critical = true;
            }
        });
    });

    if (critical) {
        exposureBlock.textContent = "Overall Exposure Classification: Critical Exposure";
    } else {
        exposureBlock.textContent = "Overall Exposure Classification: Controlled Exposure";
    }
}

function sealAssessment() {
    if (state.sealed) return;

    state.sealed = true;
    state.recordId = "AFP-" + Date.now();
    state.sealTimestamp = new Date().toISOString();

    generateDocument();
}

function generateDocument() {
    document.getElementById("assessmentSection").classList.add("hidden");
    document.getElementById("documentSection").classList.remove("hidden");

    const content = document.getElementById("documentContent");

    content.innerHTML = `
        <h2>Exposure Determination Record</h2>
        <p><strong>Instrument Version:</strong> ${instrumentVersion}</p>
        <p class="record-id"><strong>Record ID:</strong> ${state.recordId}</p>
        <p><strong>Seal Timestamp:</strong> ${state.sealTimestamp}</p>
        <hr />
        <p>This determination has been produced using calibrated weighted exposure analysis across structured compliance domains.</p>
        <hr />
        <h3>Execution & Acceptance</h3>
        <p>Consultant Signature: ________________________ Date: ____________</p>
        <p>Client Representative Signature: ________________________ Date: ____________</p>
    `;
}