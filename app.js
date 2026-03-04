document.addEventListener("DOMContentLoaded",()=>{

const start=document.getElementById("startAudit")

if(start){

start.onclick=()=>{

const audit={
consultant:document.getElementById("consultant").value,
organisation:document.getElementById("organisation").value,
client:document.getElementById("clientSite").value,
title:document.getElementById("auditTitle").value,
date:document.getElementById("assessmentDate").value
}

localStorage.setItem("audit",JSON.stringify(audit))
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

const determine=document.getElementById("determine")

if(determine){

determine.onclick=()=>{

const answers=JSON.parse(localStorage.getItem("answers")||"{}")

let score=0

Object.values(answers).forEach(a=>{
if(a==="NO") score+=5
if(a==="YES") score+=1
})

let classification="Stable"

if(score>15) classification="Critical"
else if(score>10) classification="High"
else if(score>5) classification="Elevated"

const result={
classification,
score
}

localStorage.setItem("result",JSON.stringify(result))

window.location="determination.html"

}

}

const classification=document.getElementById("classification")

if(classification){

const r=JSON.parse(localStorage.getItem("result")||"{}")

classification.innerText=r.classification
document.getElementById("score").innerText=r.score

const seal=document.getElementById("seal")

seal.onclick=()=>window.location="report.html"

}

const report=document.getElementById("report")

if(report){

const audit=JSON.parse(localStorage.getItem("audit")||"{}")
const result=JSON.parse(localStorage.getItem("result")||"{}")

report.innerHTML=`
<p><strong>Consultant:</strong> ${audit.consultant}</p>
<p><strong>Organisation:</strong> ${audit.organisation}</p>
<p><strong>Client:</strong> ${audit.client}</p>
<p><strong>Audit Title:</strong> ${audit.title}</p>
<p><strong>Date:</strong> ${audit.date}</p>

<hr>

<h2>Exposure Classification: ${result.classification}</h2>
<p>Total Score: ${result.score}</p>
`

}

})