import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Hospital } from '../models/Hospital.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { newDoctorId, newHospitalId, newPatientId } from '../utils/ids.js';
import type { AuthedRequest } from '../types/http.js';
import type { Role } from '../types/index.js';

function signToken(userId: string, role: Role) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw AppError.unauthorized('Server auth is not configured', 'AUTH_MISCONFIGURED');
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
}

async function profileFor(userId: string, role: Role) {
  if (role === 'patient') return Patient.findOne({ userId }).lean();
  if (role === 'doctor') {
    const doctor = await Doctor.findOne({ userId }).lean();
    const hospital = doctor ? await Hospital.findOne({ hospitalId: doctor.hospitalId }).lean() : null;
    return { ...doctor, hospitalName: hospital?.name };
  }
  return Hospital.findOne({ userId }).lean();
}

function publicUser(user: { _id: { toString(): string }; name: string; email: string; role: Role; walletAddress?: string; avatar?: string }) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
    avatar: user.avatar,
    initials: user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, walletAddress, dateOfBirth, specialization, hospitalId, licenseNumber, phone, address, registrationNumber } = req.body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !password) throw AppError.badRequest('Name, email and password are required', 'VALIDATION_ERROR');
  if (password.length < 6) throw AppError.badRequest('Password must be at least 6 characters', 'VALIDATION_ERROR');
  const allowed: Role[] = ['patient', 'doctor', 'hospital'];
  if (!allowed.includes(role as Role)) throw AppError.badRequest('Role must be patient, doctor or hospital', 'VALIDATION_ERROR');

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw AppError.conflict('An account with that email already exists', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: role as Role,
    walletAddress: walletAddress || undefined,
  });

  if (role === 'patient') {
    await Patient.create({
      patientId: newPatientId(),
      userId: user._id,
      name: user.name,
      dateOfBirth: dateOfBirth || '1 Jan 1990',
      allergies: [],
      walletAddress: walletAddress || undefined,
    });
  } else if (role === 'doctor') {
    await Doctor.create({
      doctorId: newDoctorId(),
      userId: user._id,
      name: user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`,
      specialization: specialization || 'General',
      hospitalId: hospitalId || 'H-001',
      licenseNumber: licenseNumber || `LIC-${user._id.toString().slice(-6).toUpperCase()}`,
      walletAddress: walletAddress || undefined,
    });
  } else {
    await Hospital.create({
      hospitalId: newHospitalId(),
      userId: user._id,
      name: user.name,
      email: user.email,
      phone,
      address,
      registrationNumber: registrationNumber || `REG-${user._id.toString().slice(-6).toUpperCase()}`,
      walletAddress: walletAddress || undefined,
    });
  }

  const token = signToken(user._id.toString(), user.role);
  const profile = await profileFor(user._id.toString(), user.role);
  ok(res, { token, user: publicUser(user), profile }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) throw AppError.badRequest('Email and password are required', 'VALIDATION_ERROR');
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  if (!user) throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  const token = signToken(user._id.toString(), user.role);
  const profile = await profileFor(user._id.toString(), user.role);
  ok(res, { token, user: publicUser(user), profile });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = (req as AuthedRequest).user;
  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized('Account no longer exists');
  const profile = await profileFor(userId, role);
  ok(res, { user: publicUser(user), profile });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, { loggedOut: true });
});
