const VERSION = "v1.1";
const CONTROLS = [
  { id:1, text:"Fire detection system operational?", weight:4 },
  { id:2, text:"Emergency exits unobstructed?", weight:4 },
  { id:3, text:"Fire extinguishers inspected and in date?", weight:4 },
  { id:4, text:"Electrical systems maintained?", weight:3 },
  { id:5, text:"Portable appliance testing current?", weight:3 },
  { id:6, text:"Distribution boards secured and labelled?", weight:3 },
  { id:7, text:"Housekeeping standards acceptable?", weight:2 },
  { id:8, text:"Access/egress routes clearly marked?", weight:2 },
  { id:9, text:"Hazard signage visible and appropriate?", weight:2 },
  { id:10, text:"Staff aware of emergency procedures?", weight:2 }
];

let responses = {};
let meta = {};

const app = document.getElementById("app");

function renderRegistration() {
  app.innerHTML = `
  <div class="card">
    <h2>Audit Registration</h2>
    <input id="consultant" placeholder="Consultant Name">
    <input id="organisation" placeholder="Organisation">
    <input id="client" placeholder="Client">
    <input id="title" placeholder="Audit Title">
    <input id="date" type="date">
    <button class="primary" onclick="startAssessment()">Commence Assessment</button>
  </div>`;
}

function startAssessment() {
  meta = {
    consultant: consultant.value,
    organisation: organisation.value,
    client: client.value,
    title: title.value,
    date: date.value
  };
  renderAssessment();
}

function renderAssessment() {
  let html = `<div class="card"><h2>Structured Exposure Assessment</h2>`;
  CONTROLS.forEach(c=>{
    html+=`
    <div class="option-group">
      <p><strong>${c.text}</strong></p>
      <button onclick="setResponse(${c.id},'YES')">YES</button>
      <button onclick="setResponse(${c.id},'NO')">NO</button>
      <button onclick="setResponse(${c.id},'NA')">N/A</button>
    </div>`;
  });
  html+=`<button class="primary" onclick="determine()">Proceed to Determination</button></div>`;
  app.innerHTML=html;
}

function setResponse(id,value){
  responses[id]=value;
}

function determine(){
  let total=0;
  let max=0;
  CONTROLS.forEach(c=>{
    if(responses[c.id]!=="NA"){
      max+=c.weight*2;
      if(responses[c.id]==="NO"){
        total+=c.weight*2;
      }
    }
  });

  const percent = max===0?0:Math.round((total/max)*100);

  let level="";
  if(percent<=10) level="Level 1 – Controlled Environment";
  else if(percent<=25) level="Level 2 – Managed Exposure";
  else if(percent<=50) level="Level 3 – Significant Exposure";
  else level="Level 4 – Critical Exposure";

  renderResult(percent,level,total,max);
}

function renderResult(percent,level,total,max){
  app.innerHTML=`
  <div class="card">
    <h2>Formal Exposure Determination</h2>
    <p><strong>Instrument Version:</strong> ${VERSION}</p>
    <p><strong>Weighted Exposure Score:</strong> ${total} / ${max}</p>
    <p><strong>Exposure Ratio:</strong> ${percent}%</p>
    <h3>${level}</h3>
    <button class="secondary" onclick="renderAssessment()">Back</button>
    <button class="primary" onclick="location.reload()">New Assessment</button>
  </div>`;
}

renderRegistration();