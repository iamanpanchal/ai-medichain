export type Role = 'patient' | 'doctor' | 'hospital';
export type Region = 'heart' | 'resp' | 'digestive' | 'musco';
export type RecType = 'lab' | 'xray' | 'mri' | 'rx' | 'ecg';

export interface MedRecord {
  id: string;
  title: string;
  type: RecType;
  source: string;
  date: string;
  region: Region;
  hash: string;
  tx: string;
}

export const REGION_META: Record<Region, { label: string; color: string; icon: string }> = {
  heart: { label: 'Heart & Cardiovascular', color: '#ff5c6c', icon: 'heart' },
  resp: { label: 'Respiratory', color: '#22d3ee', icon: 'wind' },
  digestive: { label: 'Digestive', color: '#ffb224', icon: 'droplet' },
  musco: { label: 'Musculoskeletal', color: '#10e5a5', icon: 'joint' },
};

export const TYPE_META: Record<RecType, { label: string; icon: string; color: string }> = {
  lab: { label: 'Lab Report', icon: 'flask', color: '#ff5c6c' },
  xray: { label: 'X-Ray', icon: 'image', color: '#2e7cf6' },
  mri: { label: 'MRI / Scan', icon: 'scan', color: '#8b5cf6' },
  rx: { label: 'Prescription', icon: 'file', color: '#10e5a5' },
  ecg: { label: 'Vitals', icon: 'activity', color: '#ffb224' },
};

export const RECORDS: MedRecord[] = [
  { id: 'MR-1024', title: 'Blood Test Report', type: 'lab', source: 'City Hospital', date: '12 Sep 2024', region: 'heart', hash: '8A72C91F4B2D836E5A01B7C4D9E2F6A83C5B0D1E4F6A9C7B', tx: '0x9a3f5b8e2c1d7f4a6b0c9e8d3f2a1b5c' },
  { id: 'MR-1019', title: 'X-Ray Chest', type: 'xray', source: 'Medicare Hospital', date: '5 Aug 2024', region: 'resp', hash: 'B41D7E9C2A05F3816C9B8D0E4A7F12C35D8E0A6B9F4C2D7E', tx: '0x7c2b9e4f1a8d3c6e0b5f7a2d9c4e8b1f' },
  { id: 'MR-1011', title: 'Prescription', type: 'rx', source: 'Dr. Emily Carter', date: '20 Jul 2024', region: 'musco', hash: 'D08F3A5C7B1E9246D1A0C8B5F3E6D29A4C7B0E1D8F2A5C3B', tx: '0x5d8a1c6e3f0b9d2a7c4e1f8b5d2a9c6e' },
  { id: 'MR-1002', title: 'ECG Reading', type: 'ecg', source: 'City Hospital', date: '28 Jun 2024', region: 'heart', hash: 'E56C2D9A8B4F1073A2C9D0E6F5B3A81C7D2E9F4A0B6C3D1E', tx: '0x3e6f2a9c8d1b5e0f4a7c2d9b6e3f0a5c' },
  { id: 'MR-0995', title: 'MRI Scan', type: 'mri', source: 'NeuroPlus Clinic', date: '22 Jun 2024', region: 'musco', hash: 'F91B4D2E6A8C0357B1D7E4F2A9C6D08E3F5A2C7B1D9E6F4A', tx: '0x8b1d5e9f2a4c7b0e3d6f1a8c5e2b9f4d' },
  { id: 'MR-0988', title: 'Lipid Panel', type: 'lab', source: 'Medicare Hospital', date: '10 Jun 2024', region: 'heart', hash: 'A72E5C8D1B3F9460C8A0D7E5F2B9C31D6E4F1A8B2C7D0E5F', tx: '0x2f8c4b1e6d9a3f0c5b8e2a7d4f1c6b9e' },
  { id: 'MR-0976', title: 'Chest CT Scan', type: 'xray', source: 'City Hospital', date: '3 May 2024', region: 'resp', hash: 'C30F8A1D5B6E2947A0C8F3D1E9B5A26C4D7E0F3A8B1C5D9E', tx: '0x9d4e7b2f1a6c8d3e0f5b2a9c6d1e4f7b' },
  { id: 'MR-0964', title: 'Vitamin D Test', type: 'lab', source: 'City Hospital', date: '18 Apr 2024', region: 'digestive', hash: '1D4B7E9A3C5F0826B9D1E4A7C2F8B53E6A0D3C9F1B5E2A8D', tx: '0x4a1f8c6d3e9b2f7a0c5d1e8b4f2a9c6d' },
  { id: 'MR-0951', title: 'Knee X-Ray', type: 'xray', source: 'OrthoCare Centre', date: '2 Apr 2024', region: 'musco', hash: 'E83A0D6C2F4B1759A8C0D5E3F1B7A42D9C6E0F8A3D2B1C5E', tx: '0x6c3b9e1d8f2a5c0b7e4f1a9d3c6b2e8f' },
  { id: 'MR-0940', title: 'Blood Pressure Log', type: 'ecg', source: 'City Hospital', date: '12 Mar 2024', region: 'heart', hash: 'B59C1F4E8A2D7063C0E9B6D4A8F2C15E3B7A0D2F6C9E4B1A', tx: '0x1e7d4b9f2a6c3e8f0d5b2a9c7e4f1b8d' },
  { id: 'MR-0928', title: 'Allergy Panel', type: 'lab', source: 'Medicare Hospital', date: '21 Feb 2024', region: 'digestive', hash: 'D27E5B9A1C4F6803B5D0E8A2F9C7B41D6E3F0A5C8D2B9E7F', tx: '0x8f5c2b9e1d4a7f3e0c6b1a8d5f2e9c3b' },
  { id: 'MR-0916', title: 'Dental Report', type: 'mri', source: 'SmileDental Clinic', date: '8 Jan 2024', region: 'musco', hash: 'A04D8C2E6B9F1537C2E6F0A3D8B5C91E4F7A2D6B0C5E8F3A', tx: '0x5b8e1f6d9a3c2e0b7d4f8a1c6e3b9f2d' },
];

export interface Finding {
  label: string;
  value: string;
  status: 'normal' | 'low' | 'high' | 'warn';
}
export interface AISummaryData {
  blurb: string[];
  findings: Finding[];
  recs: string[];
  conditions: { name: string; likelihood: string }[];
}

export const AI_SUMMARIES: Record<string, AISummaryData> = {
  'MR-1024': {
    blurb: [
      'Your blood tests are mostly within normal range. Your Vitamin D level is low and cholesterol is marginally high.',
    ],
    findings: [
      { label: 'Hemoglobin', value: 'Normal (13.5 g/dL)', status: 'normal' },
      { label: 'Vitamin D', value: 'Low (20 ng/mL)', status: 'low' },
      { label: 'Cholesterol', value: 'Marginally high (210 mg/dL)', status: 'high' },
    ],
    recs: ['Take Vitamin D supplements', 'Maintain a balanced diet', 'Follow up after 3 months'],
    conditions: [
      { name: 'Vitamin D insufficiency', likelihood: 'Likely' },
      { name: 'Mild hyperlipidemia', likelihood: 'Possible' },
    ],
  },
  'MR-1019': {
    blurb: ['No abnormalities detected in your chest X-ray. Lung fields appear clear and heart size is within normal limits.'],
    findings: [
      { label: 'Lung fields', value: 'Clear, no consolidation', status: 'normal' },
      { label: 'Pleural effusion', value: 'Not observed', status: 'normal' },
      { label: 'Heart size', value: 'Normal cardiothoracic ratio', status: 'normal' },
    ],
    recs: ['No follow-up required', 'Repeat only if symptoms appear'],
    conditions: [{ name: 'No significant findings', likelihood: 'Confirmed' }],
  },
  'MR-1011': {
    blurb: ['Your prescription was updated by Dr. Emily Carter. It continues two medications and adds a vitamin supplement.'],
    findings: [
      { label: 'Metformin', value: '500 mg, twice daily', status: 'normal' },
      { label: 'Atorvastatin', value: '10 mg, at night', status: 'normal' },
      { label: 'Vitamin D3', value: '6000 IU, weekly (new)', status: 'warn' },
    ],
    recs: ['Take Metformin after meals', 'Avoid grapefruit with Atorvastatin', 'Re-test Vitamin D in 8 weeks'],
    conditions: [{ name: 'Medication adjustment in progress', likelihood: 'Active' }],
  },
  'MR-1002': {
    blurb: ['Your ECG shows a normal sinus rhythm with no signs of arrhythmia or ischemia.'],
    findings: [
      { label: 'Rhythm', value: 'Normal sinus, 72 bpm', status: 'normal' },
      { label: 'ST segments', value: 'No significant changes', status: 'normal' },
      { label: 'QRS duration', value: '92 ms — normal', status: 'normal' },
    ],
    recs: ['No cardiac follow-up needed', 'Continue 30 min of activity daily'],
    conditions: [{ name: 'No arrhythmia detected', likelihood: 'Confirmed' }],
  },
  'MR-0995': {
    blurb: ['MRI of the lumbar spine shows mild disc degeneration at L4-L5 with no nerve compression.'],
    findings: [
      { label: 'L4-L5 disc', value: 'Mild degeneration', status: 'warn' },
      { label: 'Nerve root', value: 'No compression', status: 'normal' },
      { label: 'Spinal canal', value: 'Normal diameter', status: 'normal' },
    ],
    recs: ['Core-strengthening exercises', 'Avoid heavy lifting', 'Review with orthopedist if pain persists'],
    conditions: [{ name: 'Early lumbar spondylosis', likelihood: 'Likely' }],
  },
  'MR-0988': {
    blurb: ['Your lipid profile shows slightly elevated LDL. All other markers are within normal limits.'],
    findings: [
      { label: 'LDL', value: 'Slightly high (148 mg/dL)', status: 'high' },
      { label: 'HDL', value: 'Good (48 mg/dL)', status: 'normal' },
      { label: 'Triglycerides', value: 'Normal (132 mg/dL)', status: 'normal' },
    ],
    recs: ['Add 120 min of cardio weekly', 'Reduce saturated fats', 'Repeat panel in 6 months'],
    conditions: [{ name: 'Borderline hyperlipidemia', likelihood: 'Possible' }],
  },
  'MR-0976': {
    blurb: ['Chest CT confirms clear lungs with no nodules, masses, or interstitial changes.'],
    findings: [
      { label: 'Lung parenchyma', value: 'No nodules or masses', status: 'normal' },
      { label: 'Airways', value: 'Patent, no stenosis', status: 'normal' },
      { label: 'Lymph nodes', value: 'No mediastinal enlargement', status: 'normal' },
    ],
    recs: ['No repeat imaging required'],
    conditions: [{ name: 'No significant findings', likelihood: 'Confirmed' }],
  },
  'MR-0964': {
    blurb: ['Your Vitamin D level is below the optimal range. This is consistent with limited sun exposure.'],
    findings: [
      { label: 'Vitamin D', value: 'Low (18 ng/mL)', status: 'low' },
      { label: 'Calcium', value: 'Normal (9.2 mg/dL)', status: 'normal' },
    ],
    recs: ['Sunlight 15 min daily', 'Start Vitamin D3 6000 IU weekly', 'Re-test in 8 weeks'],
    conditions: [{ name: 'Vitamin D insufficiency', likelihood: 'Confirmed' }],
  },
  'MR-0951': {
    blurb: ['Knee X-ray shows early joint space narrowing in the medial compartment, consistent with mild osteoarthritis.'],
    findings: [
      { label: 'Joint space', value: 'Mild medial narrowing', status: 'warn' },
      { label: 'Bone density', value: 'Normal, no fracture', status: 'normal' },
    ],
    recs: ['Low-impact exercise (cycling, swimming)', 'Quadriceps strengthening', 'Weight management'],
    conditions: [{ name: 'Grade 1 osteoarthritis', likelihood: 'Likely' }],
  },
  'MR-0940': {
    blurb: ['Your blood pressure readings over 30 days average 124/79 mmHg, trending steadily downward.'],
    findings: [
      { label: 'Average BP', value: '124/79 mmHg', status: 'normal' },
      { label: 'Max reading', value: '138/86 mmHg (early morning)', status: 'warn' },
      { label: 'Trend', value: 'Improving 4% vs. prior month', status: 'normal' },
    ],
    recs: ['Reduce sodium intake', 'Keep morning logs for 2 weeks'],
    conditions: [{ name: 'Normal blood pressure', likelihood: 'Confirmed' }],
  },
  'MR-0928': {
    blurb: ['Two mild food sensitivities were detected. No clinical anaphylaxis markers were found.'],
    findings: [
      { label: 'Peanut', value: 'Mild sensitivity (IgE 3.1 kU)', status: 'warn' },
      { label: 'Dust mites', value: 'Mild (IgE 4.2 kU)', status: 'warn' },
      { label: 'Seasonal pollen', value: 'Negative', status: 'normal' },
    ],
    recs: ['Track symptoms after peanut exposure', 'Dust-proof bedding'],
    conditions: [{ name: 'Mild food sensitivity', likelihood: 'Confirmed' }],
  },
  'MR-0916': {
    blurb: ['Dental exam shows two small cavities on molars and healthy gingival tissue.'],
    findings: [
      { label: 'Molars 36/46', value: 'Small occlusal cavities', status: 'warn' },
      { label: 'Gums', value: 'Healthy, no recession', status: 'normal' },
    ],
    recs: ['Schedule filling within 4 weeks', 'Continue twice-daily brushing'],
    conditions: [{ name: 'Dental caries (mild)', likelihood: 'Confirmed' }],
  },
};

export interface Patient {
  id: string;
  name: string;
  dob: string;
  hospital: string;
  img?: string;
  records: string[];
}

export const PATIENTS: Patient[] = [
  { id: 'P-10024', name: 'Aman Panchal', dob: '14 May 1998', hospital: 'City Hospital', img: 'https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200', records: ['MR-1024', 'MR-0988', 'MR-1002'] },
  { id: 'P-10045', name: 'Neha Sharma', dob: '22 Jan 1995', hospital: 'LifeCare Hospital', records: ['MR-0964', 'MR-0928'] },
  { id: 'P-10111', name: 'Rohit Mehta', dob: '13 Sep 1990', hospital: 'Medicare Hospital', records: ['MR-1019'] },
  { id: 'P-10188', name: 'Priya Nair', dob: '7 Nov 1984', hospital: 'City Hospital', records: ['MR-0976', 'MR-1002'] },
  { id: 'P-10203', name: 'Arjun Rao', dob: '25 Jun 1979', hospital: 'LifeCare Hospital', records: ['MR-0951', 'MR-0940'] },
];

export interface AccessReq {
  id: string;
  doctor: string;
  hospital: string;
  date: string;
  purpose: string;
  img?: string;
}

export const ACCESS_PENDING: AccessReq[] = [
  {
    id: 'ar-1',
    doctor: 'Dr. Sarah Wilson',
    hospital: 'MedCare Hospital',
    date: '10 Sep 2024',
    purpose: 'Purpose: Cardiology follow-up',
    img: 'https://images.pexels.com/photos/37272329/pexels-photo-37272329.png?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
  {
    id: 'ar-2',
    doctor: 'Dr. Rahul Mehta',
    hospital: 'City Hospital',
    date: '6 Sep 2024',
    purpose: 'Purpose: Follow-up consultation',
    img: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
];

export const ACCESS_APPROVED: AccessReq[] = [
  { id: 'aa-1', doctor: 'Dr. Emily Carter', hospital: 'MedCare Hospital', date: '20 Jul 2024', purpose: 'Prescription management' },
  { id: 'aa-2', doctor: 'Dr. James Patel', hospital: 'LifeCare Hospital', date: '2 Jul 2024', purpose: 'Annual health check' },
  { id: 'aa-3', doctor: 'Dr. Anita Rao', hospital: 'City Hospital', date: '18 Jun 2024', purpose: 'Lab review' },
  { id: 'aa-4', doctor: 'Dr. Kevin Thomas', hospital: 'NeuroPlus Clinic', date: '30 May 2024', purpose: 'MRI consultation' },
  { id: 'aa-5', doctor: 'Dr. Laura Bennett', hospital: 'Medicare Hospital', date: '12 May 2024', purpose: 'X-ray review' },
];

export const ACCESS_REJECTED: AccessReq[] = [
  { id: 'aj-1', doctor: 'Dr. David Kim', hospital: 'OrthoCare Centre', date: '1 May 2024', purpose: 'General inquiry' },
];

export interface SharedItem {
  record: string;
  with: string;
  hospital: string;
  date: string;
  status: 'active' | 'expired';
}
export const SHARED_WITH: SharedItem[] = [
  { record: 'Prescription (MR-1011)', with: 'Dr. Emily Carter', hospital: 'MedCare Hospital', date: '20 Jul 2024', status: 'active' },
  { record: 'MRI Scan (MR-0995)', with: 'Dr. Kevin Thomas', hospital: 'NeuroPlus Clinic', date: '30 May 2024', status: 'active' },
  { record: 'X-Ray Chest (MR-1019)', with: 'Dr. Laura Bennett', hospital: 'Medicare Hospital', date: '12 May 2024', status: 'expired' },
  { record: 'Lipid Panel (MR-0988)', with: 'Dr. James Patel', hospital: 'LifeCare Hospital', date: '2 Jul 2024', status: 'active' },
];

export interface Activity {
  icon: string;
  color: string;
  title: string;
  meta: string;
}
export const ACTIVITY: Activity[] = [
  { icon: 'upload', color: '#2e7cf6', title: 'Blood Test Report uploaded', meta: 'City Hospital · 12 Sep 2024' },
  { icon: 'shield-check', color: '#10e5a5', title: 'Record MR-1024 verified on-chain', meta: 'Block #19,204,551 · 12 Sep 2024' },
  { icon: 'users', color: '#8b5cf6', title: 'Dr. Sarah Wilson requested access', meta: 'MedCare Hospital · 10 Sep 2024' },
  { icon: 'sparkles', color: '#22d3ee', title: 'AI summary generated for X-Ray Chest', meta: '5 Aug 2024' },
  { icon: 'download', color: '#ffb224', title: 'X-Ray Chest downloaded', meta: '5 Aug 2024' },
  { icon: 'share', color: '#ff5c6c', title: 'Prescription shared with Dr. Emily Carter', meta: '20 Jul 2024' },
];

export const NOTIFS = [
  { icon: 'users', color: '#8b5cf6', title: 'New access request', meta: 'Dr. Sarah Wilson · MedCare Hospital', time: '2h ago' },
  { icon: 'shield-check', color: '#10e5a5', title: 'Verification complete', meta: 'MR-1024 confirmed on-chain', time: '1d ago' },
  { icon: 'sparkles', color: '#22d3ee', title: 'AI insight ready', meta: 'New findings in Blood Test Report', time: '2d ago' },
];

export const HOSPITALS = ['City Hospital', 'Medicare', 'LifeCare', 'MedCare', 'NeuroPlus', 'OrthoCare', 'GlobalCare', 'SmileDental'];

export const TESTIMONIALS = [
  {
    quote: 'My records followed me from one city to the next. The new doctor had my full history before I even asked.',
    name: 'Aman Panchal',
    role: 'Patient',
    initials: 'AP',
  },
  {
    quote: 'I stopped chasing PDFs. One verified link and the complete clinical picture is right in front of me.',
    name: 'Dr. Sarah Wilson',
    role: 'Cardiologist · MedCare Hospital',
    initials: 'SW',
  },
  {
    quote: 'Onboarding 300 beds onto MediChain cut our discharge paperwork in half and eliminated record disputes.',
    name: 'Priya Desai',
    role: 'Administrator · LifeCare Hospital',
    initials: 'PD',
  },
];

export const USERS: Record<Role, { name: string; sub: string; initials: string }> = {
  patient: { name: 'Aman Panchal', sub: 'Patient', initials: 'A' },
  doctor: { name: 'Dr. Sarah Wilson', sub: 'Doctor', initials: 'SW' },
  hospital: { name: 'City Hospital', sub: 'Hospital', initials: 'CH' },
};

export const IMG_LOGIN =
  'https://images.pexels.com/photos/7943949/pexels-photo-7943949.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800';
