const domains=[
"Site & Environment",
"Life Safety Risk",
"Fire & Egress",
"Structural Integrity",
"Electrical / Mechanical",
"Hazardous Substances",
"Operational Controls",
"Documentation & Records",
"Governance & Oversight",
"Training & Competency"
]

const scores=[0,6,12,18,24,30,36]

document.addEventListener("DOMContentLoaded",()=>{

const register=document.getElementById("registerAudit")

if(register){

register.onclick=()=>{

const audit={
consultant:consultant.value,
organisation:organisation.value,
site:clientSite.value,
title:auditTitle.value,
date:assessmentDate.value
}

localStorage.setItem("audit",JSON.stringify(audit))

location.href="assessment.html"

}

}

const domainContainer=document.getElementById("domains")

if(domainContainer){

domains.forEach((d,i)=>{

const block=document.createElement("div")
block.className="domain"

const title=document.createElement("div")
title.className="domain-title"
title.innerText=d

const row=document.createElement("div")
row.className="score-row"

scores.forEach(s=>{

const btn=document.createElement("div")
btn.className="score"
btn.innerText=s

btn.onclick=()=>{

localStorage.setItem("domain_"+i,s)

}

row.appendChild(btn)

})

block.appendChild(title)
block.appendChild(row)

domainContainer.appendChild(block)

})

document.getElementById("determineExposure").onclick=determine

}

})

function determine(){

let total=0
let highest=0
let highestDomain=""

domains.forEach((d,i)=>{

let s=parseInt(localStorage.getItem("domain_"+i)||0)

total+=s

if(s>highest){
highest=s
highestDomain=d
}

})

let ratio=(total/200).toFixed(2)

let classification="Stable"

if(ratio>1.6)classification="Critical"
else if(ratio>1.25)classification="Severe"
else if(ratio>1.0)classification="Elevated"

alert(
"Exposure Classification: "+classification+
"\nHighest Domain: "+highestDomain+
"\nAggregate Ratio: "+ratio
)

}