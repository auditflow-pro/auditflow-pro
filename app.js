const VERSION="5.0"

let audits=JSON.parse(localStorage.getItem("afp_audits"))||[]
let seq=parseInt(localStorage.getItem("afp_seq"))||0

function save(){
localStorage.setItem("afp_audits",JSON.stringify(audits))
localStorage.setItem("afp_seq",seq)
}

function afp(){
seq++
save()
const d=new Date().toISOString().slice(0,10).replace(/-/g,"")
return`AFP-${d}-${seq.toString().padStart(4,"0")}`
}

const weights={
site:1,
life:3,
fire:3,
structural:2,
electrical:2,
hazard:1,
operations:1,
records:1,
governance:1,
training:1
}

const domains=[

{ id:"site",name:"Site & Environment",questions:[
"Fire detection system operational?",
"Emergency exits unobstructed?",
"Housekeeping maintained?",
"Access routes safe?",
"External environment risks controlled?"
]},

{ id:"life",name:"Life Safety Risk",questions:[
"First aid provision available?",
"Emergency procedures documented?",
"Staff aware of emergency reporting?",
"Incident response roles defined?",
"Life critical systems maintained?"
]},

{ id:"fire",name:"Fire & Egress",questions:[
"Fire alarm systems tested?",
"Evacuation routes marked?",
"Fire extinguishers accessible?",
"Fire escape routes clear?",
"Fire drills conducted?"
]},

{ id:"structural",name:"Structural Integrity",questions:[
"Structural damage visible?",
"Load bearing areas sound?",
"Inspection records present?",
"Structural alterations controlled?",
"Structural hazards addressed?"
]},

{ id:"electrical",name:"Electrical / Mechanical",questions:[
"Electrical systems maintained?",
"Machinery guarding intact?",
"Isolation procedures present?",
"Maintenance records available?",
"Mechanical hazards controlled?"
]},

{ id:"hazard",name:"Hazardous Substances",questions:[
"Chemicals stored correctly?",
"Safety data sheets available?",
"Spill kits present?",
"Substances labelled?",
"Exposure controls implemented?"
]},

{ id:"operations",name:"Operational Controls",questions:[
"Safe procedures documented?",
"Permit systems operating?",
"Operational supervision present?",
"Hazard reporting active?",
"Operational risk assessments completed?"
]},

{ id:"records",name:"Documentation & Records",questions:[
"Policies documented?",
"Safety records maintained?",
"Inspection logs current?",
"Incident reports reviewed?",
"Compliance documentation retained?"
]},

{ id:"governance",name:"Governance & Oversight",questions:[
"Responsibilities defined?",
"Management reviews conducted?",
"Risk registers maintained?",
"Leadership oversight visible?",
"Escalation procedures defined?"
]},

{ id:"training",name:"Training & Competency",questions:[
"Training records maintained?",
"Competency assessments performed?",
"Induction training delivered?",
"Refresher training scheduled?",
"Specialist training provided?"
]}

]

let state={view:"reg",audit:null,domain:0}

function render(){

const app=document.getElementById("app")
app.innerHTML=""

if(state.view==="reg")registration(app)
if(state.view==="domain")domain(app)
if(state.view==="summary")summary(app)
if(state.view==="outcome")outcome(app)
if(state.view==="records")records(app)

}

function registration(el){

const today=new Date().toISOString().split("T")[0]

el.innerHTML=`

<div class="panel">

<h2>Register Audit</h2>

<label>Consultant</label>
<input id="consultant">

<label>Organisation</label>
<input id="organisation">

<label>Client / Site</label>
<input id="site">

<label>Audit Title</label>
<input id="title">

<label>Assessment Date</label>
<input type="date" id="date" value="${today}">

<button onclick="start()">Register Instrument</button>

<button class="secondary" onclick="viewRecords()">Audit Records</button>

</div>

`

}

function start(){

const consultant=document.getElementById("consultant").value
const organisation=document.getElementById("organisation").value
const site=document.getElementById("site").value
const title=document.getElementById("title").value
const date=document.getElementById("date").value

if(!consultant||!organisation||!site||!title)return

state.audit={
afp:afp(),
consultant,organisation,site,title,date,
answers:{},naReasons:{}
}

audits.unshift(state.audit)
save()

state.domain=0
state.view="domain"
render()

}

function domain(el){

const d=domains[state.domain]

let html=`<div class="panel">

<h2>Domain ${state.domain+1} / 10</h2>

<div class="domain-title">${d.name}</div>
`

d.questions.forEach((q,i)=>{

const a=state.audit.answers[d.id]?.[i]||""

html+=`

<div class="result-block">

${q}

<div class="answers">

<button class="answer ${a==="yes"?"active yes":""}"
onclick="answer('${d.id}',${i},'yes')">YES</button>

<button class="answer ${a==="no"?"active no":""}"
onclick="answer('${d.id}',${i},'no')">NO</button>

<button class="answer ${a==="na"?"active na":""}"
onclick="answer('${d.id}',${i},'na')">N/A</button>

</div>

</div>

`

})

html+=`<button onclick="next()">Next Domain</button></div>`

el.innerHTML=html

}

function answer(domain,q,val){

if(!state.audit.answers[domain])state.audit.answers[domain]={}

if(val==="na"){

const reason=prompt("Explain why this question is not applicable:")

if(!reason||reason.length<5)return

state.audit.naReasons[domain+"_"+q]=reason

}

state.audit.answers[domain][q]=val

save()
render()

}

function next(){

const d=domains[state.domain]

for(let i=0;i<d.questions.length;i++){

if(!state.audit.answers[d.id]||!state.audit.answers[d.id][i]){

alert("All questions must be answered")
return

}

}

state.domain++

if(state.domain>=domains.length){

state.view="summary"

}else{

state.view="domain"

}

render()

}

function severity(domain){

const ans=state.audit.answers[domain.id]

let fail=0,total=0

domain.questions.forEach((q,i)=>{

const a=ans[i]

if(a==="yes"){total++}
if(a==="no"){fail++;total++}

})

const ratio=fail/total

if(ratio===0)return 0
if(ratio<=.2)return 1
if(ratio<=.4)return 2
if(ratio<=.6)return 3
if(ratio<=.8)return 4
return 5

}

function likelihood(sev){

if(sev===0)return 1
if(sev===1)return 2
if(sev===2)return 3
if(sev===3)return 4
return 5

}

function summary(el){

let html=`<div class="panel"><h2>Domain Exposure Summary</h2>`

domains.forEach(d=>{

const sev=severity(d)
const like=likelihood(sev)
const exp=sev*like*weights[d.id]

html+=`<div class="result-block">${d.name} — Exposure ${exp}</div>`

})

html+=`<button onclick="calc()">Determine Exposure</button></div>`

el.innerHTML=html

}

function calc(){

let total=0
let max=0

domains.forEach(d=>{

const sev=severity(d)
const like=likelihood(sev)

const score=sev*like*weights[d.id]

if(score>max)max=score

total+=score

})

const ratio=total/100

let band="Low"

if(ratio>=.7)band="Critical"
else if(ratio>=.5)band="High"
else if(ratio>=.25)band="Moderate"

state.audit.result={band,ratio,max}

state.view="outcome"
render()

}

function outcome(el){

const r=state.audit.result

el.innerHTML=`

<div class="panel">

<h2>Exposure Determination</h2>

<div class="result-block">AFP Reference: ${state.audit.afp}</div>

<div class="result-block">Exposure Classification: ${r.band}</div>

<div class="result-block">Aggregate Ratio: ${r.ratio.toFixed(3)}</div>

<div class="result-block">Highest Domain Score: ${r.max}</div>

<button onclick="window.print()">Print / Export Report</button>

<button onclick="viewRecords()">Audit Records</button>

</div>

`

}

function viewRecords(){

state.view="records"
render()

}

function records(el){

let html=`<div class="panel"><h2>Audit Records</h2>`

audits.forEach(a=>{

html+=`<div class="result-block">${a.afp} — ${a.site}</div>`

})

html+=`<button onclick="render()">New Audit</button></div>`

el.innerHTML=html

}

render()