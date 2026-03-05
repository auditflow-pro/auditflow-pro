const ledgerContainer = document.getElementById("ledger");

function loadLedger(){

let ledger = JSON.parse(localStorage.getItem("auditLedger")) || [];

ledgerContainer.innerHTML="";

ledger.forEach(audit=>{

let item=document.createElement("div");

item.className="ledger-item";

item.innerHTML=`

<strong>${audit.title}</strong><br>
${audit.client}<br>
${audit.date}

`;

ledgerContainer.appendChild(item);

});

}

document.getElementById("beginAudit").addEventListener("click",()=>{

let ledger = JSON.parse(localStorage.getItem("auditLedger")) || [];

let audit = {

consultant:document.getElementById("consultant").value,
organisation:document.getElementById("organisation").value,
client:document.getElementById("client").value,
title:document.getElementById("title").value,
date:document.getElementById("date").value,
timestamp:new Date().toISOString()

};

ledger.unshift(audit);

localStorage.setItem("auditLedger",JSON.stringify(ledger));

loadLedger();

});

loadLedger();