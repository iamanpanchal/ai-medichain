/**
 * Human-facing MediChain copy lives here so product and compliance reviews have
 * one auditable source of truth. Data-specific values remain in data.ts.
 */
export const COPY = {
  brand: 'MediChain',
  roles: { patient: 'Patient', doctor: 'Doctor', hospital: 'Hospital' },
  landing: {
    headline: 'Health Records Without Boundaries',
    features: ['Secure & Tamper-Proof', 'AI-Powered Insights', 'Access Anywhere', 'Built for a Better Tomorrow'],
    stats: ['10K+ Patients', '200+ Hospitals', '500+ Doctors', '99.9% Data Security'],
    getStarted: 'Get Started', watchVideo: 'Watch Video',
  },
  auth: {
    email: 'Email address', password: 'Password', metamask: 'Continue with MetaMask',
    signup: 'Create one', walletHelp: 'Connect your wallet to sign in securely.',
  },
  navigation: { home: 'Home', records: 'Records', doctors: 'Doctors', profile: 'Profile' },
  actions: {
    approve: 'Approve', reject: 'Reject', requestAccess: 'Request Access', upload: 'Upload Record',
    submit: 'Submit', tryAgain: 'Try Again', viewDetails: 'View Details', copied: 'Copied!',
  },
  statuses: {
    noRecords: 'No Records Yet', verificationFailed: 'Verification Failed', verified: 'Verified',
    initiating: 'Initiating', confirming: 'Confirming', finalizing: 'Finalizing',
  },
  verificationExplanation: 'The record could not be verified.',
  mobileNavigationLabel: 'Mobile navigation',
  aiDisclaimer: 'AI-generated information is for informational purposes and does not replace professional medical advice.',
  aiTabs: ['Summary', 'Key Findings', 'Medications', 'Recommendations', 'Possible Conditions'],
} as const;

export type ContentRole = keyof typeof COPY.roles;
