import { patientService } from './patientService';
import type { ExercisePrescription } from '../types';

export const prescriptionService = {
  getPrescriptionsByPatient: async (patientId: string): Promise<ExercisePrescription[]> => {
    const patient = await patientService.getById(patientId);
    return patient?.prescriptions || [];
  },

  createPrescription: async (
    patientId: string,
    data: Omit<ExercisePrescription, 'id'>
  ): Promise<ExercisePrescription> => {
    return patientService.createPrescription(patientId, data);
  },

  updateStatus: async (
    patientId: string,
    prescriptionId: string,
    status: ExercisePrescription['status']
  ): Promise<ExercisePrescription> => {
    return patientService.updatePrescriptionStatus(patientId, prescriptionId, status);
  },

  deletePrescription: async (
    patientId: string,
    prescriptionId: string
  ): Promise<boolean> => {
    return patientService.deletePrescription(patientId, prescriptionId);
  },
};

export default prescriptionService;
