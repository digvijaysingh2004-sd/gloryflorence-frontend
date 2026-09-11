export * from './api.types';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin' | 'physiotherapist' | 'doctor' | 'receptionist' | 'accountant' | 'patient';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface MedicalHistory {
  id: string;
  condition: string;
  diagnosedDate: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

export interface PatientDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  url: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  therapistId?: string;
  therapistName: string;
  date: string;
  time: string;
  durationMinutes?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  type: string;
  notes?: string;
  room?: string;
  fee?: number;
}

export interface ClinicalAssessment {
  id: string;
  patientId: string;
  assessmentDate: string;
  assessedBy: string;
  chiefComplaint: string;
  painScore: number; // VAS 0 - 10
  painLocation: string;
  painType: 'Sharp' | 'Dull Aching' | 'Burning' | 'Throbbing' | 'Radiating' | 'Stiffness';
  aggravatingFactors?: string;
  relievingFactors?: string;
  romFindings?: string;
  postureAndGait?: string;
  functionalLimitations?: string;
  clinicalDiagnosis: string;
  prognosis: 'Excellent' | 'Good' | 'Fair' | 'Guarded';
  shortTermGoals: string;
  longTermGoals: string;
  recommendedFrequency: string;
  notes?: string;
}

export interface TreatmentSession {
  id: string;
  date: string;
  notes: string;
  performedBy: string;
  preSessionPain?: number;
  postSessionPain?: number;
  modalitiesConducted?: string[];
  patientTolerance?: 'Tolerated Well' | 'Mild Discomfort' | 'Fatigued' | 'Adverse Reaction';
  nextSessionPlan?: string;
}

export interface TreatmentPlan {
  id: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  sessionsCount: number;
  sessionsCompleted: number;
  status: 'Active' | 'Completed' | 'Suspended';
  goals: string;
  treatments: string[];
  treatmentFrequency?: string;
  assignedTherapist?: string;
  notes?: string;
  sessions?: TreatmentSession[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
  medicalHistory?: MedicalHistory[];
  documents?: PatientDocument[];
  appointments?: Appointment[];
  assessments?: ClinicalAssessment[];
  treatmentPlans?: TreatmentPlan[];
  prescriptions?: ExercisePrescription[];
  invoices?: Invoice[];
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    weightKg?: number;
    heightCm?: number;
    updatedAt?: string;
  };
}

export interface PrescribedExerciseItem {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  category: string;
  targetMuscleGroup: string;
  sets: number;
  reps: number;
  holdSec?: number;
  frequency: string; // e.g., '2x daily', 'Once daily', '3x / week'
  durationWeeks: number; // e.g., 4 weeks
  notes?: string; // specific therapist instructions / precautions
}

export interface ExercisePrescription {
  id: string;
  patientId: string;
  prescribedDate: string;
  prescribedBy: string;
  diagnosis: string;
  status: 'Active' | 'Completed' | 'Suspended';
  targetGoal: string;
  generalInstructions?: string;
  items: PrescribedExerciseItem[];
}

export interface TreatmentType {
  id: string;
  name: string;
  category: 'Manual Therapy' | 'Electrotherapy' | 'Exercise Therapy' | 'Hydrotherapy' | 'Specialized Rehabilitation' | 'Other';
  description: string;
  durationMinutes: number;
  defaultPrice: number;
  status: 'Active' | 'Inactive';
  requiredEquipment?: string[];
}

export interface Exercise {
  id: string;
  title: string;
  category: 'Strengthening' | 'Mobility & Stretching' | 'Core Stability' | 'Balance & Coordination' | 'Postural Correction' | 'Cardiovascular';
  targetMuscleGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  defaultSets: number;
  defaultReps: number;
  defaultHoldSec?: number;
  instructions: string[];
  precautions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

