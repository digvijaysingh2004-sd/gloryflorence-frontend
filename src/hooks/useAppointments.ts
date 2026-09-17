import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types';

/**
 * Custom hook for appointment scheduling, status filtering, and reload operations.
 */
export function useAppointments(statusFilter?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = statusFilter && statusFilter !== 'All'
    ? appointments.filter((app) => app.status.toLowerCase() === statusFilter.toLowerCase())
    : appointments;

  return {
    appointments: filteredAppointments,
    allAppointments: appointments,
    loading,
    error,
    refresh: fetchAppointments,
  };
}

export default useAppointments;
