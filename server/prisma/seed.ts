import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  // ── Users ──────────────────────────────────────────────────────────────────
  const patientPw = await bcrypt.hash('patient123', 10);
  const doctorPw  = await bcrypt.hash('doctor123', 10);
  const hospitalPw = await bcrypt.hash('hospital123', 10);

  const patient = await prisma.user.upsert({
    where: { email: 'aman@medichain.io' },
    update: {},
    create: {
      email: 'aman@medichain.io',
      password: patientPw,
      name: 'Aman Panchal',
      role: 'patient',
      initials: 'A',
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'sarah@medichain.io' },
    update: {},
    create: {
      email: 'sarah@medichain.io',
      password: doctorPw,
      name: 'Dr. Sarah Wilson',
      role: 'doctor',
      initials: 'SW',
    },
  });

  const hospital = await prisma.user.upsert({
    where: { email: 'cityhospital@medichain.io' },
    update: {},
    create: {
      email: 'cityhospital@medichain.io',
      password: hospitalPw,
      name: 'City Hospital',
      role: 'hospital',
      initials: 'CH',
    },
  });

  console.log(`✅ Users: ${patient.name}, ${doctor.name}, ${hospital.name}`);

  // ── Records ────────────────────────────────────────────────────────────────
  const records = [
    { id: 'MR-1024', title: 'Blood Test Report', type: 'lab',  source: 'City Hospital',       date: '12 Sep 2024', region: 'heart',     hash: '8A72C91F4B2D836E5A01B7C4D9E2F6A83C5B0D1E4F6A9C7B', tx: '0x9a3f5b8e2c1d7f4a6b0c9e8d3f2a1b5c' },
    { id: 'MR-1019', title: 'X-Ray Chest',       type: 'xray', source: 'Medicare Hospital',    date: '5 Aug 2024',  region: 'resp',      hash: 'B41D7E9C2A05F3816C9B8D0E4A7F12C35D8E0A6B9F4C2D7E', tx: '0x7c2b9e4f1a8d3c6e0b5f7a2d9c4e8b1f' },
    { id: 'MR-1011', title: 'Prescription',       type: 'rx',   source: 'Dr. Emily Carter',    date: '20 Jul 2024', region: 'musco',     hash: 'D08F3A5C7B1E9246D1A0C8B5F3E6D29A4C7B0E1D8F2A5C3B', tx: '0x5d8a1c6e3f0b9d2a7c4e1f8b5d2a9c6e' },
    { id: 'MR-1002', title: 'ECG Reading',        type: 'ecg',  source: 'City Hospital',       date: '28 Jun 2024', region: 'heart',     hash: 'E56C2D9A8B4F1073A2C9D0E6F5B3A81C7D2E9F4A0B6C3D1E', tx: '0x3e6f2a9c8d1b5e0f4a7c2d9b6e3f0a5c' },
    { id: 'MR-0995', title: 'MRI Scan',           type: 'mri',  source: 'NeuroPlus Clinic',    date: '22 Jun 2024', region: 'musco',     hash: 'F91B4D2E6A8C0357B1D7E4F2A9C6D08E3F5A2C7B1D9E6F4A', tx: '0x8b1d5e9f2a4c7b0e3d6f1a8c5e2b9f4d' },
    { id: 'MR-0988', title: 'Lipid Panel',        type: 'lab',  source: 'Medicare Hospital',   date: '10 Jun 2024', region: 'heart',     hash: 'A72E5C8D1B3F9460C8A0D7E5F2B9C31D6E4F1A8B2C7D0E5F', tx: '0x2f8c4b1e6d9a3f0c5b8e2a7d4f1c6b9e' },
    { id: 'MR-0976', title: 'Chest CT Scan',      type: 'xray', source: 'City Hospital',       date: '3 May 2024',  region: 'resp',      hash: 'C30F8A1D5B6E2947A0C8F3D1E9B5A26C4D7E0F3A8B1C5D9E', tx: '0x9d4e7b2f1a6c8d3e0f5b2a9c6d1e4f7b' },
    { id: 'MR-0964', title: 'Vitamin D Test',     type: 'lab',  source: 'City Hospital',       date: '18 Apr 2024', region: 'digestive', hash: '1D4B7E9A3C5F0826B9D1E4A7C2F8B53E6A0D3C9F1B5E2A8D', tx: '0x4a1f8c6d3e9b2f7a0c5d1e8b4f2a9c6d' },
    { id: 'MR-0951', title: 'Knee X-Ray',         type: 'xray', source: 'OrthoCare Centre',    date: '2 Apr 2024',  region: 'musco',     hash: 'E83A0D6C2F4B1759A8C0D5E3F1B7A42D9C6E0F8A3D2B1C5E', tx: '0x6c3b9e1d8f2a5c0b7e4f1a9d3c6b2e8f' },
    { id: 'MR-0940', title: 'Blood Pressure Log', type: 'ecg',  source: 'City Hospital',       date: '12 Mar 2024', region: 'heart',     hash: 'B59C1F4E8A2D7063C0E9B6D4A8F2C15E3B7A0D2F6C9E4B1A', tx: '0x1e7d4b9f2a6c3e8f0d5b2a9c7e4f1b8d' },
    { id: 'MR-0928', title: 'Allergy Panel',      type: 'lab',  source: 'Medicare Hospital',   date: '21 Feb 2024', region: 'digestive', hash: 'D27E5B9A1C4F6803B5D0E8A2F9C7B41D6E3F0A5C8D2B9E7F', tx: '0x8f5c2b9e1d4a7f3e0c6b1a8d5f2e9c3b' },
    { id: 'MR-0916', title: 'Dental Report',      type: 'mri',  source: 'SmileDental Clinic',  date: '8 Jan 2024',  region: 'musco',     hash: 'A04D8C2E6B9F1537C2E6F0A3D8B5C91E4F7A2D6B0C5E8F3A', tx: '0x5b8e1f6d9a3c2e0b7d4f8a1c6e3b9f2d' },
  ] as const;

  for (const r of records) {
    await prisma.medRecord.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, patientId: patient.id },
    });
  }
  console.log(`✅ Records: ${records.length} seeded`);

  // ── AI Summaries ───────────────────────────────────────────────────────────
  const summaries: Array<{ recordId: string; blurb: string[]; findings: object[]; recs: string[]; conditions: object[] }> = [
    {
      recordId: 'MR-1024',
      blurb: ['Your blood tests are mostly within normal range. Your Vitamin D level is low and cholesterol is marginally high.'],
      findings: [
        { label: 'Hemoglobin', value: 'Normal (13.5 g/dL)', status: 'normal' },
        { label: 'Vitamin D',  value: 'Low (20 ng/mL)',    status: 'low' },
        { label: 'Cholesterol', value: 'Marginally high (210 mg/dL)', status: 'high' },
      ],
      recs: ['Take Vitamin D supplements', 'Maintain a balanced diet', 'Follow up after 3 months'],
      conditions: [{ name: 'Vitamin D insufficiency', likelihood: 'Likely' }, { name: 'Mild hyperlipidemia', likelihood: 'Possible' }],
    },
    {
      recordId: 'MR-1019',
      blurb: ['No abnormalities detected in your chest X-ray. Lung fields appear clear and heart size is within normal limits.'],
      findings: [
        { label: 'Lung fields',      value: 'Clear, no consolidation',  status: 'normal' },
        { label: 'Pleural effusion', value: 'Not observed',             status: 'normal' },
        { label: 'Heart size',       value: 'Normal cardiothoracic ratio', status: 'normal' },
      ],
      recs: ['No follow-up required', 'Repeat only if symptoms appear'],
      conditions: [{ name: 'No significant findings', likelihood: 'Confirmed' }],
    },
    {
      recordId: 'MR-1002',
      blurb: ['Your ECG shows a normal sinus rhythm with no signs of arrhythmia or ischemia.'],
      findings: [
        { label: 'Rhythm',      value: 'Normal sinus, 72 bpm',    status: 'normal' },
        { label: 'ST segments', value: 'No significant changes',  status: 'normal' },
        { label: 'QRS duration', value: '92 ms — normal',         status: 'normal' },
      ],
      recs: ['No cardiac follow-up needed', 'Continue 30 min of activity daily'],
      conditions: [{ name: 'No arrhythmia detected', likelihood: 'Confirmed' }],
    },
  ];

  for (const s of summaries) {
    await prisma.aiSummary.upsert({
      where: { recordId: s.recordId },
      update: {},
      create: s,
    });
  }
  console.log(`✅ AI summaries: ${summaries.length} seeded`);

  // ── Access Requests ────────────────────────────────────────────────────────
  await prisma.accessRequest.upsert({
    where: { id: 'ar-seed-1' },
    update: {},
    create: {
      id: 'ar-seed-1',
      patientId: patient.id,
      doctorId: doctor.id,
      purpose: 'Cardiology follow-up',
      status: 'pending',
    },
  });
  console.log('✅ Access requests seeded');

  // ── Activities ─────────────────────────────────────────────────────────────
  const activities = [
    { icon: 'upload',       color: '#2e7cf6', title: 'Blood Test Report uploaded',            meta: 'City Hospital · 12 Sep 2024' },
    { icon: 'shield-check', color: '#10e5a5', title: 'Record MR-1024 verified on-chain',      meta: 'Block #19,204,551 · 12 Sep 2024' },
    { icon: 'users',        color: '#8b5cf6', title: 'Dr. Sarah Wilson requested access',     meta: 'MedCare Hospital · 10 Sep 2024' },
    { icon: 'sparkles',     color: '#22d3ee', title: 'AI summary generated for X-Ray Chest',  meta: '5 Aug 2024' },
    { icon: 'download',     color: '#ffb224', title: 'X-Ray Chest downloaded',                meta: '5 Aug 2024' },
    { icon: 'share',        color: '#ff5c6c', title: 'Prescription shared with Dr. Emily Carter', meta: '20 Jul 2024' },
  ];

  for (const a of activities) {
    await prisma.activity.create({ data: { ...a, userId: patient.id } });
  }
  console.log(`✅ Activities: ${activities.length} seeded`);

  console.log('\n🎉 Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
