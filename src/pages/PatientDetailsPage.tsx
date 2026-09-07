import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Upload,
  Heart,
  Scale,
  Ruler,
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Stethoscope,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  Calendar,
  Layers,
  Dumbbell,
  Search,
  Check,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { patientService } from '../services/patientService';
import { treatmentService } from '../services/treatmentService';
import { prescriptionService } from '../services/prescriptionService';
import type {
  Patient,
  MedicalHistory,
  PatientDocument,
  Appointment,
  TreatmentPlan,
  TreatmentSession,
  ClinicalAssessment,
  TreatmentType,
  Invoice,
  ExercisePrescription,
  PrescribedExerciseItem,
  Exercise,
} from '../types';
import './PatientDetailsPage.css';

export const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Core Data States
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'plans' | 'prescriptions' | 'history' | 'documents' | 'appointments' | 'billing'>('overview');

  // Modal States
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isTakeHomeSheetOpen, setIsTakeHomeSheetOpen] = useState(false);
  const [selectedPrescriptionForSheet, setSelectedPrescriptionForSheet] = useState<ExercisePrescription | null>(null);

  // Available Data
  const [availableTreatments, setAvailableTreatments] = useState<TreatmentType[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Prescription Builder State (Day 6)
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState('All');
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    prescribedDate: new Date().toISOString().split('T')[0],
    prescribedBy: 'Dr. Glory Physiotherapist',
    targetGoal: '',
    generalInstructions: 'Complete each exercise adhering strictly to prescribed hold times and repetitions. Rest 45-60 seconds between sets. Discontinue any movement that provokes sharp or radiating pain.',
    items: [] as PrescribedExerciseItem[],
  });

  // Vitals Form State
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    heartRate: '',
    weightKg: '',
    heightCm: '',
  });

  // Medical History Form State
  const [historyForm, setHistoryForm] = useState({
    condition: '',
    diagnosedDate: new Date().toISOString().split('T')[0],
    severity: 'Moderate' as 'Mild' | 'Moderate' | 'Severe',
    status: 'Active' as 'Active' | 'Resolved' | 'Chronic',
    notes: '',
  });

  // Appointment Form State
  const [apptForm, setApptForm] = useState({
    date: '',
    time: '10:00 AM',
    therapistName: 'Dr. Glory Physiotherapist',
    type: 'Physiotherapy Session',
    notes: '',
  });

  // Clinical Assessment Form State (Day 5)
  const [assessmentForm, setAssessmentForm] = useState({
    chiefComplaint: '',
    painScore: 6,
    painLocation: '',
    painType: 'Dull Aching' as ClinicalAssessment['painType'],
    aggravatingFactors: '',
    relievingFactors: '',
    romFindings: '',
    postureAndGait: '',
    functionalLimitations: '',
    clinicalDiagnosis: '',
    prognosis: 'Good' as ClinicalAssessment['prognosis'],
    shortTermGoals: '',
    longTermGoals: '',
    recommendedFrequency: '3 sessions / week',
    notes: '',
  });

  // Treatment Plan Form State (Day 5)
  const [planForm, setPlanForm] = useState({
    diagnosis: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionsCount: 12,
    treatmentFrequency: '3x / week',
    assignedTherapist: 'Dr. Glory Physiotherapist',
    goals: '',
    selectedTreatments: [] as string[],
    notes: '',
  });

  // Session Checklist Form State (Day 5 enhanced)
  const [sessionForm, setSessionForm] = useState({
    planId: '',
    date: new Date().toISOString().split('T')[0],
    performedBy: 'Dr. Glory Physiotherapist',
    preSessionPain: 6,
    postSessionPain: 3,
    modalitiesConducted: [] as string[],
    patientTolerance: 'Tolerated Well' as NonNullable<TreatmentSession['patientTolerance']>,
    notes: '',
    nextSessionPlan: '',
  });

  // Billing Preview State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Document Upload Simulator
  const [isUploading, setIsUploading] = useState(false);

  const fetchPatientDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await patientService.getById(id);
      setPatient(data);
      // Pre-fill vitals form
      if (data.vitals) {
        setVitalsForm({
          bloodPressure: data.vitals.bloodPressure || '',
          heartRate: data.vitals.heartRate?.toString() || '',
          weightKg: data.vitals.weightKg?.toString() || '',
          heightCm: data.vitals.heightCm?.toString() || '',
        });
      }
    } catch {
      showToast('Patient record could not be loaded.', 'error');
      navigate('/patients');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchPatientDetails();
    treatmentService.getAllTreatments().then((res: TreatmentType[]) => setAvailableTreatments(res)).catch(() => {});
    treatmentService.getAllExercises().then((res: Exercise[]) => setAvailableExercises(res)).catch(() => {});
  }, [fetchPatientDetails]);

  // Vitals Update Submit
  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      const updatedVitals = {
        bloodPressure: vitalsForm.bloodPressure,
        heartRate: vitalsForm.heartRate ? parseInt(vitalsForm.heartRate) : undefined,
        weightKg: vitalsForm.weightKg ? parseFloat(vitalsForm.weightKg) : undefined,
        heightCm: vitalsForm.heightCm ? parseFloat(vitalsForm.heightCm) : undefined,
      };

      const updatedPatient = await patientService.update(patient.id, {
        vitals: updatedVitals,
      });

      setPatient(updatedPatient);
      showToast('Vitals logged successfully.', 'success');
      setIsVitalsModalOpen(false);
    } catch {
      showToast('Failed to update vitals.', 'error');
    }
  };

  // Add Medical History Record
  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!historyForm.condition.trim()) {
      showToast('Condition name is required', 'warning');
      return;
    }

    try {
      const newHistoryItem: MedicalHistory = {
        id: `mh_${Date.now()}`,
        ...historyForm,
      };

      const updatedHistory = [...(patient.medicalHistory || []), newHistoryItem];
      const updatedPatient = await patientService.update(patient.id, {
        medicalHistory: updatedHistory,
      });

      setPatient(updatedPatient);
      showToast('Condition added to medical history.', 'success');
      setIsHistoryModalOpen(false);
      // Reset form
      setHistoryForm({
        condition: '',
        diagnosedDate: new Date().toISOString().split('T')[0],
        severity: 'Moderate',
        status: 'Active',
        notes: '',
      });
    } catch {
      showToast('Failed to save medical history.', 'error');
    }
  };

  // Delete Medical History
  const handleDeleteHistory = async (historyId: string) => {
    if (!patient) return;
    if (window.confirm('Delete this condition from history?')) {
      try {
        const updatedHistory = (patient.medicalHistory || []).filter(item => item.id !== historyId);
        const updatedPatient = await patientService.update(patient.id, {
          medicalHistory: updatedHistory,
        });
        setPatient(updatedPatient);
        showToast('Condition removed.', 'info');
      } catch {
        showToast('Failed to remove condition.', 'error');
      }
    }
  };

  // Schedule Appointment
  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!apptForm.date) {
      showToast('Date is required.', 'warning');
      return;
    }

    try {
      const newAppt: Appointment = {
        id: `apt_${Date.now()}`,
        date: apptForm.date,
        time: apptForm.time,
        therapistName: apptForm.therapistName,
        status: 'Scheduled',
        type: apptForm.type,
        notes: apptForm.notes,
      };

      const updatedAppts = [...(patient.appointments || []), newAppt];
      const updatedPatient = await patientService.update(patient.id, {
        appointments: updatedAppts,
      });

      setPatient(updatedPatient);
      showToast('Appointment scheduled successfully.', 'success');
      setIsApptModalOpen(false);
    } catch {
      showToast('Failed to schedule appointment.', 'error');
    }
  };

  // --- Day 5 Clinical Assessment Handlers ---
  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!assessmentForm.chiefComplaint.trim() || !assessmentForm.clinicalDiagnosis.trim()) {
      showToast('Please enter both Chief Complaint and Clinical Diagnosis.', 'warning');
      return;
    }

    try {
      const newAsm = await patientService.addAssessment(patient.id, {
        patientId: patient.id,
        assessmentDate: new Date().toISOString().split('T')[0],
        assessedBy: 'Dr. Glory Physiotherapist',
        chiefComplaint: assessmentForm.chiefComplaint,
        painScore: Number(assessmentForm.painScore),
        painLocation: assessmentForm.painLocation || 'General',
        painType: assessmentForm.painType,
        aggravatingFactors: assessmentForm.aggravatingFactors,
        relievingFactors: assessmentForm.relievingFactors,
        romFindings: assessmentForm.romFindings,
        postureAndGait: assessmentForm.postureAndGait,
        functionalLimitations: assessmentForm.functionalLimitations,
        clinicalDiagnosis: assessmentForm.clinicalDiagnosis,
        prognosis: assessmentForm.prognosis,
        shortTermGoals: assessmentForm.shortTermGoals,
        longTermGoals: assessmentForm.longTermGoals,
        recommendedFrequency: assessmentForm.recommendedFrequency,
        notes: assessmentForm.notes,
      });

      const updatedAssessments = [newAsm, ...(patient.assessments || [])];
      setPatient({ ...patient, assessments: updatedAssessments });
      showToast('Clinical assessment registered successfully.', 'success');
      setIsAssessmentModalOpen(false);
      setAssessmentForm({
        chiefComplaint: '',
        painScore: 5,
        painLocation: '',
        painType: 'Dull Aching',
        aggravatingFactors: '',
        relievingFactors: '',
        romFindings: '',
        postureAndGait: '',
        functionalLimitations: '',
        clinicalDiagnosis: '',
        prognosis: 'Good',
        shortTermGoals: '',
        longTermGoals: '',
        recommendedFrequency: '3 sessions / week',
        notes: '',
      });
    } catch {
      showToast('Failed to save clinical assessment.', 'error');
    }
  };

  const handleDeleteAssessment = async (asmId: string) => {
    if (!patient) return;
    try {
      await patientService.deleteAssessment(patient.id, asmId);
      const filtered = (patient.assessments || []).filter(a => a.id !== asmId);
      setPatient({ ...patient, assessments: filtered });
      showToast('Clinical assessment removed.', 'info');
    } catch {
      showToast('Failed to delete assessment.', 'error');
    }
  };

  // --- Day 5 Treatment Plan Builder Handlers ---
  const handleCreatePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!planForm.diagnosis.trim()) {
      showToast('Please specify a diagnosis for the treatment plan.', 'warning');
      return;
    }
    if (planForm.selectedTreatments.length === 0) {
      showToast('Please assign at least one therapeutic modality from the library.', 'warning');
      return;
    }

    try {
      const newPlan = await patientService.createTreatmentPlan(patient.id, {
        diagnosis: planForm.diagnosis,
        startDate: planForm.startDate,
        endDate: planForm.endDate,
        sessionsCount: Number(planForm.sessionsCount) || 10,
        status: 'Active',
        goals: planForm.goals || 'Restore functional range of motion and reduce pain.',
        treatments: planForm.selectedTreatments,
        treatmentFrequency: planForm.treatmentFrequency,
        assignedTherapist: planForm.assignedTherapist,
        notes: planForm.notes,
      });

      const updatedPlans = [newPlan, ...(patient.treatmentPlans || [])];
      setPatient({ ...patient, treatmentPlans: updatedPlans });
      showToast('New Treatment Plan initiated.', 'success');
      setIsNewPlanModalOpen(false);
      setPlanForm({
        diagnosis: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sessionsCount: 12,
        treatmentFrequency: '3x / week',
        assignedTherapist: 'Dr. Glory Physiotherapist',
        goals: '',
        selectedTreatments: [],
        notes: '',
      });
    } catch {
      showToast('Failed to create treatment plan.', 'error');
    }
  };

  const handleUpdatePlanStatus = async (planId: string, status: TreatmentPlan['status']) => {
    if (!patient) return;
    try {
      await patientService.updatePlanStatus(patient.id, planId, status);
      const updatedPlans = (patient.treatmentPlans || []).map(p =>
        p.id === planId ? { ...p, status } : p
      );
      setPatient({ ...patient, treatmentPlans: updatedPlans });
      showToast(`Treatment plan status updated to ${status}.`, 'info');
    } catch {
      showToast('Failed to update plan status.', 'error');
    }
  };

  const openSessionModalForPlan = (planId?: string) => {
    if (!patient?.treatmentPlans) return;
    const targetPlan = planId
      ? patient.treatmentPlans.find(p => p.id === planId)
      : patient.treatmentPlans.find(p => p.status === 'Active');

    if (!targetPlan) {
      showToast('No active treatment plan found to record session.', 'warning');
      return;
    }

    setSessionForm({
      planId: targetPlan.id,
      date: new Date().toISOString().split('T')[0],
      performedBy: 'Dr. Glory Physiotherapist',
      preSessionPain: 6,
      postSessionPain: 3,
      modalitiesConducted: targetPlan.treatments ? [...targetPlan.treatments] : [],
      patientTolerance: 'Tolerated Well',
      notes: '',
      nextSessionPlan: '',
    });
    setIsSessionModalOpen(true);
  };

  const initiatePlanFromAssessment = (asm: ClinicalAssessment) => {
    setPlanForm({
      diagnosis: asm.clinicalDiagnosis,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sessionsCount: 12,
      treatmentFrequency: asm.recommendedFrequency || '3x / week',
      assignedTherapist: asm.assessedBy || 'Dr. Glory Physiotherapist',
      goals: `${asm.shortTermGoals ? asm.shortTermGoals : ''} ${asm.longTermGoals ? ' | Long-term: ' + asm.longTermGoals : ''}`.trim(),
      selectedTreatments: availableTreatments.slice(0, 3).map(t => t.name),
      notes: `Formulated based on clinical evaluation on ${asm.assessmentDate}. Complaint: ${asm.chiefComplaint}`,
    });
    setIsNewPlanModalOpen(true);
  };

  // Add Treatment Session Check-In (Day 5 Enhanced)
  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !patient.treatmentPlans || patient.treatmentPlans.length === 0) return;

    const targetPlan = sessionForm.planId
      ? patient.treatmentPlans.find(p => p.id === sessionForm.planId)
      : patient.treatmentPlans.find(p => p.status === 'Active');

    if (!targetPlan) {
      showToast('No active treatment plan selected.', 'warning');
      return;
    }

    try {
      await patientService.recordTreatmentSession(patient.id, targetPlan.id, {
        date: sessionForm.date,
        notes: sessionForm.notes || 'Rehabilitation therapeutic session executed according to prescription protocol.',
        performedBy: sessionForm.performedBy,
        preSessionPain: Number(sessionForm.preSessionPain),
        postSessionPain: Number(sessionForm.postSessionPain),
        modalitiesConducted: sessionForm.modalitiesConducted.length > 0 ? sessionForm.modalitiesConducted : targetPlan.treatments.slice(0, 2),
        patientTolerance: sessionForm.patientTolerance,
        nextSessionPlan: sessionForm.nextSessionPlan || 'Advance active functional strengthening and home exercise adherence.',
      });

      // Auto-generate invoice row on milestone or completion
      let invoicesCopy = [...(patient.invoices || [])];
      const updatedSessionsCount = (targetPlan.sessionsCompleted || 0) + 1;
      if (updatedSessionsCount >= targetPlan.sessionsCount || updatedSessionsCount % 3 === 0) {
        const newInvoice: Invoice = {
          id: `inv_${Date.now()}`,
          invoiceNumber: `INV-2026-${Math.floor(Math.random() * 900) + 100}`,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: 120.00,
          paidAmount: 0.00,
          balanceAmount: 120.00,
          status: 'Unpaid',
        };
        invoicesCopy.push(newInvoice);
        await patientService.update(patient.id, { invoices: invoicesCopy });
      }

      const refreshedPatient = await patientService.getById(patient.id);
      setPatient(refreshedPatient);
      showToast('Session logged with pre/post pain tracking!', 'success');
      setIsSessionModalOpen(false);
      setSessionForm({
        planId: '',
        date: new Date().toISOString().split('T')[0],
        performedBy: 'Dr. Glory Physiotherapist',
        preSessionPain: 6,
        postSessionPain: 3,
        modalitiesConducted: [],
        patientTolerance: 'Tolerated Well',
        notes: '',
        nextSessionPlan: '',
      });
    } catch {
      showToast('Failed to record session check-in.', 'error');
    }
  };

  // Upload Document simulation
  const handleFileUploadSim = () => {
    if (!patient) return;
    setIsUploading(true);
    setTimeout(async () => {
      try {
        const fileNames = ['Lab_Report_Vitals.pdf', 'Spinal_MRI_Assessment.pdf', 'Therapy_Reference_Letter.pdf'];
        const types = ['pdf', 'pdf', 'pdf'];
        const randomIdx = Math.floor(Math.random() * fileNames.length);

        const newDoc: PatientDocument = {
          id: `doc_${Date.now()}`,
          fileName: fileNames[randomIdx],
          fileType: types[randomIdx],
          fileSize: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: 'Dr. Glory Admin',
          url: '#',
        };

        const updatedDocs = [...(patient.documents || []), newDoc];
        const updatedPatient = await patientService.update(patient.id, {
          documents: updatedDocs,
        });

        setPatient(updatedPatient);
        showToast('Document uploaded successfully.', 'success');
      } catch {
        showToast('Failed to upload document.', 'error');
      } finally {
        setIsUploading(false);
      }
    }, 1500);
  };

  // Delete Document
  const handleDeleteDoc = async (docId: string) => {
    if (!patient) return;
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const updatedDocs = (patient.documents || []).filter(d => d.id !== docId);
        const updatedPatient = await patientService.update(patient.id, {
          documents: updatedDocs,
        });
        setPatient(updatedPatient);
        showToast('Document deleted.', 'info');
      } catch {
        showToast('Failed to delete document.', 'error');
      }
    }
  };

  // DAY 6: EXERCISE PRESCRIPTION HANDLERS
  const handleOpenPrescriptionModal = () => {
    const latestDiagnosis = patient?.assessments && patient.assessments.length > 0
      ? patient.assessments[0].clinicalDiagnosis
      : (patient?.medicalHistory && patient.medicalHistory.length > 0 ? patient.medicalHistory[0].condition : '');

    const latestGoal = patient?.assessments && patient.assessments.length > 0
      ? patient.assessments[0].shortTermGoals
      : '';

    setPrescriptionForm({
      diagnosis: latestDiagnosis || '',
      prescribedDate: new Date().toISOString().split('T')[0],
      prescribedBy: 'Dr. Glory Physiotherapist',
      targetGoal: latestGoal || '',
      generalInstructions: 'Complete each exercise adhering strictly to prescribed hold times and repetitions. Rest 45-60 seconds between sets. Discontinue any movement that provokes sharp or radiating pain.',
      items: [],
    });
    setExerciseSearchQuery('');
    setExerciseCategoryFilter('All');
    setIsPrescriptionModalOpen(true);
  };

  const handleToggleExerciseInRx = (exercise: Exercise) => {
    const existingIndex = prescriptionForm.items.findIndex(i => i.exerciseId === exercise.id);
    if (existingIndex !== -1) {
      setPrescriptionForm(prev => ({
        ...prev,
        items: prev.items.filter(i => i.exerciseId !== exercise.id)
      }));
    } else {
      const newItem: PrescribedExerciseItem = {
        id: `rxi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        category: exercise.category,
        targetMuscleGroup: exercise.targetMuscleGroup,
        sets: exercise.defaultSets || 3,
        reps: exercise.defaultReps || 10,
        holdSec: exercise.defaultHoldSec || 3,
        frequency: 'Once daily',
        durationWeeks: 4,
        notes: exercise.precautions || '',
      };
      setPrescriptionForm(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  const handleUpdateRxItem = (itemId: string, field: keyof PrescribedExerciseItem, val: any) => {
    setPrescriptionForm(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, [field]: val } : item)
    }));
  };

  const handleRemoveRxItem = (itemId: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    if (!prescriptionForm.diagnosis.trim()) {
      showToast('Please specify a clinical diagnosis.', 'warning');
      return;
    }

    if (prescriptionForm.items.length === 0) {
      showToast('Please select at least one exercise to prescribe.', 'warning');
      return;
    }

    try {
      const newRx = await prescriptionService.createPrescription(patient.id, {
        patientId: patient.id,
        prescribedDate: prescriptionForm.prescribedDate,
        prescribedBy: prescriptionForm.prescribedBy,
        diagnosis: prescriptionForm.diagnosis,
        status: 'Active',
        targetGoal: prescriptionForm.targetGoal,
        generalInstructions: prescriptionForm.generalInstructions,
        items: prescriptionForm.items,
      });

      setPatient(prev => prev ? {
        ...prev,
        prescriptions: [newRx, ...(prev.prescriptions || [])]
      } : null);

      showToast('Exercise prescription formulated and saved!', 'success');
      setIsPrescriptionModalOpen(false);
    } catch {
      showToast('Failed to save exercise prescription.', 'error');
    }
  };

  const handleUpdateRxStatus = async (rxId: string, status: ExercisePrescription['status']) => {
    if (!patient) return;
    try {
      await prescriptionService.updateStatus(patient.id, rxId, status);
      setPatient(prev => prev ? {
        ...prev,
        prescriptions: (prev.prescriptions || []).map(r => r.id === rxId ? { ...r, status } : r)
      } : null);
      showToast(`Prescription marked as ${status}`, 'success');
    } catch {
      showToast('Failed to update prescription status.', 'error');
    }
  };

  const handleDeleteRx = async (rxId: string) => {
    if (!patient) return;
    if (!window.confirm('Are you sure you want to remove this exercise prescription?')) return;

    try {
      await prescriptionService.deletePrescription(patient.id, rxId);
      setPatient(prev => prev ? {
        ...prev,
        prescriptions: (prev.prescriptions || []).filter(r => r.id !== rxId)
      } : null);
      showToast('Prescription removed.', 'info');
    } catch {
      showToast('Failed to delete prescription.', 'error');
    }
  };

  const handleOpenTakeHomeSheet = (rx: ExercisePrescription) => {
    setSelectedPrescriptionForSheet(rx);
    setIsTakeHomeSheetOpen(true);
  };

  const calculateAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age || 0;
  };

  if (isLoading) {
    return (
      <div className="patient-details-loading-container">
        <div className="spinner shimmer" />
        <p>Retrieving patient records...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-not-found-card">
        <AlertCircle size={40} className="error-icon" />
        <h3>Patient Record Not Found</h3>
        <Button onClick={() => navigate('/patients')} variant="secondary">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="patient-details-wrapper">
      {/* Return to Directory Navbar */}
      <div className="details-header-nav animate-slide-in">
        <Button
          onClick={() => navigate('/patients')}
          variant="secondary"
          iconLeft={<ArrowLeft size={16} />}
          className="back-btn"
        >
          Back to Patient Directory
        </Button>
        <span className="registration-tag">
          Registered: {patient.registrationDate}
        </span>
      </div>

      {/* Main Grid: Left Details - Right Tabs */}
      <div className="details-grid-container">
        
        {/* Left Column Profile Summary */}
        <div className="profile-summary-column animate-slide-in">
          <Card className="profile-main-card">
            <div className="profile-header-info">
              <div className="profile-circle-avatar">
                {patient.name.charAt(0)}
              </div>
              <h3 className="profile-name">{patient.name}</h3>
              <span className={`status-badge status-badge-${patient.status.toLowerCase()}`}>
                {patient.status}
              </span>
              <p className="profile-sub-details">
                {patient.gender} • {calculateAge(patient.dateOfBirth)} years old • {patient.bloodGroup}
              </p>
            </div>

            <hr className="profile-divider" />

            <div className="profile-contact-block">
              <h4 className="card-sub-header">Contact Information</h4>
              <p><strong>Phone:</strong> {patient.phone}</p>
              <p><strong>Email:</strong> {patient.email || 'N/A'}</p>
              <p><strong>Address:</strong> {patient.address}, {patient.city}, {patient.state}, {patient.country}</p>
            </div>

            <hr className="profile-divider" />

            <div className="profile-emergency-block">
              <h4 className="card-sub-header text-danger">Emergency Contact</h4>
              <p><strong>Name:</strong> {patient.emergencyContactName || 'N/A'}</p>
              <p><strong>Phone:</strong> {patient.emergencyContactPhone || 'N/A'}</p>
            </div>
          </Card>

          {/* Quick Active Vitals Card */}
          <Card className="vitals-quick-card">
            <div className="vitals-quick-header">
              <h4 className="card-sub-header">Active Vitals</h4>
              <Button onClick={() => setIsVitalsModalOpen(true)} variant="secondary" className="vitals-edit-btn">
                Record Vitals
              </Button>
            </div>
            
            {patient.vitals ? (
              <div className="vitals-values-grid">
                <div className="vitals-widget">
                  <Heart className="widget-icon text-danger" size={18} />
                  <div className="widget-content">
                    <span className="widget-val">{patient.vitals.bloodPressure || 'N/A'}</span>
                    <span className="widget-label">BP (mmHg)</span>
                  </div>
                </div>
                <div className="vitals-widget">
                  <TrendingUp className="widget-icon text-teal" size={18} />
                  <div className="widget-content">
                    <span className="widget-val">{patient.vitals.heartRate ? `${patient.vitals.heartRate} bpm` : 'N/A'}</span>
                    <span className="widget-label">Pulse Rate</span>
                  </div>
                </div>
                <div className="vitals-widget">
                  <Scale className="widget-icon text-blue" size={18} />
                  <div className="widget-content">
                    <span className="widget-val">{patient.vitals.weightKg ? `${patient.vitals.weightKg} kg` : 'N/A'}</span>
                    <span className="widget-label">Weight</span>
                  </div>
                </div>
                <div className="vitals-widget">
                  <Ruler className="widget-icon text-orange" size={18} />
                  <div className="widget-content">
                    <span className="widget-val">{patient.vitals.heightCm ? `${patient.vitals.heightCm} cm` : 'N/A'}</span>
                    <span className="widget-label">Height</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-vitals-message">No vitals registered yet.</p>
            )}
            
            {patient.vitals?.updatedAt && (
              <p className="vitals-timestamp">Last updated: {new Date(patient.vitals.updatedAt).toLocaleString()}</p>
            )}
          </Card>
        </div>

        {/* Right Column: Tab View Manager */}
        <div className="tabs-content-column animate-slide-in">
          
          {/* Tab Navigation Header Buttons */}
          <div className="tabs-header-bar">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'assessments', label: 'Assessments', count: patient.assessments?.length },
              { id: 'plans', label: 'Treatment Plans', count: patient.treatmentPlans?.length },
              { id: 'prescriptions', label: 'Exercise Prescriptions', count: patient.prescriptions?.length },
              { id: 'history', label: 'Medical History' },
              { id: 'documents', label: 'Documents' },
              { id: 'appointments', label: 'Appointments' },
              { id: 'billing', label: 'Billing' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab-btn-link ${activeTab === tab.id ? 'tab-btn-link-active' : ''}`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="tab-badge-pill">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* TAB BODY RENDER */}
          <div className="tab-body-container">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <h3 className="tab-title">Medical Assessment Summary</h3>
                  <div className="overview-complaint-section">
                    <h4 className="section-label">Active Symptoms & Chief Complaint</h4>
                    <p className="content-paragraph-box">
                      {patient.assessments && patient.assessments.length > 0
                        ? patient.assessments[0].chiefComplaint
                        : patient.medicalHistory && patient.medicalHistory.length > 0
                        ? `Patient currently reporting concerns relating to "${patient.medicalHistory[0].condition}". ${patient.medicalHistory[0].notes || ''}`
                        : 'No active clinical symptoms recorded. Registered for routine evaluation.'}
                    </p>
                  </div>

                  <div className="overview-goals-section">
                    <h4 className="section-label">Active Physical Goals</h4>
                    {patient.treatmentPlans && patient.treatmentPlans.some(p => p.status === 'Active') ? (
                      <p className="content-paragraph-box text-teal-accent">
                        {patient.treatmentPlans.find(p => p.status === 'Active')?.goals}
                      </p>
                    ) : (
                      <p className="content-paragraph-box text-muted">
                        No active physical goals configured. Formulate a Treatment Plan under the <strong>Plans</strong> tab.
                      </p>
                    )}
                  </div>

                  <div className="overview-clinical-notes">
                    <h4 className="section-label">Physiotherapist Notes</h4>
                    <textarea
                      placeholder="Add primary therapeutic insights or clinical follow-up comments here..."
                      className="details-textarea-notes"
                      defaultValue="Patient shows consistent dedication to core and lumbar stabilization tasks. Track pain index progression on Assessments tab."
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* CLINICAL ASSESSMENTS TAB (DAY 5) */}
            {activeTab === 'assessments' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <div className="tab-card-header-btn">
                    <div>
                      <h3 className="tab-title">Clinical Assessments & VAS Pain Evaluation</h3>
                      <p className="tab-sub-title">Document chief complaints, visual analog pain score, mobility exams, and diagnostic impressions.</p>
                    </div>
                    <Button
                      onClick={() => setIsAssessmentModalOpen(true)}
                      variant="primary"
                      iconLeft={<Stethoscope size={16} />}
                    >
                      Conduct Assessment
                    </Button>
                  </div>

                  {/* Quick Pain Metrics Banner */}
                  {patient.assessments && patient.assessments.length > 0 && (
                    <div className="assessment-metrics-banner">
                      <div className="metric-pill">
                        <span className="metric-label">Current Pain Index (VAS)</span>
                        <div className="metric-value-row">
                          <span className={`pain-val-badge ${
                            patient.assessments[0].painScore <= 3 ? 'pain-badge-mild' :
                            patient.assessments[0].painScore <= 6 ? 'pain-badge-moderate' : 'pain-badge-severe'
                          }`}>
                            {patient.assessments[0].painScore} / 10
                          </span>
                          <span className="pain-val-text">
                            {patient.assessments[0].painScore <= 3 ? 'Mild Discomfort' :
                             patient.assessments[0].painScore <= 6 ? 'Moderate Pain' : 'Severe / Acute Pain'}
                          </span>
                        </div>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Pain Nature & Area</span>
                        <span className="metric-value-text">
                          {patient.assessments[0].painType} • {patient.assessments[0].painLocation}
                        </span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Latest Diagnosis</span>
                        <span className="metric-value-text text-teal-accent font-semibold">
                          {patient.assessments[0].clinicalDiagnosis}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Assessments List */}
                  <div className="assessments-list-wrapper">
                    {patient.assessments && patient.assessments.length > 0 ? (
                      patient.assessments.map((asm) => {
                        const painColorClass =
                          asm.painScore <= 3 ? 'pain-badge-mild' :
                          asm.painScore <= 6 ? 'pain-badge-moderate' : 'pain-badge-severe';
                        const painPercent = Math.min(100, Math.max(0, asm.painScore * 10));

                        return (
                          <div key={asm.id} className="clinical-assessment-card">
                            <div className="asm-card-header">
                              <div className="asm-header-left">
                                <div className="asm-date-row">
                                  <Calendar size={14} className="text-muted" />
                                  <span className="asm-date">{asm.assessmentDate}</span>
                                  <span className="asm-examiner">Evaluated by: {asm.assessedBy}</span>
                                </div>
                                <h4 className="asm-diagnosis-title">{asm.clinicalDiagnosis}</h4>
                              </div>
                              <div className="asm-header-right">
                                <span className={`prognosis-tag prognosis-${asm.prognosis?.toLowerCase() || 'good'}`}>
                                  Prognosis: {asm.prognosis || 'Good'}
                                </span>
                                <div className={`vas-score-pill ${painColorClass}`}>
                                  <Activity size={14} />
                                  <span>VAS: {asm.painScore}/10</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteAssessment(asm.id)}
                                  className="asm-delete-btn"
                                  title="Delete Assessment"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* VAS Pain Scale Bar */}
                            <div className="vas-scale-track-wrapper">
                              <div className="vas-scale-labels">
                                <span>Pain Intensity: {asm.painScore} of 10</span>
                                <span className="vas-type-label">{asm.painType} ({asm.painLocation})</span>
                              </div>
                              <div className="vas-scale-track">
                                <div className={`vas-scale-fill ${painColorClass}`} style={{ width: `${painPercent}%` }} />
                              </div>
                            </div>

                            {/* Chief Complaint */}
                            <div className="asm-section-box">
                              <strong className="asm-section-heading">Chief Complaint & History:</strong>
                              <p className="asm-text">{asm.chiefComplaint}</p>
                            </div>

                            {/* 2-Column Clinical Grid */}
                            <div className="asm-details-grid">
                              <div className="asm-grid-column">
                                <h5 className="asm-col-title">Pain & Provocation Factors</h5>
                                <p><strong>Location:</strong> {asm.painLocation}</p>
                                <p><strong>Nature:</strong> {asm.painType}</p>
                                {asm.aggravatingFactors && (
                                  <p><strong>Aggravating:</strong> {asm.aggravatingFactors}</p>
                                )}
                                {asm.relievingFactors && (
                                  <p><strong>Relieving:</strong> {asm.relievingFactors}</p>
                                )}
                              </div>

                              <div className="asm-grid-column">
                                <h5 className="asm-col-title">Physical Exam & Range of Motion</h5>
                                {asm.romFindings && (
                                  <p><strong>ROM Findings:</strong> {asm.romFindings}</p>
                                )}
                                {asm.postureAndGait && (
                                  <p><strong>Posture & Gait:</strong> {asm.postureAndGait}</p>
                                )}
                                {asm.functionalLimitations && (
                                  <p><strong>Functional Limits:</strong> {asm.functionalLimitations}</p>
                                )}
                              </div>
                            </div>

                            {/* Goals and Action Bar */}
                            <div className="asm-goals-footer">
                              <div className="asm-goals-left">
                                {asm.shortTermGoals && (
                                  <div className="asm-goal-item">
                                    <Target size={14} className="text-teal-accent" />
                                    <span><strong>Short-Term:</strong> {asm.shortTermGoals}</span>
                                  </div>
                                )}
                                {asm.longTermGoals && (
                                  <div className="asm-goal-item">
                                    <Target size={14} className="text-primary" />
                                    <span><strong>Long-Term:</strong> {asm.longTermGoals}</span>
                                  </div>
                                )}
                                {asm.recommendedFrequency && (
                                  <span className="asm-freq-badge">
                                    Frequency: {asm.recommendedFrequency}
                                  </span>
                                )}
                              </div>
                              <Button
                                onClick={() => initiatePlanFromAssessment(asm)}
                                variant="secondary"
                                iconLeft={<Sparkles size={14} />}
                                className="asm-action-plan-btn"
                              >
                                Formulate Plan
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-assessments-box">
                        <Stethoscope size={40} className="empty-icon text-muted" />
                        <h4>No Clinical Assessments Recorded</h4>
                        <p>Perform an initial physical therapy assessment to establish baseline pain and ROM metrics.</p>
                        <Button
                          onClick={() => setIsAssessmentModalOpen(true)}
                          variant="primary"
                          iconLeft={<Plus size={16} />}
                        >
                          Start Initial Assessment
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* MEDICAL HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <div className="tab-card-header-btn">
                    <h3 className="tab-title">Chronic Conditions & Surgical History</h3>
                    <Button onClick={() => setIsHistoryModalOpen(true)} variant="primary" iconLeft={<Plus size={16} />}>
                      Add Condition
                    </Button>
                  </div>

                  <div className="history-entries-list">
                    {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                      patient.medicalHistory.map((item) => (
                        <div key={item.id} className="history-entry-row">
                          <div className="entry-row-left">
                            <span className={`entry-severity-dot severity-${item.severity.toLowerCase()}`} title={`${item.severity} Severity`} />
                            <div>
                              <div className="entry-condition-name">{item.condition}</div>
                              <div className="entry-date-diagnosed">Diagnosed: {item.diagnosedDate}</div>
                              {item.notes && <div className="entry-notes">{item.notes}</div>}
                            </div>
                          </div>
                          <div className="entry-row-right">
                            <span className={`status-badge status-badge-${item.status === 'Active' ? 'active' : 'inactive'}`}>
                              {item.status}
                            </span>
                            <button
                              onClick={() => handleDeleteHistory(item.id)}
                              className="history-delete-btn"
                              title="Delete Condition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-history-alert">
                        <AlertCircle size={24} />
                        <p>No chronic medical history or allergies documented.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <h3 className="tab-title">Uploaded Attachments & Prescriptions</h3>
                  
                  {/* File Upload Area Simulation */}
                  <div className="drag-upload-sandbox" onClick={handleFileUploadSim}>
                    <Upload size={32} className={isUploading ? "upload-icon animate-pulse" : "upload-icon"} />
                    {isUploading ? (
                      <p className="upload-sandbox-text">Syncing medical document to database...</p>
                    ) : (
                      <>
                        <p className="upload-sandbox-text">Click here to browse files or simulate an upload</p>
                        <span className="upload-subtext">Supports PDF, PNG, JPG scans up to 10MB</span>
                      </>
                    )}
                  </div>

                  <div className="docs-attachments-list">
                    {patient.documents && patient.documents.length > 0 ? (
                      patient.documents.map((doc) => (
                        <div key={doc.id} className="document-entry-row">
                          <div className="doc-left-info">
                            <div className="doc-file-icon">
                              <FileText size={20} />
                            </div>
                            <div>
                              <div className="doc-filename">{doc.fileName}</div>
                              <span className="doc-meta">
                                {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                              </span>
                            </div>
                          </div>
                          <div className="doc-right-actions">
                            <a
                              href={doc.url}
                              className="doc-action-btn btn-dl"
                              title="Download File"
                              onClick={(e) => {
                                e.preventDefault();
                                showToast(`Downloading: ${doc.fileName}`, 'info');
                              }}
                            >
                              Download
                            </a>
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="doc-action-btn btn-del"
                              title="Remove File"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-docs-message">No medical scans or attachments listed.</p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <div className="tab-card-header-btn">
                    <h3 className="tab-title">Appointments Timeline</h3>
                    <Button onClick={() => setIsApptModalOpen(true)} variant="primary" iconLeft={<Plus size={16} />}>
                      Schedule Visit
                    </Button>
                  </div>

                  <div className="appointments-list-timeline">
                    {patient.appointments && patient.appointments.length > 0 ? (
                      patient.appointments.map((appt) => (
                        <div key={appt.id} className="appt-timeline-node">
                          <div className="timeline-node-time">
                            <Clock size={14} />
                            <span>{appt.date}</span>
                            <span className="timeline-hour">{appt.time}</span>
                          </div>
                          <div className="timeline-node-card">
                            <div className="timeline-node-header">
                              <div>
                                <h4 className="appt-type-title">{appt.type}</h4>
                                <span className="appt-therapist">Therapist: {appt.therapistName}</span>
                              </div>
                              <span className={`status-badge status-badge-${appt.status === 'Completed' ? 'active' : appt.status === 'Scheduled' ? 'scheduled' : 'inactive'}`}>
                                {appt.status}
                              </span>
                            </div>
                            {appt.notes && <p className="appt-notes-text">{appt.notes}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-timeline-message">No appointments recorded for this patient.</p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* TREATMENT PLANS TAB (DAY 5 ENHANCED) */}
            {activeTab === 'plans' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <div className="tab-card-header-btn">
                    <div>
                      <h3 className="tab-title">Physiotherapy Treatment Plans</h3>
                      <p className="tab-sub-title">Multi-session care programs with assigned modalities, session check-ins, and pain relief tracking.</p>
                    </div>
                    <div className="tab-actions-cluster">
                      <Button
                        onClick={() => setIsNewPlanModalOpen(true)}
                        variant="primary"
                        iconLeft={<Plus size={16} />}
                      >
                        Create Treatment Plan
                      </Button>
                      <Button
                        onClick={() => openSessionModalForPlan()}
                        variant="secondary"
                        disabled={!patient.treatmentPlans || !patient.treatmentPlans.some(p => p.status === 'Active')}
                        iconLeft={<CheckCircle2 size={16} />}
                      >
                        Record Check-In
                      </Button>
                    </div>
                  </div>

                  <div className="treatment-plans-grid">
                    {patient.treatmentPlans && patient.treatmentPlans.length > 0 ? (
                      patient.treatmentPlans.map((plan) => {
                        const percent = Math.min(100, Math.round(((plan.sessionsCompleted || 0) / plan.sessionsCount) * 100));
                        const isExpanded = expandedPlanId === plan.id;

                        return (
                          <div
                            key={plan.id}
                            className={`treatment-plan-card ${plan.status === 'Active' ? 'plan-border-active' : ''}`}
                          >
                            <div className="plan-card-header">
                              <div>
                                <h4 className="plan-diagnosis">{plan.diagnosis}</h4>
                                <div className="plan-meta-row">
                                  <span className="plan-dates">
                                    Timeline: {plan.startDate} to {plan.endDate}
                                  </span>
                                  {plan.treatmentFrequency && (
                                    <span className="plan-freq-badge">{plan.treatmentFrequency}</span>
                                  )}
                                  {plan.assignedTherapist && (
                                    <span className="plan-therapist-badge">Therapist: {plan.assignedTherapist}</span>
                                  )}
                                </div>
                              </div>
                              <div className="plan-header-controls">
                                <select
                                  value={plan.status}
                                  onChange={(e) => handleUpdatePlanStatus(plan.id, e.target.value as TreatmentPlan['status'])}
                                  className={`plan-status-select status-badge-${plan.status.toLowerCase()}`}
                                >
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Suspended">Suspended</option>
                                </select>
                              </div>
                            </div>

                            {/* Session Progress Bar */}
                            <div className="plan-progress-wrapper">
                              <div className="progress-labels">
                                <span>Completed Sessions</span>
                                <strong>{plan.sessionsCompleted || 0} / {plan.sessionsCount} ({percent}%)</strong>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                              </div>
                            </div>

                            <div className="plan-details-info">
                              <strong>Primary Goals:</strong>
                              <p className="plan-goals">{plan.goals}</p>
                            </div>

                            <div className="plan-therapies-tags">
                              <strong>Assigned Therapeutics:</strong>
                              <div className="tags-flex">
                                {plan.treatments.map((t, idx) => (
                                  <span key={idx} className="therapy-tag">{t}</span>
                                ))}
                              </div>
                            </div>

                            {/* Session Check-In History Drawer */}
                            <div className="plan-history-drawer">
                              <div className="drawer-header-row">
                                <button
                                  type="button"
                                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                                  className="plan-accordion-btn"
                                >
                                  <span>Session Check-In History ({plan.sessions?.length || 0})</span>
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {plan.status === 'Active' && (
                                  <button
                                    type="button"
                                    onClick={() => openSessionModalForPlan(plan.id)}
                                    className="quick-add-session-btn"
                                  >
                                    <Plus size={13} /> Add Session
                                  </button>
                                )}
                              </div>

                              {isExpanded && (
                                <div className="session-logs-list animate-slide-in">
                                  {plan.sessions && plan.sessions.length > 0 ? (
                                    plan.sessions.map((session) => {
                                      const painDelta =
                                        session.preSessionPain !== undefined && session.postSessionPain !== undefined
                                          ? session.preSessionPain - session.postSessionPain
                                          : null;

                                      return (
                                        <div key={session.id} className="session-log-card">
                                          <div className="session-log-top">
                                            <div className="session-date-col">
                                              <span className="log-date">{session.date}</span>
                                              <span className="log-therapist">by {session.performedBy}</span>
                                            </div>
                                            <div className="session-metrics-badges">
                                              {session.preSessionPain !== undefined && session.postSessionPain !== undefined && (
                                                <span className="pain-delta-tag">
                                                  VAS: {session.preSessionPain} ➔ {session.postSessionPain}
                                                  {painDelta !== null && painDelta > 0 && (
                                                    <span className="relief-indicator"> (-{painDelta} pts relief)</span>
                                                  )}
                                                </span>
                                              )}
                                              {session.patientTolerance && (
                                                <span className="tolerance-tag">{session.patientTolerance}</span>
                                              )}
                                            </div>
                                          </div>

                                          {session.modalitiesConducted && session.modalitiesConducted.length > 0 && (
                                            <div className="session-modalities-applied">
                                              {session.modalitiesConducted.map((mod, mIdx) => (
                                                <span key={mIdx} className="modality-chip">{mod}</span>
                                              ))}
                                            </div>
                                          )}

                                          <p className="log-notes">"{session.notes}"</p>

                                          {session.nextSessionPlan && (
                                            <div className="next-session-box">
                                              <strong>Next Step:</strong> {session.nextSessionPlan}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="empty-sessions-notice">
                                      No session check-ins recorded yet. Click "Record Check-In" to log the first visit.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-plans-wrapper">
                        <Layers size={40} className="empty-icon text-muted" />
                        <h4>No Treatment Plans Configured</h4>
                        <p>Create a structured multi-session plan linking physical therapies and patient goals.</p>
                        <Button
                          onClick={() => setIsNewPlanModalOpen(true)}
                          variant="primary"
                          iconLeft={<Plus size={16} />}
                        >
                          Create First Treatment Plan
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* EXERCISE PRESCRIPTIONS TAB (DAY 6) */}
            {activeTab === 'prescriptions' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <div className="tab-card-header-btn">
                    <div>
                      <h3 className="tab-title">Clinical Exercise Prescriptions & Home Routines</h3>
                      <p className="tab-sub-title">
                        Individualized rehabilitation regimens formulated from the Clinical Exercise Library with customized sets, repetitions, hold times, and patient adherence tracking.
                      </p>
                    </div>
                    <Button
                      onClick={handleOpenPrescriptionModal}
                      variant="primary"
                      iconLeft={<Plus size={16} />}
                    >
                      Prescribe Regimen
                    </Button>
                  </div>

                  {/* Summary Metric Banner */}
                  {patient.prescriptions && patient.prescriptions.length > 0 && (
                    <div className="prescription-metrics-banner">
                      <div className="metric-pill">
                        <span className="metric-label">Active Regimens</span>
                        <span className="metric-value-text text-teal-accent font-semibold">
                          {patient.prescriptions.filter(p => p.status === 'Active').length} Active
                        </span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Total Prescribed Movements</span>
                        <span className="metric-value-text">
                          {patient.prescriptions.reduce((acc, p) => acc + p.items.length, 0)} Exercises
                        </span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Primary Care Provider</span>
                        <span className="metric-value-text">
                          {patient.prescriptions[0].prescribedBy}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Prescriptions List */}
                  <div className="prescriptions-list-wrapper">
                    {patient.prescriptions && patient.prescriptions.length > 0 ? (
                      patient.prescriptions.map((rx) => {
                        return (
                          <div
                            key={rx.id}
                            className={`prescription-card ${rx.status === 'Active' ? 'rx-border-active' : ''}`}
                          >
                            <div className="rx-card-header">
                              <div className="rx-header-left">
                                <h4 className="rx-diagnosis-title">{rx.diagnosis}</h4>
                                <div className="rx-meta-row">
                                  <span className="rx-meta-item">
                                    <Calendar size={13} className="text-muted" />
                                    Prescribed: {rx.prescribedDate}
                                  </span>
                                  <span className="rx-meta-item">
                                    <Stethoscope size={13} className="text-muted" />
                                    By: {rx.prescribedBy}
                                  </span>
                                  <span className="rx-meta-badge">
                                    {rx.items.length} {rx.items.length === 1 ? 'Exercise' : 'Exercises'}
                                  </span>
                                </div>
                              </div>
                              <div className="rx-header-actions">
                                <select
                                  value={rx.status}
                                  onChange={(e) => handleUpdateRxStatus(rx.id, e.target.value as ExercisePrescription['status'])}
                                  className={`rx-status-select status-badge-${rx.status.toLowerCase()}`}
                                >
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Suspended">Suspended</option>
                                </select>
                                <Button
                                  onClick={() => handleOpenTakeHomeSheet(rx)}
                                  variant="secondary"
                                  iconLeft={<Printer size={14} />}
                                  className="rx-print-btn"
                                >
                                  Take-Home Sheet
                                </Button>
                                <button
                                  onClick={() => handleDeleteRx(rx.id)}
                                  className="rx-delete-btn"
                                  title="Delete Prescription"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Goal & Instructions Banner */}
                            {rx.targetGoal && (
                              <div className="rx-goal-box">
                                <div className="rx-goal-header">
                                  <Target size={14} className="text-teal-accent" />
                                  <strong>Rehabilitation Target:</strong>
                                </div>
                                <p className="rx-goal-text">{rx.targetGoal}</p>
                              </div>
                            )}

                            {rx.generalInstructions && (
                              <div className="rx-instructions-box">
                                <span className="rx-instructions-label">Therapist Directions:</span>
                                <p className="rx-instructions-text">{rx.generalInstructions}</p>
                              </div>
                            )}

                            {/* Prescribed Exercises Grid */}
                            <div className="rx-exercises-section">
                              <h5 className="rx-exercises-heading">Prescribed Exercise Routine</h5>
                              <div className="rx-items-grid">
                                {rx.items.map((item, idx) => (
                                  <div key={item.id || idx} className="rx-item-card">
                                    <div className="rx-item-top">
                                      <span className="rx-item-index">{idx + 1}</span>
                                      <div className="rx-item-title-col">
                                        <h6 className="rx-item-name">{item.exerciseTitle}</h6>
                                        <div className="rx-item-meta-tags">
                                          <span className="rx-category-tag">{item.category}</span>
                                          <span className="rx-muscle-tag">{item.targetMuscleGroup}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Dosage Parameter Pills */}
                                    <div className="rx-dosage-pills-row">
                                      <div className="rx-dosage-pill">
                                        <span className="pill-key">Sets</span>
                                        <span className="pill-val">{item.sets}</span>
                                      </div>
                                      <div className="rx-dosage-pill">
                                        <span className="pill-key">Reps</span>
                                        <span className="pill-val">{item.reps}</span>
                                      </div>
                                      {item.holdSec ? (
                                        <div className="rx-dosage-pill">
                                          <span className="pill-key">Hold</span>
                                          <span className="pill-val">{item.holdSec}s</span>
                                        </div>
                                      ) : null}
                                      <div className="rx-dosage-pill highlight-pill">
                                        <span className="pill-key">Frequency</span>
                                        <span className="pill-val">{item.frequency}</span>
                                      </div>
                                      <div className="rx-dosage-pill">
                                        <span className="pill-key">Duration</span>
                                        <span className="pill-val">{item.durationWeeks} wks</span>
                                      </div>
                                    </div>

                                    {item.notes && (
                                      <div className="rx-item-notes">
                                        <span className="notes-icon">⚠️</span>
                                        <span>{item.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-prescriptions-wrapper">
                        <Dumbbell size={42} className="empty-icon text-muted" />
                        <h4>No Exercise Prescriptions Formulated</h4>
                        <p>Bridge clinical evaluations with personalized home rehabilitation routines from the library.</p>
                        <Button
                          onClick={handleOpenPrescriptionModal}
                          variant="primary"
                          iconLeft={<Plus size={16} />}
                        >
                          Prescribe First Regimen
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
              <div className="tab-fade-in">
                <Card className="tab-card">
                  <h3 className="tab-title">Linked Invoices & Billing History</h3>

                  {patient.invoices && patient.invoices.length > 0 ? (
                    <div className="billing-table-wrapper">
                      <table className="table-element billing-table">
                        <thead className="table-thead">
                          <tr>
                            <th className="table-th">Invoice No.</th>
                            <th className="table-th">Date</th>
                            <th className="table-th">Due Date</th>
                            <th className="table-th">Amount</th>
                            <th className="table-th">Paid</th>
                            <th className="table-th">Status</th>
                            <th className="table-th text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="table-tbody">
                          {patient.invoices.map((inv) => (
                            <tr key={inv.id} className="table-tr">
                              <td className="table-td font-medium text-white">{inv.invoiceNumber}</td>
                              <td className="table-td">{inv.date}</td>
                              <td className="table-td">{inv.dueDate}</td>
                              <td className="table-td">${inv.amount.toFixed(2)}</td>
                              <td className="table-td">${inv.paidAmount.toFixed(2)}</td>
                              <td className="table-td">
                                <span className={`status-badge status-badge-${inv.status.toLowerCase().replace(' ', '-')}`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="table-td text-center">
                                <Button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setIsInvoiceDetailsOpen(true);
                                  }}
                                  variant="secondary"
                                  className="billing-preview-btn"
                                  iconLeft={<Printer size={12} />}
                                >
                                  Invoice
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="empty-billing-message">No billing transactions logged.</p>
                  )}
                </Card>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* RECORD VITALS MODAL */}
      <Modal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        title="Record Active Patient Vitals"
        size="md"
      >
        <form onSubmit={handleVitalsSubmit} className="vitals-form">
          <div className="vitals-form-grid">
            <Input
              label="Blood Pressure (mmHg)"
              value={vitalsForm.bloodPressure}
              onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
              placeholder="e.g. 120/80"
            />
            <Input
              label="Pulse Rate (bpm)"
              type="number"
              value={vitalsForm.heartRate}
              onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
              placeholder="e.g. 72"
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={vitalsForm.weightKg}
              onChange={(e) => setVitalsForm({ ...vitalsForm, weightKg: e.target.value })}
              placeholder="e.g. 68.5"
            />
            <Input
              label="Height (cm)"
              type="number"
              step="0.5"
              value={vitalsForm.heightCm}
              onChange={(e) => setVitalsForm({ ...vitalsForm, heightCm: e.target.value })}
              placeholder="e.g. 172.5"
            />
          </div>
          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsVitalsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Vitals
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD HISTORY CONDITION MODAL */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Log Chronic Condition"
        size="md"
      >
        <form onSubmit={handleHistorySubmit} className="patient-form">
          <Input
            label="Condition Name *"
            value={historyForm.condition}
            onChange={(e) => setHistoryForm({ ...historyForm, condition: e.target.value })}
            placeholder="e.g. Cervical Spondylosis"
          />
          <div className="form-grid-2">
            <Input
              label="Diagnosis Date *"
              type="date"
              value={historyForm.diagnosedDate}
              onChange={(e) => setHistoryForm({ ...historyForm, diagnosedDate: e.target.value })}
            />
            <div className="input-group">
              <label className="input-label">Severity Level</label>
              <select
                value={historyForm.severity}
                onChange={(e) => setHistoryForm({ ...historyForm, severity: e.target.value as any })}
                className="input-field"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Clinical Status</label>
              <select
                value={historyForm.status}
                onChange={(e) => setHistoryForm({ ...historyForm, status: e.target.value as any })}
                className="input-field"
              >
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
                <option value="Chronic">Chronic</option>
              </select>
            </div>
          </div>
          <Input
            label="Additional Notes / Treatment References"
            as="textarea"
            rows={3}
            value={historyForm.notes}
            onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })}
            placeholder="Add relevant notes here..."
          />
          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Condition
            </Button>
          </div>
        </form>
      </Modal>

      {/* SCHEDULE APPOINTMENT MODAL */}
      <Modal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        title="Schedule Appointment Visit"
        size="md"
      >
        <form onSubmit={handleApptSubmit} className="patient-form">
          <div className="form-grid-2">
            <Input
              label="Visit Date *"
              type="date"
              value={apptForm.date}
              onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
            />
            <Input
              label="Visit Time *"
              value={apptForm.time}
              onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
              placeholder="e.g. 10:30 AM"
            />
          </div>
          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Select Practitioner</label>
              <select
                value={apptForm.therapistName}
                onChange={(e) => setApptForm({ ...apptForm, therapistName: e.target.value })}
                className="input-field"
              >
                <option value="Dr. Glory Physiotherapist">Dr. Glory Physiotherapist</option>
                <option value="Dr. Glory Doctor">Dr. Glory Doctor</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Appointment Category</label>
              <select
                value={apptForm.type}
                onChange={(e) => setApptForm({ ...apptForm, type: e.target.value })}
                className="input-field"
              >
                <option value="Physiotherapy Session">Physiotherapy Session</option>
                <option value="Initial Assessment">Initial Assessment</option>
                <option value="Medical Consultation">Medical Consultation</option>
                <option value="Post-Op Assessment">Post-Op Assessment</option>
              </select>
            </div>
          </div>
          <Input
            label="Additional Notes / Symptoms"
            as="textarea"
            rows={3}
            value={apptForm.notes}
            onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
            placeholder="Add relevant symptoms or therapist guidelines..."
          />
          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsApptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Visit
            </Button>
          </div>
        </form>
      </Modal>

      {/* NEW CLINICAL ASSESSMENT MODAL (DAY 5) */}
      <Modal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        title="Conduct Clinical Evaluation & Functional Assessment"
        size="lg"
      >
        <form onSubmit={handleAssessmentSubmit} className="patient-form">
          <div className="form-section-divider">
            <h4>1. Chief Complaint & Pain Evaluation (VAS 0–10)</h4>
          </div>

          {/* Interactive VAS Pain Slider */}
          <div className="vas-interactive-slider-box">
            <div className="vas-slider-header">
              <span className="vas-label font-semibold">Visual Analog Pain Scale (VAS):</span>
              <div className="vas-display-pill">
                <span className={`pain-val-badge ${
                  assessmentForm.painScore <= 3 ? 'pain-badge-mild' :
                  assessmentForm.painScore <= 6 ? 'pain-badge-moderate' : 'pain-badge-severe'
                }`}>
                  {assessmentForm.painScore} / 10
                </span>
                <span className="vas-severity-text">
                  {assessmentForm.painScore === 0 ? 'No Pain' :
                   assessmentForm.painScore <= 3 ? 'Mild Discomfort' :
                   assessmentForm.painScore <= 6 ? 'Moderate Pain' :
                   assessmentForm.painScore <= 8 ? 'Severe Pain' : 'Extreme / Debilitating'}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={assessmentForm.painScore}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, painScore: Number(e.target.value) })}
              className="vas-slider-input"
            />
            <div className="vas-slider-ticks">
              <span>0 (None)</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10 (Worst)</span>
            </div>
          </div>

          <Input
            label="Chief Complaint & Patient Narrative *"
            as="textarea"
            rows={2}
            value={assessmentForm.chiefComplaint}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, chiefComplaint: e.target.value })}
            placeholder="Describe the primary symptom, onset, duration, and patient description..."
            required
          />

          <div className="form-grid-2">
            <Input
              label="Primary Pain Location *"
              value={assessmentForm.painLocation}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, painLocation: e.target.value })}
              placeholder="e.g. Lumbar Spine L4-L5, Right Shoulder"
              required
            />
            <div className="input-group">
              <label className="input-label">Pain Nature / Quality</label>
              <select
                value={assessmentForm.painType}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, painType: e.target.value as any })}
                className="input-field"
              >
                <option value="Sharp">Sharp & Stabbing</option>
                <option value="Dull Aching">Dull Aching</option>
                <option value="Burning">Burning / Neuropathic</option>
                <option value="Throbbing">Throbbing / Pulsing</option>
                <option value="Radiating">Radiating / Tingling</option>
                <option value="Stiffness">Stiffness & Tightness</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <Input
              label="Aggravating Factors"
              value={assessmentForm.aggravatingFactors}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, aggravatingFactors: e.target.value })}
              placeholder="e.g. Prolonged sitting, lifting, coughing"
            />
            <Input
              label="Relieving Factors"
              value={assessmentForm.relievingFactors}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, relievingFactors: e.target.value })}
              placeholder="e.g. Prone lying, ice packs, walking"
            />
          </div>

          <div className="form-section-divider">
            <h4>2. Physical & Functional Examination</h4>
          </div>

          <Input
            label="Range of Motion (ROM) & Flexibility Findings"
            as="textarea"
            rows={2}
            value={assessmentForm.romFindings}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, romFindings: e.target.value })}
            placeholder="e.g. Lumbar flexion limited to 45° with pain. Right SLR positive at 40°."
          />

          <div className="form-grid-2">
            <Input
              label="Posture & Gait Observation"
              value={assessmentForm.postureAndGait}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, postureAndGait: e.target.value })}
              placeholder="e.g. Antalgic gait, reduced lumbar lordosis"
            />
            <Input
              label="Functional Limitations"
              value={assessmentForm.functionalLimitations}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, functionalLimitations: e.target.value })}
              placeholder="e.g. Inability to drive >30m, difficulty stairs"
            />
          </div>

          <div className="form-section-divider">
            <h4>3. Diagnosis & Rehabilitation Goals</h4>
          </div>

          <div className="form-grid-2">
            <Input
              label="Clinical Diagnosis *"
              value={assessmentForm.clinicalDiagnosis}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, clinicalDiagnosis: e.target.value })}
              placeholder="e.g. Lumbar Disc Herniation with Radiculopathy"
              required
            />
            <div className="input-group">
              <label className="input-label">Prognosis</label>
              <select
                value={assessmentForm.prognosis}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, prognosis: e.target.value as any })}
                className="input-field"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Guarded">Guarded</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <Input
              label="Short-Term Goal (2-4 weeks)"
              value={assessmentForm.shortTermGoals}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, shortTermGoals: e.target.value })}
              placeholder="e.g. Reduce VAS pain from 7 to 4, centralize pain"
            />
            <Input
              label="Recommended Care Frequency"
              value={assessmentForm.recommendedFrequency}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, recommendedFrequency: e.target.value })}
              placeholder="e.g. 3 sessions / week for 4 weeks"
            />
          </div>

          <Input
            label="Long-Term Rehabilitation Goal"
            value={assessmentForm.longTermGoals}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, longTermGoals: e.target.value })}
            placeholder="e.g. Full pain-free spinal ROM, return to running and desk work"
          />

          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsAssessmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" iconLeft={<Stethoscope size={16} />}>
              Save Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE TREATMENT PLAN MODAL (DAY 5) */}
      <Modal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        title="Formulate Physiotherapy Treatment Plan"
        size="lg"
      >
        <form onSubmit={handleCreatePlanSubmit} className="patient-form">
          <Input
            label="Plan Diagnosis / Clinical Focus *"
            value={planForm.diagnosis}
            onChange={(e) => setPlanForm({ ...planForm, diagnosis: e.target.value })}
            placeholder="e.g. L4-L5 Lumbar Decompression & Stabilization Rehab"
            required
          />

          <div className="form-grid-2">
            <Input
              label="Start Date *"
              type="date"
              value={planForm.startDate}
              onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
              required
            />
            <Input
              label="Projected Completion Date *"
              type="date"
              value={planForm.endDate}
              onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Total Planned Sessions *"
              type="number"
              min="1"
              max="60"
              value={planForm.sessionsCount.toString()}
              onChange={(e) => setPlanForm({ ...planForm, sessionsCount: Number(e.target.value) })}
              required
            />
            <Input
              label="Weekly Frequency"
              value={planForm.treatmentFrequency}
              onChange={(e) => setPlanForm({ ...planForm, treatmentFrequency: e.target.value })}
              placeholder="e.g. 3x / week"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Assigned Lead Physiotherapist</label>
            <select
              value={planForm.assignedTherapist}
              onChange={(e) => setPlanForm({ ...planForm, assignedTherapist: e.target.value })}
              className="input-field"
            >
              <option value="Dr. Glory Physiotherapist">Dr. Glory Physiotherapist</option>
              <option value="Dr. Glory Doctor">Dr. Glory Doctor</option>
            </select>
          </div>

          {/* Therapeutic Modalities Multi-Select Chips */}
          <div className="modalities-picker-section">
            <label className="input-label font-semibold">
              Assigned Modalities from Treatment Library * ({planForm.selectedTreatments.length} selected)
            </label>
            <p className="picker-helper-text">Select one or more modalities to combine into this care regimen:</p>
            <div className="modalities-chips-grid">
              {availableTreatments.map((treatment) => {
                const isSelected = planForm.selectedTreatments.includes(treatment.name);
                return (
                  <button
                    key={treatment.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setPlanForm({
                          ...planForm,
                          selectedTreatments: planForm.selectedTreatments.filter(t => t !== treatment.name),
                        });
                      } else {
                        setPlanForm({
                          ...planForm,
                          selectedTreatments: [...planForm.selectedTreatments, treatment.name],
                        });
                      }
                    }}
                    className={`modality-select-chip ${isSelected ? 'modality-chip-selected' : ''}`}
                  >
                    <span className="chip-name">{treatment.name}</span>
                    <span className="chip-category">({treatment.category})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Primary Rehabilitation Goals"
            as="textarea"
            rows={2}
            value={planForm.goals}
            onChange={(e) => setPlanForm({ ...planForm, goals: e.target.value })}
            placeholder="e.g. Reduce pain from 7/10 to 2/10. Restore active lumbar extension. Return to swimming."
          />

          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsNewPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" iconLeft={<Plus size={16} />}>
              Create Care Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* RECORD SESSION CHECK-IN MODAL (DAY 5 ENHANCED) */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Physiotherapy Session Progress & Pain Check-In"
        size="lg"
      >
        <form onSubmit={handleSessionSubmit} className="patient-form">
          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Target Treatment Plan *</label>
              <select
                value={sessionForm.planId}
                onChange={(e) => {
                  const pId = e.target.value;
                  const pl = patient?.treatmentPlans?.find(p => p.id === pId);
                  setSessionForm({
                    ...sessionForm,
                    planId: pId,
                    modalitiesConducted: pl?.treatments || [],
                  });
                }}
                className="input-field"
                required
              >
                {patient?.treatmentPlans?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.diagnosis} ({p.status} - {p.sessionsCompleted || 0}/{p.sessionsCount} sessions)
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Session Date *"
              type="date"
              value={sessionForm.date}
              onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Performed By</label>
              <select
                value={sessionForm.performedBy}
                onChange={(e) => setSessionForm({ ...sessionForm, performedBy: e.target.value })}
                className="input-field"
              >
                <option value="Dr. Glory Physiotherapist">Dr. Glory Physiotherapist</option>
                <option value="Dr. Glory Doctor">Dr. Glory Doctor</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Patient Session Tolerance</label>
              <select
                value={sessionForm.patientTolerance}
                onChange={(e) => setSessionForm({ ...sessionForm, patientTolerance: e.target.value as any })}
                className="input-field"
              >
                <option value="Tolerated Well">Tolerated Well (Good Compliance)</option>
                <option value="Mild Discomfort">Mild Discomfort (Normal Soreness)</option>
                <option value="Fatigued">Fatigued (Reduced Intensity Needed)</option>
                <option value="Adverse Reaction">Adverse Reaction / Sharp Pain</option>
              </select>
            </div>
          </div>

          {/* Pre and Post Session Pain Trackers */}
          <div className="session-pain-tracker-grid">
            <div className="session-pain-box">
              <label className="input-label font-semibold">Pre-Session Pain Index (VAS)</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sessionForm.preSessionPain}
                  onChange={(e) => setSessionForm({ ...sessionForm, preSessionPain: Number(e.target.value) })}
                  className="vas-slider-input"
                />
                <span className="pain-preview-badge">{sessionForm.preSessionPain} / 10</span>
              </div>
            </div>

            <div className="session-pain-box">
              <label className="input-label font-semibold">Post-Session Pain Index (VAS)</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sessionForm.postSessionPain}
                  onChange={(e) => setSessionForm({ ...sessionForm, postSessionPain: Number(e.target.value) })}
                  className="vas-slider-input"
                />
                <span className="pain-preview-badge text-teal-accent">{sessionForm.postSessionPain} / 10</span>
              </div>
            </div>
          </div>

          {/* Modalities Conducted Checklist */}
          {(() => {
            const selectedPlan = patient?.treatmentPlans?.find(p => p.id === sessionForm.planId) || patient?.treatmentPlans?.[0];
            if (!selectedPlan || !selectedPlan.treatments) return null;

            return (
              <div className="session-modalities-check-box">
                <label className="input-label font-semibold">Modalities Conducted in This Session:</label>
                <div className="modalities-checkbox-flex">
                  {selectedPlan.treatments.map((mod, idx) => {
                    const isChecked = sessionForm.modalitiesConducted.includes(mod);
                    return (
                      <label key={idx} className="modality-check-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSessionForm({
                                ...sessionForm,
                                modalitiesConducted: [...sessionForm.modalitiesConducted, mod],
                              });
                            } else {
                              setSessionForm({
                                ...sessionForm,
                                modalitiesConducted: sessionForm.modalitiesConducted.filter(m => m !== mod),
                              });
                            }
                          }}
                        />
                        <span>{mod}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <Input
            label="Therapeutic Accomplishments & Progress Notes"
            as="textarea"
            rows={3}
            value={sessionForm.notes}
            onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
            placeholder="e.g. Joint mobilization grade II performed. Lumbar traction 15min. Patient noted immediate pain relief."
          />

          <Input
            label="Next Session Recommendation / Prescription Update"
            value={sessionForm.nextSessionPlan}
            onChange={(e) => setSessionForm({ ...sessionForm, nextSessionPlan: e.target.value })}
            placeholder="e.g. Progress core activation to bird-dog exercises. Maintain traction intensity."
          />

          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" iconLeft={<CheckCircle2 size={16} />}>
              Save Session & Update Progress
            </Button>
          </div>
        </form>
      </Modal>

      {/* PRINTABLE INVOICE MODAL */}
      <Modal
        isOpen={isInvoiceDetailsOpen}
        onClose={() => setIsInvoiceDetailsOpen(false)}
        title="Printable Statement Invoice Preview"
        size="lg"
      >
        {selectedInvoice && (
          <div className="invoice-printable-container">
            <div className="invoice-print-header">
              <div className="company-info">
                <h3>GLORY FLORENCE PHYSIOTHERAPY</h3>
                <p>Suite 101, Medical Console Rd</p>
                <p>Sydney, NSW, Australia</p>
                <p>Phone: +61 2 9876 5432 | support@gloryflorence.com</p>
              </div>
              <div className="invoice-meta-header">
                <h2>INVOICE</h2>
                <p><strong>Number:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {selectedInvoice.date}</p>
                <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>
              </div>
            </div>

            <hr className="print-divider" />

            <div className="invoice-recipient-block">
              <div>
                <strong>Billed To:</strong>
                <p>{patient.name}</p>
                <p>{patient.phone}</p>
                <p>{patient.address}, {patient.city}</p>
                <p>{patient.email}</p>
              </div>
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Physiotherapy Rehabilitation Treatment Session & Assessment Fee</td>
                  <td className="text-right">1</td>
                  <td className="text-right">${selectedInvoice.amount.toFixed(2)}</td>
                  <td className="text-right">${selectedInvoice.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-totals-wrapper">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>${selectedInvoice.amount.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Tax (GST 10%):</span>
                <span>$0.00</span>
              </div>
              <div className="totals-row total-highlight">
                <span>Total Amount:</span>
                <span>${selectedInvoice.amount.toFixed(2)}</span>
              </div>
              <div className="totals-row text-success font-medium">
                <span>Paid Amount:</span>
                <span>${selectedInvoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="totals-row text-danger font-medium border-t">
                <span>Balance Due:</span>
                <span>${selectedInvoice.balanceAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="invoice-terms-footer">
              <p><strong>Terms:</strong> Payment due within 14 days of issue. Balance amount can be settled via card or clinic cash deposit.</p>
              <p className="thank-you">Thank you for choosing Glory Florence Physiotherapy!</p>
            </div>

            <div className="invoice-print-footer-actions">
              <Button onClick={() => window.print()} variant="primary" iconLeft={<Printer size={16} />}>
                Print Invoice
              </Button>
              <Button onClick={() => setIsInvoiceDetailsOpen(false)} variant="secondary">
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DAY 6: FORMULATE EXERCISE PRESCRIPTION MODAL */}
      <Modal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        title="Formulate Clinical Exercise Prescription"
        size="xl"
      >
        <form onSubmit={handlePrescriptionSubmit} className="rx-builder-modal-content">
          {/* Top Prescription Meta Fields */}
          <div className="rx-meta-fields-grid">
            <Input
              label="Target Clinical Diagnosis *"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
              placeholder="e.g. Lumbar Disc Herniation / Rotator Cuff Tendinopathy"
              required
            />
            <Input
              label="Prescribed Date"
              type="date"
              value={prescriptionForm.prescribedDate}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescribedDate: e.target.value })}
              required
            />
            <Input
              label="Supervising Clinician"
              value={prescriptionForm.prescribedBy}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescribedBy: e.target.value })}
              placeholder="Dr. Glory Physiotherapist"
            />
          </div>

          <div className="rx-goals-fields-grid">
            <Input
              label="Rehabilitation Target & Functional Goal"
              value={prescriptionForm.targetGoal}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, targetGoal: e.target.value })}
              placeholder="e.g. Abolish radicular pain and restore pain-free lumbar extension."
            />
            <div className="input-group">
              <label className="input-label">General Patient Instructions</label>
              <textarea
                value={prescriptionForm.generalInstructions}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, generalInstructions: e.target.value })}
                className="input-field rx-textarea"
                rows={2}
                placeholder="Guidelines for warm-up, breathing, and stopping criteria..."
              />
            </div>
          </div>

          {/* Exercise Library Picker Section */}
          <div className="rx-picker-section">
            <div className="rx-picker-header">
              <div>
                <h4 className="rx-picker-title">Select Exercises from Clinical Library</h4>
                <p className="rx-picker-subtitle">
                  Browse and select movements to prescribe. Selected: <strong>{prescriptionForm.items.length}</strong>
                </p>
              </div>
              <div className="rx-picker-filters">
                <div className="search-box-wrap">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search exercises by title or muscle group..."
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                    className="rx-search-input"
                  />
                </div>
                <select
                  value={exerciseCategoryFilter}
                  onChange={(e) => setExerciseCategoryFilter(e.target.value)}
                  className="rx-cat-select"
                >
                  <option value="All">All Categories</option>
                  <option value="Strengthening">Strengthening</option>
                  <option value="Mobility & Stretching">Mobility & Stretching</option>
                  <option value="Core Stability">Core Stability</option>
                  <option value="Balance & Coordination">Balance & Coordination</option>
                  <option value="Postural Correction">Postural Correction</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                </select>
              </div>
            </div>

            {/* Exercise Selection Grid */}
            <div className="rx-available-exercises-grid">
              {availableExercises
                .filter((ex) => {
                  const matchesCat = exerciseCategoryFilter === 'All' || ex.category === exerciseCategoryFilter;
                  const q = exerciseSearchQuery.toLowerCase();
                  const matchesQuery = !q || ex.title.toLowerCase().includes(q) || ex.targetMuscleGroup.toLowerCase().includes(q);
                  return matchesCat && matchesQuery;
                })
                .map((ex) => {
                  const isSelected = prescriptionForm.items.some(i => i.exerciseId === ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => handleToggleExerciseInRx(ex)}
                      className={`rx-catalog-card ${isSelected ? 'catalog-card-selected' : ''}`}
                    >
                      <div className="catalog-card-info">
                        <div className="catalog-title-row">
                          <span className="catalog-title">{ex.title}</span>
                          {isSelected && <Check size={16} className="text-teal-accent" />}
                        </div>
                        <div className="catalog-meta">
                          <span className="catalog-cat">{ex.category}</span> • <span className="catalog-muscle">{ex.targetMuscleGroup}</span>
                        </div>
                        <div className="catalog-defaults">
                          Default: {ex.defaultSets} sets × {ex.defaultReps} reps {ex.defaultHoldSec ? `(${ex.defaultHoldSec}s hold)` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`catalog-add-btn ${isSelected ? 'btn-selected' : ''}`}
                      >
                        {isSelected ? 'Selected' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Configured Dosage for Selected Exercises */}
          {prescriptionForm.items.length > 0 && (
            <div className="rx-configured-dosage-section">
              <h4 className="rx-configured-title">
                Configure Dosage & Parameters for Selected Movements ({prescriptionForm.items.length})
              </h4>
              <div className="rx-configured-items-list">
                {prescriptionForm.items.map((item, idx) => (
                  <div key={item.id} className="rx-config-row-card">
                    <div className="config-header-row">
                      <div className="config-title-left">
                        <span className="config-item-idx">#{idx + 1}</span>
                        <strong>{item.exerciseTitle}</strong>
                        <span className="config-badge">{item.category}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRxItem(item.id)}
                        className="config-remove-btn"
                        title="Remove from prescription"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="config-inputs-row">
                      <div className="config-input-group">
                        <label>Sets</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.sets}
                          onChange={(e) => handleUpdateRxItem(item.id, 'sets', parseInt(e.target.value) || 1)}
                          className="config-input-num"
                        />
                      </div>
                      <div className="config-input-group">
                        <label>Reps</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={item.reps}
                          onChange={(e) => handleUpdateRxItem(item.id, 'reps', parseInt(e.target.value) || 1)}
                          className="config-input-num"
                        />
                      </div>
                      <div className="config-input-group">
                        <label>Hold (sec)</label>
                        <input
                          type="number"
                          min="0"
                          max="180"
                          value={item.holdSec || 0}
                          onChange={(e) => handleUpdateRxItem(item.id, 'holdSec', parseInt(e.target.value) || 0)}
                          className="config-input-num"
                        />
                      </div>
                      <div className="config-input-group flex-2">
                        <label>Frequency</label>
                        <select
                          value={item.frequency}
                          onChange={(e) => handleUpdateRxItem(item.id, 'frequency', e.target.value)}
                          className="config-select"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="2x daily (Morning & Evening)">2x daily (Morning & Evening)</option>
                          <option value="3x daily">3x daily</option>
                          <option value="3x / week (Alternate days)">3x / week (Alternate days)</option>
                          <option value="5x / week">5x / week</option>
                          <option value="As needed / For symptom flare-ups">As needed / For symptom flare-ups</option>
                        </select>
                      </div>
                      <div className="config-input-group">
                        <label>Duration (Weeks)</label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={item.durationWeeks}
                          onChange={(e) => handleUpdateRxItem(item.id, 'durationWeeks', parseInt(e.target.value) || 1)}
                          className="config-input-num"
                        />
                      </div>
                    </div>

                    <div className="config-precautions-row">
                      <label>Precautions / Patient Notes:</label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateRxItem(item.id, 'notes', e.target.value)}
                        placeholder="e.g. Keep abdominal core engaged; cease if pain radiates past knee"
                        className="config-precautions-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions-container">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPrescriptionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={prescriptionForm.items.length === 0}
              iconLeft={<Plus size={16} />}
            >
              Save & Prescribe Regimen ({prescriptionForm.items.length} Movements)
            </Button>
          </div>
        </form>
      </Modal>

      {/* DAY 6: PRINTABLE TAKE-HOME EXERCISE ROUTINE MODAL */}
      <Modal
        isOpen={isTakeHomeSheetOpen}
        onClose={() => setIsTakeHomeSheetOpen(false)}
        title="Patient Take-Home Exercise Routine Handout"
        size="xl"
      >
        {selectedPrescriptionForSheet && (
          <div className="prescription-printable-container">
            {/* Clinic Letterhead */}
            <div className="rx-print-clinic-header">
              <div className="rx-print-brand-left">
                <div className="rx-print-logo-circle">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="rx-print-clinic-name">GLORY FLORENCE PHYSIOTHERAPY & REHABILITATION</h2>
                  <p className="rx-print-clinic-sub">Clinical Physical Therapy • Spine Decompression • Sports Medicine</p>
                  <p className="rx-print-clinic-addr">42 Healthcare Boulevard, Medical Enclave • Tel: +1 (555) 019-2800 • Web: www.gloryflorence.com</p>
                </div>
              </div>
              <div className="rx-print-doc-badge">
                <span className="rx-print-badge-title">OFFICIAL PATIENT EXERCISE PRESCRIPTION</span>
                <span className="rx-print-badge-num">Rx ID: {selectedPrescriptionForSheet.id}</span>
                <span className="rx-print-badge-date">Prescribed: {selectedPrescriptionForSheet.prescribedDate}</span>
              </div>
            </div>

            <hr className="rx-print-hr" />

            {/* Patient & Practitioner Details Box */}
            <div className="rx-print-patient-meta-grid">
              <div className="rx-meta-col">
                <p><strong>Patient Name:</strong> {patient.name}</p>
                <p><strong>Patient ID:</strong> {patient.id.toUpperCase()}</p>
                <p><strong>Age / Gender:</strong> {calculateAge(patient.dateOfBirth)} Yrs / {patient.gender}</p>
                <p><strong>Contact:</strong> {patient.phone}</p>
              </div>
              <div className="rx-meta-col">
                <p><strong>Clinical Diagnosis:</strong> {selectedPrescriptionForSheet.diagnosis}</p>
                <p><strong>Prescribing Clinician:</strong> {selectedPrescriptionForSheet.prescribedBy}</p>
                <p><strong>Status:</strong> {selectedPrescriptionForSheet.status}</p>
                <p><strong>Regimen Duration:</strong> {selectedPrescriptionForSheet.items[0]?.durationWeeks || 4} Weeks</p>
              </div>
            </div>

            {/* Target Goal & Guidelines */}
            {selectedPrescriptionForSheet.targetGoal && (
              <div className="rx-print-goal-banner">
                <strong>Primary Rehabilitation Goal:</strong> {selectedPrescriptionForSheet.targetGoal}
              </div>
            )}

            {selectedPrescriptionForSheet.generalInstructions && (
              <div className="rx-print-directions-box">
                <strong>Patient Directions:</strong> {selectedPrescriptionForSheet.generalInstructions}
              </div>
            )}

            {/* Numbered Exercises Routines */}
            <div className="rx-print-exercises-block">
              <h3 className="rx-print-section-title">Prescribed Exercises & Adherence Protocol</h3>
              <div className="rx-print-items-list">
                {selectedPrescriptionForSheet.items.map((item, idx) => {
                  // Retrieve full instructions if available from library
                  const libraryRef = availableExercises.find(e => e.id === item.exerciseId);
                  return (
                    <div key={item.id || idx} className="rx-print-item-card">
                      <div className="rx-print-item-header">
                        <span className="rx-print-number">#{idx + 1}</span>
                        <div className="rx-print-title-area">
                          <h4 className="rx-print-title">{item.exerciseTitle}</h4>
                          <span className="rx-print-muscle">{item.targetMuscleGroup} ({item.category})</span>
                        </div>
                      </div>

                      {/* Dosage Prescription Table */}
                      <div className="rx-print-dosage-bar">
                        <span className="dosage-item"><strong>Sets:</strong> {item.sets}</span>
                        <span className="dosage-item"><strong>Reps:</strong> {item.reps}</span>
                        {item.holdSec ? <span className="dosage-item"><strong>Hold:</strong> {item.holdSec} seconds</span> : null}
                        <span className="dosage-item highlight"><strong>Frequency:</strong> {item.frequency}</span>
                        <span className="dosage-item"><strong>Duration:</strong> {item.durationWeeks} Weeks</span>
                      </div>

                      {/* Instructions */}
                      {libraryRef && libraryRef.instructions && libraryRef.instructions.length > 0 && (
                        <div className="rx-print-instructions">
                          <strong>Execution Steps:</strong>
                          <ol className="rx-print-steps-list">
                            {libraryRef.instructions.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Precautions */}
                      {item.notes && (
                        <div className="rx-print-precautions">
                          <strong>Clinician Precautions:</strong> {item.notes}
                        </div>
                      )}

                      {/* 7-Day Adherence Tracking Row */}
                      <div className="rx-print-tracker-row">
                        <span className="tracker-label">Weekly Adherence Check:</span>
                        <div className="tracker-days">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="tracker-day-box">
                              <span className="day-name">{day}</span>
                              <div className="day-checkbox" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinician Sign-off & Warnings Footer */}
            <div className="rx-print-footer-grid">
              <div className="rx-print-warning">
                <p><strong>Patient Advisory:</strong> Discontinue any exercise immediately if you experience dizziness, sharp radiating pain, or joint swelling. Perform all movements in a controlled manner without holding your breath.</p>
              </div>
              <div className="rx-print-signature-box">
                <div className="signature-line" />
                <p className="signature-name">{selectedPrescriptionForSheet.prescribedBy}</p>
                <p className="signature-title">Registered Physiotherapist & Clinical Supervisor</p>
                <p className="signature-date">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="prescription-print-footer-actions">
              <Button onClick={() => window.print()} variant="primary" iconLeft={<Printer size={16} />}>
                Print Take-Home Routine
              </Button>
              <Button onClick={() => setIsTakeHomeSheetOpen(false)} variant="secondary">
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default PatientDetailsPage;
