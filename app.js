// AuditFlow Pro – Workflow Authority Hardening V1
// £59.99 Instrument Behaviour

const sections = [
  {
    name: "Site & Environment",
    questions: [
      "Work areas clean and free from hazards?",
      "Access routes clearly marked?",
      "Lighting adequate?",
      "Waste management controlled?",
      "Emergency exits unobstructed?",
      "Housekeeping standards maintained?",
      "Storage areas organised?",
      "Signage visible and clear?",
      "Environmental risks identified?",
      "Controls implemented effectively?"
    ]
  },
  {
    name: "Equipment & Infrastructure",
    questions: [
      "Equipment maintained appropriately?",
      "Inspection records available?",
      "Electrical systems compliant?",
      "Safety guards in place?",
      "Calibration up to date?",
      "Infrastructure structurally sound?",
      "Ventilation systems functional?",
      "Water systems safe?",
      "Fire detection operational?",
      "Backup systems available?"
    ]
  },
  {
    name: "Operational Controls",
    questions: [
      "Procedures aligned with practice?",
      "Risk assessments current?",
      "Supervision adequate?",
      "Training records available?",
      "Incident reporting functional?",
      "Monitoring systems active?",
      "Corrective actions tracked?",
      "Permit systems enforced?",
      "Change management controlled?",
      "Compliance reviews conducted?"
    ]
  },
  {
    name: "People & Process",
    questions: [
      "Roles clearly defined?",
      "Competency verified?",
      "Communication effective?",
      "Leadership oversight present?",
      "Escalation procedures defined?",
      "Performance reviewed regularly?",
      "Accountability assigned?",
      "Documentation controlled?",
      "Continuous improvement evident?",
      "Governance oversight effective?"
    ]
  }
];

let state = {
  currentSection: 0,
  currentQuestion: 0,
  answers: {},
  auditName: "",
  client: "",
  date: new Date().toLocaleDateString(),
  status: "IN PROGRESS"
};

function init() {
  document.getElementById("auditDate").innerText = state.date;
  render();
}

function render() {
  renderStatus();
  renderSectionHeader();
  renderQuestion();
}

function renderStatus() {
  const badge = document.getElementById("statusBadge");
  badge.innerText = state.status;
  badge.className = "status-badge " + state.status.replace(" ", "-").toLowerCase();
}

function renderSectionHeader() {
  const section = sections[state.currentSection];
  const answered = getSectionAnswered(state.currentSection);
  document.getElementById("sectionHeader").innerText =
    section.name + " • " + answered + "/" + section.questions.length + " answered";
}

function renderQuestion() {
  const section = sections[state.currentSection];
  const question = section.questions[state.currentQuestion];

  document.getElementById("questionText").innerText = question;
}

function answer(value) {
  const key = state.currentSection + "-" + state.currentQuestion;
  state.answers[key] = value;

  autoAdvance();
}

function autoAdvance() {
  const section = sections[state.currentSection];

  if (state.currentQuestion < section.questions.length - 1) {
    state.currentQuestion++;
    render();
  } else {
    showSectionComplete();
  }
}

function showSectionComplete() {
  const panel = document.getElementById("completionPanel");
  const section = sections[state.currentSection];

  panel.innerText = "SECTION COMPLETE\n" + section.name.toUpperCase();
  panel.style.display = "block";

  setTimeout(() => {
    panel.style.display = "none";
    moveToNextSection();
  }, 1200);
}

function moveToNextSection() {
  if (state.currentSection < sections.length - 1) {
    state.currentSection++;
    state.currentQuestion = 0;
    render();
  } else {
    state.status = "COMPLETE";
    render();
  }
}

function previous() {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    render();
  }
}

function getSectionAnswered(sectionIndex) {
  let count = 0;
  sections[sectionIndex].questions.forEach((_, i) => {
    if (state.answers[sectionIndex + "-" + i]) count++;
  });
  return count;
}

window.answerYes = () => answer("YES");
window.answerNo = () => answer("NO");
window.answerNA = () => answer("N/A");
window.previous = previous;

window.onload = init;