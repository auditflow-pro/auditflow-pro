const APP_VERSION="9.0";

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

];

const scores=[0,6,12,18,24,30,36];

document.addEventListener("DOMContentLoaded",()=>{

const register=document.getElementById("registerAudit");

if(register){

register.onclick=()=>{

const audit={

consultant:document.getElementById("consultant").value,
organisation:document.getElementById("organisation").value,
site:document.getElementById("clientSite").value,
title:document.getElementById("auditTitle").value,
date:document.getElementById("assessmentDate").value

};

localStorage.setItem("audit",JSON.stringify(audit));

window.location="assessment.html";

};

}

const domainContainer=document.getElementById("domains");

if(domainContainer){

domains.forEach((d,i)=>{

const block=document.createElement("div");

block.className="domain";

const title=document.createElement("div");
title.className="domain-title";
title.innerText=d;

const row=document.createElement("div");
row.className="score-row";

scores.forEach(score=>{

const btn=document.createElement("div");

btn.className="score";

btn.innerText=score;

btn.onclick=()=>{

localStorage.setItem("domain_"+i,score);

};

row.appendChild(btn);

});

block.appendChild(title);
block.appendChild(row);

domainContainer.appendChild(block);

});

document.getElementById("determineExposure").onclick=determineExposure;

}

});

function determineExposure(){

let total=0;
let highest=0;
let highestDomain="";

domains.forEach((d,i)=>{

const s=parseInt(localStorage.getItem("domain_"+i)||0);

total+=s;

if(s>highest){

highest=s;
highestDomain=d;

}

});

const ratio=(total/200).toFixed(2);

let classification="Stable";

if(ratio>1.6) classification="Critical";
else if(ratio>1.25) classification="Severe";
else if(ratio>1.0) classification="Elevated";

alert(

"Exposure Classification: "+classification+
"\nHighest Domain: "+highestDomain+
"\nAggregate Ratio: "+ratio

);

}