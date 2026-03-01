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
  modified:false
};

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
  const key=state.currentSection+"-"+state.currentQuestion;
  state.answers[key]=val;
  autoAdvance();
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
  let count=0;
  Object.values(state.answers).forEach(v=>{
    if(v==="NO") count++;
  });
  return count;
}

function renderActions(){
  const container=document.getElementById("actionsList");
  container.innerHTML="";
  Object.keys(state.answers).forEach(key=>{
    if(state.answers[key]==="NO"){
      const div=document.createElement("div");
      div.innerText="Section "+(parseInt(key.split("-")[0])+1)+
        " – Question "+(parseInt(key.split("-")[1])+1);
      container.appendChild(div);
    }
  });
}

function renderSummary(){
  const container=document.getElementById("summaryContent");
  container.innerHTML="";
  sections.forEach((section,index)=>{
    const div=document.createElement("div");
    div.innerText=section.name+
      " — "+getAnswered(index)+"/"+section.total+" answered";
    container.appendChild(div);
  });
}

window.onload=init;