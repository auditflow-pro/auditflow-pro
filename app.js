(function(){

const STORAGE_KEY = "auditflow_global_v3";

const STATUS = {
  IN_PROGRESS:"IN_PROGRESS",
  READY_REVIEW:"READY_REVIEW",
  COMPLETE:"COMPLETE"
};

const TEMPLATE = {
  site:{
    title:"Site & Environment",
    questions:[
      "Work areas clean and free from hazards?",
      "Access and egress routes clear?",
      "Environmental conditions acceptable?",
      "Emergency arrangements adequate?"
    ]
  },
  equipment:{
    title:"Equipment & Infrastructure",
    questions:[
      "Equipment maintained and inspected?",
      "Infrastructure structurally sound?",
      "Safety devices operational?",
      "Utilities functioning safely?"
    ]
  },
  operations:{
    title:"Operational Controls",
    questions:[
      "Documented procedures available?",
      "Controls implemented effectively?",
      "Monitoring mechanisms in place?",
      "Non-conformance handled correctly?"
    ]
  },
  people:{
    title:"People & Process",
    questions:[
      "Staff trained and competent?",
      "Responsibilities clearly assigned?",
      "Incident reporting functional?",
      "Continuous improvement evident?"
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
  if(!raw) return {audits:[],activeAuditId:null};
  try{ return JSON.parse(raw); }
  catch{ return {audits:[],activeAuditId:null}; }
}

function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }

let state=load();

function activeAudit(){
  return state.audits.find(a=>a.id===state.activeAuditId)||null;
}

function openCount(audit){
  return audit.actions.filter(a=>a.status==="OPEN").length;
}

function sectionStats(audit,key){
  const arr=audit.responses[key];
  return{
    answered:arr.filter(Boolean).length,
    total:arr.length,
    open:audit.actions.filter(a=>a.sectionKey===key&&a.status==="OPEN").length
  };
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

function updateIdentityFields(audit){
  $("auditName").value = audit.name;
  $("clientName").value = audit.client;
  $("auditDate").value = audit.date;

  const pill = $("statusPill");
  pill.textContent = statusLabel(audit.status);
  pill.className = "status-pill " + statusClass(audit.status);
}

function updateButtonsState(audit){
  const disabled = !audit.name.trim();
  ["btnYes","btnNo","btnNa","btnPrev","btnNext"].forEach(id=>{
    $(id).disabled = disabled;
  });

  if(disabled){
    $("contextStrip").textContent = "Audit name required to begin.";
  }
}

function renderAudit(){
  const audit = activeAudit();
  if(!audit) return;

  updateIdentityFields(audit);
  updateButtonsState(audit);

  if(!audit.name.trim()) return;

  const section = TEMPLATE[audit.activeSection];
  const question = section.questions[audit.activeIndex];

  $("questionText").textContent = question;

  const stats = sectionStats(audit,audit.activeSection);
  const totalOpen = openCount(audit);

  $("contextStrip").textContent =
    `${section.title} • ${stats.answered}/${stats.total} answered • ` +
    `${stats.open} open in section (${totalOpen} total) • ` +
    `${statusLabel(audit.status)}`;

  save();
}

function record(value){
  const audit = activeAudit();
  if(!audit || !audit.name.trim()) return;

  audit.responses[audit.activeSection][audit.activeIndex] = value;

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

  renderAudit();
}

function next(delta){
  const audit = activeAudit();
  if(!audit || !audit.name.trim()) return;

  const max = TEMPLATE[audit.activeSection].questions.length-1;
  audit.activeIndex = Math.max(0,Math.min(max,audit.activeIndex+delta));
  renderAudit();
}

function createAudit(){
  const a = blankAudit();
  state.audits.push(a);
  state.activeAuditId = a.id;
  renderAudit();
}

function bindIdentityEvents(){
  $("auditName").addEventListener("input", e=>{
    const audit = activeAudit();
    audit.name = e.target.value;
    renderAudit();
  });

  $("clientName").addEventListener("input", e=>{
    const audit = activeAudit();
    audit.client = e.target.value;
    save();
  });

  $("auditDate").addEventListener("change", e=>{
    const audit = activeAudit();
    audit.date = e.target.value;
    save();
  });
}

$("btnYes").onclick=()=>record("YES");
$("btnNo").onclick=()=>record("NO");
$("btnNa").onclick=()=>record("N/A");
$("btnPrev").onclick=()=>next(-1);
$("btnNext").onclick=()=>next(1);
$("btnNewAudit").onclick=createAudit;

bindIdentityEvents();

if(!state.activeAuditId){
  const first=blankAudit();
  state.audits.push(first);
  state.activeAuditId=first.id;
}

renderAudit();

})();