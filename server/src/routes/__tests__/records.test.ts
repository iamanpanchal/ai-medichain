import request from 'supertest';
import app from '../../index';
import { prismaMock } from '../../db/__mocks__/singleton';
import jwt from 'jsonwebtoken';
import * as contract from '../../blockchain/contract';

jest.mock('../../blockchain/contract', () => ({
  anchorRecord: jest.fn().mockResolvedValue('0xmocktxhash'),
  verifyRecord: jest.fn(),
}));

describe('Records Routes', () => {
  let token: string;
  let mockPatientId = 'patient-123';

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign(
      { sub: mockPatientId, email: 'patient@test.com', role: 'patient', name: 'Test Patient' },
      process.env.JWT_SECRET
    );
  });

  describe('GET /api/records', () => {
    it('should return records for the authenticated patient', async () => {
      const mockRecords = [
        { id: 'MR-1', title: 'Lab Results', patientId: mockPatientId },
        { id: 'MR-2', title: 'X-Ray', patientId: mockPatientId }
      ];
      
      prismaMock.medRecord.findMany.mockResolvedValue(mockRecords as any);

      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(prismaMock.medRecord.findMany).toHaveBeenCalledWith({
        where: { patientId: mockPatientId },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should fail if unauthenticated', async () => {
      const res = await request(app).get('/api/records');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/records', () => {
    it('should allow patients to upload records and anchor on-chain', async () => {
      const newRecord = {
        id: 'MR-123',
        title: 'MRI Scan',
        type: 'mri',
        source: 'City Hospital',
        date: '2026-09-23',
        region: 'head', // Wait, valid regions are: 'heart', 'resp', 'digestive', 'musco' based on zod schema. Let's use 'heart'.
        hash: '0xabc123',
        tx: '0xpending'
      };

      const expectedDbRecord = { ...newRecord, region: 'heart', patientId: mockPatientId, tx: '0xmocktxhash' };
      
      prismaMock.medRecord.create.mockResolvedValue(expectedDbRecord as any);
      prismaMock.activity.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newRecord, region: 'heart' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('MRI Scan');
      expect(prismaMock.medRecord.create).toHaveBeenCalled();
      expect(prismaMock.activity.create).toHaveBeenCalled();
    });

    it('should deny non-patients from uploading', async () => {
      const doctorToken = jwt.sign(
        { sub: 'doc-123', email: 'doc@test.com', role: 'doctor', name: 'Dr. Test' },
        process.env.JWT_SECRET!
      );

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ title: 'Invalid' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only patients can upload');
    });
  });
});
