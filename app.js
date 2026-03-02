const VERSION = "v1.6 Institutional";

const CONTROLS = [
  { id:1, domain:"Fire Safety", text:"Fire detection system operational?", weight:4 },
  { id:2, domain:"Fire Safety", text:"Emergency exits unobstructed?", weight:4 },
  { id:3, domain:"Fire Safety", text:"Fire extinguishers inspected and in date?", weight:4 },
  { id:4, domain:"Electrical Safety", text:"Electrical systems maintained?", weight:3 },
  { id:5, domain:"Electrical Safety", text:"Portable appliance testing current?", weight:3 },
  { id:6, domain:"Electrical Safety", text:"Distribution boards secured?", weight:3 },
  { id:7, domain:"General Safety", text:"Housekeeping standards acceptable?", weight:2 },
  { id:8, domain:"General Safety", text:"Access routes clearly marked?", weight:2 },
  { id:9, domain:"General Safety", text:"Hazard signage visible?", weight:2 },
  { id:10, domain:"General Safety", text:"Staff aware of emergency procedures?", weight:2 }
];

let responses = {};
let index = 0;

const app = document.getElementById("app");

function renderRegistration(){
  app.innerHTML = `
  <div class="card">
    <div class="instrument-meta">
      Version: ${VERSION} | Methodology: Weighted Domain Severity Model
    </div>
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
  renderAssessment();
}

function renderAssessment(){

  let grouped = {};
  CONTROLS.forEach(c=>{
    if(!grouped[c.domain]) grouped[c.domain]=[];
    grouped[c.domain].push(c);
  });

  let html = `<div class="card">
  <div class="instrument-meta">
    Version: ${VERSION} | Structured Institutional Classification
  </div>
  <h2>Structured Exposure Assessment</h2>`;

  Object.keys(grouped).forEach(domain=>{
    html += `<div class="domain-title"><strong>${domain}</strong></div>`;
    grouped[domain].forEach(c=>{
      html += `
        <p>${c.text}</p>
        <div class="response-group">
          ${["YES","NO","NA"].map(v=>`
            <span class="response-option ${responses[c.id]===v?"selected":""}"
              onclick="selectResponse(${c.id},'${v}')">${v}</span>
          `).join("")}
        </div>`;
    });
  });

  html += `
    <button class="secondary" onclick="renderRegistration()">Back</button>
    <button class="primary" onclick="determine()">Determine Exposure</button>
  </div>`;

  app.innerHTML = html;
}

function selectResponse(id,val){
  responses[id]=val;
  renderAssessment();
}

function determine(){

  let total=0, max=0;

  CONTROLS.forEach(c=>{
    if(responses[c.id]!=="NA"){
      max += c.weight*2;
      if(responses[c.id]==="NO"){
        total += c.weight*2;
      }
    }
  });

  const percent = max===0?0:Math.round((total/max)*100);

  let level="";
  if(percent<=10) level="Level 1 – Controlled Environment";
  else if(percent<=25) level="Level 2 – Managed Exposure";
  else if(percent<=50) level="Level 3 – Significant Exposure";
  else level="Level 4 – Critical Exposure";

  app.innerHTML = `
  <div class="card">
    <div class="instrument-meta">
      Version: ${VERSION} | Deterministic Classification Output
    </div>
    <h2>Institutional Determination</h2>

    <div class="certificate-block">
      <p><strong>Exposure Ratio:</strong> ${percent}%</p>
      <h3>${level}</h3>
      <p>This determination is derived from weighted domain severity modelling.</p>
    </div>

    <button class="secondary" onclick="renderAssessment()">Back</button>
    <button class="primary" onclick="window.print()">Generate Institutional Report</button>
  </div>`;
}

renderRegistration();