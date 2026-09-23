export function newRecordId() {
  const n = 2000 + Math.floor(Math.random() * 8000);
  return `MR-${n}`;
}

export function newRequestId() {
  return `ar-${Date.now().toString(36)}`;
}

export function newPatientId() {
  return `P-${10000 + Math.floor(Math.random() * 89999)}`;
}

export function newDoctorId() {
  return `D-${1000 + Math.floor(Math.random() * 8999)}`;
}

export function newHospitalId() {
  return `H-${100 + Math.floor(Math.random() * 899)}`;
}
