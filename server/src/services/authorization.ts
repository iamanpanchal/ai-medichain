import { Prisma, ShareStatus } from '@prisma/client';
import type { JwtPayload } from '../middleware/auth';

/**
 * Record-level access control.
 *
 * A patient may only ever read their own records. A doctor or hospital may only
 * read records that have been explicitly shared with them through an approved
 * AccessRequest (materialised as a `SharedAccess` grant). Owning an
 * `AccessRequest` in `pending` or `rejected` state grants nothing.
 */

export const ACTIVE_SHARE: ShareStatus = 'active';

export interface RecordAccessFields {
  patientId: string;
  sharedAccess?: Array<{ doctorId: string; status: string }> | null;
}

export function isPatient(user: JwtPayload): boolean {
  return user.role === 'patient';
}

/**
 * Prisma `where` fragment matching every record the user is allowed to read.
 * Used for list endpoints.
 */
export function visibleRecordsWhere(user: JwtPayload): Prisma.MedRecordWhereInput {
  return isPatient(user)
    ? { patientId: user.sub }
    : { sharedAccess: { some: { doctorId: user.sub, status: ACTIVE_SHARE } } };
}

/**
 * Authorisation check for a single already-loaded record. Use this on routes
 * that fetch by primary key, where a `where` filter cannot express the rule.
 */
export function canAccessRecord(user: JwtPayload, record: RecordAccessFields): boolean {
  if (isPatient(user)) {
    return record.patientId === user.sub;
  }

  return (record.sharedAccess ?? []).some(
    (grant) => grant.doctorId === user.sub && grant.status === ACTIVE_SHARE
  );
}
