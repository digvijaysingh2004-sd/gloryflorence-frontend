import api from "./api";
import type { TreatmentType, Exercise } from "../types";

export const TREATMENT_CATEGORIES = [
  "Manual Therapy",
  "Electrotherapy",
  "Exercise Therapy",
  "Hydrotherapy",
  "Specialized Rehabilitation",
  "Other",
] as const;

export const EXERCISE_CATEGORIES = [
  "Strengthening",
  "Mobility & Stretching",
  "Core Stability",
  "Balance & Coordination",
  "Postural Correction",
  "Cardiovascular",
] as const;

export const MUSCLE_GROUPS = [
  "All",
  "Cervical / Neck",
  "Shoulders & Rotator Cuff",
  "Upper Back & Thoracic",
  "Lumbar Spine & Core",
  "Pelvis & Hip",
  "Knee & Lower Extremity",
  "Ankle & Foot",
];

export const mapBackendTreatmentType = (dto: any): TreatmentType => {
  if (!dto) return {} as TreatmentType;
  const categoryName = typeof dto.category === "string" 
    ? dto.category 
    : (dto.category?.name || dto.categoryName || "Manual Therapy");

  return {
    id: String(dto.id),
    name: dto.name || "",
    category: categoryName as TreatmentType["category"],
    description: dto.description || "",
    durationMinutes: dto.durationMinutes || dto.defaultDurationMinutes || 45,
    defaultPrice: dto.defaultPrice !== undefined ? dto.defaultPrice : 0,
    status: dto.status || (dto.isActive === false ? "Inactive" : "Active"),
    requiredEquipment: dto.requiredEquipment || [],
  };
};

export const mapBackendExercise = (dto: any): Exercise => {
  if (!dto) return {} as Exercise;
  const categoryName = typeof dto.category === "string"
    ? dto.category
    : (dto.category?.name || dto.categoryName || "Strengthening");

  return {
    id: String(dto.id),
    title: dto.title || dto.name || "Exercise",
    category: categoryName as Exercise["category"],
    targetMuscleGroup: dto.targetMuscleGroup || "General",
    difficulty: dto.difficulty || "Beginner",
    equipment: dto.equipment || "None / Mat",
    defaultSets: dto.defaultSets || 3,
    defaultReps: dto.defaultReps || 10,
    defaultHoldSec: dto.defaultHoldSec || 3,
    instructions: Array.isArray(dto.instructions)
      ? dto.instructions
      : typeof dto.instructions === "string"
        ? [dto.instructions]
        : ["Follow instructions provided by your therapist."],
    precautions: dto.precautions || "",
    videoUrl: dto.videoUrl || "",
    imageUrl: dto.imageUrl || "",
  };
};

export const treatmentService = {
  // GET /api/treatment-types
  getAllTreatments: async (filters?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<TreatmentType[]> => {
    try {
      const response = await api.get("/treatment-types", { params: filters });
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      let mapped: TreatmentType[] = rawList.map(mapBackendTreatmentType);

      if (filters?.search) {
        const lower = filters.search.toLowerCase();
        mapped = mapped.filter(
          (t: TreatmentType) =>
            t.name.toLowerCase().includes(lower) ||
            t.description.toLowerCase().includes(lower)
        );
      }
      if (filters?.category && filters.category !== "All") {
        mapped = mapped.filter((t: TreatmentType) => t.category === filters.category);
      }
      if (filters?.status && filters.status !== "All") {
        mapped = mapped.filter((t: TreatmentType) => t.status === filters.status);
      }
      return mapped;
    } catch (err) {
      console.error("Error fetching treatment types from API:", err);
      return [];
    }
  },

  // GET /api/treatment-types/{id}
  getTreatmentById: async (id: string): Promise<TreatmentType> => {
    const response = await api.get(`/treatment-types/${id}`);
    return mapBackendTreatmentType(response.data);
  },

  // POST /api/treatment-types
  createTreatment: async (
    data: Omit<TreatmentType, "id"> & { categoryId?: number | string }
  ): Promise<TreatmentType> => {
    const payload = {
      name: data.name,
      categoryId: data.categoryId || 1,
      categoryName: data.category,
      category: data.category,
      description: data.description,
      durationMinutes: data.durationMinutes,
      defaultPrice: data.defaultPrice,
      isActive: data.status === "Active",
      requiredEquipment: data.requiredEquipment || [],
    };
    const response = await api.post("/treatment-types", payload);
    return mapBackendTreatmentType(response.data);
  },

  // PUT /api/treatment-types/{id}
  updateTreatment: async (
    id: string,
    data: Partial<TreatmentType> & { categoryId?: number | string }
  ): Promise<TreatmentType> => {
    const payload = {
      ...(data.name && { name: data.name }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.category && { categoryName: data.category, category: data.category }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
      ...(data.defaultPrice !== undefined && { defaultPrice: data.defaultPrice }),
      ...(data.status !== undefined && { isActive: data.status === "Active" }),
      ...(data.requiredEquipment && { requiredEquipment: data.requiredEquipment }),
    };
    const response = await api.put(`/treatment-types/${id}`, payload);
    return mapBackendTreatmentType(response.data);
  },

  // DELETE /api/treatment-types/{id}
  deleteTreatment: async (id: string): Promise<boolean> => {
    await api.delete(`/treatment-types/${id}`);
    return true;
  },

  // --- Exercises Library APIs ---

  // GET /api/exercises
  getAllExercises: async (filters?: {
    search?: string;
    category?: string;
    difficulty?: string;
    muscleGroup?: string;
  }): Promise<Exercise[]> => {
    try {
      const response = await api.get("/exercises", { params: filters });
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      let mapped: Exercise[] = rawList.map(mapBackendExercise);

      if (filters?.search) {
        const lower = filters.search.toLowerCase();
        mapped = mapped.filter(
          (ex: Exercise) =>
            ex.title.toLowerCase().includes(lower) ||
            ex.targetMuscleGroup.toLowerCase().includes(lower)
        );
      }
      if (filters?.category && filters.category !== "All") {
        mapped = mapped.filter((ex: Exercise) => ex.category === filters.category);
      }
      if (filters?.difficulty && filters.difficulty !== "All") {
        mapped = mapped.filter((ex: Exercise) => ex.difficulty === filters.difficulty);
      }
      if (filters?.muscleGroup && filters.muscleGroup !== "All") {
        mapped = mapped.filter(
          (ex: Exercise) =>
            ex.targetMuscleGroup.toLowerCase() === filters.muscleGroup?.toLowerCase()
        );
      }
      return mapped;
    } catch (err) {
      console.error("Error fetching exercises from API:", err);
      return [];
    }
  },

  // GET /api/exercises/{id}
  getExerciseById: async (id: string): Promise<Exercise> => {
    const response = await api.get(`/exercises/${id}`);
    return mapBackendExercise(response.data);
  },

  // POST /api/exercises
  createExercise: async (data: Omit<Exercise, "id">): Promise<Exercise> => {
    const payload = {
      name: data.title,
      categoryName: data.category,
      targetMuscleGroup: data.targetMuscleGroup,
      difficulty: data.difficulty,
      equipment: data.equipment,
      defaultSets: data.defaultSets,
      defaultReps: data.defaultReps,
      defaultHoldSec: data.defaultHoldSec || 3,
      instructions: data.instructions,
      precautions: data.precautions || "",
      videoUrl: data.videoUrl || "",
      imageUrl: data.imageUrl || "",
    };
    const response = await api.post("/exercises", payload);
    return mapBackendExercise(response.data);
  },

  // PUT /api/exercises/{id}
  updateExercise: async (
    id: string,
    data: Partial<Exercise>
  ): Promise<Exercise> => {
    const payload = {
      id: parseInt(id, 10) || id,
      name: data.title,
      categoryName: data.category,
      targetMuscleGroup: data.targetMuscleGroup,
      difficulty: data.difficulty,
      equipment: data.equipment,
      defaultSets: data.defaultSets,
      defaultReps: data.defaultReps,
      defaultHoldSec: data.defaultHoldSec,
      instructions: data.instructions,
      precautions: data.precautions,
      videoUrl: data.videoUrl,
      imageUrl: data.imageUrl,
    };
    const response = await api.put(`/exercises/${id}`, payload);
    return mapBackendExercise(response.data);
  },

  // DELETE /api/exercises/{id}
  deleteExercise: async (id: string): Promise<boolean> => {
    await api.delete(`/exercises/${id}`);
    return true;
  },
};

export default treatmentService;
