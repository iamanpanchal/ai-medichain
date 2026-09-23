import type { MedicalRecordDoc } from '../models/MedicalRecord.js';
import { Patient } from '../models/Patient.js';
import { formatDisplayDate } from '../utils/dates.js';
import type { AccessRequestDoc } from '../models/AccessRequest.js';
import type { AccessPermissionDoc } from '../models/AccessPermission.js';
import type { NotificationDoc } from '../models/Notification.js';

export function recordToUi(doc: MedicalRecordDoc & { patientName?: string }) {
  return {
    id: doc.recordId,
    title: doc.title,
    type: doc.recordType,
    source: doc.source,
    date: doc.date,
    region: doc.region,
    hash: doc.fileHash,
    tx: doc.blockchainTxHash,
    patientName: doc.patientName,
    patientId: doc.patientId,
    doctorId: doc.doctorId,
    hospitalId: doc.hospitalId,
    description: doc.description,
    diagnosis: doc.diagnosis,
    prescription: doc.prescription,
    notes: doc.notes,
    fileUrl: doc.fileUrl,
    blockchainRecordId: doc.blockchainRecordId,
    verificationStatus: doc.verificationStatus,
  };
}

export async function recordToUiWithPatient(doc: MedicalRecordDoc) {
  const patient = await Patient.findOne({ patientId: doc.patientId });
  return recordToUi({ ...doc, patientName: patient?.name ?? 'Unknown patient' });
}

export function accessToUi(doc: AccessRequestDoc) {
  return {
    id: doc.requestId,
    doctor: doc.doctorName,
    hospital: doc.hospitalName,
    date: formatDisplayDate(doc.requestedAt),
    purpose: doc.purpose.startsWith('Purpose:') ? doc.purpose : doc.purpose,
    img: doc.doctorAvatar,
    status: doc.status,
    patientId: doc.patientId,
    doctorId: doc.doctorId,
    hospitalId: doc.hospitalId,
  };
}

export function permissionToUi(doc: AccessPermissionDoc) {
  return {
    record: doc.recordLabel,
    with: doc.doctorName,
    hospital: doc.hospitalName,
    date: formatDisplayDate(doc.grantedAt),
    status: doc.status === 'active' ? 'active' : 'expired',
    id: String((doc as unknown as { _id: { toString(): string } })._id),
    recordIds: doc.recordIds,
    permissionType: doc.permissionType,
  };
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const h = Math.round(diff / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function notificationToUi(doc: NotificationDoc & { createdAt?: Date; _id: { toString(): string } }) {
  return {
    id: doc._id.toString(),
    icon: doc.icon ?? 'bell',
    color: doc.color ?? '#2e7cf6',
    title: doc.title,
    meta: doc.message,
    time: timeAgo(doc.createdAt ?? new Date()),
    isRead: doc.isRead,
    type: doc.type,
  };
}

export function patientSearchToUi(patient: {
  patientId: string;
  name: string;
  dateOfBirth: string;
  hospitalName?: string;
  avatar?: string;
  email?: string;
  records: { recordId: string; title: string; source: string; date: string; recordType: string }[];
}) {
  return {
    id: patient.patientId,
    name: patient.name,
    dob: patient.dateOfBirth,
    hospital: patient.hospitalName ?? 'Unknown hospital',
    img: patient.avatar,
    email: patient.email,
    records: patient.records.map((r) => r.recordId),
    availableRecords: patient.records.map((r) => ({
      id: r.recordId,
      title: r.title,
      source: r.source,
      date: r.date,
      type: r.recordType,
    })),
  };
}
