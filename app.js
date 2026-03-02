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

let state = {
    answers: {},
    initial: {},
    sealed: false,
    recordId: "",
    timestamp: ""
};

document.getElementById("startBtn").addEventListener("click", startAssessment);
document.getElementById("sealBtn").addEventListener("click", sealAssessment);
document.getElementById("exportBtn").addEventListener("click", () => {
    document.getElementById("exportOptions").classList.remove("hidden");
});
document.getElementById("cancelExportBtn").addEventListener("click", () => {
    document.getElementById("exportOptions").classList.add("hidden");
});
document.getElementById("printBtn").addEventListener("click", () => window.print());

function startAssessment() {
    const consultant = consultantName.value.trim();
    const client = clientName.value.trim();
    const title = auditTitle.value.trim();
    const date = assessmentDate.value;

    if (!consultant || !client || !title || !date) {
        const error = document.getElementById("registrationError");
        error.textContent = "All registration fields must be completed before assessment can begin.";
        error.classList.remove("hidden");
        return;
    }

    registrationPanel.classList.add("hidden");
    assessmentSection.classList.remove("hidden");

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

            ["YES", "NO", "N/A"].forEach(option => {
                const btn = document.createElement("button");
                btn.className = "answer-btn";
                btn.textContent = option;

                btn.onclick = () => handleAnswer(dIndex, qIndex, option, btn, qBlock);
                qBlock.appendChild(btn);
            });

            block.appendChild(qBlock);
        });

        container.appendChild(block);
    });
}

function handleAnswer(dIndex, qIndex, value, btn, qBlock) {
    const key = `${dIndex}_${qIndex}`;

    if (!state.initial[key]) state.initial[key] = value;

    state.answers[key] = value;

    const buttons = qBlock.querySelectorAll(".answer-btn");
    buttons.forEach(b => b.className = "answer-btn");

    if (value === "YES") btn.classList.add("selected-yes");
    if (value === "NO") btn.classList.add("selected-no");
    if (value === "N/A") btn.classList.add("selected-na");

    let recorded = qBlock.querySelector(".answer-recorded");
    if (!recorded) {
        recorded = document.createElement("div");
        recorded.className = "answer-recorded";
        qBlock.appendChild(recorded);
    }
    recorded.textContent = `Answer Recorded: ${value}`;

    let modified = qBlock.querySelector(".modified-flag");
    if (state.initial[key] !== value) {
        if (!modified) {
            modified = document.createElement("div");
            modified.className = "modified-flag";
            modified.textContent = "Status: Modified";
            qBlock.appendChild(modified);
        }
    } else if (modified) {
        modified.remove();
    }

    evaluateExposure();
}

function evaluateExposure() {
    const exposureBlock = document.getElementById("globalExposure");
    exposureBlock.classList.remove("hidden");

    let critical = false;

    instrument.forEach((domain, dIndex) => {
        domain.questions.forEach((q, qIndex) => {
            const key = `${dIndex}_${qIndex}`;
            if (q.tier === 4 && state.answers[key] === "NO") critical = true;
        });
    });

    exposureBlock.textContent = critical
        ? "Overall Exposure Classification: Critical Exposure"
        : "Overall Exposure Classification: Controlled Exposure";
}

function sealAssessment() {
    state.recordId = generateRecordId();
    state.timestamp = formatTimestamp(new Date());

    assessmentSection.classList.add("hidden");
    documentSection.classList.remove("hidden");

    generateDocument();
}

function generateRecordId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `AFP-${y}${m}${d}-${hh}${mm}${ss}`;
}

function formatTimestamp(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
}

function generateDocument() {
    const content = document.getElementById("documentContent");

    content.innerHTML = `
        <h2>Exposure Determination Record</h2>
        <p>AuditFlow Pro — Professional Instrument System</p>
        <p><strong>Instrument Version:</strong> ${instrumentVersion}</p>
        <p class="record-id"><strong>Record ID:</strong> ${state.recordId}</p>
        <p><strong>Determination Timestamp:</strong> ${state.timestamp}</p>
        <hr>
        <p>This determination has been produced using calibrated weighted exposure analysis across structured compliance domains.</p>
        <hr>
        <h3>Execution & Acceptance</h3>
        <p>Consultant Signature: ________________________ Date: ____________</p>
        <p>Client Representative Signature: ________________________ Date: ____________</p>
        <hr>
        <p style="font-size:12px;">Issued by AuditFlow Pro</p>
    `;
}