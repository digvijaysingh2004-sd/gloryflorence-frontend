import api from './api';
import type { Patient, ClinicalAssessment, TreatmentPlan, TreatmentSession, ExercisePrescription } from '../types';

const STORAGE_KEY = 'gf_patients_db';

const MOCK_PATIENTS_SEED: Patient[] = [
  {
    id: 'pat_1',
    name: 'Emily Watson',
    email: 'emily.watson@gmail.com',
    phone: '+1 (555) 019-2834',
    gender: 'Female',
    dateOfBirth: '1988-04-12',
    bloodGroup: 'O+',
    address: '42 Wallaby Way',
    city: 'Sydney',
    state: 'NSW',
    country: 'Australia',
    emergencyContactName: 'John Watson',
    emergencyContactPhone: '+1 (555) 019-2835',
    registrationDate: '2025-01-15',
    status: 'Active',
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      weightKg: 65,
      heightCm: 168,
      updatedAt: '2026-08-30T10:00:00Z',
    },
    medicalHistory: [
      {
        id: 'mh_1',
        condition: 'Chronic Lower Back Pain',
        diagnosedDate: '2024-11-05',
        severity: 'Moderate',
        status: 'Active',
        notes: 'Pain increases after long sitting hours. Lumbar L4-L5 disc compression.',
      },
      {
        id: 'mh_2',
        condition: 'Left Ankle Sprain',
        diagnosedDate: '2023-06-18',
        severity: 'Mild',
        status: 'Resolved',
        notes: 'Grade 1 sprain. Completed rehab successfully.',
      }
    ],
    documents: [
      {
        id: 'doc_1',
        fileName: 'MRI_Lumbar_Spine_Emily.pdf',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        uploadDate: '2025-01-16',
        uploadedBy: 'Dr. Glory Admin',
        url: '#',
      },
      {
        id: 'doc_2',
        fileName: 'XRay_Ankle_Left.png',
        fileType: 'image',
        fileSize: '1.1 MB',
        uploadDate: '2023-06-19',
        uploadedBy: 'Dr. Glory Doctor',
        url: '#',
      }
    ],
    appointments: [
      {
        id: 'apt_1',
        date: '2026-09-02',
        time: '10:00 AM',
        therapistName: 'Dr. Glory Physiotherapist',
        status: 'Scheduled',
        type: 'Physiotherapy Session',
        notes: 'Follow-up for lower back strengthening.',
      },
      {
        id: 'apt_2',
        date: '2026-08-28',
        time: '02:30 PM',
        therapistName: 'Dr. Glory Physiotherapist',
        status: 'Completed',
        type: 'Initial Assessment',
        notes: 'Patient showed improved range of motion in extension.',
      }
    ],
    assessments: [
      {
        id: 'asm_1',
        patientId: 'pat_1',
        assessmentDate: '2026-08-28',
        assessedBy: 'Dr. Glory Physiotherapist',
        chiefComplaint: 'Sharp lumbar spine pain radiating down right buttock and posterior thigh after prolonged desk sitting.',
        painScore: 7,
        painLocation: 'Lumbar Spine (L4-L5) & Right Gluteal',
        painType: 'Radiating',
        aggravatingFactors: 'Sitting >30 mins, forward spinal flexion, coughing',
        relievingFactors: 'Walking, lying prone with lumbar pillow, heat application',
        romFindings: 'Lumbar flexion restricted to 45° with peripheralization. Extension limited to 10° due to sharp pain. Positive SLR on right at 40°.',
        postureAndGait: 'Mild antalgic gait favoring right side. Flattened lumbar lordosis.',
        functionalLimitations: 'Unable to sit continuously for work meetings. Difficulty lifting objects >5kg.',
        clinicalDiagnosis: 'L4-L5 Disc Herniation with Right Lumbar Radiculopathy',
        prognosis: 'Good',
        shortTermGoals: 'Reduce VAS pain score from 7/10 to 4/10 in 3 weeks. Centralize radicular symptoms to lumbar spine.',
        longTermGoals: 'Full pain-free lumbar ROM, return to recreational swimming and desk work 2+ hours without discomfort.',
        recommendedFrequency: '3 sessions / week for 4 weeks',
        notes: 'Advised ergonomic workstation changes and avoidance of early morning heavy spinal loading.'
      }
    ],
    treatmentPlans: [
      {
        id: 'tp_1',
        diagnosis: 'L4-L5 Disc Herniation Rehab',
        startDate: '2026-08-28',
        endDate: '2026-10-28',
        sessionsCount: 12,
        sessionsCompleted: 1,
        status: 'Active',
        goals: 'Reduce pain level from 7/10 to 2/10. Increase core strength. Return to swimming.',
        treatments: ['Core stabilization exercises', 'Lumbar traction', 'Manual therapy & joint mobilization', 'Therapeutic Ultrasound & Phonophoresis'],
        treatmentFrequency: '3x / week',
        assignedTherapist: 'Dr. Glory Physiotherapist',
        notes: 'Initial focus on pain reduction and gentle decompression.',
        sessions: [
          {
            id: 'tps_1',
            date: '2026-08-28',
            notes: 'Completed initial evaluation and first decompression mobilization. Patient reported 3 points pain relief immediately following traction.',
            performedBy: 'Dr. Glory Physiotherapist',
            preSessionPain: 7,
            postSessionPain: 4,
            modalitiesConducted: ['Lumbar traction', 'Manual therapy & joint mobilization'],
            patientTolerance: 'Tolerated Well',
            nextSessionPlan: 'Reassess SLR angle and initiate transverse abdominis isometric activation.'
          }
        ]
      }
    ],
    prescriptions: [
      {
        id: 'rx_1',
        patientId: 'pat_1',
        prescribedDate: '2026-08-28',
        prescribedBy: 'Dr. Glory Physiotherapist',
        diagnosis: 'L4-L5 Disc Herniation with Lumbar Radiculopathy',
        status: 'Active',
        targetGoal: 'Restore spinal extension tolerance and strengthen multifidus and transverse abdominis to stabilize lumbar spine.',
        generalInstructions: 'Perform movements smoothly without breath-holding. If sharp pain or numbness radiates below the knee, discontinue that movement and notify your clinician.',
        items: [
          {
            id: 'rxi_1',
            exerciseId: 'ex_8',
            exerciseTitle: 'Prone McKenzie Lumbar Extension Press-Up',
            category: 'Mobility & Stretching',
            targetMuscleGroup: 'Lumbar Spine & Core',
            sets: 3,
            reps: 10,
            holdSec: 3,
            frequency: '2x daily (Morning & Evening)',
            durationWeeks: 4,
            notes: 'Exhale completely at the top of the press-up. Keep hips relaxed on the mat.'
          },
          {
            id: 'rxi_2',
            exerciseId: 'ex_3',
            exerciseTitle: 'Bird-Dog Core Stability (Quadruped Cross-Extension)',
            category: 'Core Stability',
            targetMuscleGroup: 'Lumbar Spine & Core',
            sets: 3,
            reps: 10,
            holdSec: 4,
            frequency: 'Once daily',
            durationWeeks: 4,
            notes: 'Maintain neutral spine; avoid hyperextending or rotating the pelvis.'
          },
          {
            id: 'rxi_3',
            exerciseId: 'ex_1',
            exerciseTitle: 'Supine Pelvic Bridging with Neutral Spine',
            category: 'Strengthening',
            targetMuscleGroup: 'Pelvis & Hip',
            sets: 3,
            reps: 12,
            holdSec: 5,
            frequency: 'Once daily',
            durationWeeks: 3,
            notes: 'Squeeze glutes at top position. Ensure hamstrings do not cramp.'
          }
        ]
      }
    ],
    invoices: [
      {
        id: 'inv_1',
        invoiceNumber: 'INV-2026-001',
        date: '2026-08-28',
        dueDate: '2026-09-10',
        amount: 150.00,
        paidAmount: 150.00,
        balanceAmount: 0.00,
        status: 'Paid',
      },
      {
        id: 'inv_2',
        invoiceNumber: 'INV-2026-002',
        date: '2026-08-31',
        dueDate: '2026-09-15',
        amount: 80.00,
        paidAmount: 0.00,
        balanceAmount: 80.00,
        status: 'Unpaid',
      }
    ]
  },
  {
    id: 'pat_2',
    name: 'Marcus Aurelius',
    email: 'marcus.philosopher@gmail.com',
    phone: '+1 (555) 014-9988',
    gender: 'Male',
    dateOfBirth: '1975-08-21',
    bloodGroup: 'A-',
    address: '100 Rome Ave',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    emergencyContactName: 'Faustina Aurelius',
    emergencyContactPhone: '+1 (555) 014-9989',
    registrationDate: '2025-02-10',
    status: 'Active',
    vitals: {
      bloodPressure: '130/85',
      heartRate: 68,
      weightKg: 82,
      heightCm: 180,
      updatedAt: '2026-08-29T11:00:00Z',
    },
    medicalHistory: [
      {
        id: 'mh_3',
        condition: 'Right Shoulder Rotator Cuff Tendonitis',
        diagnosedDate: '2025-02-10',
        severity: 'Severe',
        status: 'Chronic',
        notes: 'Impingement signs positive. Restricted abduction above 90 degrees.',
      }
    ],
    documents: [
      {
        id: 'doc_3',
        fileName: 'Shoulder_Ultrasound.pdf',
        fileType: 'pdf',
        fileSize: '1.8 MB',
        uploadDate: '2025-02-12',
        uploadedBy: 'Dr. Glory Doctor',
        url: '#',
      }
    ],
    appointments: [
      {
        id: 'apt_3',
        date: '2026-09-03',
        time: '04:00 PM',
        therapistName: 'Dr. Glory Doctor',
        status: 'Scheduled',
        type: 'Medical Consultation',
        notes: 'Review ultrasound scan and shoulder progress.',
      }
    ],
    assessments: [
      {
        id: 'asm_2',
        patientId: 'pat_2',
        assessmentDate: '2025-02-10',
        assessedBy: 'Dr. Glory Doctor',
        chiefComplaint: 'Inability to lift right arm overhead with acute impingement and night ache.',
        painScore: 8,
        painLocation: 'Right Shoulder Anterior & Lateral Deltoid',
        painType: 'Dull Aching',
        aggravatingFactors: 'Overhead reaching, sleeping on right side, putting on jacket',
        relievingFactors: 'Ice pack, arm rest in sling',
        romFindings: 'Active abduction limited to 85° with painful arc between 60°-120°. Hawkins-Kennedy test positive.',
        postureAndGait: 'Protracted right shoulder girdle with slight anterior head carriage.',
        functionalLimitations: 'Cannot comb hair or reach upper kitchen shelves.',
        clinicalDiagnosis: 'Supraspinatus Tendinopathy with Subacromial Impingement',
        prognosis: 'Good',
        shortTermGoals: 'Abolish night pain, increase abduction to 120° in 4 weeks.',
        longTermGoals: 'Complete pain-free overhead active ROM and return to resistance training.',
        recommendedFrequency: '2 sessions / week for 8 weeks'
      }
    ],
    treatmentPlans: [
      {
        id: 'tp_2',
        diagnosis: 'Rotator Cuff Physical Therapy',
        startDate: '2025-02-12',
        endDate: '2025-05-12',
        sessionsCount: 20,
        sessionsCompleted: 20,
        status: 'Completed',
        goals: 'Restore shoulder abduction to 170 degrees. Pain-free overhead reaching.',
        treatments: ['Manual therapy & joint mobilization', 'Interferential Therapy (IFT) & TENS', 'Core stabilization exercises'],
        treatmentFrequency: '2x / week',
        assignedTherapist: 'Dr. Glory Physiotherapist',
        sessions: [
          {
            id: 'tps_2',
            date: '2025-05-12',
            notes: 'Final rehabilitation session. Patient achieved 175° active abduction without pain. Discharged to home maintenance program.',
            performedBy: 'Dr. Glory Physiotherapist',
            preSessionPain: 1,
            postSessionPain: 0,
            modalitiesConducted: ['Manual therapy & joint mobilization'],
            patientTolerance: 'Tolerated Well'
          }
        ]
      }
    ],
    prescriptions: [
      {
        id: 'rx_2',
        patientId: 'pat_2',
        prescribedDate: '2025-02-12',
        prescribedBy: 'Dr. Glory Doctor',
        diagnosis: 'Supraspinatus Tendinopathy & Subacromial Impingement',
        status: 'Completed',
        targetGoal: 'Strengthen infraspinatus/teres minor and improve scapular retraction mechanics.',
        generalInstructions: 'Warm up shoulder with gentle pendulums before starting resistance band work.',
        items: [
          {
            id: 'rxi_4',
            exerciseId: 'ex_6',
            exerciseTitle: 'Rotator Cuff External Rotation (Side-Lying)',
            category: 'Strengthening',
            targetMuscleGroup: 'Shoulders & Rotator Cuff',
            sets: 3,
            reps: 12,
            holdSec: 2,
            frequency: '3x / week',
            durationWeeks: 6,
            notes: 'Keep elbow pinned to the flank using a folded towel.'
          },
          {
            id: 'rxi_5',
            exerciseId: 'ex_4',
            exerciseTitle: 'Scapular Retraction with Resistance Band',
            category: 'Strengthening',
            targetMuscleGroup: 'Upper Back & Thoracic',
            sets: 3,
            reps: 15,
            holdSec: 2,
            frequency: 'Once daily',
            durationWeeks: 6,
            notes: 'Pinch shoulder blades down and back; do not elevate traps.'
          }
        ]
      }
    ],
    invoices: [
      {
        id: 'inv_3',
        invoiceNumber: 'INV-2025-054',
        date: '2025-02-12',
        dueDate: '2025-02-28',
        amount: 600.00,
        paidAmount: 400.00,
        balanceAmount: 200.00,
        status: 'Partially Paid',
      }
    ]
  },
  {
    id: 'pat_3',
    name: 'Sarah Connor',
    email: 'sconnor@resistance.net',
    phone: '+1 (555) 911-2029',
    gender: 'Female',
    dateOfBirth: '1992-11-30',
    bloodGroup: 'B+',
    address: 'Unknown Safehouse',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    emergencyContactName: 'John Connor',
    emergencyContactPhone: '+1 (555) 911-3000',
    registrationDate: '2026-03-01',
    status: 'Inactive',
    vitals: {
      bloodPressure: '115/75',
      heartRate: 60,
      weightKg: 58,
      heightCm: 165,
      updatedAt: '2026-08-25T09:00:00Z',
    },
    medicalHistory: [
      {
        id: 'mh_4',
        condition: 'Right Knee ACL Tear (Post-Op)',
        diagnosedDate: '2026-02-15',
        severity: 'Severe',
        status: 'Active',
        notes: 'Post-operative reconstruction rehab. Grafts stable.',
      }
    ],
    documents: [],
    appointments: [],
    treatmentPlans: [],
    invoices: []
  }
];

const getLocalStore = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PATIENTS_SEED));
    return MOCK_PATIENTS_SEED;
  }
  try {
    const parsed: Patient[] = JSON.parse(data);
    // Ensure all patients have assessments and treatment plans array structures
    let migrated = false;
    parsed.forEach(p => {
      if (!p.assessments) {
        // Populate default seed assessments for pat_1 if missing
        const seedMatch = MOCK_PATIENTS_SEED.find(s => s.id === p.id);
        p.assessments = seedMatch?.assessments || [];
        migrated = true;
      }
      if (!p.treatmentPlans) {
        p.treatmentPlans = [];
        migrated = true;
      }
    });
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return MOCK_PATIENTS_SEED;
  }
};

const saveLocalStore = (patients: Patient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};

export const patientService = {
  getAll: async (filters?: { search?: string; status?: string; gender?: string }): Promise<Patient[]> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.get('/patients', { params: filters });
        return response.data;
      }
      throw new Error('Offline mode active');
    } catch {
      console.warn('[Offline Mode] Loading patients from localStorage.');
      let list = getLocalStore();

      if (filters) {
        const { search, status, gender } = filters;
        if (search) {
          const lower = search.toLowerCase();
          list = list.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            p.email.toLowerCase().includes(lower) ||
            p.phone.includes(lower)
          );
        }
        if (status && status !== 'All') {
          list = list.filter(p => p.status === status);
        }
        if (gender && gender !== 'All') {
          list = list.filter(p => p.gender === gender);
        }
      }
      return list;
    }
  },

  getById: async (id: string): Promise<Patient> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.get(`/patients/${id}`);
        return response.data;
      }
      throw new Error('Offline mode active');
    } catch {
      console.warn(`[Offline Mode] Fetching patient ${id} from localStorage.`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === id);
      if (!patient) throw new Error('Patient not found');
      return patient;
    }
  },

  create: async (patientData: Omit<Patient, 'id' | 'registrationDate'>): Promise<Patient> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.post('/patients', patientData);
        return response.data;
      }
      throw new Error('Offline mode active');
    } catch {
      console.warn('[Offline Mode] Creating patient in localStorage.');
      const list = getLocalStore();
      const newPatient: Patient = {
        ...patientData,
        id: `pat_${Date.now()}`,
        registrationDate: new Date().toISOString().split('T')[0],
        medicalHistory: [],
        documents: [],
        appointments: [],
        treatmentPlans: [],
        invoices: [],
        vitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          weightKg: 70,
          heightCm: 170,
          updatedAt: new Date().toISOString()
        }
      };
      list.push(newPatient);
      saveLocalStore(list);
      return newPatient;
    }
  },

  update: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const response = await api.put(`/patients/${id}`, patientData);
        return response.data;
      }
      throw new Error('Offline mode active');
    } catch {
      console.warn(`[Offline Mode] Updating patient ${id} in localStorage.`);
      const list = getLocalStore();
      const index = list.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Patient not found');
      
      const updatedPatient = {
        ...list[index],
        ...patientData,
        vitals: {
          ...list[index].vitals,
          ...patientData.vitals,
          updatedAt: new Date().toISOString()
        }
      };
      list[index] = updatedPatient;
      saveLocalStore(list);
      return updatedPatient;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        await api.delete(`/patients/${id}`);
        return true;
      }
      throw new Error('Offline mode active');
    } catch {
      console.warn(`[Offline Mode] Archiving/Deleting patient ${id} in localStorage.`);
      const list = getLocalStore();
      const filtered = list.filter(p => p.id !== id);
      saveLocalStore(filtered);
      return true;
    }
  },

  // --- Day 5 Clinical Assessments & Treatment Plans Methods ---

  addAssessment: async (patientId: string, assessmentData: Omit<ClinicalAssessment, 'id'>): Promise<ClinicalAssessment> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const res = await api.post(`/patients/${patientId}/assessments`, assessmentData);
        return res.data;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Adding clinical assessment for patient ${patientId}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient) throw new Error('Patient not found');

      const newAssessment: ClinicalAssessment = {
        ...assessmentData,
        id: `asm_${Date.now()}`
      };

      if (!patient.assessments) patient.assessments = [];
      patient.assessments.unshift(newAssessment);
      saveLocalStore(list);
      return newAssessment;
    }
  },

  deleteAssessment: async (patientId: string, assessmentId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        await api.delete(`/patients/${patientId}/assessments/${assessmentId}`);
        return true;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Deleting assessment ${assessmentId} from patient ${patientId}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient || !patient.assessments) return false;

      patient.assessments = patient.assessments.filter(a => a.id !== assessmentId);
      saveLocalStore(list);
      return true;
    }
  },

  createTreatmentPlan: async (patientId: string, planData: Omit<TreatmentPlan, 'id' | 'sessionsCompleted' | 'sessions'>): Promise<TreatmentPlan> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const res = await api.post(`/patients/${patientId}/treatment-plans`, planData);
        return res.data;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Creating treatment plan for patient ${patientId}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient) throw new Error('Patient not found');

      const newPlan: TreatmentPlan = {
        ...planData,
        id: `tp_${Date.now()}`,
        sessionsCompleted: 0,
        sessions: []
      };

      if (!patient.treatmentPlans) patient.treatmentPlans = [];
      patient.treatmentPlans.unshift(newPlan);
      saveLocalStore(list);
      return newPlan;
    }
  },

  updatePlanStatus: async (patientId: string, planId: string, status: TreatmentPlan['status']): Promise<TreatmentPlan> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const res = await api.patch(`/patients/${patientId}/treatment-plans/${planId}/status`, { status });
        return res.data;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Updating treatment plan ${planId} status to ${status}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient || !patient.treatmentPlans) throw new Error('Patient or plan not found');

      const plan = patient.treatmentPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      plan.status = status;
      saveLocalStore(list);
      return plan;
    }
  },

  recordTreatmentSession: async (patientId: string, planId: string, sessionData: Omit<TreatmentSession, 'id'>): Promise<TreatmentSession> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const res = await api.post(`/patients/${patientId}/treatment-plans/${planId}/sessions`, sessionData);
        return res.data;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Recording session on plan ${planId} for patient ${patientId}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient || !patient.treatmentPlans) throw new Error('Patient not found');

      const plan = patient.treatmentPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const newSession: TreatmentSession = {
        ...sessionData,
        id: `tps_${Date.now()}`
      };

      if (!plan.sessions) plan.sessions = [];
      plan.sessions.unshift(newSession);
      plan.sessionsCompleted = Math.min(plan.sessionsCount, (plan.sessionsCompleted || 0) + 1);

      if (plan.sessionsCompleted >= plan.sessionsCount) {
        plan.status = 'Completed';
      }

      saveLocalStore(list);
      return newSession;
    }
  },

  createPrescription: async (patientId: string, prescriptionData: Omit<ExercisePrescription, 'id'>): Promise<ExercisePrescription> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const res = await api.post(`/patients/${patientId}/prescriptions`, prescriptionData);
        return res.data;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Creating exercise prescription for patient ${patientId}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient) throw new Error('Patient not found');

      const newRx: ExercisePrescription = {
        ...prescriptionData,
        id: `rx_${Date.now()}`,
      };

      if (!patient.prescriptions) patient.prescriptions = [];
      patient.prescriptions.unshift(newRx);
      saveLocalStore(list);
      return newRx;
    }
  },

  updatePrescriptionStatus: async (patientId: string, prescriptionId: string, status: ExercisePrescription['status']): Promise<ExercisePrescription> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        const res = await api.patch(`/patients/${patientId}/prescriptions/${prescriptionId}/status`, { status });
        return res.data;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Updating prescription ${prescriptionId} status to ${status}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient || !patient.prescriptions) throw new Error('Patient or prescriptions not found');

      const rx = patient.prescriptions.find(r => r.id === prescriptionId);
      if (!rx) throw new Error('Prescription not found');

      rx.status = status;
      saveLocalStore(list);
      return rx;
    }
  },

  deletePrescription: async (patientId: string, prescriptionId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('gf_auth_token');
      if (token && !token.startsWith('mock_')) {
        await api.delete(`/patients/${patientId}/prescriptions/${prescriptionId}`);
        return true;
      }
      throw new Error('Offline mode');
    } catch {
      console.warn(`[Offline Mode] Deleting prescription ${prescriptionId} from patient ${patientId}`);
      const list = getLocalStore();
      const patient = list.find(p => p.id === patientId);
      if (!patient || !patient.prescriptions) return false;

      patient.prescriptions = patient.prescriptions.filter(r => r.id !== prescriptionId);
      saveLocalStore(list);
      return true;
    }
  }
};
