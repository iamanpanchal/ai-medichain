import mongoose, { Schema, Types } from 'mongoose';

export interface HospitalDoc {
  hospitalId: string;
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  registrationNumber: string;
  walletAddress?: string;
}

const hospitalSchema = new Schema<HospitalDoc>(
  {
    hospitalId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    registrationNumber: { type: String, required: true },
    walletAddress: { type: String },
  },
  { timestamps: true },
);

export const Hospital = mongoose.model<HospitalDoc>('Hospital', hospitalSchema);
