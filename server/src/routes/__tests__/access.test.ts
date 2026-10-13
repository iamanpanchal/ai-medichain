import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../index';
import { prismaMock } from '../../db/__mocks__/singleton';

const PATIENT_ID = '11111111-1111-4111-8111-111111111111';
const DOCTOR_ID = '22222222-2222-4222-8222-222222222222';

describe('Access Routes', () => {
  let patientToken: string;
  let doctorToken: string;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    patientToken = jwt.sign(
      { sub: PATIENT_ID, email: 'patient@test.com', role: 'patient', name: 'Test Patient' },
      process.env.JWT_SECRET
    );
    doctorToken = jwt.sign(
      { sub: DOCTOR_ID, email: 'doc@test.com', role: 'doctor', name: 'Dr. Test' },
      process.env.JWT_SECRET
    );
  });

  describe('POST /api/access/request', () => {
    it('should reject a request from a patient', async () => {
      const res = await request(app)
        .post('/api/access/request')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ patient_id: PATIENT_ID, purpose: 'Follow-up' });

      expect(res.status).toBe(403);
    });

    it('should reject a duplicate pending request', async () => {
      prismaMock.users.findUnique.mockResolvedValue({ id: PATIENT_ID, role: 'patient' } as any);
      prismaMock.access_requests.findFirst.mockResolvedValue({ id: 'existing' } as any);

      const res = await request(app)
        .post('/api/access/request')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ patient_id: PATIENT_ID, purpose: 'Follow-up' });

      expect(res.status).toBe(409);
      expect(prismaMock.access_requests.create).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/access/:id', () => {
    const pendingRequest = {
      id: 'ar-1',
      patient_id: PATIENT_ID,
      doctor_id: DOCTOR_ID,
      purpose: 'Cardiology follow-up',
      status: 'pending',
      doctor: { name: 'Dr. Test' },
    };

    it('should grant access to every patient record on approval', async () => {
      prismaMock.access_requests.findUnique.mockResolvedValue(pendingRequest as any);
      prismaMock.access_requests.update.mockResolvedValue({ ...pendingRequest, status: 'approved' } as any);
      prismaMock.records.findMany.mockResolvedValue([
        { id: 'MR-1' },
        { id: 'MR-2' },
      ] as any);
      prismaMock.activities.create.mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/access/ar-1')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ action: 'approved' });

      expect(res.status).toBe(200);
      expect(prismaMock.shared_access.createMany).toHaveBeenCalledWith({
        data: [
          { patient_id: PATIENT_ID, doctor_id: DOCTOR_ID, record_id: 'MR-1', status: 'active' },
          { patient_id: PATIENT_ID, doctor_id: DOCTOR_ID, record_id: 'MR-2', status: 'active' },
        ],
      });
    });

    it('should revoke existing grants on rejection', async () => {
      prismaMock.access_requests.findUnique.mockResolvedValue(pendingRequest as any);
      prismaMock.access_requests.update.mockResolvedValue({ ...pendingRequest, status: 'rejected' } as any);
      prismaMock.activities.create.mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/access/ar-1')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ action: 'rejected' });

      expect(res.status).toBe(200);
      expect(prismaMock.shared_access.deleteMany).toHaveBeenCalledWith({
        where: { patient_id: PATIENT_ID, doctor_id: DOCTOR_ID },
      });
      expect(prismaMock.shared_access.createMany).not.toHaveBeenCalled();
    });

    it('should not let a patient action someone else request', async () => {
      prismaMock.access_requests.findUnique.mockResolvedValue(
        { ...pendingRequest, patient_id: 'other-patient' } as any
      );

      const res = await request(app)
        .patch('/api/access/ar-1')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ action: 'approved' });

      expect(res.status).toBe(403);
      expect(prismaMock.shared_access.createMany).not.toHaveBeenCalled();
    });

    it('should refuse to re-decide an already actioned request', async () => {
      prismaMock.access_requests.findUnique.mockResolvedValue(
        { ...pendingRequest, status: 'approved' } as any
      );

      const res = await request(app)
        .patch('/api/access/ar-1')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ action: 'rejected' });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/access/:id', () => {
    it('should revoke grants when a doctor withdraws', async () => {
      prismaMock.access_requests.findUnique.mockResolvedValue({
        id: 'ar-1',
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ID,
        status: 'pending',
      } as any);

      const res = await request(app)
        .delete('/api/access/ar-1')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(prismaMock.shared_access.deleteMany).toHaveBeenCalledWith({
        where: { patient_id: PATIENT_ID, doctor_id: DOCTOR_ID },
      });
    });

    it('should not let a different doctor withdraw the request', async () => {
      prismaMock.access_requests.findUnique.mockResolvedValue({
        id: 'ar-1',
        patient_id: PATIENT_ID,
        doctor_id: 'someone-else',
        status: 'pending',
      } as any);

      const res = await request(app)
        .delete('/api/access/ar-1')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(403);
    });
  });
});
