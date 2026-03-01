// AuditFlow Pro – Fully Wired V1 (£59.99 Standard)

const sections = [
  { name: "Site & Environment", questions: 10 },
  { name: "Equipment & Infrastructure", questions: 10 },
  { name: "Operational Controls", questions: 10 },
  { name: "People & Process", questions: 10 }
];

let state = {
  currentSection: 0,
  currentQuestion: 0,
  answers: {}, // key: "section-question" value: YES/NO/NA
  auditName: "",
  client: "",
  date: new Date().toLocaleDateString("en-GB"),
  status: "IN PROGRESS"
};

function init() {
  document.getElementById("auditDate").innerText = state.date;
  wireNavigation();
  render();
}

function wireNavigation() {
  document.querySelectorAll(".navitem").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".navitem").forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      const view = item.dataset.view;

      document.getElementById("auditView").style.display = view === "audit" ? "block" : "none";
      document.getElementById("actionsView").style.display = view === "actions" ? "block" : "none";
      document.getElementById("summaryView").style.display = view === "summary" ? "block" : "none";

      if (view === "actions") renderActions();
      if (view === "summary") renderSummary();
    });
  });
}

function render() {
  renderStatus();
  renderSection();
  renderQuestion();
}

function renderStatus() {
  const badge = document.getElementById("statusBadge");
  badge.innerText = state.status;
  badge.className = "status-badge";
  if (state.status === "COMPLETE") badge.classList.add("complete");
}

function renderSection() {
  const section = sections[state.currentSection];
  const answered = getSectionAnswered(state.currentSection);
  document.getElementById("sectionHeader").innerText =
    section.name + " • " + answered + "/" + section.questions + " answered";
}

function renderQuestion() {
  const section = sections[state.currentSection];
  document.getElementById("questionText").innerText =
    section.name + " – Question " + (state.currentQuestion + 1);
}

function answer(value) {
  const key = state.currentSection + "-" + state.currentQuestion;
  state.answers[key] = value;

  autoAdvance();
}

function autoAdvance() {
  if (state.currentQuestion < sections[state.currentSection].questions - 1) {
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
    moveNextSection();
  }, 1200);
}

function moveNextSection() {
  if (state.currentSection < sections.length - 1) {
    state.currentSection++;
    state.currentQuestion = 0;
    render();
  } else {
    state.status = "COMPLETE";
    renderStatus();
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
  for (let i = 0; i < sections[sectionIndex].questions; i++) {
    if (state.answers[sectionIndex + "-" + i]) count++;
  }
  return count;
}

function renderActions() {
  const container = document.getElementById("actionsList");
  container.innerHTML = "";

  let hasActions = false;

  Object.keys(state.answers).forEach(key => {
    if (state.answers[key] === "NO") {
      hasActions = true;
      const [sectionIndex, questionIndex] = key.split("-");

      const div = document.createElement("div");
      div.style.padding = "12px 0";
      div.style.borderBottom = "1px solid #e3e6ee";
      div.innerHTML =
        "<strong>" +
        sections[sectionIndex].name +
        "</strong> – Question " +
        (parseInt(questionIndex) + 1);
      container.appendChild(div);
    }
  });

  if (!hasActions) {
    container.innerHTML = "<p>No open actions.</p>";
  }
}

function renderSummary() {
  const container = document.getElementById("summaryContent");
  container.innerHTML = "";

  sections.forEach((section, index) => {
    const answered = getSectionAnswered(index);
    const div = document.createElement("div");
    div.style.padding = "12px 0";
    div.style.borderBottom = "1px solid #e3e6ee";
    div.innerHTML =
      "<strong>" +
      section.name +
      "</strong><br>" +
      answered +
      "/" +
      section.questions +
      " answered";
    container.appendChild(div);
  });

  const exportBtn = document.createElement("button");
  exportBtn.innerText = "Export Report";
  exportBtn.className = "primary-btn";
  exportBtn.style.marginTop = "20px";
  exportBtn.onclick = () => window.print();

  container.appendChild(exportBtn);
}

window.answerYes = () => answer("YES");
window.answerNo = () => answer("NO");
window.answerNA = () => answer("N/A");
window.previous = previous;

window.onload = init;