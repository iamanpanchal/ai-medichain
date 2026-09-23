export type Role = 'patient' | 'doctor' | 'hospital';
export type RecType = 'lab' | 'xray' | 'mri' | 'rx' | 'ecg';
export type Region = 'heart' | 'resp' | 'digestive' | 'musco';
export type AccessStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
export type PermissionStatus = 'active' | 'expired' | 'revoked';
export type PermissionType = 'full' | 'temporary' | 'record-specific';
export type VerificationStatus = 'pending' | 'verified' | 'failed';

export type ActivityAction =
  | 'RECORD_CREATED'
  | 'RECORD_VIEWED'
  | 'RECORD_UPDATED'
  | 'RECORD_UPLOADED'
  | 'ACCESS_REQUESTED'
  | 'ACCESS_APPROVED'
  | 'ACCESS_REJECTED'
  | 'ACCESS_REVOKED'
  | 'RECORD_VERIFIED'
  | 'AI_SUMMARY_GENERATED';

export type JwtPayload = {
  userId: string;
  role: Role;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; message: string; errorCode: string };
