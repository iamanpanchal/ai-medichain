import { ethers } from 'ethers';

// Minimal ABI — only the functions we call from the backend
const ABI = [
  'function anchorRecord(string calldata recordId, bytes32 hash) external',
  'function updateRecord(string calldata recordId, bytes32 newHash) external',
  'function verifyRecord(string calldata recordId) external view returns (bytes32 hash, address anchoredBy, uint256 timestamp)',
  'function isAnchored(string calldata recordId) external view returns (bool)',
  'event RecordAnchored(string indexed recordId, bytes32 indexed hash, address indexed anchoredBy, uint256 timestamp)',
] as const;

function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.ETHEREUM_RPC_URL ?? 'http://localhost:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getSigner(): ethers.Wallet {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) throw new Error('WALLET_PRIVATE_KEY is not set in environment.');
  return new ethers.Wallet(privateKey, getProvider());
}

function getContract(withSigner = false): ethers.Contract {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error('CONTRACT_ADDRESS is not set in environment.');
  const runner = withSigner ? getSigner() : getProvider();
  return new ethers.Contract(address, ABI, runner);
}

/**
 * Anchors a record's SHA-256 hash on-chain.
 * @param recordId  MediChain record ID, e.g. "MR-1024"
 * @param hexHash   Hex string of the SHA-256 hash (with or without 0x prefix)
 * @returns         The transaction hash
 */
export async function anchorRecord(recordId: string, hexHash: string): Promise<string> {
  const contract = getContract(true);
  // Ensure the hash is padded to bytes32
  const hash32 = ethers.zeroPadValue(
    hexHash.startsWith('0x') ? hexHash : `0x${hexHash}`,
    32,
  );
  const tx = await (contract['anchorRecord'] as (id: string, h: string) => Promise<ethers.ContractTransactionResponse>)(recordId, hash32);
  await tx.wait();
  return tx.hash;
}

/**
 * Reads the on-chain anchor for a record.
 */
export async function verifyRecord(recordId: string): Promise<{
  hash: string;
  anchor: string;
  timestamp: number;
}> {
  const contract = getContract(false);
  const [hash, anchorAddr, ts] = await (contract['verifyRecord'] as (id: string) => Promise<[string, string, bigint]>)(recordId);
  return {
    hash:      hash,
    anchor:    anchorAddr,
    timestamp: Number(ts),
  };
}

/**
 * Checks whether a record has been anchored on-chain.
 */
export async function isAnchored(recordId: string): Promise<boolean> {
  const contract = getContract(false);
  return (contract['isAnchored'] as (id: string) => Promise<boolean>)(recordId);
}
