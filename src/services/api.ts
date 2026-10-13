import { authHeaders } from './auth';
import type { MedRecord, AISummaryData, Finding } from '../data';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000';

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message ?? 'Request failed');
  }

  return (payload?.data ?? payload) as T;
}

// ---- Records ----
export interface RecordsResponse {
  id: string;
  title: string;
  type: MedRecord['type'];
  source: string;
  date: string;
  region: MedRecord['region'];
  hash: string;
  tx: string;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  aiSummary?: AISummaryData | null;
  sharedAccess?: Array<{ doctorId: string; status: string }>;
}

export async function fetchRecords(): Promise<RecordsResponse[]> {
  return apiRequest<RecordsResponse[]>('/api/records');
}

export async function fetchRecord(id: string): Promise<RecordsResponse> {
  return apiRequest<RecordsResponse>(`/api/records/${id}`);
}

export async function verifyRecord(id: string): Promise<{
  verified: boolean;
  onChain: { hash: string; anchor: string; timestamp: number } | null;
  record: RecordsResponse;
}> {
  return apiRequest(`/api/records/${id}/verify`);
}

export interface CreateRecordInput {
  id: string;
  title: string;
  type: MedRecord['type'];
  source: string;
  date: string;
  region: MedRecord['region'];
  hash: string;
  tx: string;
}

export async function createRecord(input: CreateRecordInput): Promise<RecordsResponse> {
  return apiRequest<RecordsResponse>('/api/records', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ---- Access Requests ----
export interface AccessRequestItem {
  id: string;
  doctor: string;
  hospital: string;
  date: string;
  purpose: string;
  img?: string;
}

export interface AccessRequestsResponse {
  pending: AccessRequestItem[];
  approved: AccessRequestItem[];
  rejected: AccessRequestItem[];
}

export async function fetchAccessRequests(): Promise<AccessRequestsResponse> {
  return apiRequest<AccessRequestsResponse>('/api/access');
}

export interface DoctorAccessRequestItem {
  id: string;
  patient: string;
  patientId: string;
  hospital: string;
  scope: string;
  date: string;
  status: string;
}

export async function fetchDoctorAccessRequests(): Promise<DoctorAccessRequestItem[]> {
  return apiRequest<DoctorAccessRequestItem[]>('/api/access');
}

export async function requestAccess(patientId: string, purpose: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>('/api/access/request', {
    method: 'POST',
    body: JSON.stringify({ patientId, purpose }),
  });
}

export async function approveAccessRequest(id: string): Promise<void> {
  return apiRequest(`/api/access/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'approved' }),
  });
}

export async function rejectAccessRequest(id: string): Promise<void> {
  return apiRequest(`/api/access/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'rejected' }),
  });
}

export async function withdrawAccessRequest(id: string): Promise<void> {
  return apiRequest(`/api/access/${id}`, {
    method: 'DELETE',
  });
}

// ---- AI ----
export interface AISummaryResponse {
  id: string;
  recordId: string;
  blurb: string[];
  findings: Finding[];
  recs: string[];
  conditions: { name: string; likelihood: string }[];
  model: string;
  createdAt: string;
}

export async function generateAISummary(recordId: string): Promise<AISummaryResponse> {
  return apiRequest<AISummaryResponse>(`/api/ai/summarize/${recordId}`, {
    method: 'POST',
  });
}

export async function fetchAISummary(recordId: string): Promise<AISummaryResponse> {
  return apiRequest<AISummaryResponse>(`/api/ai/summary/${recordId}`);
}

export async function fetchActivity(): Promise<Array<{
  id: string;
  icon: string;
  color: string;
  title: string;
  meta: string;
  createdAt: string;
}>> {
  return apiRequest('/api/ai/activity');
}

// ---- Patient Search (for doctors) ----
export interface SearchablePatient {
  id: string;
  name: string;
  dob: string;
  hospital: string;
  img?: string;
  records: string[];
}

export async function searchPatients(query: string): Promise<SearchablePatient[]> {
  // This endpoint doesn't exist yet on the backend - we'll need to add it
  // For now, return empty array and handle gracefully
  try {
    return apiRequest<SearchablePatient[]>(`/api/patients/search?q=${encodeURIComponent(query)}`);
  } catch {
    return [];
  }
}