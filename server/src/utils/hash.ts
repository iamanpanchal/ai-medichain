import { createHash, randomBytes } from 'node:crypto';

export function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex').toUpperCase();
}

export function mockTxHash() {
  return `0x${randomBytes(16).toString('hex')}`;
}
