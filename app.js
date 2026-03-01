(function(){

const STORAGE_KEY = "auditflow_global_v4";

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

function renderNav(){
  document.querySelectorAll(".navitem").forEach(n=>{
    n.classList.toggle("active",n.dataset.view===state.view);
  });
}

function renderAudit(){
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
    return;
  }

  const section=TEMPLATE[audit.activeSection];
  $("questionText").textContent=section.questions[audit.activeIndex];

  $("contextStrip").textContent=
    `${section.title} • ${audit.activeIndex+1}/${section.questions.length} • `+
    `${openCount(audit)} open • ${statusLabel(audit.status)}`;

  save();
}

function renderActions(){
  const audit=activeAudit();
  const body=$("actionsBody");
  body.innerHTML="";

  if(!audit || audit.actions.length===0){
    body.innerHTML="<tr><td colspan='3'>No actions</td></tr>";
    return;
  }

  audit.actions.forEach(a=>{
    const tr=document.createElement("tr");
    tr.innerHTML=
      `<td>${TEMPLATE[a.sectionKey].questions[a.questionIndex]}</td>`+
      `<td>${TEMPLATE[a.sectionKey].title}</td>`+
      `<td>${a.status}</td>`;
    body.appendChild(tr);
  });
}

function renderSummary(){
  const audit=activeAudit();
  if(!audit) return;

  const pill=$("statusPill");
  pill.textContent=statusLabel(audit.status);
  pill.className="status-pill "+statusClass(audit.status);

  $("summaryMeta").textContent=`${openCount(audit)} open actions`;

  const btn=$("btnToggleComplete");

  if(audit.status===STATUS.IN_PROGRESS)
    btn.textContent="Move to Ready for Review";
  else if(audit.status===STATUS.READY_REVIEW)
    btn.textContent="Mark Complete";
  else
    btn.textContent="Reopen Audit";
}

function render(){
  renderNav();

  $("viewAudit").style.display=state.view==="audit"?"block":"none";
  $("viewActions").style.display=state.view==="actions"?"block":"none";
  $("viewSummary").style.display=state.view==="summary"?"block":"none";

  if(state.view==="audit") renderAudit();
  if(state.view==="actions") renderActions();
  if(state.view==="summary") renderSummary();
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

function toggleCompletion(){
  const audit=activeAudit();
  if(!audit) return;

  const open=openCount(audit);

  if(audit.status===STATUS.IN_PROGRESS){
    audit.status=STATUS.READY_REVIEW;
  }else if(audit.status===STATUS.READY_REVIEW){
    if(open>0){ alert("Close all open actions first."); return; }
    audit.status=STATUS.COMPLETE;
  }else{
    audit.status=STATUS.IN_PROGRESS;
  }

  render();
}

function createAudit(){
  const a=blankAudit();
  state.audits.push(a);
  state.activeAuditId=a.id;
  state.view="audit";
  render();
}

document.querySelectorAll(".navitem").forEach(n=>{
  n.onclick=()=>{state.view=n.dataset.view;render();};
});

$("btnYes").onclick=()=>record("YES");
$("btnNo").onclick=()=>record("NO");
$("btnNa").onclick=()=>record("N/A");
$("btnPrev").onclick=()=>next(-1);
$("btnNext").onclick=()=>next(1);
$("btnToggleComplete").onclick=toggleCompletion;
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