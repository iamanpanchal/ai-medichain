import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Hospital } from '../models/Hospital.js';
import { AppError } from '../utils/AppError.js';
import type { AuthUser } from '../types/http.js';

export async function getPatientForUser(userId: string) {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw AppError.notFound('Patient profile not found');
  return patient;
}

export async function getDoctorForUser(userId: string) {
  const doctor = await Doctor.findOne({ userId });
  if (!doctor) throw AppError.notFound('Doctor profile not found');
  return doctor;
}

export async function getHospitalForUser(userId: string) {
  const hospital = await Hospital.findOne({ userId });
  if (!hospital) throw AppError.notFound('Hospital profile not found');
  return hospital;
}

export async function actorContext(user: AuthUser) {
  if (user.role === 'patient') {
    const patient = await getPatientForUser(user.userId);
    return { patientId: patient.patientId, name: patient.name, doctorId: undefined as string | undefined, hospitalId: undefined as string | undefined };
  }
  if (user.role === 'doctor') {
    const doctor = await getDoctorForUser(user.userId);
    return { patientId: undefined as string | undefined, name: doctor.name, doctorId: doctor.doctorId, hospitalId: doctor.hospitalId };
  }
  const hospital = await getHospitalForUser(user.userId);
  return { patientId: undefined as string | undefined, name: hospital.name, doctorId: undefined as string | undefined, hospitalId: hospital.hospitalId };
}

export async function assertCanReadPatient(user: AuthUser, patientId: string) {
  if (user.role === 'patient') {
    const patient = await getPatientForUser(user.userId);
    if (patient.patientId !== patientId) throw AppError.forbidden();
  }
}
