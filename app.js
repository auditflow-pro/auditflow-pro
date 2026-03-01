(function(){

const STORAGE_KEY = "auditflow_global_v6";

const STATUS = {
  IN_PROGRESS:"IN_PROGRESS",
  READY_REVIEW:"READY_REVIEW",
  COMPLETE:"COMPLETE"
};

const TEMPLATE = {
  site:{
    title:"Site & Environment",
    questions:[
      "Housekeeping standards consistently maintained across operational areas?",
      "Access and egress routes clearly defined and unobstructed?",
      "Segregation between pedestrian and vehicle movement effectively controlled?",
      "Emergency arrangements clearly communicated and visible?",
      "Environmental risks (noise, temperature, ventilation) assessed and controlled?",
      "Storage areas organised to prevent instability or congestion?",
      "Signage clear, consistent, and aligned with operational risk?",
      "Workspaces designed to minimise manual handling exposure?",
      "External areas maintained to prevent slips, trips, or access risk?",
      "Site security controls effective against unauthorised access?"
    ]
  },
  equipment:{
    title:"Equipment & Infrastructure",
    questions:[
      "Preventive maintenance programme implemented and current?",
      "Inspection records complete and readily accessible?",
      "Safety-critical devices tested and verified operational?",
      "Temporary equipment subject to equivalent control standards?",
      "Infrastructure integrity routinely reviewed and documented?",
      "Isolation and lockout controls clearly defined and applied?",
      "Electrical installations visually compliant and protected?",
      "Equipment guarding effective and free from bypassing?",
      "Utility systems monitored for abnormal performance?",
      "Defect reporting process clearly linked to maintenance action?"
    ]
  },
  operations:{
    title:"Operational Controls",
    questions:[
      "Documented procedures current and aligned with practice?",
      "Risk assessments reflect actual operating conditions?",
      "Control measures verified for effectiveness?",
      "Change management process applied to operational updates?",
      "Permit or authorisation systems functioning correctly?",
      "Monitoring and review processes actively maintained?",
      "Incident investigation identifies root cause, not symptoms?",
      "Corrective actions tracked to verified completion?",
      "Performance metrics used to inform operational decisions?",
      "Non-conformance handling process consistently applied?"
    ]
  },
  people:{
    title:"People & Process",
    questions:[
      "Roles and responsibilities clearly defined and understood?",
      "Training records current and competence verified?",
      "Supervision proportionate to operational risk?",
      "Communication channels effective across teams?",
      "Incident reporting culture demonstrably active?",
      "Leadership engagement visible within operational areas?",
      "Contractor controls equivalent to internal standards?",
      "Workload and staffing levels appropriate to task risk?",
      "Continuous improvement initiatives formally tracked?",
      "Governance oversight documented and periodically reviewed?"
    ]
  }
};

function $(id){ return document.getElementById(id); }
function uid(){ return Math.random().toString(16).slice(2)+"-"+Date.now().toString(16); }

function blankAudit(){
  const responses={};
  Object.keys(TEMPLATE).forEach(k=>{
    responses[k]=Array(TEMPLATE[k].questions.length).fill(null);
  });
  return{
    id:uid(),
    name:"",
    client:"",
    date:"",
    status:STATUS.IN_PROGRESS,
    activeSection:"site",
    activeIndex:0,
    responses,
    actions:[]
  };
}

function load(){
  const raw=localStorage.getItem(STORAGE_KEY);
  if(!raw) return {audits:[],activeAuditId:null,view:"audit"};
  try{ return JSON.parse(raw); }
  catch{ return {audits:[],activeAuditId:null,view:"audit"}; }
}

function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }

let state=load();

function activeAudit(){
  return state.audits.find(a=>a.id===state.activeAuditId)||null;
}

function openCount(audit){
  return audit.actions.filter(a=>a.status==="OPEN").length;
}

function statusLabel(s){
  if(s===STATUS.COMPLETE) return "Complete";
  if(s===STATUS.READY_REVIEW) return "Ready for Review";
  return "In progress";
}

function statusClass(s){
  if(s===STATUS.COMPLETE) return "complete";
  if(s===STATUS.READY_REVIEW) return "review";
  return "progress";
}

function render(){
  const audit=activeAudit();
  if(!audit) return;

  $("auditName").value=audit.name;
  $("clientName").value=audit.client;
  $("auditDate").value=audit.date;

  const pill=$("statusPill");
  pill.textContent=statusLabel(audit.status);
  pill.className="status-pill "+statusClass(audit.status);

  const disabled=!audit.name.trim();

  ["btnYes","btnNo","btnNa","btnPrev","btnNext"].forEach(id=>{
    $(id).disabled=disabled;
  });

  if(disabled){
    $("contextStrip").textContent="Audit name required to begin.";
    $("questionText").textContent="";
    return;
  }

  const section=TEMPLATE[audit.activeSection];
  const question=section.questions[audit.activeIndex];

  $("questionText").textContent=question;

  $("contextStrip").textContent=
    `${section.title} • ${audit.activeIndex+1}/${section.questions.length} • `+
    `${openCount(audit)} open • ${statusLabel(audit.status)}`;

  save();
}

function record(value){
  const audit=activeAudit();
  if(!audit||!audit.name.trim()) return;

  audit.responses[audit.activeSection][audit.activeIndex]=value;

  if(value==="NO"){
    audit.actions.push({
      id:uid(),
      sectionKey:audit.activeSection,
      questionIndex:audit.activeIndex,
      status:"OPEN"
    });
  }

  if(audit.status===STATUS.COMPLETE && openCount(audit)>0){
    audit.status=STATUS.READY_REVIEW;
  }

  render();
}

function next(delta){
  const audit=activeAudit();
  if(!audit||!audit.name.trim()) return;

  const max=TEMPLATE[audit.activeSection].questions.length-1;
  audit.activeIndex=Math.max(0,Math.min(max,audit.activeIndex+delta));
  render();
}

function createAudit(){
  const a=blankAudit();
  state.audits.push(a);
  state.activeAuditId=a.id;
  render();
}

$("btnYes").onclick=()=>record("YES");
$("btnNo").onclick=()=>record("NO");
$("btnNa").onclick=()=>record("N/A");
$("btnPrev").onclick=()=>next(-1);
$("btnNext").onclick=()=>next(1);
$("btnNewAudit").onclick=createAudit;

$("auditName").oninput=e=>{
  activeAudit().name=e.target.value;
  render();
};
$("clientName").oninput=e=>{
  activeAudit().client=e.target.value;
  save();
};
$("auditDate").onchange=e=>{
  activeAudit().date=e.target.value;
  save();
};

if(!state.activeAuditId){
  const first=blankAudit();
  state.audits.push(first);
  state.activeAuditId=first.id;
}

render();

})();