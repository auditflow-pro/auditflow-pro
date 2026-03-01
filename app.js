(function(){

const STORAGE_KEY="auditflow_global_v8";
const SECTION_ORDER=["site","equipment","operations","people"];

const TEMPLATE={
site:{title:"Site & Environment",questions:[
"Housekeeping standards consistently maintained across operational areas?",
"Access and egress routes clearly defined and unobstructed?",
"Segregation between pedestrian and vehicle movement effectively controlled?",
"Emergency arrangements clearly communicated and visible?",
"Environmental risks assessed and controlled?",
"Storage areas organised safely?",
"Signage aligned with operational risk?",
"Manual handling exposure minimised?",
"External slip/trip risks controlled?",
"Site security controls effective?"
]},
equipment:{title:"Equipment & Infrastructure",questions:[
"Preventive maintenance current?",
"Inspection records complete?",
"Safety-critical devices tested?",
"Temporary equipment controlled?",
"Infrastructure integrity reviewed?",
"Isolation controls applied?",
"Electrical installations protected?",
"Equipment guarding effective?",
"Utility systems monitored?",
"Defect reporting linked to action?"
]},
operations:{title:"Operational Controls",questions:[
"Procedures aligned with practice?",
"Risk assessments current?",
"Control measures verified?",
"Change management applied?",
"Permit systems functioning?",
"Monitoring active?",
"Incident investigations robust?",
"Corrective actions verified?",
"Performance metrics used?",
"Non-conformance handled consistently?"
]},
people:{title:"People & Process",questions:[
"Roles clearly defined?",
"Training current?",
"Supervision appropriate?",
"Communication effective?",
"Incident reporting active?",
"Leadership engagement visible?",
"Contractor controls aligned?",
"Staffing levels adequate?",
"Improvement initiatives tracked?",
"Governance oversight documented?"
]}
};

function $(id){return document.getElementById(id);}
function uid(){return Math.random().toString(16).slice(2);}

function blankAudit(){
let responses={};
SECTION_ORDER.forEach(k=>responses[k]=Array(TEMPLATE[k].questions.length).fill(null));
return{
id:uid(),
name:"",
client:"",
date:"",
activeSection:"site",
activeIndex:0,
responses,
actions:[]
};
}

function load(){
let raw=localStorage.getItem(STORAGE_KEY);
if(!raw)return{audits:[],activeId:null,view:"audit"};
return JSON.parse(raw);
}

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}

let state=load();

if(!state.activeId){
let a=blankAudit();
state.audits=[a];
state.activeId=a.id;
}

function active(){return state.audits.find(a=>a.id===state.activeId);}

function switchView(v){
state.view=v;
$("auditView").style.display=v==="audit"?"block":"none";
$("actionsView").style.display=v==="actions"?"block":"none";
$("summaryView").style.display=v==="summary"?"block":"none";
document.querySelectorAll(".navitem").forEach(n=>n.classList.toggle("active",n.dataset.view===v));
render();
}

document.querySelectorAll(".navitem").forEach(n=>n.onclick=()=>switchView(n.dataset.view));

function render(){
let a=active();
$("auditName").value=a.name;
$("clientName").value=a.client;
$("auditDate").value=a.date;

let section=TEMPLATE[a.activeSection];
$("sectionHeader").textContent=section.title;

let answered=a.responses[a.activeSection].filter(x=>x!==null).length;
let open=a.actions.filter(x=>x.status==="OPEN").length;

$("sectionMeta").textContent=`${answered}/${section.questions.length} answered • ${open} open`;

$("questionText").textContent=section.questions[a.activeIndex];

renderActions();
renderSummary();
save();
}

function sectionCompleteTransition(nextSection){
let banner=$("sectionCompleteBanner");
banner.textContent=`${TEMPLATE[active().activeSection].title} complete`;
banner.style.display="block";
setTimeout(()=>{
banner.style.display="none";
active().activeSection=nextSection;
active().activeIndex=0;
render();
},700);
}

function autoAdvance(){
let a=active();
let max=TEMPLATE[a.activeSection].questions.length-1;
let secIndex=SECTION_ORDER.indexOf(a.activeSection);

if(a.activeIndex<max){
a.activeIndex++;
}else{
if(secIndex<SECTION_ORDER.length-1){
let nextSection=SECTION_ORDER[secIndex+1];
sectionCompleteTransition(nextSection);
return;
}
}
render();
}

function record(val){
let a=active();
if(!a.name.trim())return;

a.responses[a.activeSection][a.activeIndex]=val;

if(val==="NO"){
a.actions.push({id:uid(),section:a.activeSection,index:a.activeIndex,status:"OPEN"});
}

autoAdvance();
}

$("btnYes").onclick=()=>record("YES");
$("btnNo").onclick=()=>record("NO");
$("btnNa").onclick=()=>record("N/A");
$("btnPrev").onclick=()=>{if(active().activeIndex>0){active().activeIndex--;render();}};
$("btnNext").onclick=()=>{autoAdvance();};

$("auditName").oninput=e=>{active().name=e.target.value;render();};
$("clientName").oninput=e=>{active().client=e.target.value;};
$("auditDate").onchange=e=>{active().date=e.target.value;};

$("btnNewAudit").onclick=()=>{
let a=blankAudit();
state.audits.push(a);
state.activeId=a.id;
switchView("audit");
};

function renderActions(){
let a=active();
let openDiv=$("openActions");
let closedDiv=$("closedActions");
openDiv.innerHTML="";
closedDiv.innerHTML="";

a.actions.forEach(act=>{
let div=document.createElement("div");
div.className="action-item";
div.textContent=TEMPLATE[act.section].questions[act.index];
if(act.status==="OPEN"){
let btn=document.createElement("button");
btn.textContent="Close";
btn.onclick=()=>{act.status="CLOSED";render();};
div.appendChild(btn);
openDiv.appendChild(div);
}else{
closedDiv.appendChild(div);
}
});
}

function renderSummary(){
let a=active();
let container=$("summarySections");
container.innerHTML="";

SECTION_ORDER.forEach(k=>{
let answered=a.responses[k].filter(x=>x!==null).length;
let div=document.createElement("div");
div.className="summary-row";
div.textContent=`${TEMPLATE[k].title} — ${answered}/${TEMPLATE[k].questions.length}`;
container.appendChild(div);
});

let open=a.actions.filter(x=>x.status==="OPEN").length;
let closed=a.actions.filter(x=>x.status==="CLOSED").length;

$("summaryTotals").textContent=`Open actions: ${open} • Closed actions: ${closed}`;
}

switchView(state.view||"audit");

})();