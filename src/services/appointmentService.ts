import api from './api';
import type { Appointment } from '../types';

const STORAGE_KEY = 'gf_appointments_db';

export const THERAPISTS_LIST = [
  'Dr. Glory Physiotherapist',
  'Dr. Sarah Jenkins',
  'Dr. Glory Doctor',
  'Dr. Alex Morgan',
];

export const APPOINTMENT_TYPES = [
  'Initial Assessment',
  'Physiotherapy Session',
  'Manual Therapy',
  'Sports Injury Rehab',
  'Post-Op Rehabilitation',
  'Spinal Decompression',
  'Dry Needling',
];

export const ROOMS_LIST = [
  'Room 101 (Assessment)',
  'Room 102 (Manual Therapy)',
  'Room 103 (Electrotherapy)',
  'Rehab Gym Bay A',
  'Rehab Gym Bay B',
];

// Helper to convert "10:00 AM" or "14:30" to total minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes('PM');
  const isAM = cleanTime.includes('AM');

  const parts = cleanTime.replace('AM', '').replace('PM', '').trim().split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Helper to format minutes to 12-hour "hh:mm AM/PM"
export const minutesToTimeStr = (totalMinutes: number): string => {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const padMin = mins < 10 ? `0${mins}` : mins;
  const padHour = hours12 < 10 ? `0${hours12}` : hours12;
  return `${padHour}:${padMin} ${period}`;
};

const getTodayDateStr = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDateOffsetStr = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_APPOINTMENTS_SEED: Appointment[] = [
  {
    id: 'apt_1',
    patientId: 'pat_1',
    patientName: 'Emily Watson',
    patientPhone: '+1 (555) 019-2834',
    patientEmail: 'emily.watson@gmail.com',
    therapistName: 'Dr. Glory Physiotherapist',
    date: getTodayDateStr(),
    time: '10:00 AM',
    durationMinutes: 45,
    status: 'Scheduled',
    type: 'Physiotherapy Session',
    room: 'Room 102 (Manual Therapy)',
    fee: 65,
    notes: 'Follow-up for lower back strengthening and spinal mobility.',
  },
  {
    id: 'apt_2',
    patientId: 'pat_2',
    patientName: 'Michael Chen',
    patientPhone: '+1 (555) 019-8821',
    patientEmail: 'michael.chen@techcorp.com',
    therapistName: 'Dr. Sarah Jenkins',
    date: getTodayDateStr(),
    time: '11:15 AM',
    durationMinutes: 60,
    status: 'Scheduled',
    type: 'Initial Assessment',
    room: 'Room 101 (Assessment)',
    fee: 90,
    notes: 'Severe neck stiffness and shoulder impingement after desk work.',
  },
  {
    id: 'apt_3',
    patientId: 'pat_3',
    patientName: 'Robert Davis',
    patientPhone: '+1 (555) 019-4412',
    patientEmail: 'robert.davis@outlook.com',
    therapistName: 'Dr. Glory Doctor',
    date: getTodayDateStr(),
    time: '02:00 PM',
    durationMinutes: 45,
    status: 'Scheduled',
    type: 'Spinal Decompression',
    room: 'Room 103 (Electrotherapy)',
    fee: 80,
    notes: 'Lumbar traction cycle 3 of 10. Check pain thresholds.',
  },
  {
    id: 'apt_4',
    patientId: 'pat_4',
    patientName: 'Sophia Martinez',
    patientPhone: '+1 (555) 019-7733',
    patientEmail: 'sophia.m@gmail.com',
    therapistName: 'Dr. Glory Physiotherapist',
    date: getTodayDateStr(),
    time: '03:30 PM',
    durationMinutes: 45,
    status: 'Scheduled',
    type: 'Manual Therapy',
    room: 'Room 102 (Manual Therapy)',
    fee: 75,
    notes: 'Myofascial release for hamstring tightness and knee alignment.',
  },
  {
    id: 'apt_5',
    patientId: 'pat_5',
    patientName: 'James Wilson',
    patientPhone: '+1 (555) 019-3399',
    patientEmail: 'j.wilson@sportsclub.org',
    therapistName: 'Dr. Alex Morgan',
    date: getTodayDateStr(),
    time: '04:30 PM',
    durationMinutes: 30,
    status: 'Scheduled',
    type: 'Sports Injury Rehab',
    room: 'Rehab Gym Bay A',
    fee: 55,
    notes: 'ACL reconstruction week 8 functional return protocol.',
  },
  {
    id: 'apt_6',
    patientId: 'pat_1',
    patientName: 'Emily Watson',
    patientPhone: '+1 (555) 019-2834',
    patientEmail: 'emily.watson@gmail.com',
    therapistName: 'Dr. Glory Physiotherapist',
    date: getDateOffsetStr(2),
    time: '10:00 AM',
    durationMinutes: 45,
    status: 'Scheduled',
    type: 'Physiotherapy Session',
    room: 'Room 102 (Manual Therapy)',
    fee: 65,
    notes: 'Scheduled progression session.',
  },
  {
    id: 'apt_7',
    patientId: 'pat_2',
    patientName: 'Michael Chen',
    patientPhone: '+1 (555) 019-8821',
    patientEmail: 'michael.chen@techcorp.com',
    therapistName: 'Dr. Sarah Jenkins',
    date: getDateOffsetStr(-1),
    time: '09:00 AM',
    durationMinutes: 45,
    status: 'Completed',
    type: 'Initial Assessment',
    room: 'Room 101 (Assessment)',
    fee: 90,
    notes: 'Baseline measurements recorded.',
  }
];

const getLocalStore = (): Appointment[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS_SEED));
    return INITIAL_APPOINTMENTS_SEED;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS_SEED;
  }
};

const saveLocalStore = (data: Appointment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
}

export const formatBackendTime = (timeStr?: string): string => {
  if (!timeStr) return '09:00 AM';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const padMin = minutes < 10 ? `0${minutes}` : minutes;
  const padHour = hours12 < 10 ? `0${hours12}` : hours12;
  return `${padHour}:${padMin} ${period}`;
};

export const timeTo24h = (timeStr: string): string => {
  const mins = timeToMinutes(timeStr);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const padH = h < 10 ? `0${h}` : h;
  const padM = m < 10 ? `0${m}` : m;
  return `${padH}:${padM}:00`;
};

export const mapBackendAppointment = (dto: any): Appointment => {
  if (!dto) return {} as Appointment;
  const dateStr = dto.appointmentDate ? dto.appointmentDate.split('T')[0] : (dto.date || getTodayDateStr());
  const timeStr = dto.startTime ? formatBackendTime(dto.startTime) : (dto.time || '10:00 AM');
  return {
    id: String(dto.id),
    patientId: dto.patientId ? String(dto.patientId) : undefined,
    patientName: dto.patientName || 'Patient',
    patientPhone: dto.patientPhoneNumber || dto.patientPhone || '',
    patientEmail: dto.patientEmail || '',
    therapistId: dto.physiotherapistId ? String(dto.physiotherapistId) : undefined,
    therapistName: dto.physiotherapistName || dto.therapistName || 'Dr. Glory Physiotherapist',
    date: dateStr,
    time: timeStr,
    durationMinutes: dto.durationMinutes || 45,
    status: dto.status || 'Scheduled',
    type: dto.appointmentTypeName || dto.type || 'Physiotherapy Session',
    notes: dto.notes || dto.reason || '',
    room: dto.room || 'Room 102 (Manual Therapy)',
    fee: dto.fee || 65,
  };
};

export const appointmentService = {
  getTherapists: (): string[] => THERAPISTS_LIST,
  getAppointmentTypes: (): string[] => APPOINTMENT_TYPES,
  getRooms: (): string[] => ROOMS_LIST,

  checkConflict: (
    therapistName: string,
    date: string,
    timeStr: string,
    durationMinutes: number = 45,
    excludeId?: string
  ): ConflictCheckResult => {
    const list = getLocalStore();
    const newStart = timeToMinutes(timeStr);
    const newEnd = newStart + durationMinutes;

    const conflict = list.find((a) => {
      if (excludeId && a.id === excludeId) return false;
      if (a.therapistName !== therapistName || a.date !== date) return false;
      if (a.status === 'Cancelled') return false;

      const aptStart = timeToMinutes(a.time);
      const aptEnd = aptStart + (a.durationMinutes || 45);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return newStart < aptEnd && newEnd > aptStart;
    });

    if (conflict) {
      return { hasConflict: true, conflictingAppointment: conflict };
    }
    return { hasConflict: false };
  },

  getAll: async (filters?: {
    date?: string;
    therapist?: string;
    status?: string;
    search?: string;
  }): Promise<Appointment[]> => {
    try {
      const response = await api.get('/appointments', { params: filters });
      const rawList = Array.isArray(response.data)
        ? response.data
        : (response.data?.items || []);
      let mapped: Appointment[] = rawList.map(mapBackendAppointment);

      if (filters?.date) {
        mapped = mapped.filter((a) => a.date === filters.date);
      }
      if (filters?.therapist && filters.therapist !== 'All') {
        mapped = mapped.filter((a) => a.therapistName === filters.therapist);
      }
      if (filters?.status && filters.status !== 'All') {
        mapped = mapped.filter((a) => a.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.patientName?.toLowerCase().includes(q) ||
            a.therapistName.toLowerCase().includes(q) ||
            a.type.toLowerCase().includes(q) ||
            a.notes?.toLowerCase().includes(q)
        );
      }

      mapped.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      return mapped;
    } catch {
      let list = getLocalStore();

      if (filters?.date) {
        list = list.filter((a) => a.date === filters.date);
      }
      if (filters?.therapist && filters.therapist !== 'All') {
        list = list.filter((a) => a.therapistName === filters.therapist);
      }
      if (filters?.status && filters.status !== 'All') {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.patientName?.toLowerCase().includes(q) ||
            a.therapistName.toLowerCase().includes(q) ||
            a.type.toLowerCase().includes(q) ||
            a.notes?.toLowerCase().includes(q)
        );
      }

      // Sort chronologically by date and time
      list.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      return list;
    }
  },

  getById: async (id: string): Promise<Appointment> => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return mapBackendAppointment(response.data);
    } catch {
      const list = getLocalStore();
      const apt = list.find((a) => a.id === id);
      if (!apt) throw new Error('Appointment not found');
      return apt;
    }
  },

  create: async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    try {
      const duration = appointmentData.durationMinutes || 45;
      const start24 = timeTo24h(appointmentData.time || '10:00 AM');
      const startMins = timeToMinutes(appointmentData.time || '10:00 AM');
      const end24 = minutesToTimeStr(startMins + duration);
      const endTime24 = timeTo24h(end24);

      const payload = {
        patientId: parseInt(appointmentData.patientId || '1', 10) || 1,
        physiotherapistId: parseInt(appointmentData.therapistId || '3', 10) || 3,
        appointmentTypeId: 2,
        appointmentDate: appointmentData.date ? `${appointmentData.date}T00:00:00Z` : new Date().toISOString(),
        startTime: start24,
        endTime: endTime24,
        reason: appointmentData.type || 'Physiotherapy Consultation',
        notes: appointmentData.notes || '',
      };

      const response = await api.post('/appointments', payload);
      return mapBackendAppointment(response.data);
    } catch {
      const list = getLocalStore();
      const newApt: Appointment = {
        ...appointmentData,
        id: `apt_${Date.now()}`,
        durationMinutes: appointmentData.durationMinutes || 45,
      };
      list.push(newApt);
      saveLocalStore(list);
      return newApt;
    }
  },

  update: async (id: string, updateData: Partial<Appointment>): Promise<Appointment> => {
    try {
      const response = await api.put(`/appointments/${id}`, updateData);
      return response.data;
    } catch {
      const list = getLocalStore();
      const index = list.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Appointment not found');

      const updated = {
        ...list[index],
        ...updateData,
      };
      list[index] = updated;
      saveLocalStore(list);
      return updated;
    }
  },

  updateStatus: async (
    id: string,
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show'
  ): Promise<Appointment> => {
    return appointmentService.update(id, { status });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/appointments/${id}`);
      return true;
    } catch {
      const list = getLocalStore();
      const filtered = list.filter((a) => a.id !== id);
      saveLocalStore(filtered);
      return true;
    }
  },
};
