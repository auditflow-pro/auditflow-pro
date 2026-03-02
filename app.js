const VERSION = "v1.5 Institutional";

const CONTROLS = [
  { id:1, domain:"Fire", text:"Fire detection system operational?", weight:4 },
  { id:2, domain:"Fire", text:"Emergency exits unobstructed?", weight:4 },
  { id:3, domain:"Fire", text:"Fire extinguishers inspected and in date?", weight:4 },
  { id:4, domain:"Electrical", text:"Electrical systems maintained?", weight:3 },
  { id:5, domain:"Electrical", text:"Portable appliance testing current?", weight:3 },
  { id:6, domain:"Electrical", text:"Distribution boards secured?", weight:3 },
  { id:7, domain:"General", text:"Housekeeping standards acceptable?", weight:2 },
  { id:8, domain:"General", text:"Access routes clearly marked?", weight:2 },
  { id:9, domain:"General", text:"Hazard signage visible?", weight:2 },
  { id:10, domain:"General", text:"Staff aware of emergency procedures?", weight:2 }
];

let responses = {};
let meta = {};
let index = 0;

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
  const c = CONTROLS[index];
  app.innerHTML = `
  <div class="card">
    <div class="progress">Control ${index+1} of ${CONTROLS.length}</div>
    <h2>${c.text}</h2>
    <button onclick="answer('YES')">YES</button>
    <button onclick="answer('NO')">NO</button>
    <button onclick="answer('NA')">N/A</button>
    <br><br>
    ${index>0?'<button class="secondary" onclick="back()">Back</button>':''}
    <button class="secondary" onclick="resetAll()">Reset</button>
  </div>`;
}

function answer(val){
  responses[CONTROLS[index].id]=val;
  if(index<CONTROLS.length-1){
    index++;
    renderQuestion();
  } else {
    determine();
  }
}

function back(){ index--; renderQuestion(); }
function resetAll(){ responses={}; index=0; renderRegistration(); }

function determine(){

  let total=0;
  let max=0;
  let domainScores={Fire:0,Electrical:0,General:0};
  let domainMax={Fire:0,Electrical:0,General:0};
  let failed=[];

  CONTROLS.forEach(c=>{
    if(responses[c.id]!=="NA"){
      domainMax[c.domain]+=c.weight*2;
      max+=c.weight*2;
      if(responses[c.id]==="NO"){
        domainScores[c.domain]+=c.weight*2;
        total+=c.weight*2;
        failed.push(c);
      }
    }
  });

  const percent = max===0?0:Math.round((total/max)*100);

  let level="";
  if(percent<=10) level="Level 1 – Controlled Environment";
  else if(percent<=25) level="Level 2 – Managed Exposure";
  else if(percent<=50) level="Level 3 – Significant Exposure";
  else level="Level 4 – Critical Exposure";

  const recordID = generateRecordID();

  renderResult(percent,level,total,max,domainScores,domainMax,failed,recordID);
}

function generateRecordID(){
  const now=new Date();
  return `AFP-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours()}${now.getMinutes()}`;
}

function renderResult(percent,level,total,max,domainScores,domainMax,failed,recordID){

  const domainBreakdown = Object.keys(domainScores).map(d=>{
    const pct = domainMax[d]===0?0:Math.round((domainScores[d]/domainMax[d])*100);
    return `<li>${d} Exposure: ${pct}%</li>`;
  }).join("");

  const priority = failed.sort((a,b)=>b.weight-a.weight)
    .map(f=>`<li>${f.text}</li>`).join("");

  app.innerHTML=`
  <div class="card">
    <h2>Institutional Exposure Determination</h2>
    <p><strong>Record ID:</strong> ${recordID}</p>
    <p><strong>Version:</strong> ${VERSION}</p>
    <p><strong>Total Exposure:</strong> ${percent}%</p>
    <h3>${level}</h3>

    <h4>Domain Concentration</h4>
    <ul>${domainBreakdown}</ul>

    <h4>Priority Ranking</h4>
    <ul>${priority}</ul>

    <h4>Action Framework</h4>
    <p>Immediate: Address highest-weight failed controls.</p>
    <p>Short-Term: Implement corrective plan.</p>
    <p>Review: Reassess post-remediation.</p>

    <button class="secondary" onclick="renderRegistration()">New Assessment</button>
    <button class="primary" onclick="window.print()">Generate Institutional Report</button>
  </div>`;
}

renderRegistration();