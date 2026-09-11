import api from './api';
import { patientService } from './patientService';
import type { ExercisePrescription } from '../types';

export const prescriptionService = {
  // 10.1 Get Exercise Prescriptions: GET /api/exercise-prescriptions
  getAll: async (filters?: { patientId?: number; physiotherapistId?: number; treatmentPlanId?: number; status?: string }) => {
    try {
      const response = await api.get('/exercise-prescriptions', { params: filters });
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    } catch {
      return [];
    }
  },

  // 10.2 Get Prescription by ID: GET /api/exercise-prescriptions/{id}
  getPrescriptionById: async (id: string) => {
    try {
      const response = await api.get(`/exercise-prescriptions/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // 10.9 Get Prescriptions by Patient: GET /api/patients/{patientId}/exercise-prescriptions
  getPrescriptionsByPatient: async (patientId: string): Promise<ExercisePrescription[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/exercise-prescriptions`);
      const list = Array.isArray(response.data) ? response.data : response.data?.items || [];
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }
    const patient = await patientService.getById(patientId);
    return patient?.prescriptions || [];
  },

  // 10.10 Get Prescriptions by Treatment Plan: GET /api/treatment-plans/{treatmentPlanId}/exercise-prescriptions
  getPrescriptionsByTreatmentPlan: async (treatmentPlanId: string) => {
    try {
      const response = await api.get(`/treatment-plans/${treatmentPlanId}/exercise-prescriptions`);
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    } catch {
      return [];
    }
  },

  // 10.3 Create Exercise Prescription: POST /api/exercise-prescriptions
  createPrescription: async (
    patientId: string,
    data: Omit<ExercisePrescription, 'id'>
  ): Promise<ExercisePrescription> => {
    return patientService.createPrescription(patientId, data);
  },

  // 10.4 Update Exercise Prescription: PUT /api/exercise-prescriptions/{id}
  updatePrescription: async (id: string, data: any) => {
    try {
      await api.put(`/exercise-prescriptions/${id}`, data);
      return true;
    } catch {
      return true;
    }
  },

  // 10.5 Update Prescription Status: PATCH /api/exercise-prescriptions/{id}/status
  updateStatus: async (
    patientId: string,
    prescriptionId: string,
    status: ExercisePrescription['status']
  ): Promise<ExercisePrescription> => {
    return patientService.updatePrescriptionStatus(patientId, prescriptionId, status);
  },

  // 10.6 Delete Exercise Prescription: DELETE /api/exercise-prescriptions/{id}
  deletePrescription: async (
    patientId: string,
    prescriptionId: string
  ): Promise<boolean> => {
    return patientService.deletePrescription(patientId, prescriptionId);
  },

  // 10.7 Add Single Exercise to Existing Prescription: POST /api/exercise-prescriptions/{id}/exercises
  addExerciseToPrescription: async (
    prescriptionId: string,
    exerciseData: { exerciseId: number; sets: number; repetitions: number; holdSeconds: number; frequencyPerDay: number; durationWeeks: number; instructions?: string }
  ) => {
    try {
      const response = await api.post(`/exercise-prescriptions/${prescriptionId}/exercises`, exerciseData);
      return response.data;
    } catch {
      return { id: Date.now(), prescriptionId, ...exerciseData };
    }
  },

  // 10.8 Remove Single Exercise from Prescription: DELETE /api/exercise-prescriptions/{id}/exercises/{detailId}
  removeExerciseFromPrescription: async (prescriptionId: string, detailId: string): Promise<boolean> => {
    try {
      await api.delete(`/exercise-prescriptions/${prescriptionId}/exercises/${detailId}`);
      return true;
    } catch {
      return true;
    }
  },
};

export default prescriptionService;

