document.addEventListener("DOMContentLoaded",()=>{

const startAudit=document.getElementById("startAudit");

if(startAudit){

startAudit.onclick=()=>{

window.location="assessment.html";

};

}

const determine=document.getElementById("determineExposure");

if(determine){

determine.onclick=()=>{

localStorage.setItem("classification","Stable");

localStorage.setItem("domain","Operational Controls");

localStorage.setItem("ratio","0.93");

window.location="determination.html";

};

}

const classification=document.getElementById("classification");

if(classification){

classification.innerText=localStorage.getItem("classification");

document.getElementById("domain").innerText=localStorage.getItem("domain");

document.getElementById("ratio").innerText=localStorage.getItem("ratio");

}

const reportButton=document.getElementById("reportButton");

if(reportButton){

reportButton.onclick=()=>{

window.location="report.html";

};

}

});