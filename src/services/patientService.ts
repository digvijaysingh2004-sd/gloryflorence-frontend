import api from "./api";
import type {
  Patient,
  ClinicalAssessment,
  TreatmentPlan,
  TreatmentSession,
  ExercisePrescription,
  PatientDocument,
  MedicalHistory,
} from "../types";

export const mapBackendPatient = (dto: any): Patient => {
  if (!dto) return {} as Patient;
  const fullName =
    dto.name ||
    `${dto.firstName || ""} ${dto.lastName || ""}`.trim() ||
    "Patient";

  // Construct location from nested address fields or direct address string
  const streetAddress = dto.address || dto.streetAddress || "";
  const city = dto.city || dto.cityName || "";
  const state = dto.state || dto.stateName || "";
  const country = dto.country || dto.countryName || "";

  const hasVitals =
    dto.vitals ||
    dto.bloodPressure ||
    dto.heartRate ||
    dto.weightKg ||
    dto.heightCm ||
    dto.temperature ||
    dto.oxygenSaturation;

  return {
    id: String(dto.id),
    name: fullName,
    email: dto.email || "",
    phone: dto.phoneNumber || dto.phone || "",
    gender: dto.gender || "",
    dateOfBirth: dto.dateOfBirth ? dto.dateOfBirth.split("T")[0] : "",
    bloodGroup: dto.bloodGroup || "",
    address: streetAddress,
    city: city,
    state: state,
    country: country,
    emergencyContactName: dto.emergencyContactName || "",
    emergencyContactPhone: dto.emergencyContactPhone || "",
    registrationDate:
      dto.registrationDate || dto.createdAt
        ? (dto.registrationDate || dto.createdAt).split("T")[0]
        : new Date().toISOString().split("T")[0],
    status: dto.status || (dto.isActive === false ? "Inactive" : "Active"),
    vitals: hasVitals
      ? {
          bloodPressure:
            dto.vitals?.bloodPressure || dto.bloodPressure || undefined,
          heartRate: dto.vitals?.heartRate ?? dto.heartRate ?? undefined,
          weightKg: dto.vitals?.weightKg ?? dto.weightKg ?? undefined,
          heightCm: dto.vitals?.heightCm ?? dto.heightCm ?? undefined,
          temperature: dto.vitals?.temperature ?? dto.temperature ?? undefined,
          oxygenSaturation:
            dto.vitals?.oxygenSaturation ?? dto.oxygenSaturation ?? undefined,
          updatedAt: dto.vitals?.updatedAt || dto.vitalsUpdatedAt || undefined,
        }
      : undefined,
    medicalHistory: Array.isArray(dto.medicalHistory)
      ? dto.medicalHistory
      : typeof dto.medicalHistory === "string" && dto.medicalHistory
        ? [
            {
              id: "mh_1",
              condition: dto.medicalHistory,
              diagnosedDate: new Date().toISOString().split("T")[0],
              severity: "Moderate",
              status: "Active",
            },
          ]
        : [],
    documents: dto.documents || [],
    appointments: dto.appointments || [],
    assessments: dto.assessments || [],
    treatmentPlans: dto.treatmentPlans || [],
    prescriptions: dto.prescriptions || [],
    invoices: dto.invoices || [],
  };
};

export const mapBackendPrescription = (dto: any): ExercisePrescription => {
  if (!dto) return {} as ExercisePrescription;
  const rawItems = Array.isArray(dto.items)
    ? dto.items
    : Array.isArray(dto.exercises)
      ? dto.exercises
      : Array.isArray(dto.details)
        ? dto.details
        : [];

  const items = rawItems.map((item: any) => ({
    id: String(item.id || item.exerciseId || Date.now()),
    exerciseId: String(item.exerciseId || item.id || "1"),
    exerciseTitle:
      item.exerciseTitle ||
      item.exerciseName ||
      item.exercise?.title ||
      item.exercise?.name ||
      "Exercise Movement",
    category:
      item.category ||
      item.exerciseCategory ||
      item.exercise?.category ||
      "Strengthening",
    targetMuscleGroup:
      item.targetMuscleGroup ||
      item.exercise?.targetMuscleGroup ||
      "General",
    sets: Number(item.sets) || 3,
    reps: Number(item.reps || item.repetitions) || 10,
    holdSec: Number(item.holdSec || item.holdSeconds) || 3,
    frequency:
      item.frequency ||
      (item.frequencyPerDay ? `${item.frequencyPerDay}x daily` : "Once daily"),
    durationWeeks: Number(item.durationWeeks) || 4,
    notes: item.notes || item.instructions || "",
  }));

  return {
    id: String(dto.id),
    patientId: String(dto.patientId || ""),
    prescribedDate: dto.prescribedDate
      ? dto.prescribedDate.split("T")[0]
      : dto.createdAt
        ? dto.createdAt.split("T")[0]
        : new Date().toISOString().split("T")[0],
    prescribedBy:
      dto.physiotherapistName ||
      dto.prescribedBy ||
      (dto.physiotherapist
        ? `${dto.physiotherapist.firstName || ""} ${dto.physiotherapist.lastName || ""}`.trim()
        : "") ||
      "Physiotherapist",
    diagnosis: dto.diagnosis || "Physiotherapy Treatment",
    status: dto.status || "Active",
    targetGoal: dto.targetGoal || dto.goal || "",
    generalInstructions: dto.generalInstructions || "",
    items,
  };
};

export const patientService = {
  // GET /api/Patients
  getAll: async (filters?: {
    search?: string;
    status?: string;
    gender?: string;
  }): Promise<Patient[]> => {
    try {
      const response = await api.get("/patients", { params: filters });
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      let mapped: Patient[] = rawList.map(mapBackendPatient);

      if (filters?.search) {
        const lower = filters.search.toLowerCase();
        mapped = mapped.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.email.toLowerCase().includes(lower) ||
            p.phone.includes(lower) ||
            p.city.toLowerCase().includes(lower) ||
            p.address.toLowerCase().includes(lower),
        );
      }
      if (filters?.status && filters.status !== "All") {
        mapped = mapped.filter((p) => p.status === filters.status);
      }
      if (filters?.gender && filters.gender !== "All") {
        mapped = mapped.filter(
          (p) => p.gender.toLowerCase() === filters.gender?.toLowerCase(),
        );
      }
      return mapped;
    } catch (err) {
      console.error("Failed to fetch patients from backend API:", err);
      return [];
    }
  },

  // GET /api/Patients/{id}
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    const patient = mapBackendPatient(response.data);

    // Fetch all sub-resources concurrently using Promise.allSettled
    const [
      historyRes,
      docsRes,
      asmRes,
      plansRes,
      sessionsRes,
      rxRes,
      apptsRes,
      invoicesRes,
    ] = await Promise.allSettled([
      patientService.getMedicalHistory(id),
      patientService.getDocuments(id),
      patientService.getAssessments(id),
      patientService.getTreatmentPlans(id),
      patientService.getSessions(id),
      patientService.getPrescriptions(id),
      api.get("/appointments", { params: { patientId: id } }),
      api.get(`/patients/${id}/invoices`),
    ]);

    if (historyRes.status === "fulfilled" && historyRes.value?.length) {
      patient.medicalHistory = historyRes.value;
    }
    if (docsRes.status === "fulfilled" && docsRes.value?.length) {
      patient.documents = docsRes.value;
    }
    if (asmRes.status === "fulfilled" && asmRes.value?.length) {
      patient.assessments = asmRes.value;
    }

    let sessionsList: TreatmentSession[] = [];
    if (sessionsRes.status === "fulfilled" && sessionsRes.value?.length) {
      sessionsList = sessionsRes.value;
    }

    if (plansRes.status === "fulfilled" && plansRes.value?.length) {
      patient.treatmentPlans = plansRes.value.map((plan) => {
        const planSessions = sessionsList.filter(
          (s) => String(s.planId) === String(plan.id) || (!s.planId && plan.status === "Active")
        );
        const mergedSessions = planSessions.length ? planSessions : (plan.sessions || []);
        return {
          ...plan,
          sessions: mergedSessions,
          sessionsCompleted: mergedSessions.length || plan.sessionsCompleted || 0,
        };
      });
    }

    if (rxRes.status === "fulfilled" && rxRes.value?.length) {
      patient.prescriptions = rxRes.value;
    }

    if (apptsRes.status === "fulfilled") {
      const rawAppts = Array.isArray(apptsRes.value.data)
        ? apptsRes.value.data
        : apptsRes.value.data?.items || [];
      const mappedAppts = rawAppts
        .map((a: any) => ({
          id: String(a.id),
          patientId: String(a.patientId || id),
          patientName: a.patientName || patient.name,
          patientPhone: a.patientPhoneNumber || a.patientPhone || patient.phone,
          patientEmail: a.patientEmail || patient.email,
          therapistId: a.physiotherapistId ? String(a.physiotherapistId) : undefined,
          therapistName: a.physiotherapistName || a.therapistName || "",
          date: a.appointmentDate ? a.appointmentDate.split("T")[0] : a.date || "",
          time: a.startTime || a.time || "10:00 AM",
          durationMinutes: a.durationMinutes || 45,
          status: a.status || "Scheduled",
          type: a.appointmentTypeName || a.type || a.reason || "Physiotherapy Session",
          notes: a.notes || a.reason || "",
        }))
        .filter(
          (a: any) =>
            String(a.patientId) === String(id) ||
            a.patientName?.toLowerCase() === patient.name?.toLowerCase()
        );
      if (mappedAppts.length) {
        patient.appointments = mappedAppts;
      }
    }

    if (invoicesRes.status === "fulfilled") {
      const rawInv = Array.isArray(invoicesRes.value.data)
        ? invoicesRes.value.data
        : invoicesRes.value.data?.items || [];
      if (rawInv.length) {
        patient.invoices = rawInv.map((inv: any) => ({
          id: String(inv.id),
          invoiceNumber: inv.invoiceNumber || `INV-${inv.id}`,
          date: inv.issueDate ? inv.issueDate.split("T")[0] : inv.date || "",
          dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
          amount: inv.totalAmount || inv.amount || 0,
          paidAmount: inv.paidAmount || 0,
          balanceAmount: inv.balanceAmount ?? (inv.totalAmount - (inv.paidAmount || 0)),
          status: inv.status || "Unpaid",
        }));
      }
    }

    return patient;
  },

  // GET /api/patients/{patientId}/sessions
  getSessions: async (patientId: string): Promise<TreatmentSession[]> => {
    try {
      let response;
      try {
        response = await api.get(`/patients/${patientId}/sessions`);
      } catch {
        response = await api.get(`/patients/${patientId}/treatment-sessions`);
      }
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      return rawList.map((s: any) => ({
        id: String(s.id),
        planId: String(s.treatmentPlanId || s.planId || ""),
        appointmentId: String(s.appointmentId || ""),
        date: s.sessionDate ? s.sessionDate.split("T")[0] : s.date || new Date().toISOString().split("T")[0],
        performedBy: s.physiotherapistName || s.performedBy || "Physiotherapist",
        preSessionPain: s.painLevelBefore ?? s.preSessionPain ?? 5,
        postSessionPain: s.painLevelAfter ?? s.postSessionPain ?? 3,
        modalitiesConducted: s.modalitiesConducted
          ? (typeof s.modalitiesConducted === "string"
              ? s.modalitiesConducted.split(",").map((item: string) => item.trim()).filter(Boolean)
              : s.modalitiesConducted)
          : [],
        patientTolerance: s.patientTolerance || "Good",
        notes: s.notes || s.assessment || "",
        nextSessionPlan: s.nextSessionPlan || "",
      }));
    } catch {
      return [];
    }
  },

  // GET /api/patients/{patientId}/exercise-prescriptions
  getPrescriptions: async (patientId: string): Promise<ExercisePrescription[]> => {
    let rawList: any[] = [];
    try {
      const res1 = await api.get(`/patients/${patientId}/exercise-prescriptions`, {
        suppressToast: true,
      } as any);
      const list1 = Array.isArray(res1.data)
        ? res1.data
        : res1.data?.items || [];
      if (list1.length > 0) rawList = list1;
    } catch {
      // Fall through
    }

    if (rawList.length === 0) {
      try {
        const res2 = await api.get(`/patients/${patientId}/prescriptions`, {
          suppressToast: true,
        } as any);
        const list2 = Array.isArray(res2.data)
          ? res2.data
          : res2.data?.items || [];
        if (list2.length > 0) rawList = list2;
      } catch {
        // Fall through
      }
    }

    if (rawList.length === 0) {
      try {
        const res3 = await api.get(`/exercise-prescriptions`, {
          params: { patientId: parseInt(patientId, 10) || patientId },
          suppressToast: true,
        } as any);
        const list3 = Array.isArray(res3.data)
          ? res3.data
          : res3.data?.items || [];
        if (list3.length > 0) rawList = list3;
      } catch {
        // Fall through
      }
    }

    return rawList.map(mapBackendPrescription);
  },

  // POST /api/Patients
  create: async (
    patientData: Omit<Patient, "id" | "registrationDate">,
  ): Promise<Patient> => {
    const nameParts = (patientData.name || "").trim().split(" ");
    const firstName = nameParts[0] || "New";
    const lastName = nameParts.slice(1).join(" ") || "Patient";

    const payload = {
      firstName,
      lastName,
      dateOfBirth: patientData.dateOfBirth
        ? `${patientData.dateOfBirth}T00:00:00Z`
        : new Date().toISOString(),
      gender: patientData.gender || "Other",
      bloodGroup: patientData.bloodGroup || "O+",
      email: patientData.email || "",
      phoneNumber: patientData.phone || "",
      address: patientData.address || "",
      city: patientData.city || "",
      state: patientData.state || "",
      country: patientData.country || "",
      emergencyContactName: patientData.emergencyContactName || "",
      emergencyContactPhone: patientData.emergencyContactPhone || "",
      medicalHistory:
        typeof patientData.medicalHistory === "string"
          ? patientData.medicalHistory
          : "",
    };

    const response = await api.post("/patients", payload);
    return mapBackendPatient(response.data);
  },

  // PUT /api/Patients/{id}
  update: async (
    id: string,
    updateData: Partial<Patient>,
  ): Promise<Patient> => {
    // 1. Fetch current patient entity to preserve any fields not included in updateData
    const current = await patientService.getById(id).catch(() => null);

    let firstName = "";
    let lastName = "";

    if (updateData.name && updateData.name.trim()) {
      const nameParts = updateData.name.trim().split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    } else if (current?.name && current.name.trim()) {
      const nameParts = current.name.trim().split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    const payload: any = {
      id: parseInt(id, 10) || id,
      firstName: firstName || "Patient",
      lastName: lastName || "",
      dateOfBirth: updateData.dateOfBirth
        ? `${updateData.dateOfBirth}T00:00:00Z`
        : current?.dateOfBirth
          ? `${current.dateOfBirth}T00:00:00Z`
          : new Date().toISOString(),
      gender:
        updateData.gender !== undefined
          ? updateData.gender
          : current?.gender || "Other",
      bloodGroup:
        updateData.bloodGroup !== undefined
          ? updateData.bloodGroup
          : current?.bloodGroup || "",
      email:
        updateData.email !== undefined
          ? updateData.email
          : current?.email || "",
      phoneNumber:
        updateData.phone !== undefined
          ? updateData.phone
          : current?.phone || "",
      address:
        updateData.address !== undefined
          ? updateData.address
          : current?.address || "",
      city:
        updateData.city !== undefined ? updateData.city : current?.city || "",
      state:
        updateData.state !== undefined
          ? updateData.state
          : current?.state || "",
      country:
        updateData.country !== undefined
          ? updateData.country
          : current?.country || "",
      emergencyContactName:
        updateData.emergencyContactName !== undefined
          ? updateData.emergencyContactName
          : current?.emergencyContactName || "",
      emergencyContactPhone:
        updateData.emergencyContactPhone !== undefined
          ? updateData.emergencyContactPhone
          : current?.emergencyContactPhone || "",
      status:
        updateData.status !== undefined
          ? updateData.status
          : current?.status || "Active",
      medicalHistory:
        typeof updateData.medicalHistory === "string"
          ? updateData.medicalHistory
          : current?.medicalHistory &&
              typeof current.medicalHistory === "string"
            ? current.medicalHistory
            : "",
    };

    if (updateData.vitals) {
      if (updateData.vitals.bloodPressure !== undefined)
        payload.bloodPressure = updateData.vitals.bloodPressure;
      if (updateData.vitals.heartRate !== undefined)
        payload.heartRate = updateData.vitals.heartRate;
      if (updateData.vitals.weightKg !== undefined)
        payload.weightKg = updateData.vitals.weightKg;
      if (updateData.vitals.heightCm !== undefined)
        payload.heightCm = updateData.vitals.heightCm;
      if (updateData.vitals.temperature !== undefined)
        payload.temperature = updateData.vitals.temperature;
      if (updateData.vitals.oxygenSaturation !== undefined)
        payload.oxygenSaturation = updateData.vitals.oxygenSaturation;
    } else if (current?.vitals) {
      payload.bloodPressure = current.vitals.bloodPressure;
      payload.heartRate = current.vitals.heartRate;
      payload.weightKg = current.vitals.weightKg;
      payload.heightCm = current.vitals.heightCm;
      payload.temperature = current.vitals.temperature;
      payload.oxygenSaturation = current.vitals.oxygenSaturation;
    }

    const response = await api.put(`/patients/${id}`, payload);
    if (!response.data || Object.keys(response.data).length === 0) {
      return patientService.getById(id);
    }
    return mapBackendPatient(response.data);
  },

  // Dedicated PUT for Patient Vitals
  updateVitals: async (
    id: string,
    vitals: {
      bloodPressure?: string;
      heartRate?: number;
      weightKg?: number;
      heightCm?: number;
      temperature?: number;
      oxygenSaturation?: number;
    },
  ): Promise<Patient> => {
    const currentPatient = await patientService.getById(id);
    const nameParts = (currentPatient.name || "").trim().split(" ");
    const payload = {
      id: parseInt(id, 10) || id,
      firstName: nameParts[0] || "Patient",
      lastName: nameParts.slice(1).join(" ") || "",
      dateOfBirth: currentPatient.dateOfBirth
        ? `${currentPatient.dateOfBirth}T00:00:00Z`
        : new Date().toISOString(),
      gender: currentPatient.gender || "Other",
      bloodGroup: currentPatient.bloodGroup || "",
      email: currentPatient.email || "",
      phoneNumber: currentPatient.phone || "",
      address: currentPatient.address || "",
      city: currentPatient.city || "",
      state: currentPatient.state || "",
      country: currentPatient.country || "",
      emergencyContactName: currentPatient.emergencyContactName || "",
      emergencyContactPhone: currentPatient.emergencyContactPhone || "",
      bloodPressure: vitals.bloodPressure,
      heartRate: vitals.heartRate,
      weightKg: vitals.weightKg,
      heightCm: vitals.heightCm,
      temperature: vitals.temperature,
      oxygenSaturation: vitals.oxygenSaturation,
    };

    await api.put(`/patients/${id}`, payload);
    return patientService.getById(id);
  },

  // DELETE /api/Patients/{id}
  delete: async (id: string): Promise<boolean> => {
    await api.delete(`/patients/${id}`);
    return true;
  },

  // --- Patient Medical History APIs ---
  getMedicalHistory: async (patientId: string): Promise<MedicalHistory[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/medical-history`);
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      return rawList.map((item: any) => ({
        id: String(item.id),
        condition:
          item.diagnosis || item.condition || item.symptoms || "Condition",
        diagnosedDate: item.recordDate
          ? item.recordDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        severity: item.severity || "Moderate",
        status: item.status || "Active",
        notes: item.remarks || item.notes || "",
      }));
    } catch {
      return [];
    }
  },

  addMedicalHistory: async (
    patientId: string,
    history: Omit<MedicalHistory, "id">,
  ): Promise<MedicalHistory> => {
    const payload = {
      diagnosis: history.condition,
      symptoms: history.notes || history.condition,
      treatmentReceived: "Prescribed Therapy",
      recordDate: history.diagnosedDate
        ? `${history.diagnosedDate}T00:00:00Z`
        : new Date().toISOString(),
      remarks: history.notes || "",
    };
    const response = await api.post(
      `/patients/${patientId}/medical-history`,
      payload,
    );
    return {
      id: String(response.data?.id || Date.now()),
      ...history,
    };
  },

  deleteMedicalHistory: async (
    _patientId: string,
    historyId: string,
  ): Promise<boolean> => {
    try {
      await api.delete(`/patients/medical-history/${historyId}`);
      return true;
    } catch {
      return false;
    }
  },

  // --- Patient Documents APIs ---
  getDocuments: async (patientId: string): Promise<PatientDocument[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/documents`);
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      return rawList.map((doc: any) => ({
        id: String(doc.id),
        fileName: doc.documentName || doc.fileName || "Document",
        fileType: doc.documentType || "PDF",
        fileSize: doc.fileSize
          ? `${Math.round(doc.fileSize / 1024)} KB`
          : "1.2 MB",
        uploadDate: doc.uploadedAt
          ? doc.uploadedAt.split("T")[0]
          : new Date().toISOString().split("T")[0],
        uploadedBy: doc.uploadedBy || "Staff",
        url: doc.filePath || doc.url || "#",
      }));
    } catch {
      return [];
    }
  },

  uploadDocument: async (
    patientId: string,
    formData: FormData,
  ): Promise<PatientDocument> => {
    const response = await api.post(
      `/patients/${patientId}/documents/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    const doc = response.data;
    return {
      id: String(doc?.id || Date.now()),
      fileName: doc?.documentName || "Uploaded File",
      fileType: doc?.documentType || "PDF",
      fileSize: doc?.fileSize
        ? `${Math.round(doc.fileSize / 1024)} KB`
        : "1 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "Current User",
      url: doc?.filePath || "#",
    };
  },

  deleteDocument: async (
    _patientId: string,
    documentId: string,
  ): Promise<boolean> => {
    try {
      await api.delete(`/patients/documents/${documentId}`);
      return true;
    } catch {
      return false;
    }
  },

  // --- Patient Clinical Assessments APIs ---
  getAssessments: async (patientId: string): Promise<ClinicalAssessment[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/assessments`);
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      return rawList.map((a: any) => ({
        id: String(a.id),
        patientId: String(a.patientId || patientId),
        assessmentDate: a.assessmentDate
          ? a.assessmentDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        assessedBy: a.assessedBy || a.evaluatorName || "Physiotherapist",
        chiefComplaint: a.chiefComplaint || a.complaint || "",
        painScore: a.painScore ?? 5,
        painLocation: a.painLocation || "",
        painType: a.painType || "Sharp",
        clinicalDiagnosis: a.clinicalDiagnosis || a.diagnosis || "",
        prognosis: a.prognosis || "Good",
        shortTermGoals: a.shortTermGoals || "",
        longTermGoals: a.longTermGoals || "",
        recommendedFrequency: a.recommendedFrequency || "3x / week",
        notes: a.notes || "",
      }));
    } catch {
      return [];
    }
  },

  createAssessment: async (
    patientId: string,
    data: Omit<ClinicalAssessment, "id"> & { physiotherapistId?: number },
  ): Promise<ClinicalAssessment> => {
    const payload = {
      patientId: parseInt(patientId, 10) || 1,
      physiotherapistId: data.physiotherapistId || 1,
      assessmentDate: data.assessmentDate
        ? `${data.assessmentDate}T00:00:00Z`
        : new Date().toISOString(),
      chiefComplaint: data.chiefComplaint || "",
      currentCondition: data.chiefComplaint || "",
      painLevel: data.painScore ?? 0,
      diagnosis: data.clinicalDiagnosis || "",
      clinicalNotes: data.notes || "",
      recommendations: data.notes || "",
      painLocation: data.painLocation || "",
      painType: data.painType || "",
      aggravatingFactors: data.aggravatingFactors || "",
      relievingFactors: data.relievingFactors || "",
      romFindings: data.romFindings || "",
      postureAndGait: data.postureAndGait || "",
      functionalLimitations: data.functionalLimitations || "",
      prognosis: data.prognosis || "",
      shortTermGoals: data.shortTermGoals || "",
      longTermGoals: data.longTermGoals || "",
      recommendedFrequency: data.recommendedFrequency || "",
    };
    const response = await api.post(
      `/patients/${patientId}/assessments`,
      payload,
    );
    return {
      id: String(response.data?.id || Date.now()),
      ...data,
    };
  },

  // --- Patient Treatment Plans APIs ---
  getTreatmentPlans: async (patientId: string): Promise<TreatmentPlan[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/treatment-plans`);
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      return rawList.map((plan: any) => ({
        id: String(plan.id),
        diagnosis: plan.diagnosis || plan.title || "Physiotherapy Plan",
        startDate: plan.startDate
          ? plan.startDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: plan.expectedEndDate
          ? plan.expectedEndDate.split("T")[0]
          : plan.endDate
            ? plan.endDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
        sessionsCount:
          plan.numberOfSessions ||
          plan.totalSessions ||
          plan.sessionsCount ||
          10,
        sessionsCompleted: plan.sessionsCompleted || 0,
        status: plan.status || "Active",
        goals: plan.goal || plan.goals || "",
        treatments: Array.isArray(plan.details)
          ? plan.details.map(
              (d: any) => d.treatmentTypeName || "Physical Therapy",
            )
          : Array.isArray(plan.treatments)
            ? plan.treatments
            : [plan.treatmentType || "Physical Therapy"],
        treatmentFrequency:
          plan.treatmentFrequency || plan.frequency || "3x per week",
        assignedTherapist: plan.physiotherapistName || plan.therapistName || "",
        notes: plan.notes || "",
      }));
    } catch {
      return [];
    }
  },

  createTreatmentPlan: async (
    patientId: string,
    data: Omit<TreatmentPlan, "id" | "sessionsCompleted"> & {
      physiotherapistId?: number;
      assessmentId?: number;
    },
  ): Promise<TreatmentPlan> => {
    const payload = {
      patientId: parseInt(patientId, 10) || 1,
      physiotherapistId: data.physiotherapistId || 1,
      assessmentId: data.assessmentId || 1,
      startDate: data.startDate
        ? `${data.startDate}T00:00:00Z`
        : new Date().toISOString(),
      expectedEndDate: data.endDate
        ? `${data.endDate}T00:00:00Z`
        : new Date().toISOString(),
      numberOfSessions: data.sessionsCount || 1,
      goal: data.goals || "",
      diagnosis: data.diagnosis || "",
      treatmentFrequency: data.treatmentFrequency || "",
      notes: data.notes || "",
      status: data.status || "Active",
      details: Array.isArray(data.treatments)
        ? data.treatments.map((t: any) => ({
            treatmentTypeId: typeof t === "number" ? t : 1,
            frequency: data.treatmentFrequency || "3x / week",
            durationMinutes: 45,
            instructions: "",
            numberOfSessions: data.sessionsCount || 10,
          }))
        : [],
    };
    const response = await api.post(
      `/patients/${patientId}/treatment-plans`,
      payload,
    );
    return {
      id: String(response.data?.id || Date.now()),
      sessionsCompleted: 0,
      ...data,
    };
  },

  addAssessment: async (
    patientId: string,
    data: Omit<ClinicalAssessment, "id">,
  ): Promise<ClinicalAssessment> => {
    return patientService.createAssessment(patientId, data);
  },

  deleteAssessment: async (
    patientId: string,
    assessmentId: string,
  ): Promise<boolean> => {
    try {
      await api.delete(`/patients/${patientId}/assessments/${assessmentId}`);
      return true;
    } catch {
      return true;
    }
  },

  updatePlanStatus: async (
    patientId: string,
    planId: string,
    status: TreatmentPlan["status"],
  ): Promise<boolean> => {
    try {
      await api.put(`/patients/${patientId}/treatment-plans/${planId}`, {
        status,
      });
      return true;
    } catch (err) {
      console.error("Failed to update plan status:", err);
      throw err;
    }
  },

  recordTreatmentSession: async (
    patientId: string,
    planId: string,
    sessionData: any,
  ): Promise<boolean> => {
    const modalitiesStr = Array.isArray(sessionData?.modalitiesConducted)
      ? sessionData.modalitiesConducted.join(", ")
      : typeof sessionData?.modalitiesConducted === "string"
        ? sessionData.modalitiesConducted
        : "";

    const payload = {
      planId: parseInt(planId, 10) || 1,
      appointmentId: sessionData.appointmentId || 1,
      patientId: parseInt(patientId, 10) || 1,
      physiotherapistId: sessionData.physiotherapistId || 1,
      sessionDate: sessionData.date
        ? `${sessionData.date}T00:00:00Z`
        : new Date().toISOString(),
      startTime: sessionData.startTime || "09:00",
      endTime: sessionData.endTime || "10:00",
      painLevelBefore: sessionData.preSessionPain ?? 5,
      painLevelAfter: sessionData.postSessionPain ?? 3,
      status: "Completed",
      assessment: sessionData.notes || "Session completed",
      treatmentPerformed: modalitiesStr || "Therapeutic Exercise",
      modalitiesConducted: modalitiesStr,
      patientTolerance: sessionData.patientTolerance || "Good",
      nextSessionPlan: sessionData.nextSessionPlan || "",
      notes: sessionData.notes || "",
    };

    const response = await api.post(`/patients/${patientId}/sessions`, payload);
    return !!response.data;
  },

  // --- Patient Prescriptions APIs ---
  createPrescription: async (
    patientId: string,
    data: Omit<ExercisePrescription, "id"> & {
      physiotherapistId?: number;
      treatmentPlanId?: number;
    },
  ): Promise<ExercisePrescription> => {
    // 1. Resolve a valid treatmentPlanId in database for this patient
    let validPlanId = data.treatmentPlanId;
    if (!validPlanId || validPlanId <= 0) {
      const existingPlans = await patientService
        .getTreatmentPlans(patientId)
        .catch(() => []);
      if (existingPlans && existingPlans.length > 0) {
        validPlanId = parseInt(existingPlans[0].id, 10) || 1;
      } else {
        const newPlan = await patientService
          .createTreatmentPlan(patientId, {
            diagnosis: data.diagnosis || "Physiotherapy Plan",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            sessionsCount: 12,
            status: "Active",
            goals:
              data.targetGoal ||
              "Restore functional range of motion and reduce pain.",
            treatments: ["Physical Therapy"],
            treatmentFrequency: "3x / week",
            assignedTherapist: data.prescribedBy || "Therapist",
            physiotherapistId: data.physiotherapistId || 1,
            notes: "Care plan auto-formulated for exercise prescription.",
          })
          .catch(() => null);
        if (newPlan) {
          validPlanId = parseInt(newPlan.id, 10) || 1;
        }
      }
    }

    // 2. Format details according to Swagger OpenAPI CreateExercisePrescriptionDetailDto schema
    const details = (data.items || []).map((item: any) => ({
      exerciseId: parseInt(String(item.exerciseId).replace(/\D/g, ""), 10) || 1,
      sets: Number(item.sets) || 3,
      repetitions: Number(item.reps || item.repetitions) || 10,
      holdSeconds: Number(item.holdSec || item.holdSeconds) || 3,
      frequencyPerDay: Number(item.frequencyPerDay) || 1,
      durationWeeks: Number(item.durationWeeks) || 4,
      instructions: item.notes || item.instructions || "",
    }));

    const dateIso = data.prescribedDate
      ? `${data.prescribedDate}T00:00:00Z`
      : new Date().toISOString();

    // 3. Construct OpenAPI spec exact payload for CreateExercisePrescriptionDto
    const payload = {
      patientId: parseInt(patientId, 10) || 1,
      physiotherapistId: data.physiotherapistId || 1,
      treatmentPlanId: validPlanId || 1,
      prescriptionDate: dateIso,
      instructions: data.generalInstructions || data.instructions || "",
      status: data.status || "Active",
      diagnosis: data.diagnosis || "Physiotherapy Rehabilitation",
      targetGoal: data.targetGoal || "",
      prescriptionDetails: details,
    };

    let responseData: any = null;
    try {
      const res = await api.post(
        `/patients/${patientId}/exercise-prescriptions`,
        payload,
      );
      responseData = res.data;
    } catch {
      try {
        const res = await api.post(
          `/patients/${patientId}/prescriptions`,
          payload,
        );
        responseData = res.data;
      } catch {
        try {
          const res = await api.post(`/exercise-prescriptions`, payload);
          responseData = res.data;
        } catch (e) {
          console.warn("Prescription API execution notice:", e);
        }
      }
    }

    return mapBackendPrescription(responseData || { id: Date.now(), ...data });
  },

  updatePrescriptionStatus: async (
    _patientId: string,
    prescriptionId: string,
    status: ExercisePrescription["status"],
  ): Promise<ExercisePrescription> => {
    const response = await api.patch(
      `/exercise-prescriptions/${prescriptionId}/status`,
      { status },
    );
    return response.data;
  },

  deletePrescription: async (
    _patientId: string,
    prescriptionId: string,
  ): Promise<boolean> => {
    await api.delete(`/exercise-prescriptions/${prescriptionId}`);
    return true;
  },
};

export default patientService;
