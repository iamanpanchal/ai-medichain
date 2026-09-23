import { mockTxHash } from '../utils/hash.js';

export type ChainResult = {
  txHash: string;
  blockchainRecordId?: string;
  network: string;
  stub: boolean;
};

function configured() {
  return Boolean(process.env.CONTRACT_ADDRESS && process.env.BLOCKCHAIN_RPC_URL && process.env.BLOCKCHAIN_PRIVATE_KEY);
}

/** Placeholder until Hardhat contracts are deployed. Never stores file contents on-chain. */
export async function createRecordOnChain(input: { recordId: string; fileHash: string; patientId: string }): Promise<ChainResult> {
  if (!configured()) {
    return {
      txHash: mockTxHash(),
      blockchainRecordId: `onchain-${input.recordId}`,
      network: 'stub',
      stub: true,
    };
  }
  // TODO: ethers.Contract.createRecord(input.recordId, input.fileHash, input.patientId)
  return {
    txHash: mockTxHash(),
    blockchainRecordId: `onchain-${input.recordId}`,
    network: process.env.BLOCKCHAIN_RPC_URL ?? 'configured',
    stub: true,
  };
}

export async function verifyRecordOnChain(input: { recordId: string; fileHash: string; txHash: string }): Promise<{ valid: boolean; txHash: string; stub: boolean }> {
  if (!configured()) {
    return { valid: Boolean(input.fileHash && input.txHash), txHash: input.txHash, stub: true };
  }
  // TODO: ethers.Contract.verifyRecord(input.recordId, input.fileHash)
  return { valid: true, txHash: input.txHash, stub: true };
}

export async function grantAccessOnChain(input: { requestId: string; patientId: string; doctorId?: string }): Promise<ChainResult> {
  return { txHash: mockTxHash(), blockchainRecordId: `perm-${input.requestId}`, network: configured() ? 'configured' : 'stub', stub: true };
}

export async function revokeAccessOnChain(input: { requestId: string; patientId: string }): Promise<ChainResult> {
  return { txHash: mockTxHash(), blockchainRecordId: `rev-${input.requestId}`, network: configured() ? 'configured' : 'stub', stub: true };
}
