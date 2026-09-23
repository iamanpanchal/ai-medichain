import mongoose, { Schema, Types } from 'mongoose';

export interface DoctorDoc {
  doctorId: string;
  userId: Types.ObjectId;
  name: string;
  specialization: string;
  hospitalId: string;
  licenseNumber: string;
  walletAddress?: string;
  avatar?: string;
}

const doctorSchema = new Schema<DoctorDoc>(
  {
    doctorId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    hospitalId: { type: String, required: true, index: true },
    licenseNumber: { type: String, required: true },
    walletAddress: { type: String },
    avatar: { type: String },
  },
  { timestamps: true },
);

export const Doctor = mongoose.model<DoctorDoc>('Doctor', doctorSchema);
