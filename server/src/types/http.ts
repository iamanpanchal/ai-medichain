import type { Request } from 'express';
import type { Role } from '../types/index.js';

export type AuthUser = { userId: string; role: Role };

export type AuthedRequest = Request & { user: AuthUser };
