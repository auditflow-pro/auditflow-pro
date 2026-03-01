// AuditFlow Pro – Enterprise Action Engine V1
// Offline-first, single-user, structured risk documentation

const sections = [
  { name:"Site & Environment", total:10 },
  { name:"Equipment & Infrastructure", total:10 },
  { name:"Operational Controls", total:10 },
  { name:"People & Process", total:10 }
];

let state = {
  status:"DRAFT",
  currentSection:0,
  currentQuestion:0,
  answers:{},
  actions:[],
  modified:false
};

let actionCounter = 1;
let pendingActionContext = null;

function init(){
  document.getElementById("auditDate").innerText =
    new Date().toLocaleDateString("en-GB");

  wireNav();
  wireEngine();
  render();
}

function wireNav(){
  document.querySelectorAll(".navitem").forEach(item=>{
    item.addEventListener("click",()=>{
      document.querySelectorAll(".navitem").forEach(n=>n.classList.remove("active"));
      item.classList.add("active");

      const view=item.dataset.view;

      document.getElementById("auditView").style.display=view==="audit"?"block":"none";
      document.getElementById("actionsView").style.display=view==="actions"?"block":"none";
      document.getElementById("summaryView").style.display=view==="summary"?"block":"none";

      if(view==="actions") renderActions();
      if(view==="summary") renderSummary();
    });
  });
}

function wireEngine(){
  document.getElementById("startAuditBtn").onclick=startAudit;
  document.getElementById("yesBtn").onclick=()=>answer("YES");
  document.getElementById("noBtn").onclick=()=>answer("NO");
  document.getElementById("naBtn").onclick=()=>answer("NA");
  document.getElementById("previousBtn").onclick=previous;
  document.getElementById("exportBtn").onclick=()=>window.print();

  document.getElementById("auditName").addEventListener("input",()=>{
    if(state.status==="COMPLETE") setModified();
  });

  document.getElementById("clientName").addEventListener("input",()=>{
    if(state.status==="COMPLETE") setModified();
  });
}

function startAudit(){
  const name=document.getElementById("auditName").value.trim();
  const error=document.getElementById("nameError");

  if(!name){
    error.innerText="Audit name required to create formal record.";
    return;
  }

  error.innerText="";
  state.status="IN PROGRESS";
  document.getElementById("engineBlock").style.display="block";
  document.getElementById("startAuditBtn").style.display="none";
  render();
}

function answer(val){
  if(state.status!=="IN PROGRESS") return;

  const key=state.currentSection+"-"+state.currentQuestion;
  state.answers[key]=val;

  if(val==="NO"){
    openActionPanel();
  } else {
    autoAdvance();
  }
}

function openActionPanel(){
  const container=document.querySelector(".section-card");

  pendingActionContext={
    section:sections[state.currentSection].name,
    questionIndex:state.currentQuestion,
    questionText:"Question "+(state.currentQuestion+1)
  };

  container.innerHTML = `
    <div class="section-header">Action Required</div>
    <div class="section-meta">${pendingActionContext.section} – ${pendingActionContext.questionText}</div>

    <label>Severity *</label>
    <select id="severitySelect">
      <option value="">Select severity</option>
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
      <option>Critical</option>
    </select>

    <label>Rationale (optional)</label>
    <textarea id="rationaleInput"></textarea>

    <label>Recommended Action (optional)</label>
    <textarea id="recommendInput"></textarea>

    <button id="confirmActionBtn" class="primary-btn">Confirm Action</button>
  `;

  document.getElementById("confirmActionBtn").onclick=confirmAction;
}

function confirmAction(){
  const severity=document.getElementById("severitySelect").value;
  if(!severity) return;

  const rationale=document.getElementById("rationaleInput").value;
  const recommend=document.getElementById("recommendInput").value;

  const action={
    id:"A-"+String(actionCounter++).padStart(3,"0"),
    section:pendingActionContext.section,
    questionIndex:pendingActionContext.questionIndex,
    questionText:pendingActionContext.questionText,
    severity,
    status:"Open",
    created:new Date().toISOString(),
    closed:null,
    rationale,
    recommendedAction:recommend
  };

  state.actions.push(action);

  autoAdvance();
  render();
}

function autoAdvance(){
  if(state.currentQuestion<sections[state.currentSection].total-1){
    state.currentQuestion++;
    render();
  }else{
    showSectionComplete();
  }
}

function showSectionComplete(){
  const panel=document.getElementById("completionPanel");
  panel.innerText="SECTION COMPLETE\n"+sections[state.currentSection].name.toUpperCase();
  panel.style.display="block";

  setTimeout(()=>{
    panel.style.display="none";
    nextSection();
  },1200);
}

function nextSection(){
  if(state.currentSection<sections.length-1){
    state.currentSection++;
    state.currentQuestion=0;
    render();
  }else{
    state.status="COMPLETE";
    render();
  }
}

function previous(){
  if(state.currentQuestion>0){
    state.currentQuestion--;
    render();
  }
}

function setModified(){
  state.status="MODIFIED";
  render();
}

function render(){
  renderStatus();
  renderSection();
  renderQuestion();
}

function renderStatus(){
  const badge=document.getElementById("statusBadge");
  badge.className="status-badge "+state.status.toLowerCase();
  badge.innerText=state.status;
}

function renderSection(){
  const section=sections[state.currentSection];
  const answered=getAnswered(state.currentSection);
  const open=getOpenCount();

  document.getElementById("sectionHeader").innerText=section.name;
  document.getElementById("sectionMeta").innerText=
    "Progress: "+answered+" of "+section.total+" • Open Actions: "+open;
}

function renderQuestion(){
  document.getElementById("questionText").innerText=
    "Question "+(state.currentQuestion+1);
}

function getAnswered(sectionIndex){
  let count=0;
  for(let i=0;i<sections[sectionIndex].total;i++){
    if(state.answers[sectionIndex+"-"+i]) count++;
  }
  return count;
}

function getOpenCount(){
  return state.actions.filter(a=>a.status==="Open").length;
}

function renderActions(){
  const container=document.getElementById("actionsList");
  container.innerHTML="";

  const openActions=state.actions.filter(a=>a.status==="Open");

  const summary=document.createElement("div");
  const counts={
    Critical:0,High:0,Medium:0,Low:0
  };
  openActions.forEach(a=>counts[a.severity]++);

  summary.innerText=
    "Open: "+openActions.length+
    " | Critical: "+counts.Critical+
    " | High: "+counts.High+
    " | Medium: "+counts.Medium+
    " | Low: "+counts.Low;

  container.appendChild(summary);

  openActions.forEach(action=>{
    const div=document.createElement("div");
    div.style.borderBottom="1px solid #e3e6ee";
    div.style.padding="12px 0";

    div.innerHTML=
      `<strong>${action.id}</strong><br>
       ${action.section} – ${action.questionText}<br>
       Severity: ${action.severity}<br>
       Status: ${action.status}`;

    const closeBtn=document.createElement("button");
    closeBtn.innerText="Close";
    closeBtn.onclick=()=>{
      action.status="Closed";
      action.closed=new Date().toISOString();
      if(state.status==="COMPLETE") setModified();
      renderActions();
    };

    div.appendChild(closeBtn);
    container.appendChild(div);
  });
}

function renderSummary(){
  const container=document.getElementById("summaryContent");
  container.innerHTML="";

  sections.forEach((section,index)=>{
    const div=document.createElement("div");
    div.innerText=
      section.name+" — "+
      getAnswered(index)+"/"+section.total+" answered";
    container.appendChild(div);
  });
}

window.onload=init;