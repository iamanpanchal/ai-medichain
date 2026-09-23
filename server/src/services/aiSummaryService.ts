import { AISummary } from '../models/AISummary.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
import { Patient } from '../models/Patient.js';

const DEMO: Record<string, { summary: string; keyFindings: { label: string; value: string; status: 'normal' | 'low' | 'high' | 'warn' }[]; medications: string[]; recommendations: string[]; conditions: { name: string; likelihood: string }[] }> = {};

export function demoSummaryFor(title: string) {
  return {
    summary: `AI draft for ${title}: findings are presented for information only and do not replace a clinician's review.`,
    keyFindings: [{ label: 'Overall', value: 'Requires clinician confirmation', status: 'warn' as const }],
    medications: [] as string[],
    recommendations: ['Discuss this report with your care team'],
    conditions: [{ name: 'Pending clinical correlation', likelihood: 'Possible' }],
  };
}

export async function getOrCreateSummary(recordId: string) {
  const existing = await AISummary.findOne({ recordId });
  if (existing) return existing;
  const record = await MedicalRecord.findOne({ recordId });
  if (!record) return null;
  const draft = DEMO[recordId] ?? demoSummaryFor(record.title);
  const created = await AISummary.create({
    recordId,
    patientId: record.patientId,
    summary: draft.summary,
    keyFindings: draft.keyFindings,
    medications: draft.medications,
    recommendations: draft.recommendations,
    conditions: draft.conditions,
    modelName: 'MedLM-2',
    generatedAt: new Date(),
  });
  await logActivity({
    patientId: record.patientId,
    action: 'AI_SUMMARY_GENERATED',
    recordId,
    description: `AI summary generated for ${record.title}`,
  });
  const patient = await Patient.findOne({ patientId: record.patientId });
  if (patient) {
    await createNotification({
      userId: patient.userId,
      type: 'AI_INSIGHT',
      title: 'AI insight ready',
      message: `New findings in ${record.title}`,
      relatedRecordId: recordId,
      icon: 'sparkles',
      color: '#22d3ee',
    });
  }
  return created;
}

export function summaryToUi(doc: {
  summary: string;
  keyFindings: { label: string; value: string; status: 'normal' | 'low' | 'high' | 'warn' }[];
  medications: string[];
  recommendations: string[];
  conditions: { name: string; likelihood: string }[];
  modelName: string;
}) {
  return {
    blurb: [doc.summary],
    findings: doc.keyFindings,
    recs: doc.recommendations,
    medications: doc.medications,
    conditions: doc.conditions,
    modelName: doc.modelName,
  };
}
