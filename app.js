const VERSION="4.0"

let audits=JSON.parse(localStorage.getItem("afp_audits"))||[]
let sequence=parseInt(localStorage.getItem("afp_sequence"))||0

let state={
view:"registration",
audit:null,
domainIndex:0
}

const domains=[

{
id:"site",
name:"Site & Environment",
questions:[
"Fire detection system operational?",
"Emergency exits unobstructed?",
"Housekeeping maintained?",
"Access routes safe?",
"External environment risks controlled?"
]
},

{
id:"life",
name:"Life Safety Risk",
questions:[
"First aid provision available?",
"Emergency procedures documented?",
"Staff aware of emergency reporting?",
"Incident response roles defined?",
"Life critical systems maintained?"
]
},

{
id:"fire",
name:"Fire & Egress",
questions:[
"Fire alarm systems tested?",
"Evacuation routes marked?",
"Fire extinguishers accessible?",
"Fire escape routes clear?",
"Fire drills conducted?"
]
},

{
id:"structural",
name:"Structural Integrity",
questions:[
"Structural damage visible?",
"Load bearing areas sound?",
"Inspection records present?",
"Structural alterations controlled?",
"Structural hazards addressed?"
]
},

{
id:"electrical",
name:"Electrical / Mechanical",
questions:[
"Electrical systems maintained?",
"Machinery guarding intact?",
"Isolation procedures present?",
"Maintenance records available?",
"Mechanical hazards controlled?"
]
},

{
id:"hazard",
name:"Hazardous Substances",
questions:[
"Chemicals stored correctly?",
"Safety data sheets available?",
"Spill kits present?",
"Substances labelled?",
"Exposure controls implemented?"
]
},

{
id:"operations",
name:"Operational Controls",
questions:[
"Safe procedures documented?",
"Permit systems operating?",
"Operational supervision present?",
"Hazard reporting active?",
"Operational risk assessments completed?"
]
},

{
id:"records",
name:"Documentation & Records",
questions:[
"Policies documented?",
"Safety records maintained?",
"Inspection logs current?",
"Incident reports reviewed?",
"Compliance documentation retained?"
]
},

{
id:"governance",
name:"Governance & Oversight",
questions:[
"Responsibilities defined?",
"Management reviews conducted?",
"Risk registers maintained?",
"Leadership oversight visible?",
"Escalation procedures defined?"
]
},

{
id:"training",
name:"Training & Competency",
questions:[
"Training records maintained?",
"Competency assessments performed?",
"Induction training delivered?",
"Refresher training scheduled?",
"Specialist training provided?"
]
}

]

function save(){

localStorage.setItem("afp_audits",JSON.stringify(audits))
localStorage.setItem("afp_sequence",sequence)

}

function afp(){

sequence++

const d=new Date().toISOString().slice(0,10).replace(/-/g,"")

save()

return`AFP-${d}-${sequence.toString().padStart(4,"0")}`

}

function render(){

const app=document.getElementById("app")

app.innerHTML=""

if(state.view==="registration")registration(app)
if(state.view==="domain")domain(app)
if(state.view==="summary")summary(app)
if(state.view==="outcome")outcome(app)
if(state.view==="records")records(app)

}

function registration(el){

el.innerHTML=`

<div class="panel">

<h2>Audit Registration</h2>

<label>Consultant</label>
<input id="consultant">

<label>Organisation</label>
<input id="organisation">

<label>Client / Site</label>
<input id="site">

<label>Audit Title</label>
<input id="title">

<label>Assessment Date</label>
<input id="date" type="date">

<button onclick="start()">Register Audit</button>

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

if(!consultant||!organisation||!site||!title||!date){

alert("All fields required")

return

}

state.audit={

afp:afp(),
consultant,
organisation,
site,
title,
date,
answers:{},
version:VERSION

}

audits.unshift(state.audit)

save()

state.domainIndex=0
state.view="domain"

render()

}

function domain(el){

const d=domains[state.domainIndex]

let html=`

<div class="panel">

<h2>Domain ${state.domainIndex+1} of 10</h2>

<div class="domain-title">${d.name}</div>

`

d.questions.forEach((q,i)=>{

html+=`

<div class="question">

${q}

<div class="answers">

<button class="answer yes" onclick="ans('${d.id}',${i},'yes')">YES</button>

<button class="answer no" onclick="ans('${d.id}',${i},'no')">NO</button>

<button class="answer na" onclick="ans('${d.id}',${i},'na')">N/A</button>

</div>

</div>

`

})

html+=`

<label>Likelihood</label>

<select id="likelihood">

<option value="1">Rare</option>
<option value="2">Unlikely</option>
<option value="3">Possible</option>
<option value="4">Likely</option>
<option value="5">Almost Certain</option>

</select>

<button onclick="next()">Next Domain</button>

</div>

`

el.innerHTML=html

}

function ans(domain,q,v){

if(!state.audit.answers[domain])state.audit.answers[domain]={}

state.audit.answers[domain][q]=v

save()

}

function next(){

state.domainIndex++

if(state.domainIndex>=domains.length){

state.view="summary"

}else{

state.view="domain"

}

render()

}

function severity(domain){

const answers=state.audit.answers[domain.id]||{}

let fail=0
let total=0

domain.questions.forEach((q,i)=>{

const a=answers[i]

if(a==="yes")total++
if(a==="no"){fail++;total++}

})

if(total===0)return 0

const ratio=fail/total

if(ratio===0)return 0
if(ratio<=.2)return 1
if(ratio<=.4)return 2
if(ratio<=.6)return 3
if(ratio<=.8)return 4

return 5

}

function summary(el){

let html=`<div class="panel"><h2>Domain Exposure Summary</h2>`

domains.forEach(d=>{

const s=severity(d)

html+=`<div class="result-block">${d.name} — Severity ${s}</div>`

})

html+=`<button onclick="calc()">Calculate Exposure</button></div>`

el.innerHTML=html

}

function calc(){

let highest=0
let total=0

domains.forEach(d=>{

const s=severity(d)

if(s>highest)highest=s

total+=s

})

const ratio=total/(domains.length*5)

let band="Low"

if(ratio>=.7)band="Critical"
else if(ratio>=.5)band="High"
else if(ratio>=.25)band="Moderate"

state.audit.result={band,ratio,highest}

state.view="outcome"

render()

}

function outcome(el){

const r=state.audit.result

el.innerHTML=`

<div class="panel">

<h2>Exposure Determination</h2>

<div class="result-block">

AFP Reference: ${state.audit.afp}

</div>

<div class="result-block">

Exposure Classification: ${r.band}

</div>

<div class="result-block">

Aggregate Ratio: ${r.ratio.toFixed(3)}

</div>

<div class="result-block">

Highest Domain Severity: ${r.highest}

</div>

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

html+=`<button onclick="registration()">New Audit</button></div>`

el.innerHTML=html

}

render()