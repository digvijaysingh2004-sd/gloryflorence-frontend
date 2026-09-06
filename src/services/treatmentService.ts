import api from './api';
import type { TreatmentType, Exercise } from '../types';

const STORAGE_KEY_TREATMENTS = 'gf_treatments_db';
const STORAGE_KEY_EXERCISES = 'gf_exercises_db';

export const TREATMENT_CATEGORIES = [
  'Manual Therapy',
  'Electrotherapy',
  'Exercise Therapy',
  'Hydrotherapy',
  'Specialized Rehabilitation',
  'Other',
] as const;

export const EXERCISE_CATEGORIES = [
  'Strengthening',
  'Mobility & Stretching',
  'Core Stability',
  'Balance & Coordination',
  'Postural Correction',
  'Cardiovascular',
] as const;

export const MUSCLE_GROUPS = [
  'All',
  'Cervical / Neck',
  'Shoulders & Rotator Cuff',
  'Upper Back & Thoracic',
  'Lumbar Spine & Core',
  'Pelvis & Hip',
  'Knee & Lower Extremity',
  'Ankle & Foot',
];

const INITIAL_TREATMENTS_SEED: TreatmentType[] = [
  {
    id: 'tt_1',
    name: 'Manual Therapy & Joint Mobilization',
    category: 'Manual Therapy',
    description: 'Hands-on clinical techniques including Maitland and Mulligan joint mobilizations, passive ROM, and deep myofascial release.',
    durationMinutes: 45,
    defaultPrice: 75,
    status: 'Active',
    requiredEquipment: ['Treatment Plinth', 'Mobilization Belts', 'Towel Roll'],
  },
  {
    id: 'tt_2',
    name: 'Therapeutic Ultrasound & Phonophoresis',
    category: 'Electrotherapy',
    description: 'High-frequency acoustic sound waves to increase local blood flow, accelerate soft-tissue healing, and break down scar tissue.',
    durationMinutes: 30,
    defaultPrice: 50,
    status: 'Active',
    requiredEquipment: ['1MHz/3MHz Ultrasound Unit', 'Coupling Gel'],
  },
  {
    id: 'tt_3',
    name: 'Interferential Therapy (IFT) & TENS',
    category: 'Electrotherapy',
    description: 'Medium frequency electro-stimulation targeting deep-seated nerve pain, edema reduction, and neuromuscular pain suppression.',
    durationMinutes: 30,
    defaultPrice: 45,
    status: 'Active',
    requiredEquipment: ['Digital IFT Device', 'Electrode Pads', 'Straps'],
  },
  {
    id: 'tt_4',
    name: 'Lumbar & Cervical Mechanical Traction',
    category: 'Specialized Rehabilitation',
    description: 'Computerized cyclic and static spinal decompression therapy for herniated discs, radiculopathy, and nerve root impingement.',
    durationMinutes: 40,
    defaultPrice: 85,
    status: 'Active',
    requiredEquipment: ['Spinal Decompression Table', 'Thoracic/Pelvic Harness'],
  },
  {
    id: 'tt_5',
    name: 'Clinical Dry Needling (Myofascial Trigger Points)',
    category: 'Specialized Rehabilitation',
    description: 'Sterile filament needles inserted into hyperirritable taut muscular bands to release chronic spasm and deactivate pain pathways.',
    durationMinutes: 45,
    defaultPrice: 90,
    status: 'Active',
    requiredEquipment: ['Filament Needles', 'Alcohol Swabs', 'Sharps Container'],
  },
  {
    id: 'tt_6',
    name: 'Kinesio Taping & Functional Strapping',
    category: 'Manual Therapy',
    description: 'Elastic therapeutic taping application to facilitate lymphatic drainage, support vulnerable ligaments, and enhance proprioception.',
    durationMinutes: 20,
    defaultPrice: 35,
    status: 'Active',
    requiredEquipment: ['Kinesiology Tape', 'Medical Scissors'],
  },
  {
    id: 'tt_7',
    name: 'Supervised Functional Kinesiotherapy',
    category: 'Exercise Therapy',
    description: 'One-on-one guided clinical corrective exercise therapy aiming for progressive overload and neuromuscular re-education.',
    durationMinutes: 60,
    defaultPrice: 80,
    status: 'Active',
    requiredEquipment: ['Resistance Bands', 'Stability Balls', 'Cable Column'],
  },
];

const INITIAL_EXERCISES_SEED: Exercise[] = [
  {
    id: 'ex_1',
    title: 'Cat-Cow Segmental Spinal Mobility',
    category: 'Mobility & Stretching',
    targetMuscleGroup: 'Lumbar Spine & Core',
    difficulty: 'Beginner',
    equipment: 'Yoga Mat',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldSec: 3,
    instructions: [
      'Begin on your hands and knees with wrists directly under shoulders and knees under hips.',
      'Inhale: gently drop your belly toward the floor, lift your chest and look forward (Cow position).',
      'Exhale: slowly draw your navel toward your spine, rounding your back upward toward the ceiling (Cat position).',
      'Move smoothly between both positions without forcing deep lumbar hyper-extension.'
    ],
    precautions: 'Avoid if experiencing sharp disc pinching or radiating leg pain during flexion.',
  },
  {
    id: 'ex_2',
    title: 'Pelvic Bridging with Glute Activation',
    category: 'Strengthening',
    targetMuscleGroup: 'Pelvis & Hip',
    difficulty: 'Beginner',
    equipment: 'Bodyweight / Yoga Mat',
    defaultSets: 3,
    defaultReps: 12,
    defaultHoldSec: 5,
    instructions: [
      'Lie flat on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Engage your abdominal core and squeeze your glutes.',
      'Push through your heels to lift your hips until your thighs and torso form a straight line.',
      'Hold the peak contraction for 5 seconds before lowering down slowly with control.'
    ],
    precautions: 'Do not overarch the lower back; ensure glutes do the primary lifting.',
  },
  {
    id: 'ex_3',
    title: 'Bird Dog (Quadruped Alternate Reach)',
    category: 'Core Stability',
    targetMuscleGroup: 'Lumbar Spine & Core',
    difficulty: 'Intermediate',
    equipment: 'Yoga Mat',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldSec: 4,
    instructions: [
      'Start in a quadruped position with a neutral, flat spine.',
      'Simultaneously extend your right arm forward and your left leg straight backward.',
      'Keep hips parallel to the floor without tilting or twisting.',
      'Hold for 3-4 seconds, return smoothly to center, and alternate to the opposite side.'
    ],
    precautions: 'Do not allow the lower back to sag. Maintain abdominal tension throughout.',
  },
  {
    id: 'ex_4',
    title: 'Scapular Retraction with Resistance Band',
    category: 'Strengthening',
    targetMuscleGroup: 'Upper Back & Thoracic',
    difficulty: 'Beginner',
    equipment: 'Resistance Band (Light/Medium)',
    defaultSets: 3,
    defaultReps: 15,
    defaultHoldSec: 2,
    instructions: [
      'Stand upright holding an elastic resistance band in front of your chest with elbows straight.',
      'Pull the band horizontally across your chest by squeezing your shoulder blades together.',
      'Pause for 2 seconds at full pinch, then slowly return to starting tension.'
    ],
    precautions: 'Keep shoulders relaxed away from your ears; avoid shrugging.',
  },
  {
    id: 'ex_5',
    title: 'Wall Angels (Thoracic & Shoulder Mobility)',
    category: 'Postural Correction',
    targetMuscleGroup: 'Shoulders & Rotator Cuff',
    difficulty: 'Beginner',
    equipment: 'Wall / Bodyweight',
    defaultSets: 2,
    defaultReps: 12,
    defaultHoldSec: 2,
    instructions: [
      'Stand with back, head, and buttocks flat against a smooth wall, feet 4-6 inches away.',
      'Place arms in a 90-degree goalpost position against the wall.',
      'Slowly slide your arms overhead while maintaining contact with wrists and elbows.',
      'Slide back down to ribs level while keeping core engaged.'
    ],
    precautions: 'Stop if anterior shoulder impingement or pain occurs.',
  },
  {
    id: 'ex_6',
    title: 'Rotator Cuff External Rotation (Side-Lying)',
    category: 'Strengthening',
    targetMuscleGroup: 'Shoulders & Rotator Cuff',
    difficulty: 'Intermediate',
    equipment: '1-2kg Dumbbell or Cable',
    defaultSets: 3,
    defaultReps: 12,
    defaultHoldSec: 2,
    instructions: [
      'Lie on your unaffected side with a folded towel placed between your elbow and rib cage.',
      'Bend elbow to 90 degrees holding a light dumbbell.',
      'Slowly rotate forearm upward toward the ceiling, keeping elbow pinned.',
      'Hold 2 seconds, then lower with a 3-second eccentric tempo.'
    ],
    precautions: 'Avoid compensation through thoracic trunk rotation.',
  },
  {
    id: 'ex_7',
    title: 'Single-Leg Stance on Foam Pad (Proprioception)',
    category: 'Balance & Coordination',
    targetMuscleGroup: 'Ankle & Foot',
    difficulty: 'Advanced',
    equipment: 'Balance Foam Pad / Airex',
    defaultSets: 3,
    defaultReps: 1,
    defaultHoldSec: 30,
    instructions: [
      'Stand bare-footed in the center of an unstable balance pad.',
      'Lift one foot off the pad, maintaining an upright posture and looking straight ahead.',
      'Micro-adjust at the ankle and foot to maintain stability for 30 seconds.',
      'For advanced progression, introduce gentle head turns or eyes-closed variation.'
    ],
    precautions: 'Perform within reach of a wall or stable railing to prevent falls.',
  },
  {
    id: 'ex_8',
    title: 'Prone McKenzie Lumbar Extension Press-Up',
    category: 'Mobility & Stretching',
    targetMuscleGroup: 'Lumbar Spine & Core',
    difficulty: 'Beginner',
    equipment: 'Treatment Plinth / Mat',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldSec: 3,
    instructions: [
      'Lie face down with palms flat on the floor directly beneath shoulders.',
      'Relax your glutes and lower back completely.',
      'Push your upper body up by straightening elbows, keeping pelvis flat on the plinth.',
      'Hold the top position for 2-3 seconds, breathing out, then lower back down.'
    ],
    precautions: 'Ideal for posterior disc derangement; stop if symptoms peripheralize down into legs.',
  }
];

const getTreatmentsStore = (): TreatmentType[] => {
  const raw = localStorage.getItem(STORAGE_KEY_TREATMENTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_TREATMENTS, JSON.stringify(INITIAL_TREATMENTS_SEED));
    return INITIAL_TREATMENTS_SEED;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_TREATMENTS_SEED;
  }
};

const saveTreatmentsStore = (data: TreatmentType[]) => {
  localStorage.setItem(STORAGE_KEY_TREATMENTS, JSON.stringify(data));
};

const getExercisesStore = (): Exercise[] => {
  const raw = localStorage.getItem(STORAGE_KEY_EXERCISES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(INITIAL_EXERCISES_SEED));
    return INITIAL_EXERCISES_SEED;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXERCISES_SEED;
  }
};

const saveExercisesStore = (data: Exercise[]) => {
  localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(data));
};

export const treatmentService = {
  // Treatment Types API
  getAllTreatments: async (filters?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<TreatmentType[]> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.get('/treatment-types', { params: filters });
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      let list = getTreatmentsStore();

      if (filters?.category && filters.category !== 'All') {
        list = list.filter((t) => t.category === filters.category);
      }
      if (filters?.status && filters.status !== 'All') {
        list = list.filter((t) => t.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
      }

      return list;
    }
  },

  getTreatmentById: async (id: string): Promise<TreatmentType> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.get(`/treatment-types/${id}`);
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getTreatmentsStore();
      const item = list.find((t) => t.id === id);
      if (!item) throw new Error('Treatment type not found');
      return item;
    }
  },

  createTreatment: async (data: Omit<TreatmentType, 'id'>): Promise<TreatmentType> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.post('/treatment-types', data);
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getTreatmentsStore();
      const newItem: TreatmentType = {
        ...data,
        id: `tt_${Date.now()}`,
      };
      list.push(newItem);
      saveTreatmentsStore(list);
      return newItem;
    }
  },

  updateTreatment: async (id: string, data: Partial<TreatmentType>): Promise<TreatmentType> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.put(`/treatment-types/${id}`, data);
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getTreatmentsStore();
      const index = list.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Treatment type not found');

      const updated = { ...list[index], ...data };
      list[index] = updated;
      saveTreatmentsStore(list);
      return updated;
    }
  },

  deleteTreatment: async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        await api.delete(`/treatment-types/${id}`);
        return true;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getTreatmentsStore();
      const filtered = list.filter((t) => t.id !== id);
      saveTreatmentsStore(filtered);
      return true;
    }
  },

  // Exercises API
  getAllExercises: async (filters?: {
    category?: string;
    difficulty?: string;
    muscleGroup?: string;
    search?: string;
  }): Promise<Exercise[]> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.get('/exercises', { params: filters });
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      let list = getExercisesStore();

      if (filters?.category && filters.category !== 'All') {
        list = list.filter((e) => e.category === filters.category);
      }
      if (filters?.difficulty && filters.difficulty !== 'All') {
        list = list.filter((e) => e.difficulty === filters.difficulty);
      }
      if (filters?.muscleGroup && filters.muscleGroup !== 'All') {
        list = list.filter((e) => e.targetMuscleGroup.toLowerCase().includes(filters.muscleGroup!.toLowerCase()));
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.targetMuscleGroup.toLowerCase().includes(q) ||
            e.equipment.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q)
        );
      }

      return list;
    }
  },

  getExerciseById: async (id: string): Promise<Exercise> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.get(`/exercises/${id}`);
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getExercisesStore();
      const item = list.find((e) => e.id === id);
      if (!item) throw new Error('Exercise not found');
      return item;
    }
  },

  createExercise: async (data: Omit<Exercise, 'id'>): Promise<Exercise> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.post('/exercises', data);
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getExercisesStore();
      const newItem: Exercise = {
        ...data,
        id: `ex_${Date.now()}`,
      };
      list.push(newItem);
      saveExercisesStore(list);
      return newItem;
    }
  },

  updateExercise: async (id: string, data: Partial<Exercise>): Promise<Exercise> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.put(`/exercises/${id}`, data);
        return response.data;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getExercisesStore();
      const index = list.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Exercise not found');

      const updated = { ...list[index], ...data };
      list[index] = updated;
      saveExercisesStore(list);
      return updated;
    }
  },

  deleteExercise: async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        await api.delete(`/exercises/${id}`);
        return true;
      }
      throw new Error('Offline mode');
    } catch {
      const list = getExercisesStore();
      const filtered = list.filter((e) => e.id !== id);
      saveExercisesStore(filtered);
      return true;
    }
  },
};
