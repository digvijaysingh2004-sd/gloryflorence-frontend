import api from "./api";
import masterDataService from "./masterDataService";
import type { Appointment } from "../types";

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
}

// Helper to convert "10:00 AM" or "14:30" to total minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes("PM");
  const isAM = cleanTime.includes("AM");

  const parts = cleanTime.replace("AM", "").replace("PM", "").trim().split(":");
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
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const padMin = mins < 10 ? `0${mins}` : mins;
  const padHour = hours12 < 10 ? `0${hours12}` : hours12;
  return `${padHour}:${padMin} ${period}`;
};

export const formatBackendTime = (timeStr?: string): string => {
  if (!timeStr) return "09:00 AM";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const period = hours >= 12 ? "PM" : "AM";
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
  const dateStr = dto.appointmentDate
    ? dto.appointmentDate.split("T")[0]
    : dto.date || new Date().toISOString().split("T")[0];
  const timeStr = dto.startTime
    ? formatBackendTime(dto.startTime)
    : dto.time || "10:00 AM";
  const patName =
    dto.patientName ||
    (dto.patient
      ? `${dto.patient.firstName || ""} ${dto.patient.lastName || ""}`.trim()
      : "") ||
    "Patient";
  const therName =
    dto.physiotherapistName ||
    dto.therapistName ||
    (dto.physiotherapist
      ? `${dto.physiotherapist.firstName || ""} ${dto.physiotherapist.lastName || ""}`.trim()
      : "") ||
    dto.physiotherapist?.name ||
    "";

  return {
    id: String(dto.id),
    patientId: dto.patientId ? String(dto.patientId) : undefined,
    patientName: patName,
    patientPhone: dto.patientPhoneNumber || dto.patientPhone || dto.patient?.phoneNumber || "",
    patientEmail: dto.patientEmail || dto.patient?.email || "",
    therapistId: dto.physiotherapistId
      ? String(dto.physiotherapistId)
      : dto.therapistId
        ? String(dto.therapistId)
        : undefined,
    therapistName: therName,
    date: dateStr,
    time: timeStr,
    durationMinutes: dto.durationMinutes || 45,
    status: dto.status || "Scheduled",
    type:
      dto.appointmentTypeName ||
      dto.appointmentType?.name ||
      dto.type ||
      dto.reason ||
      "Physiotherapy Session",
    notes: dto.notes || dto.reason || "",
    room: dto.room || undefined,
    fee: dto.fee !== undefined ? dto.fee : undefined,
  };
};

export const appointmentService = {
  // Get Physiotherapists dynamically from masterdata
  getTherapists: async (): Promise<Array<{ id: string; name: string }>> => {
    try {
      const staff = await masterDataService.getPhysiotherapists();
      if (staff && staff.length > 0) {
        return staff.map((s) => {
          const name =
            `${s.firstName || ""} ${s.lastName || ""}`.trim() ||
            s.username ||
            `Physiotherapist ${s.id}`;
          return {
            id: String(s.id),
            name,
          };
        });
      }
    } catch {
      // Fall through to empty array
    }
    return [];
  },

  // Get Appointment Types dynamically from /api/appointment-types or /api/MasterData/appointment-types
  fetchAppointmentTypesApi: async (
    isActive?: boolean,
  ): Promise<
    Array<{
      id: number;
      name: string;
      durationMinutes?: number;
      description?: string;
      isActive?: boolean;
    }>
  > => {
    try {
      let response;
      try {
        response = await api.get("/appointment-types", {
          params: { isActive },
        });
      } catch {
        response = await api.get("/MasterData/appointment-types", {
          params: { isActive },
        });
      }
      const items = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      return items.map((t: any) => ({
        id: t.id,
        name: t.name,
        durationMinutes: t.durationMinutes || 45,
        description: t.description || "",
        isActive: t.isActive ?? true,
      }));
    } catch {
      return [];
    }
  },

  // 3.1 Get All Appointments: GET /api/appointments
  getAll: async (filters?: {
    date?: string;
    therapist?: string;
    status?: string;
    search?: string;
  }): Promise<Appointment[]> => {
    try {
      const apiParams: Record<string, any> = {};
      if (filters?.date) apiParams.date = filters.date;
      if (filters?.therapist && filters.therapist !== "All") {
        apiParams.therapist = filters.therapist;
      }
      if (filters?.status && filters.status !== "All") {
        apiParams.status = filters.status;
      }
      if (filters?.search) {
        apiParams.search = filters.search;
      }

      const response = await api.get("/appointments", { params: apiParams });
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      let mapped: Appointment[] = rawList.map(mapBackendAppointment);

      if (filters?.date) {
        mapped = mapped.filter((a) => a.date === filters.date);
      }
      if (filters?.therapist && filters.therapist !== "All") {
        const term = filters.therapist.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.therapistName?.toLowerCase() === term ||
            a.therapistId === filters.therapist,
        );
      }
      if (filters?.status && filters.status !== "All") {
        const st = filters.status.toLowerCase();
        mapped = mapped.filter((a) => a.status?.toLowerCase() === st);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.patientName?.toLowerCase().includes(q) ||
            a.therapistName?.toLowerCase().includes(q) ||
            a.type?.toLowerCase().includes(q) ||
            a.notes?.toLowerCase().includes(q),
        );
      }

      mapped.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      return mapped;
    } catch (err) {
      console.error("Error fetching appointments from API:", err);
      return [];
    }
  },

  // 3.1.1 Get Logged-In Patient's Own Appointments: GET /api/appointments/my-appointments
  getMyAppointments: async (filters?: {
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Appointment[]> => {
    try {
      const response = await api.get("/appointments/my-appointments", {
        params: filters,
      });
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      const mapped: Appointment[] = rawList.map(mapBackendAppointment);

      mapped.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      return mapped;
    } catch (err) {
      console.error("Error fetching patient appointments from API:", err);
      return [];
    }
  },

  // 3.3 Get Appointment by ID: GET /api/appointments/{id}
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return mapBackendAppointment(response.data);
  },

  // 3.2 Create Appointment: POST /api/appointments
  create: async (appointmentData: {
    patientId: string | number;
    therapistId?: string;
    appointmentTypeId?: number;
    date: string;
    time: string;
    durationMinutes?: number;
    type?: string;
    notes?: string;
  }): Promise<Appointment> => {
    const duration = appointmentData.durationMinutes || 45;
    const start24 = timeTo24h(appointmentData.time || "10:00 AM");
    const startMins = timeToMinutes(appointmentData.time || "10:00 AM");
    const end24 = minutesToTimeStr(startMins + duration);
    const endTime24 = timeTo24h(end24);

    const parsedPatId =
      appointmentData.patientId !== undefined &&
      appointmentData.patientId !== null &&
      String(appointmentData.patientId).trim() !== ""
        ? parseInt(String(appointmentData.patientId), 10)
        : 0;

    const payload = {
      patientId: Number.isNaN(parsedPatId) ? 0 : parsedPatId,
      physiotherapistId: parseInt(appointmentData.therapistId || "1", 10) || 1,
      appointmentTypeId: appointmentData.appointmentTypeId || 1, // Dynamic ID passed from selection
      appointmentDate: appointmentData.date
        ? `${appointmentData.date}T00:00:00Z`
        : new Date().toISOString(),
      startTime: start24,
      endTime: endTime24,
      reason: appointmentData.type || "Physiotherapy Consultation",
      notes: appointmentData.notes || "",
    };

    const response = await api.post("/appointments", payload);
    return mapBackendAppointment(response.data);
  },

  // 3.4 Update Appointment: PUT /api/appointments/{id}
  update: async (id: string, updateData: any): Promise<Appointment> => {
    const start24 = updateData.time ? timeTo24h(updateData.time) : "10:00:00";
    const duration = updateData.durationMinutes || 45;
    const startMins = updateData.time ? timeToMinutes(updateData.time) : 600;
    const end24 = minutesToTimeStr(startMins + duration);
    const endTime24 = timeTo24h(end24);

    const payload: any = {
      id: parseInt(id, 10) || id,
      patientId: parseInt(updateData.patientId || "1", 10) || 1,
      physiotherapistId: parseInt(updateData.therapistId || "1", 10) || 1,
      appointmentTypeId: updateData.appointmentTypeId || 1,
      appointmentDate: updateData.date
        ? `${updateData.date}T00:00:00Z`
        : new Date().toISOString(),
      startTime: start24,
      endTime: endTime24,
      status: updateData.status || "Scheduled",
      reason: updateData.type || updateData.reason || "",
      notes: updateData.notes || "",
    };

    const response = await api.put(`/appointments/${id}`, payload);
    if (!response.data || Object.keys(response.data).length === 0) {
      return appointmentService.getById(id);
    }
    return mapBackendAppointment(response.data);
  },

  // Update Status
  updateStatus: async (
    id: string,
    status: "Scheduled" | "Completed" | "Cancelled" | "No Show",
  ): Promise<Appointment> => {
    if (status === "Cancelled") {
      try {
        await api.put(`/appointments/${id}/cancel`, {
          cancellationReason: "Cancelled from system UI",
        });
      } catch {
        // Fallback to general update if cancel endpoint is restricted
      }
    }
    return appointmentService.update(id, { status });
  },

  // 3.5 Reschedule Appointment: PUT /api/appointments/{id}/reschedule
  reschedule: async (
    id: string,
    data: {
      newAppointmentDate: string;
      newStartTime: string;
      newEndTime: string;
      reason?: string;
    },
  ): Promise<boolean> => {
    await api.put(`/appointments/${id}/reschedule`, data);
    return true;
  },

  // 3.6 Cancel Appointment: PUT /api/appointments/{id}/cancel
  cancel: async (id: string, cancellationReason: string): Promise<boolean> => {
    await api.put(`/appointments/${id}/cancel`, { cancellationReason });
    return true;
  },

  // 3.8 Check Appointment Conflict: GET /api/appointments/check-conflict
  checkApiConflict: async (params: {
    physiotherapistId: number;
    date: string;
    startTime: string;
    endTime: string;
    excludeAppointmentId?: number;
  }): Promise<boolean> => {
    try {
      const response = await api.get("/appointments/check-conflict", {
        params,
      });
      return response.data === true;
    } catch {
      return false;
    }
  },

  // Delete Appointment
  delete: async (id: string): Promise<boolean> => {
    await api.delete(`/appointments/${id}`);
    return true;
  },

  // --- Section 4 Appointment Types CRUD Methods ---

  getAppointmentTypeById: async (id: number) => {
    try {
      const response = await api.get(`/appointment-types/${id}`);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const response = await api.get(`/MasterData/appointment-types/${id}`);
        return response.data;
      }
      throw err;
    }
  },

  createAppointmentType: async (data: {
    name: string;
    durationMinutes?: number;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await api.post("/appointment-types", data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const response = await api.post("/MasterData/appointment-types", data);
        return response.data;
      }
      throw err;
    }
  },

  updateAppointmentType: async (
    id: number,
    data: {
      name: string;
      durationMinutes: number;
      description?: string;
      isActive: boolean;
    },
  ) => {
    try {
      await api.put(`/appointment-types/${id}`, { id, ...data });
      return true;
    } catch (err: any) {
      if (err.response?.status === 404) {
        await api.put(`/MasterData/appointment-types/${id}`, { id, ...data });
        return true;
      }
      throw err;
    }
  },

  deleteAppointmentType: async (id: number) => {
    try {
      await api.delete(`/appointment-types/${id}`);
      return true;
    } catch (err: any) {
      if (err.response?.status === 404) {
        await api.delete(`/MasterData/appointment-types/${id}`);
        return true;
      }
      throw err;
    }
  },
};

export default appointmentService;
