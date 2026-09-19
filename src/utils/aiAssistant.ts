import { ACTIVITY, AI_SUMMARIES, SHARED_WITH, type AccessReq, type MedRecord, type Role, TYPE_META } from '../data';

export type AssistantAction =
  | { label: string; type: 'navigate'; page: string }
  | { label: string; type: 'record'; recordId: string }
  | { label: string; type: 'summary'; recordId: string };

export interface AssistantContext {
  role: Role;
  page: string;
  records: MedRecord[];
  pendingAccess: AccessReq[];
  approvedAccess: AccessReq[];
}

export interface AssistantResponse {
  text: string;
  actions?: AssistantAction[];
}

const disclaimer = '\n\nFor medical decisions, please consult a qualified healthcare professional.';

function recordDetails(record: MedRecord): AssistantResponse {
  const summary = AI_SUMMARIES[record.id];
  return {
    text: `${record.id} is ${record.title}, a ${TYPE_META[record.type].label.toLowerCase()} from ${record.source} dated ${record.date}.\n\nIt is recorded with verification hash ${record.hash.slice(0, 12)}… and transaction ${record.tx.slice(0, 12)}…${summary ? '\n\nAn AI-generated summary is available for this record.' : ''}`,
    actions: [
      { label: 'View Record', type: 'record', recordId: record.id },
      ...(summary ? [{ label: 'Open AI Summary', type: 'summary' as const, recordId: record.id }] : []),
    ],
  };
}

function summaryFor(record: MedRecord): AssistantResponse {
  const summary = AI_SUMMARIES[record.id];
  if (!summary) {
    return {
      text: `There is no AI-generated summary available for ${record.title} yet. You can still review the verified record details.`,
      actions: [{ label: 'View Record', type: 'record', recordId: record.id }],
    };
  }
  const findings = summary.findings.map((finding) => `• ${finding.label}: ${finding.value}`).join('\n');
  return {
    text: `Based on your ${record.title} from ${record.source}, the AI-generated summary notes:\n\n${findings}\n\n${summary.recs.length ? `Suggested follow-up noted in the report: ${summary.recs[0]}.` : ''}${disclaimer}`,
    actions: [{ label: 'Open AI Summary', type: 'summary', recordId: record.id }, { label: 'View Record', type: 'record', recordId: record.id }],
  };
}

function patientOnly(context: AssistantContext): AssistantResponse | null {
  if (context.role === 'patient') return null;
  return {
    text: 'For privacy, MediChain AI only discusses a patient’s medical details after they are available through your authorized patient-record workflow.',
    actions: [{ label: 'Search Patient Records', type: 'navigate', page: 'search' }],
  };
}

export function processAssistantMessage(message: string, context: AssistantContext): AssistantResponse {
  const query = message.trim().toLowerCase();
  const restricted = patientOnly(context);
  const recordId = query.match(/mr-\d{3,}/i)?.[0]?.toUpperCase();

  const navigation: Array<[RegExp, string, string]> = [
    [/^(open|show).*(my )?records/, 'records', 'My Records'],
    [/^(open|show).*(ai )?summary/, 'ai', 'AI Medical Record Summary'],
    [/^(open|show).*(health )?passport/, 'passport', 'Health Passport'],
    [/^(open|show).*access requests?/, 'access', 'Access Requests'],
    [/^(open|show).*activity/, 'activity', 'Activity Log'],
    [/^(open|show).*settings?/, 'settings', 'Settings'],
  ];
  const navigationMatch = navigation.find(([pattern]) => pattern.test(query));
  if (navigationMatch && !(restricted && ['records', 'ai', 'passport', 'access'].includes(navigationMatch[1]))) {
    return { text: `Opening ${navigationMatch[2]}.`, actions: [{ label: `Open ${navigationMatch[2]}`, type: 'navigate', page: navigationMatch[1] }] };
  }

  if (context.role !== 'patient') {
    if (/search|patient/.test(query)) return { text: 'Open Patient Records to search the connected network and request authorized access.', actions: [{ label: 'Search Patient Records', type: 'navigate', page: 'search' }] };
    if (/activity/.test(query)) return { text: 'Opening the activity log.', actions: [{ label: 'Show Activity', type: 'navigate', page: 'activity' }] };
    return { text: 'I can help you navigate authorized patient records, sent requests, activity, and settings. Try “search patient records” or “show activity”.' };
  }

  if (recordId) {
    const record = context.records.find((item) => item.id === recordId);
    return record ? recordDetails(record) : { text: `I could not find ${recordId} in your current records. Try one of the record IDs listed in My Records.`, actions: [{ label: 'Open My Records', type: 'navigate', page: 'records' }] };
  }

  if (/latest|newest/.test(query) && /(report|record|summary|summar)/.test(query)) {
    const latest = context.records[0];
    if (!latest) return { text: 'You do not have any records yet. Upload a verified record to get started.', actions: [{ label: 'Upload Record', type: 'navigate', page: 'upload' }] };
    return /summary|summar/.test(query) ? summaryFor(latest) : {
      text: `Your latest record is ${latest.title} from ${latest.source}, dated ${latest.date}.`,
      actions: [{ label: 'View Record', type: 'record', recordId: latest.id }, { label: 'Open AI Summary', type: 'summary', recordId: latest.id }],
    };
  }

  if (/recent records?|what records|how many records|record list/.test(query)) {
    if (!context.records.length) return { text: 'You do not have any medical records yet.', actions: [{ label: 'Upload Record', type: 'navigate', page: 'upload' }] };
    const recent = context.records.slice(0, 3).map((record) => `• ${record.id} — ${record.title} (${record.date})`).join('\n');
    return { text: `You have ${context.records.length} medical record${context.records.length === 1 ? '' : 's'}. Your most recent records are:\n\n${recent}`, actions: [{ label: 'Open My Records', type: 'navigate', page: 'records' }] };
  }

  if (/blood test|x-ray|xray|mri|ecg|prescription|summar|explain.*(record|summary)/.test(query)) {
    const record = context.records.find((item) => query.includes(item.id.toLowerCase()) || query.includes(item.title.toLowerCase()) || (item.title.toLowerCase().includes('blood') && query.includes('blood test')) || (item.title.toLowerCase().includes('x-ray') && /x-?ray/.test(query)));
    return record ? summaryFor(record) : { text: 'Tell me the record name or ID you would like explained, such as “Summarize MR-1024”.', actions: [{ label: 'Open My Records', type: 'navigate', page: 'records' }] };
  }

  if (/who.*access|shared|access requests?|pending/.test(query)) {
    const pending = context.pendingAccess.length;
    const approved = context.approvedAccess.length;
    const shared = SHARED_WITH.filter((item) => item.status === 'active');
    const people = shared.slice(0, 3).map((item) => `• ${item.record} is shared with ${item.with}`).join('\n');
    return { text: `You have ${pending} pending access request${pending === 1 ? '' : 's'}, ${approved} approved request${approved === 1 ? '' : 's'}, and ${shared.length} active record share${shared.length === 1 ? '' : 's'}.\n\n${people || 'No active record shares are listed.'}`, actions: [{ label: 'Review Access Requests', type: 'navigate', page: 'access' }, { label: 'View Shared Records', type: 'navigate', page: 'shared' }] };
  }

  if (/passport/.test(query)) {
    return { text: `Your Health Passport is a portable overview of your ${context.records.length} record${context.records.length === 1 ? '' : 's'}, designed to help verify your health information when you need it.`, actions: [{ label: 'Open Health Passport', type: 'navigate', page: 'passport' }] };
  }

  if (/activity|what happened/.test(query)) {
    const events = ACTIVITY.slice(0, 3).map((item) => `• ${item.title}`).join('\n');
    return { text: `Your recent MediChain activity includes:\n\n${events}`, actions: [{ label: 'Open Activity Log', type: 'navigate', page: 'activity' }] };
  }

  if (/help|what can you do/.test(query)) {
    return { text: 'I can help you find records, explain existing AI summaries, open your Health Passport, review access requests, and navigate MediChain. Try “Summarize my latest report” or “What is MR-1024?”.' };
  }

  return { text: 'I can help with your MediChain records, AI summaries, Health Passport, access requests, and activity. Try asking “Summarize my latest report” or “What records do I have?”.' };
}
