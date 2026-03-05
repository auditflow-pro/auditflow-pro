document.addEventListener("DOMContentLoaded",()=>{

const startAudit=document.getElementById("startAudit")

if(startAudit){

startAudit.onclick=()=>{

const auditData={
consultant:document.getElementById("consultant").value,
organisation:document.getElementById("organisation").value,
client:document.getElementById("clientSite").value,
title:document.getElementById("auditTitle").value,
date:document.getElementById("assessmentDate").value
}

localStorage.setItem("auditData",JSON.stringify(auditData))
localStorage.setItem("answers",JSON.stringify({}))

window.location="assessment.html"

}

}

const questions=document.querySelectorAll(".question")

if(questions.length){

let answers={}

questions.forEach(q=>{

const id=q.dataset.q

q.querySelectorAll("button").forEach(btn=>{

btn.onclick=()=>{

const answer=btn.className.toUpperCase()

answers[id]=answer

localStorage.setItem("answers",JSON.stringify(answers))

q.querySelector(".record").innerText="Recorded: "+answer

}

})

})

}

const determine=document.getElementById("determineExposure")

if(determine){

determine.onclick=()=>{

const answers=JSON.parse(localStorage.getItem("answers")||"{}")

let score=0

Object.values(answers).forEach(a=>{

if(a==="NO") score+=5
if(a==="YES") score+=1

})

let classification="Stable"

if(score>=15) classification="Critical Exposure"
else if(score>=10) classification="High Exposure"
else if(score>=5) classification="Moderate Exposure"

const result={classification,score}

localStorage.setItem("result",JSON.stringify(result))

window.location="determination.html"

}

}

const classification=document.getElementById("classification")

if(classification){

const result=JSON.parse(localStorage.getItem("result")||"{}")

classification.innerText=result.classification
document.getElementById("score").innerText=result.score

const reportBtn=document.getElementById("generateReport")

reportBtn.onclick=()=>window.location="report.html"

}

const reportContent=document.getElementById("reportContent")

if(reportContent){

const audit=JSON.parse(localStorage.getItem("auditData")||"{}")
const result=JSON.parse(localStorage.getItem("result")||"{}")

const auditID="AFP-"+Date.now()

reportContent.innerHTML=`

<h2>Audit Reference</h2>
<p>${auditID}</p>

<h2>Audit Information</h2>

<p><strong>Consultant:</strong> ${audit.consultant}</p>
<p><strong>Organisation:</strong> ${audit.organisation}</p>
<p><strong>Client / Site:</strong> ${audit.client}</p>
<p><strong>Audit Title:</strong> ${audit.title}</p>
<p><strong>Assessment Date:</strong> ${audit.date}</p>

<hr>

<h2>Exposure Classification</h2>

<p><strong>Result:</strong> ${result.classification}</p>
<p><strong>Risk Score:</strong> ${result.score}</p>

`

}

})