(function(){

const STORAGE_KEY="auditflow_store_v2";

const TEMPLATE={
fire:{title:"Fire Safety",questions:[
"Fire extinguishers present?",
"Fire exits clear?",
"Emergency lighting operational?",
"Evacuation plan displayed?"
]},
electrical:{title:"Electrical Safety",questions:[
"Cables undamaged?",
"Sockets not overloaded?",
"Boards accessible?",
"PAT records available?"
]}
};

function uid(){return Math.random().toString(16).slice(2)+Date.now();}

function blankStore(){return{activeView:"audit",activeAuditId:null,audits:[]};}

function load(){
const raw=localStorage.getItem(STORAGE_KEY);
if(!raw)return blankStore();
try{return JSON.parse(raw);}catch{return blankStore();}
}

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}

let state=load();

function answeredCount(audit){
let total=0,ans=0;
Object.keys(TEMPLATE).forEach(k=>{
const qs=TEMPLATE[k].questions.length;
total+=qs;
(audit.responses[k]||[]).forEach(v=>{if(v)ans++;});
});
return{total,ans};
}

function getActive(){
return state.audits.find(a=>a.id===state.activeAuditId)||null;
}

function renderSummary(){
const audit=getActive();
if(!audit)return;

document.getElementById("viewSummary").style.display="block";

const {total,ans}=answeredCount(audit);
const open=(audit.actions||[]).filter(a=>a.status==="OPEN").length;

document.getElementById("summaryIdentity").innerHTML=
`<strong>${audit.name}</strong><br>${audit.client||""}<br>Status: <span class="pill ${audit.status==="COMPLETE"?"complete":"progress"}">${audit.status}</span>`;

document.getElementById("summaryStats").innerHTML=
`Answered: ${ans}/${total}<br>Open Actions: ${open}`;

const tbody=document.getElementById("summaryTable");
tbody.innerHTML="";

Object.keys(TEMPLATE).forEach(k=>{
const qs=TEMPLATE[k].questions.length;
let done=0;
(audit.responses[k]||[]).forEach(v=>{if(v)done++;});
tbody.innerHTML+=`<tr><td>${TEMPLATE[k].title}</td><td>${done}/${qs}</td></tr>`;
});

const btn=document.getElementById("btnToggleComplete");
btn.textContent=audit.status==="COMPLETE"?"Reopen Audit":"Mark Complete";
btn.onclick=function(){
audit.status=audit.status==="COMPLETE"?"IN_PROGRESS":"COMPLETE";
save();
render();
};
}

function renderNav(){
document.querySelectorAll(".navitem").forEach(el=>{
el.classList.toggle("active",el.dataset.view===state.activeView);
});
}

function render(){
renderNav();
document.getElementById("viewSummary").style.display="none";
if(state.activeView==="summary")renderSummary();
save();
}

document.getElementById("navBlock").addEventListener("click",e=>{
const item=e.target.closest(".navitem");
if(!item)return;
state.activeView=item.dataset.view;
render();
});

render();

})();