import mongoose, { Schema } from 'mongoose';

export interface FindingDoc {
  label: string;
  value: string;
  status: 'normal' | 'low' | 'high' | 'warn';
}

export interface AISummaryDoc {
  recordId: string;
  patientId: string;
  summary: string;
  keyFindings: FindingDoc[];
  medications: string[];
  recommendations: string[];
  conditions: { name: string; likelihood: string }[];
  modelName: string;
  generatedAt: Date;
}

const aiSummarySchema = new Schema<AISummaryDoc>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    keyFindings: {
      type: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
          status: { type: String, enum: ['normal', 'low', 'high', 'warn'], required: true },
        },
      ],
      default: [],
    },
    medications: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    conditions: {
      type: [{ name: { type: String, required: true }, likelihood: { type: String, required: true } }],
      default: [],
    },
    modelName: { type: String, default: 'MedLM-2' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const AISummary = mongoose.model<AISummaryDoc>('AISummary', aiSummarySchema);
