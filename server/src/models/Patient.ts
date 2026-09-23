import mongoose, { Schema, Types } from 'mongoose';

export interface PatientDoc {
  patientId: string;
  userId: Types.ObjectId;
  name: string;
  dateOfBirth: string;
  gender?: string;
  bloodGroup?: string;
  allergies: string[];
  emergencyContact?: string;
  hospitalName?: string;
  walletAddress?: string;
  avatar?: string;
}

const patientSchema = new Schema<PatientDoc>(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String },
    bloodGroup: { type: String },
    allergies: { type: [String], default: [] },
    emergencyContact: { type: String },
    hospitalName: { type: String },
    walletAddress: { type: String },
    avatar: { type: String },
  },
  { timestamps: true },
);

export const Patient = mongoose.model<PatientDoc>('Patient', patientSchema);
