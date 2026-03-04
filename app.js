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

{ id:"govern