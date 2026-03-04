/*
AuditFlow Pro
Runtime Engine
Version 7.6
*/

const APP_VERSION="7.6";

document.addEventListener("DOMContentLoaded",function(){

const registerButton=document.getElementById("registerAudit");
const recordsButton=document.getElementById("auditRecords");

if(registerButton){

registerButton.addEventListener("click",function(){

const consultant=document.getElementById("consultant").value;
const organisation=document.getElementById("organisation").value;
const site=document.getElementById("clientSite").value;
const title=document.getElementById("auditTitle").value;
const date=document.getElementById("assessmentDate").value;

const auditRecord={

version:APP_VERSION,
consultant:consultant,
organisation:organisation,
site:site,
title:title,
date:date,
timestamp:new Date().toISOString()

};

localStorage.setItem("auditflow_active_audit",JSON.stringify(auditRecord));

alert("Audit Registered");

});

}

if(recordsButton){

recordsButton.addEventListener("click",function(){

const record=localStorage.getItem("auditflow_active_audit");

if(record){

const data=JSON.parse(record);

alert(
"Active Audit\n\n"+
"Consultant: "+data.consultant+"\n"+
"Organisation: "+data.organisation+"\n"+
"Site: "+data.site+"\n"+
"Title: "+data.title+"\n"+
"Date: "+data.date
);

}else{

alert("No audit records stored.");

}

});

}

});