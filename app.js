// AuditFlow Pro – Operational Report Engine (Printer Safe)

function renderSummary() {
  const container = document.getElementById("summaryContent");
  container.innerHTML = "";

  const auditName = document.getElementById("auditName").value || "—";
  const client = document.getElementById("clientName").value || "—";
  const date = document.getElementById("auditDate").innerText;
  const status = state.status;
  const generated = new Date().toLocaleDateString("en-GB");

  const findings = state.actions.filter(a => a.status === "Open");

  // =====================
  // REPORT HEADER
  // =====================

  container.innerHTML += `
    <div class="report-header">
      <h1>Operational Assessment Report</h1>
      <div class="report-meta">
        <div><strong>Audit:</strong> ${auditName}</div>
        <div><strong>Client:</strong> ${client}</div>
        <div><strong>Audit Date:</strong> ${date}</div>
        <div><strong>Status:</strong> ${status}</div>
        <div><strong>Report Generated:</strong> ${generated}</div>
      </div>
    </div>
  `;

  // =====================
  // EXECUTIVE OVERVIEW
  // =====================

  container.innerHTML += `
    <div class="report-section">
      <h2>Executive Operational Overview</h2>
      <ul>
        <li>Total Domains Assessed: ${Object.keys(questionBank).length}</li>
        <li>Total Findings Identified: ${findings.length}</li>
        <li>Open Actions Requiring Remediation: ${findings.length}</li>
      </ul>
      <p>
        This assessment evaluated operational, structural and governance controls 
        across defined domains. Findings reflect identified control deficiencies 
        requiring structured remediation.
      </p>
    </div>
  `;

  // =====================
  // DOMAIN SUMMARY
  // =====================

  container.innerHTML += `<div class="report-section"><h2>Domain Assessment Summary</h2>`;

  Object.keys(questionBank).forEach((domain, index) => {
    const total = questionBank[domain].length;
    const answered = getAnswered(index);
    const domainFindings = findings.filter(f => f.section === domain).length;

    container.innerHTML += `
      <div class="domain-summary">
        <strong>${domain}</strong><br>
        Questions Evaluated: ${answered}/${total}<br>
        Findings: ${domainFindings}
      </div>
    `;
  });

  container.innerHTML += `</div>`;

  // =====================
  // ACTION REGISTER
  // =====================

  container.innerHTML += `
    <div class="report-section">
      <h2>Action Register</h2>
      <table class="report-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Finding</th>
            <th>Recommended Action</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  findings.forEach(f => {
    container.innerHTML += `
      <tr>
        <td>${f.section}</td>
        <td>${f.questionText}</td>
        <td>${f.recommendedAction || "—"}</td>
        <td>${f.status}</td>
      </tr>
    `;
  });

  container.innerHTML += `
        </tbody>
      </table>
    </div>
  `;

  // =====================
  // METHODOLOGY
  // =====================

  container.innerHTML += `
    <div class="report-section">
      <h2>Methodology</h2>
      <p>
        This operational assessment utilises structured response logic to identify 
        control deficiencies and generate corrective actions across defined domains.
      </p>
    </div>
  `;
}