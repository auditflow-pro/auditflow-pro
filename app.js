(function () {
  const sectionList = document.getElementById("sectionList");
  const questionText = document.getElementById("questionText");
  const hintText = document.getElementById("hintText");

  const demoQuestions = {
    fire: "Fire extinguishers present and accessible?",
    electrical: "Electrical cables free from damage?",
    environment: "Floors free from trip hazards?",
    ppe: "PPE available where required?"
  };

  function setActiveSection(targetSectionKey) {
    const sections = sectionList.querySelectorAll(".section");
    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      el.classList.toggle("active", key === targetSectionKey);
    });

    const newQuestion = demoQuestions[targetSectionKey] || "Question not found.";
    questionText.textContent = newQuestion;

    hintText.textContent = `Section set to "${targetSectionKey}". (Demo only)`;
  }

  sectionList.addEventListener("click", (e) => {
    const item = e.target.closest(".section");
    if (!item) return;
    const key = item.getAttribute("data-section");
    if (!key) return;
    setActiveSection(key);
  });

  // Keep default consistent with the initial HTML active state
  setActiveSection("fire");
})();
