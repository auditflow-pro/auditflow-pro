const version="11.0"

document.addEventListener("DOMContentLoaded",()=>{

const start=document.getElementById("startAudit")

if(start){
start.onclick=()=>{

const auditData={
consultant:document.getElementById("consultant").value,
organisation:document.getElementById("organisation").value,
client:document.getElementById("clientSite").value,
title:document.getElementById("auditTitle").value,
date:document.getElementById("assessmentDate").value
}

localStorage.setItem("auditData",JSON.stringify(auditData))

window.location="assessment.html"

}
}

const determine=document.getElementById("determineExposure")

if(determine){

determine.onclick=()=>{

localStorage.setItem("classification","Stable")
localStorage.setItem("domain","Operational Controls")
localStorage.setItem("ratio","0.93")

window.location="determination.html"

}

}

const classification=document.getElementById("classification")

if(classification){

document.getElementById("classification").innerText=
localStorage.getItem("classification")

document.getElementById("domain").innerText=
localStorage.getItem("domain")

document.getElementById("ratio").innerText=
localStorage.getItem("ratio")

}

const reportBtn=document.getElementById("viewReport")

if(reportBtn){
reportBtn.onclick=()=>window.location="report.html"
}

})