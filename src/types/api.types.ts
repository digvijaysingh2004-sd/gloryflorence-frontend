// =======================================================
// Glory Florence API — TypeScript Contracts & Interfaces
// (.NET 8 Web API - Swagger / OpenAPI Specification)
// =======================================================

// --- Base Envelopes ---

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// --- Auth Module ---

export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

// --- Patient Module ---

export interface PatientDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  medicalHistory: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phoneNumber: string;
  address?: string;
  medicalHistory?: string;
}

export interface UpdatePatientDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phoneNumber: string;
  address?: string;
  medicalHistory?: string;
}

export interface PatientMedicalHistoryDto {
  id: number;
  patientId: number;
  diagnosis: string;
  symptoms: string;
  treatmentReceived: string;
  recordDate: string;
  remarks: string;
}

export interface CreatePatientMedicalHistoryDto {
  diagnosis: string;
  symptoms: string;
  treatmentReceived: string;
  recordDate?: string;
  remarks?: string;
}

export interface PatientDocumentDto {
  id: number;
  patientId: number;
  documentName: string;
  documentType: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

// --- Appointment Module ---

export interface AppointmentDto {
  id: number;
  patientId: number;
  patientName: string;
  patientPhoneNumber: string;
  patientEmail: string;
  physiotherapistId: number;
  physiotherapistName: string;
  physiotherapistEmail: string;
  appointmentTypeId: number;
  appointmentTypeName: string;
  durationMinutes: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status:
    | 'Scheduled'
    | 'Confirmed'
    | 'InProgress'
    | 'Completed'
    | 'Cancelled'
    | 'Rescheduled'
    | 'NoShow';
  reason: string;
  notes: string;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AppointmentFilterDto {
  dateFrom?: string;
  dateTo?: string;
  patientId?: number;
  physiotherapistId?: number;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateAppointmentDto {
  patientId: number;
  physiotherapistId: number;
  appointmentTypeId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  id: number;
  patientId: number;
  physiotherapistId: number;
  appointmentTypeId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
}

export interface RescheduleAppointmentDto {
  newAppointmentDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
}

export interface CancelAppointmentDto {
  cancellationReason: string;
}

export interface AppointmentTypeDto {
  id: number;
  name: string;
  durationMinutes: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAppointmentTypeDto {
  name: string;
  durationMinutes?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateAppointmentTypeDto {
  id: number;
  name: string;
  durationMinutes: number;
  description: string;
  isActive: boolean;
}

// --- Clinical Assessment Module ---

export interface PatientAssessmentDto {
  id: number;
  patientId: number;
  patientName: string;
  sessionId?: number | null;
  physiotherapistId: number;
  physiotherapistName: string;
  assessmentDate: string;
  chiefComplaint: string;
  currentCondition: string;
  painLevel: number;
  diagnosis: string;
  clinicalNotes: string;
  recommendations: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatePatientAssessmentDto {
  patientId: number;
  sessionId?: number | null;
  physiotherapistId: number;
  assessmentDate?: string;
  chiefComplaint: string;
  currentCondition?: string;
  painLevel: number;
  diagnosis?: string;
  clinicalNotes?: string;
  recommendations?: string;
}

export interface UpdatePatientAssessmentDto {
  sessionId?: number | null;
  physiotherapistId: number;
  assessmentDate: string;
  chiefComplaint: string;
  currentCondition?: string;
  painLevel: number;
  diagnosis?: string;
  clinicalNotes?: string;
  recommendations?: string;
}

// --- Treatment Plan Module ---

export interface TreatmentPlanDetailDto {
  id: number;
  treatmentPlanId: number;
  treatmentTypeId: number;
  treatmentTypeName: string;
  frequency: string;
  durationMinutes: number;
  instructions: string;
  numberOfSessions: number;
}

export interface CreateTreatmentPlanDetailDto {
  treatmentTypeId: number;
  frequency: string;
  durationMinutes: number;
  instructions?: string;
  numberOfSessions: number;
}

export interface TreatmentPlanDto {
  id: number;
  patientId: number;
  patientName: string;
  physiotherapistId: number;
  physiotherapistName: string;
  assessmentId: number;
  startDate: string;
  expectedEndDate: string;
  numberOfSessions: number;
  goal: string;
  notes: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Discontinued';
  createdAt: string;
  updatedAt?: string | null;
  details: TreatmentPlanDetailDto[];
}

export interface CreateTreatmentPlanDto {
  patientId: number;
  physiotherapistId: number;
  assessmentId: number;
  startDate: string;
  expectedEndDate: string;
  numberOfSessions: number;
  goal?: string;
  notes?: string;
  status?: string;
  details: CreateTreatmentPlanDetailDto[];
}

// --- Treatment Session Module ---

export interface TreatmentSessionDto {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  physiotherapistId: number;
  physiotherapistName: string;
  treatmentPlanId?: number | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  painLevelBefore?: number | null;
  painLevelAfter?: number | null;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';
  assessment: string;
  treatmentPerformed: string;
  recommendations: string;
  notes: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTreatmentSessionDto {
  appointmentId: number;
  patientId: number;
  physiotherapistId: number;
  treatmentPlanId?: number | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  painLevelBefore?: number | null;
  painLevelAfter?: number | null;
  status?: string;
  assessment?: string;
  treatmentPerformed?: string;
  recommendations?: string;
  notes?: string;
}

// --- Master Data Module ---

export interface CountryDto {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface StateDto {
  id: number;
  name: string;
  countryId: number;
  isActive: boolean;
  createdAt: string;
}

export interface CityDto {
  id: number;
  name: string;
  stateId: number;
  isActive: boolean;
  createdAt: string;
}

export interface GenderDto {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface BloodGroupDto {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface SpecializationDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface StatusDto {
  id: number;
  type: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}
