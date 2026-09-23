import mongoose, { Schema } from 'mongoose';
import type { Role } from '../types/index.js';

export interface UserDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  walletAddress?: string;
  avatar?: string;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['patient', 'doctor', 'hospital'] },
    walletAddress: { type: String, unique: true, sparse: true, index: true },
    avatar: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.model<UserDoc>('User', userSchema);
