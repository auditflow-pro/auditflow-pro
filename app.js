const VERSION = "v1.3 Elite Advisory";

const CONTROLS = [
  { id:1, text:"Fire detection system operational?", weight:4 },
  { id:2, text:"Emergency exits unobstructed?", weight:4 },
  { id:3, text:"Fire extinguishers inspected and in date?", weight:4 },
  { id:4, text:"Electrical systems maintained?", weight:3 },
  { id:5, text:"Portable appliance testing current?", weight:3 },
  { id:6, text:"Distribution boards secured and labelled?", weight:3 },
  { id:7, text:"Housekeeping standards acceptable?", weight:2 },
  { id:8, text:"Access routes clearly marked?", weight:2 },
  { id:9, text:"Hazard signage visible?", weight:2 },
  { id:10, text:"Staff aware of emergency procedures?", weight:2 }
];

let responses = {};
let meta = {};
let currentIndex = 0;

const app = document.getElementById("app");

function renderRegistration(){
  app.innerHTML = `
  <div class="card">
    <h2>Audit Registration</h2>
    <input id="consultant" placeholder="Consultant Name">
    <input id="organisation" placeholder="Organisation">
    <input id="client" placeholder="Client">
    <input id="title" placeholder="Audit Title">
    <input id="date" type="date">
    <button class="primary" onclick="start()">Commence Assessment</button>
  </div>`;
}

function start(){
  meta = {
    consultant: consultant.value,
    organisation: organisation.value,
    client: client.value,
    title: title.value,
    date: date.value
  };
  renderQuestion();
}

function renderQuestion(){
  const c = CONTROLS[currentIndex];
  app.innerHTML = `
  <div class="card">
    <div class="progress">Control ${currentIndex+1} of ${CONTROLS.length}</div>
    <h2>${c.text}</h2>

    <div class="option-group">
      <button onclick="answer('YES')">YES</button>
      <button onclick="answer('NO')">NO</button>
      <button onclick="answer('NA')">N/A</button>
    </div>

    <div>
      ${currentIndex>0?'<button class="secondary" onclick="back()">Back</button>':''}
      <button class="secondary" onclick="resetAll()">Reset</button>
    </div>
  </div>`;
}

function answer(val){
  responses[CONTROLS[currentIndex].id]=val;
  if(currentIndex<CONTROLS.length-1){
    currentIndex++;
    renderQuestion();
  } else {
    determine();
  }
}

function back(){
  if(currentIndex>0){
    currentIndex--;
    renderQuestion();
  }
}

function resetAll(){
  responses={};
  currentIndex=0;
  renderRegistration();
}

function determine(){

  let total=0;
  let max=0;
  let failed=[];
  let passed=[];

  CONTROLS.forEach(c=>{
    if(responses[c.id]!=="NA"){
      max+=c.weight*2;
      if(responses[c.id]==="NO"){
        total+=c.weight*2;
        failed.push(c.text);
      } else if(responses[c.id]==="YES"){
        passed.push(c.text);
      }
    }
  });

  const percent = max===0?0:Math.round((total/max)*100);

  let level="";
  if(percent<=10) level="Level 1 – Controlled Environment";
  else if(percent<=25) level="Level 2 – Managed Exposure";
  else if(percent<=50) level="Level 3 – Significant Exposure";
  else level="Level 4 – Critical Exposure";

  renderResult(percent,level,total,max,failed,passed);
}

function renderResult(percent,level,total,max,failed,passed){

  app.innerHTML=`
  <div class="card">
    <h2>Formal Exposure Determination</h2>
    <p><strong>Version:</strong> ${VERSION}</p>
    <p><strong>Weighted Score:</strong> ${total} / ${max}</p>
    <p><strong>Exposure Ratio:</strong> ${percent}%</p>
    <h3>${level}</h3>

    <h4>Determination Basis</h4>
    <ul>${failed.map(f=>`<li>${f}</li>`).join("")}</ul>

    <button class="secondary" onclick="renderRegistration()">New Assessment</button>
    <button class="primary" onclick="generatePDF('${percent}','${level}',${total},${max},${JSON.stringify(failed)})">
      Generate Professional Report
    </button>
  </div>`;
}

function generatePDF(percent,level,total,max,failedJSON){

  const failed = JSON.parse(failedJSON);
  const timestamp = new Date().toLocaleString();

  const report = `
  <div>
    <h1>AuditFlow Pro — Exposure Determination Report</h1>
    <p><strong>Instrument Version:</strong> ${VERSION}</p>
    <p><strong>Generated:</strong> ${timestamp}</p>
    <hr>

    <h2>Registration Details</h2>
    <p><strong>Consultant:</strong> ${meta.consultant}</p>
    <p><strong>Organisation:</strong> ${meta.organisation}</p>
    <p><strong>Client:</strong> ${meta.client}</p>
    <p><strong>Audit Title:</strong> ${meta.title}</p>
    <p><strong>Assessment Date:</strong> ${meta.date}</p>

    <div style="page-break-after:always;"></div>

    <h2>Exposure Summary</h2>
    <p><strong>Weighted Score:</strong> ${total} / ${max}</p>
    <p><strong>Exposure Ratio:</strong> ${percent}%</p>
    <h3>${level}</h3>

    <div style="page-break-after:always;"></div>

    <h2>Failed Controls</h2>
    <ul>${failed.map(f=>`<li>${f}</li>`).join("")}</ul>

    <h2>Advisory Framework</h2>
    <p><strong>Immediate Action:</strong> Address failed life-safety controls without delay.</p>
    <p><strong>Short-Term:</strong> Implement corrective plan within defined review period.</p>
    <p><strong>Review Interval:</strong> Reassess following remediation actions.</p>

    <div style="page-break-after:always;"></div>

    <h2>Formal Sealing</h2>
    <p>This document represents a structured exposure determination based on weighted domain severity modelling.</p>
    <br><br>
    <p>Consultant Signature: ____________________________</p>
    <p>Client Representative Signature: ____________________________</p>
  </div>`;

  const printWindow = window.open("", "", "width=900,height=700");
  printWindow.document.write(report);
  printWindow.document.close();
  printWindow.print();
}

renderRegistration();