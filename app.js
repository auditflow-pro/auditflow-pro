const APP_VERSION="7.0"

let findings=[]
let actions=[]

const registerBtn=document.getElementById("registerAudit")

registerBtn.onclick=()=>{

document.getElementById("findingsPanel").classList.remove("hidden")

}

document.getElementById("addFinding").onclick=()=>{

const text=document.getElementById("findingText").value
const location=document.getElementById("findingLocation").value
const severity=document.getElementById("findingSeverity").value

const finding={
text,
location,
severity
}

findings.push(finding)

renderFindings()

}

function renderFindings(){

const list=document.getElementById("findingList")

list.innerHTML=""

findings.forEach(f=>{

const div=document.createElement("div")

div.innerHTML=`${f.severity} — ${f.text} (${f.location})`

list.appendChild(div)

})

}

document.getElementById("generateActions").onclick=()=>{

actions=findings.map(f=>{

return{

action:`Resolve: ${f.text}`,
location:f.location,
priority:f.severity

}

})

renderActions()

document.getElementById("actionsPanel").classList.remove("hidden")

}

function renderActions(){

const list=document.getElementById("actionList")

list.innerHTML=""

actions.forEach(a=>{

const div=document.createElement("div")

div.innerHTML=`${a.priority} — ${a.action} (${a.location})`

list.appendChild(div)

})

}

document.getElementById("exportJSON").onclick=()=>{

const audit={

version:APP_VERSION,
consultant:document.getElementById("consultant").value,
organisation:document.getElementById("organisation").value,
site:document.getElementById("clientSite").value,
title:document.getElementById("auditTitle").value,
date:document.getElementById("assessmentDate").value,
findings,
actions

}

const dataStr=JSON.stringify(audit,null,2)

const blob=new Blob([dataStr],{type:"application/json"})

const url=URL.createObjectURL(blob)

const a=document.createElement("a")

a.href=url
a.download="auditflow-export.json"

a.click()

}