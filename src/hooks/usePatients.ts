import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import type { Patient } from '../types';

/**
 * Custom hook for patient data management, filtering, searching, and reloading.
 */
export function usePatients(searchTerm: string = '') {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (patient.name && patient.name.toLowerCase().includes(term)) ||
      (patient.id && patient.id.toLowerCase().includes(term)) ||
      (patient.phone && patient.phone.includes(term)) ||
      (patient.email && patient.email.toLowerCase().includes(term))
    );
  });

  return {
    patients: filteredPatients,
    rawPatients: patients,
    loading,
    error,
    refresh: fetchPatients,
  };
}

export default usePatients;
