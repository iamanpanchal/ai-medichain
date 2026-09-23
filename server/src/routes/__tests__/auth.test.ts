import request from 'supertest';
import app from '../../index';
import { prismaMock } from '../../db/__mocks__/singleton';
import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'patient',
        initials: 'T',
        walletAddress: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'patient'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should return 409 if email exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1' } as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
          role: 'patient'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'patient',
        initials: 'T',
        walletAddress: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'patient',
      } as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
