/* ===============================
   AuditFlow Pro v3.0
   Registration Data Integrity Layer
================================= */

const INSTRUMENT_VERSION = "3.0";
const STORAGE_NAMESPACE = `AFP_v${INSTRUMENT_VERSION}_REGISTRATION`;

/* ===============================
   Clear Old Versions Automatically
================================= */

(function clearLegacyStorage() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("AFP_v") && !key.startsWith(`AFP_v${INSTRUMENT_VERSION}`)) {
            localStorage.removeItem(key);
        }
    });
})();

/* ===============================
   Field Map (Deterministic)
================================= */

const fieldMap = {
    consultant: document.getElementById("consultant"),
    organisation: document.getElementById("organisation"),
    client: document.getElementById("client"),
    auditTitle: document.getElementById("auditTitle"),
    assessmentDate: document.getElementById("assessmentDate")
};

/* ===============================
   Load Stored Data Safely
================================= */

function loadRegistration() {
    const stored = localStorage.getItem(STORAGE_NAMESPACE);
    if (!stored) return;

    try {
        const data = JSON.parse(stored);

        Object.keys(fieldMap).forEach(key => {
            if (data[key] !== undefined) {
                fieldMap[key].value = data[key];
            }
        });

    } catch (e) {
        localStorage.removeItem(STORAGE_NAMESPACE);
    }
}

/* ===============================
   Save Registration Deterministically
================================= */

function saveRegistration() {
    const data = {};

    Object.keys(fieldMap).forEach(key => {
        data[key] = fieldMap[key].value || "";
    });

    localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(data));
}

/* ===============================
   Event Listeners
================================= */

Object.values(fieldMap).forEach(field => {
    field.addEventListener("input", saveRegistration);
});

/* ===============================
   Commence Button Handler
================================= */

document.getElementById("commenceBtn").addEventListener("click", () => {

    const registration = {};

    Object.keys(fieldMap).forEach(key => {
        registration[key] = fieldMap[key].value.trim();
    });

    if (!registration.consultant ||
        !registration.organisation ||
        !registration.client ||
        !registration.auditTitle ||
        !registration.assessmentDate) {

        alert("All registration fields must be completed before proceeding.");
        return;
    }

    console.log("Registration Locked:", registration);
});

/* ===============================
   Initialize
================================= */

loadRegistration();