const STORAGE_KEY = "auditflowpro_v2_professional";

let state = loadState();

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    clients: [],
    audits: [],
    activeAuditId: null
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const CONTROL_LIBRARY = [
  // SECTION 1
  {section:"Site & Environment", title:"Access routes are clearly marked and unobstructed.", desc:"Walkways, corridors and traffic routes are free from blockage and clearly defined.", impact:3},
  {section:"Site & Environment", title:"Emergency exits are accessible and appropriately signed.", desc:"Exit routes are visible and free from obstruction.", impact:4},
  {section:"Site & Environment", title:"Fire detection and alarm systems are operational.", desc:"Systems are tested at defined intervals and records are available.", impact:4},
  {section:"Site & Environment", title:"Environmental hazards are identified and controlled.", desc:"Physical or structural risks are assessed and mitigated.", impact:3},
  {section:"Site & Environment", title:"Lighting levels are adequate for operational tasks.", desc:"Illumination supports safe work performance.", impact:2},
  {section:"Site & Environment", title:"Housekeeping standards are maintained.", desc:"Work areas remain orderly and free from hazard.", impact:2},
  {section:"Site & Environment", title:"External areas are maintained safely.", desc:"Perimeter and access zones present no unmanaged risk.", impact:2},
  {section:"Site & Environment", title:"Signage is clear and relevant.", desc:"Mandatory and warning notices are visible.", impact:2},
  {section:"Site & Environment", title:"Waste management practices are controlled.", desc:"Waste is segregated and stored safely.", impact:2},
  {section:"Site & Environment", title:"Structural integrity is maintained.", desc:"Buildings show no unmanaged deterioration.", impact:3},

  // SECTION 2
  {section:"Equipment & Infrastructure", title:"Critical equipment is maintained per schedule.", desc:"Preventative maintenance plans are followed.", impact:3},
  {section:"Equipment & Infrastructure", title:"Inspection records are current and complete.", desc:"Inspection documentation is traceable.", impact:2},
  {section:"Equipment & Infrastructure", title:"Safety interlocks and guards are functional.", desc:"Protective systems prevent unintended exposure.", impact:4},
  {section:"Equipment & Infrastructure", title:"Utility systems operate within safe limits.", desc:"Electrical and service systems are controlled.", impact:3},
  {section:"Equipment & Infrastructure", title:"Emergency shutdown mechanisms are functional.", desc:"Shutdown systems are tested and accessible.", impact:4},
  {section:"Equipment & Infrastructure", title:"Calibration of instruments is up to date.", desc:"Measurement devices are verified.", impact:2},
  {section:"Equipment & Infrastructure", title:"Backup systems are tested.", desc:"Redundancy is available for critical functions.", impact:3},
  {section:"Equipment & Infrastructure", title:"Infrastructure capacity supports operations.", desc:"Facilities are not overloaded.", impact:2},
  {section:"Equipment & Infrastructure", title:"Equipment labeling is accurate.", desc:"Asset and hazard labels are legible.", impact:1},
  {section:"Equipment & Infrastructure", title:"Defect reporting mechanisms are active.", desc:"Faults are recorded and resolved.", impact:2},

  // SECTION 3
  {section:"Operational Controls", title:"Standard operating procedures are documented.", desc:"Procedures are accessible and formalised.", impact:3},
  {section:"Operational Controls", title:"Procedures reflect current practice.", desc:"Documentation matches real operations.", impact:3},
  {section:"Operational Controls", title:"Change management processes are applied.", desc:"Modifications are risk assessed.", impact:4},
  {section:"Operational Controls", title:"Incident reporting is active.", desc:"Events are recorded and investigated.", impact:3},
  {section:"Operational Controls", title:"Risk assessments are reviewed periodically.", desc:"Risk registers are updated.", impact:3},
  {section:"Operational Controls", title:"Control measures are monitored.", desc:"Mitigations are verified for effectiveness.", impact:3},
  {section:"Operational Controls", title:"Third-party activities are managed.", desc:"Contractors follow defined expectations.", impact:3},
  {section:"Operational Controls", title:"Permits are enforced for high-risk tasks.", desc:"Formal approval is required before execution.", impact:4},
  {section:"Operational Controls", title:"Operational limits are respected.", desc:"Work parameters are adhered to.", impact:2},
  {section:"Operational Controls", title:"Audit findings are tracked to closure.", desc:"Corrective actions are not left unresolved.", impact:3},

  // SECTION 4
  {section:"People & Process", title:"Roles and responsibilities are defined.", desc:"Accountability is assigned.", impact:2},
  {section:"People & Process", title:"Personnel are trained for tasks.", desc:"Competency is verified.", impact:3},
  {section:"People & Process", title:"Induction processes are formalised.", desc:"New staff receive structured onboarding.", impact:2},
  {section:"People & Process", title:"Supervision levels are appropriate.", desc:"Oversight matches risk exposure.", impact:3},
  {section:"People & Process", title:"Safety culture is promoted.", desc:"Staff engagement supports safe behaviours.", impact:3},
  {section:"People & Process", title:"Communication channels are effective.", desc:"Safety information flows clearly.", impact:2},
  {section:"People & Process", title:"Disciplinary processes are consistent.", desc:"Non-compliance is addressed proportionately.", impact:2},
  {section:"People & Process", title:"Continuous improvement mechanisms exist.", desc:"Feedback drives enhancement.", impact:2},
  {section:"People & Process", title:"Management review occurs periodically.", desc:"Leadership reviews risk indicators.", impact:3},
  {section:"People & Process", title:"Resources are sufficient for safe operation.", desc:"Constraints do not compromise safety.", impact:4}
];

/* Engine + rendering remains same but now maps from CONTROL_LIBRARY */

function buildControls() {
  return CONTROL_LIBRARY.map((c, i) => ({
    id: "C" + i,
    ...c,
    response: null,
    score: 0
  }));
}

function calculateMaxRisk(controls, likelihood) {
  return controls.reduce((t, c) => t + (c.impact * likelihood), 0);
}

/* Remaining functions identical to prior structure */