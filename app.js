/* AuditFlow Pro — Domain Loader Engine
Version: v7.0
Purpose: Dynamic domain loading and audit navigation
*/

let domainLibrary = [];
let currentDomainIndex = 0;
let auditResponses = {};
let auditMeta = {};

/* ---------- INITIALISE APPLICATION ---------- */

document.addEventListener("DOMContentLoaded", async () => {

    initialiseDate();
    await loadDomainLibrary();

});

/* ---------- DATE INITIALISATION ---------- */

function initialiseDate() {

    const dateField = document.getElementById("assessmentDate");

    if (!dateField) return;

    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    dateField.value = formatted;
}

/* ---------- LOAD DOMAIN REGISTRY ---------- */

async function loadDomainLibrary() {

    try {

        const response = await fetch("domains/domain-library.json");
        const data = await response.json();

        domainLibrary = data.domains;

        console.log("Domain library loaded:", domainLibrary.length);

    } catch (error) {

        console.error("Domain library failed to load", error);

    }

}

/* ---------- REGISTER AUDIT ---------- */

function registerAudit() {

    const consultant = document.getElementById("consultant").value;
    const organisation = document.getElementById("organisation").value;
    const client = document.getElementById("clientSite").value;
    const title = document.getElementById("auditTitle").value;
    const date = document.getElementById("assessmentDate").value;

    if (!client || !title) {

        alert("Client / Site and Audit Title are required.");
        return;

    }

    auditMeta = {
        consultant,
        organisation,
        client,
        title,
        date,
        reference: generateAFPReference()
    };

    startAudit();

}

/* ---------- AFP REFERENCE ---------- */

function generateAFPReference() {

    const now = new Date();
    const datePart =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const sequence = Math.floor(Math.random() * 9000 + 1000);

    return `AFP-${datePart}-${sequence}`;

}

/* ---------- START AUDIT ---------- */

async function startAudit() {

    currentDomainIndex = 0;

    await loadDomain(currentDomainIndex);

}

/* ---------- LOAD DOMAIN ---------- */

async function loadDomain(index) {

    const domain = domainLibrary[index];

    const response = await fetch(domain.file);
    const data = await response.json();

    renderDomain(domain.name, data.controls);

}

/* ---------- RENDER DOMAIN ---------- */

function renderDomain(domainName, controls) {

    const container = document.getElementById("auditContainer");

    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = domainName;

    container.appendChild(title);

    controls.forEach(control => {

        const block = document.createElement("div");
        block.className = "control-block";

        const question = document.createElement("p");
        question.textContent = control.question;

        block.appendChild(question);

        block.appendChild(createAnswerButton(control.id, "YES"));
        block.appendChild(createAnswerButton(control.id, "NO"));
        block.appendChild(createAnswerButton(control.id, "NA"));

        container.appendChild(block);

    });

    const nextButton = document.createElement("button");

    nextButton.textContent = "Next Domain";
    nextButton.className = "nav-button";

    nextButton.onclick = nextDomain;

    container.appendChild(nextButton);

}

/* ---------- ANSWER BUTTON ---------- */

function createAnswerButton(controlId, answer) {

    const button = document.createElement("button");

    button.textContent = answer;

    button.onclick = () => recordAnswer(controlId, answer);

    return button;

}

/* ---------- RECORD ANSWER ---------- */

function recordAnswer(controlId, answer) {

    auditResponses[controlId] = answer;

}

/* ---------- NEXT DOMAIN ---------- */

async function nextDomain() {

    currentDomainIndex++;

    if (currentDomainIndex >= domainLibrary.length) {

        finishAudit();
        return;

    }

    await loadDomain(currentDomainIndex);

}

/* ---------- FINISH AUDIT ---------- */

function finishAudit() {

    console.log("Audit complete");

    const result = calculateExposure();

    displayResult(result);

}

/* ---------- EXPOSURE ENGINE ---------- */

function calculateExposure() {

    let failures = 0;
    let total = 0;

    Object.values(auditResponses).forEach(answer => {

        total++;

        if (answer === "NO") failures++;

    });

    const ratio = failures / total;

    let classification = "Acceptable";

    if (ratio > 0.6) classification = "Critical";
    else if (ratio > 0.4) classification = "Serious";
    else if (ratio > 0.2) classification = "Moderate";

    return {
        ratio,
        classification
    };

}

/* ---------- DISPLAY RESULT ---------- */

function displayResult(result) {

    const container = document.getElementById("auditContainer");

    container.innerHTML = "";

    const header = document.createElement("h2");
    header.textContent = "Exposure Determination";

    const ref = document.createElement("p");
    ref.textContent = "AFP Reference: " + auditMeta.reference;

    const classification = document.createElement("p");
    classification.textContent = "Exposure Classification: " + result.classification;

    const ratio = document.createElement("p");
    ratio.textContent = "Aggregate Ratio: " + result.ratio.toFixed(3);

    container.appendChild(header);
    container.appendChild(ref);
    container.appendChild(classification);
    container.appendChild(ratio);

}