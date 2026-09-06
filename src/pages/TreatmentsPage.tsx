import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Dumbbell,
  Plus,
  Search,
  Clock,
  DollarSign,
  Tag,
  ShieldAlert,
  Info,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import {
  treatmentService,
  TREATMENT_CATEGORIES,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
} from '../services/treatmentService';
import type { TreatmentType, Exercise } from '../types';
import './TreatmentsPage.css';

export const TreatmentsPage: React.FC = () => {
  const { showToast } = useNotification();

  // Active Tab: 'modalities' | 'exercises'
  const [activeTab, setActiveTab] = useState<'modalities' | 'exercises'>('modalities');

  // Data States
  const [treatments, setTreatments] = useState<TreatmentType[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Modality Filters
  const [treatmentCategory, setTreatmentCategory] = useState<string>('All');
  const [treatmentSearch, setTreatmentSearch] = useState<string>('');

  // Exercise Filters
  const [exerciseCategory, setExerciseCategory] = useState<string>('All');
  const [exerciseDifficulty, setExerciseDifficulty] = useState<string>('All');
  const [exerciseMuscleGroup, setExerciseMuscleGroup] = useState<string>('All');
  const [exerciseSearch, setExerciseSearch] = useState<string>('');

  // Modals
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState<boolean>(false);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentType | null>(null);

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [selectedGuideExercise, setSelectedGuideExercise] = useState<Exercise | null>(null);

  // Forms State - Treatment
  const initialTreatmentForm = {
    name: '',
    category: 'Manual Therapy' as TreatmentType['category'],
    description: '',
    durationMinutes: 45,
    defaultPrice: 65,
    status: 'Active' as 'Active' | 'Inactive',
    equipmentStr: '',
  };
  const [treatmentFormData, setTreatmentFormData] = useState(initialTreatmentForm);

  // Forms State - Exercise
  const initialExerciseForm = {
    title: '',
    category: 'Strengthening' as Exercise['category'],
    targetMuscleGroup: 'Lumbar Spine & Core',
    difficulty: 'Beginner' as Exercise['difficulty'],
    equipment: 'Bodyweight / Mat',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldSec: 3,
    instructionsStr: '',
    precautions: '',
  };
  const [exerciseFormData, setExerciseFormData] = useState(initialExerciseForm);

  // Load Data
  const loadTreatments = useCallback(async () => {
    try {
      const data = await treatmentService.getAllTreatments({
        category: treatmentCategory,
        search: treatmentSearch,
      });
      setTreatments(data);
    } catch {
      showToast('Failed to load treatment modalities.', 'error');
    }
  }, [treatmentCategory, treatmentSearch, showToast]);

  const loadExercises = useCallback(async () => {
    try {
      const data = await treatmentService.getAllExercises({
        category: exerciseCategory,
        difficulty: exerciseDifficulty,
        muscleGroup: exerciseMuscleGroup,
        search: exerciseSearch,
      });
      setExercises(data);
    } catch {
      showToast('Failed to load exercise library.', 'error');
    }
  }, [exerciseCategory, exerciseDifficulty, exerciseMuscleGroup, exerciseSearch, showToast]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([loadTreatments(), loadExercises()]);
  }, [loadTreatments, loadExercises]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Modality Handlers
  const handleOpenAddTreatment = () => {
    setEditingTreatment(null);
    setTreatmentFormData(initialTreatmentForm);
    setIsTreatmentModalOpen(true);
  };

  const handleOpenEditTreatment = (item: TreatmentType) => {
    setEditingTreatment(item);
    setTreatmentFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      durationMinutes: item.durationMinutes,
      defaultPrice: item.defaultPrice,
      status: item.status,
      equipmentStr: (item.requiredEquipment || []).join(', '),
    });
    setIsTreatmentModalOpen(true);
  };

  const handleTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentFormData.name.trim()) {
      showToast('Treatment name is required.', 'warning');
      return;
    }

    const payload = {
      name: treatmentFormData.name,
      category: treatmentFormData.category,
      description: treatmentFormData.description,
      durationMinutes: Number(treatmentFormData.durationMinutes),
      defaultPrice: Number(treatmentFormData.defaultPrice),
      status: treatmentFormData.status,
      requiredEquipment: treatmentFormData.equipmentStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingTreatment) {
        await treatmentService.updateTreatment(editingTreatment.id, payload);
        showToast('Treatment modality updated.', 'success');
      } else {
        await treatmentService.createTreatment(payload);
        showToast('Treatment modality added.', 'success');
      }
      setIsTreatmentModalOpen(false);
      loadTreatments();
    } catch {
      showToast('Failed to save treatment modality.', 'error');
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (!window.confirm('Delete this treatment modality?')) return;
    try {
      await treatmentService.deleteTreatment(id);
      showToast('Treatment modality removed.', 'info');
      loadTreatments();
    } catch {
      showToast('Failed to delete treatment.', 'error');
    }
  };

  // Exercise Handlers
  const handleOpenAddExercise = () => {
    setEditingExercise(null);
    setExerciseFormData(initialExerciseForm);
    setIsExerciseModalOpen(true);
  };

  const handleOpenEditExercise = (ex: Exercise) => {
    setEditingExercise(ex);
    setExerciseFormData({
      title: ex.title,
      category: ex.category,
      targetMuscleGroup: ex.targetMuscleGroup,
      difficulty: ex.difficulty,
      equipment: ex.equipment,
      defaultSets: ex.defaultSets,
      defaultReps: ex.defaultReps,
      defaultHoldSec: ex.defaultHoldSec || 0,
      instructionsStr: ex.instructions.join('\n'),
      precautions: ex.precautions || '',
    });
    setIsExerciseModalOpen(true);
  };

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseFormData.title.trim()) {
      showToast('Exercise title is required.', 'warning');
      return;
    }

    const instructionsArray = exerciseFormData.instructionsStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: exerciseFormData.title,
      category: exerciseFormData.category,
      targetMuscleGroup: exerciseFormData.targetMuscleGroup,
      difficulty: exerciseFormData.difficulty,
      equipment: exerciseFormData.equipment,
      defaultSets: Number(exerciseFormData.defaultSets),
      defaultReps: Number(exerciseFormData.defaultReps),
      defaultHoldSec: Number(exerciseFormData.defaultHoldSec),
      instructions: instructionsArray.length > 0 ? instructionsArray : ['Perform according to clinical direction.'],
      precautions: exerciseFormData.precautions,
    };

    try {
      if (editingExercise) {
        await treatmentService.updateExercise(editingExercise.id, payload);
        showToast('Exercise updated.', 'success');
      } else {
        await treatmentService.createExercise(payload);
        showToast('Exercise added to catalog.', 'success');
      }
      setIsExerciseModalOpen(false);
      loadExercises();
    } catch {
      showToast('Failed to save exercise.', 'error');
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!window.confirm('Delete this exercise from the directory?')) return;
    try {
      await treatmentService.deleteExercise(id);
      showToast('Exercise deleted.', 'info');
      loadExercises();
    } catch {
      showToast('Failed to delete exercise.', 'error');
    }
  };

  // Modality statistics
  const modalityStats = useMemo(() => {
    const total = treatments.length;
    const active = treatments.filter((t) => t.status === 'Active').length;
    const avgDuration = total > 0 ? Math.round(treatments.reduce((acc, t) => acc + t.durationMinutes, 0) / total) : 0;
    return { total, active, avgDuration };
  }, [treatments]);

  return (
    <div className="treatments-container">
      {/* Header */}
      <div className="treatments-header">
        <div>
          <h1 className="page-title">Treatment Modalities & Exercise Library</h1>
          <p className="page-subtitle">
            Configure clinic service modalities, treatment pricing, and clinical exercise protocols.
          </p>
        </div>

        <div>
          {activeTab === 'modalities' ? (
            <Button variant="primary" iconLeft={<Plus size={18} />} onClick={handleOpenAddTreatment}>
              Add Treatment Modality
            </Button>
          ) : (
            <Button variant="primary" iconLeft={<Plus size={18} />} onClick={handleOpenAddExercise}>
              Add Clinical Exercise
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="treatments-tabs-nav">
        <button
          className={`treatments-tab-btn ${activeTab === 'modalities' ? 'active' : ''}`}
          onClick={() => setActiveTab('modalities')}
        >
          <Activity size={18} />
          <span>Treatment Modalities & Services</span>
          <span className="treatments-tab-badge">{treatments.length}</span>
        </button>

        <button
          className={`treatments-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          <Dumbbell size={18} />
          <span>Clinical Exercise Directory</span>
          <span className="treatments-tab-badge">{exercises.length}</span>
        </button>
      </div>

      {/* TAB 1: TREATMENT MODALITIES */}
      {activeTab === 'modalities' && (
        <>
          {/* Summary Stat Cards */}
          <div className="treatments-stats-grid">
            <div className="treatment-stat-card">
              <div className="treatment-stat-icon">
                <Layers size={22} />
              </div>
              <div>
                <div className="treatment-stat-value">{modalityStats.total}</div>
                <div className="treatment-stat-label">Total Services Offered</div>
              </div>
            </div>

            <div className="treatment-stat-card">
              <div className="treatment-stat-icon">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="treatment-stat-value">{modalityStats.active}</div>
                <div className="treatment-stat-label">Active Modalities</div>
              </div>
            </div>

            <div className="treatment-stat-card">
              <div className="treatment-stat-icon">
                <Clock size={22} />
              </div>
              <div>
                <div className="treatment-stat-value">{modalityStats.avgDuration} min</div>
                <div className="treatment-stat-label">Average Session Length</div>
              </div>
            </div>
          </div>

          {/* Modalities Filter Bar */}
          <Card className="treatments-filter-card">
            <div className="filter-bar-row">
              <div className="category-chips">
                {['All', ...TREATMENT_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    className={`category-chip ${treatmentCategory === cat ? 'active' : ''}`}
                    onClick={() => setTreatmentCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ minWidth: '260px' }}>
                <Input
                  placeholder="Search modalities, therapies..."
                  value={treatmentSearch}
                  onChange={(e) => setTreatmentSearch(e.target.value)}
                  iconLeft={<Search size={16} />}
                />
              </div>
            </div>
          </Card>

          {/* Modalities Grid */}
          <div className="treatments-grid">
            {treatments.map((t) => (
              <div key={t.id} className="treatment-card">
                <div>
                  <div className="treatment-card-header">
                    <div>
                      <h3 className="treatment-name">{t.name}</h3>
                      <span className="category-badge">{t.category}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: t.status === 'Active' ? '#15803d' : '#94a3b8',
                      }}
                    >
                      ● {t.status}
                    </span>
                  </div>

                  <p className="treatment-desc">{t.description}</p>

                  {t.requiredEquipment && t.requiredEquipment.length > 0 && (
                    <div className="treatment-equipment-tags">
                      {t.requiredEquipment.map((eq, i) => (
                        <span key={i} className="equipment-tag">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="treatment-card-meta">
                    <div className="treatment-duration-badge">
                      <Clock size={14} />
                      <span>{t.durationMinutes} minutes</span>
                    </div>
                    <div className="treatment-price-badge">${t.defaultPrice.toFixed(2)}</div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '6px',
                      marginTop: '0.75rem',
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      iconLeft={<Edit2 size={14} />}
                      onClick={() => handleOpenEditTreatment(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={<Trash2 size={14} />}
                      onClick={() => handleDeleteTreatment(t.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: EXERCISE DIRECTORY */}
      {activeTab === 'exercises' && (
        <>
          {/* Exercises Filter Card */}
          <Card className="treatments-filter-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="filter-bar-row">
                <div className="category-chips">
                  {['All', ...EXERCISE_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      className={`category-chip ${exerciseCategory === cat ? 'active' : ''}`}
                      onClick={() => setExerciseCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{ minWidth: '260px' }}>
                  <Input
                    placeholder="Search exercises, muscles..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    iconLeft={<Search size={16} />}
                  />
                </div>
              </div>

              {/* Secondary Level: Muscle group & Difficulty */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Target Area:
                  </span>
                  <select
                    className="therapist-select-control"
                    value={exerciseMuscleGroup}
                    onChange={(e) => setExerciseMuscleGroup(e.target.value)}
                  >
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Difficulty:
                  </span>
                  <select
                    className="therapist-select-control"
                    value={exerciseDifficulty}
                    onChange={(e) => setExerciseDifficulty(e.target.value)}
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Exercises Grid */}
          <div className="exercises-grid">
            {exercises.map((ex) => (
              <div key={ex.id} className="exercise-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`exercise-difficulty-badge ${ex.difficulty}`}>
                      {ex.difficulty}
                    </span>
                    <span className="category-badge">{ex.category}</span>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginTop: '0.75rem', marginBottom: '2px' }}>
                    {ex.title}
                  </h3>

                  <div className="exercise-target-area">
                    <Tag size={13} color="var(--primary)" />
                    <span>{ex.targetMuscleGroup}</span>
                  </div>

                  {/* Dosage Recommendations */}
                  <div className="dosage-chips-row">
                    <div className="dosage-chip">
                      <span>Sets:</span>
                      <strong>{ex.defaultSets}</strong>
                    </div>
                    <div className="dosage-chip">
                      <span>Reps:</span>
                      <strong>{ex.defaultReps}</strong>
                    </div>
                    {ex.defaultHoldSec ? (
                      <div className="dosage-chip">
                        <span>Hold:</span>
                        <strong>{ex.defaultHoldSec}s</strong>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Equipment: <strong>{ex.equipment}</strong>
                  </div>
                </div>

                <div className="exercise-card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={<Info size={14} />}
                    onClick={() => setSelectedGuideExercise(ex)}
                  >
                    View Guide
                  </Button>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="action-icon-btn"
                      title="Edit Exercise"
                      onClick={() => handleOpenEditExercise(ex)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="action-icon-btn danger"
                      title="Delete Exercise"
                      onClick={() => handleDeleteExercise(ex.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Treatment Modality Modal */}
      <Modal
        isOpen={isTreatmentModalOpen}
        onClose={() => setIsTreatmentModalOpen(false)}
        title={editingTreatment ? 'Edit Treatment Modality' : 'Add New Treatment Modality'}
        size="md"
      >
        <form onSubmit={handleTreatmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            name="name"
            label="Modality Name *"
            placeholder="e.g. Ultrasound Therapy"
            value={treatmentFormData.name}
            onChange={(e) => setTreatmentFormData({ ...treatmentFormData, name: e.target.value })}
            required
          />

          <div className="form-grid-2">
            <div>
              <label className="input-label">Category</label>
              <select
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={treatmentFormData.category}
                onChange={(e) =>
                  setTreatmentFormData({
                    ...treatmentFormData,
                    category: e.target.value as TreatmentType['category'],
                  })
                }
              >
                {TREATMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Status</label>
              <select
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={treatmentFormData.status}
                onChange={(e) =>
                  setTreatmentFormData({
                    ...treatmentFormData,
                    status: e.target.value as 'Active' | 'Inactive',
                  })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <Input
              label="Standard Duration (Minutes)"
              type="number"
              value={treatmentFormData.durationMinutes}
              onChange={(e) =>
                setTreatmentFormData({
                  ...treatmentFormData,
                  durationMinutes: Number(e.target.value),
                })
              }
              iconLeft={<Clock size={16} />}
            />

            <Input
              label="Default Fee ($)"
              type="number"
              value={treatmentFormData.defaultPrice}
              onChange={(e) =>
                setTreatmentFormData({
                  ...treatmentFormData,
                  defaultPrice: Number(e.target.value),
                })
              }
              iconLeft={<DollarSign size={16} />}
            />
          </div>

          <div>
            <label className="input-label">Clinical Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Clinical indication, physiological effects..."
              value={treatmentFormData.description}
              onChange={(e) =>
                setTreatmentFormData({ ...treatmentFormData, description: e.target.value })
              }
            />
          </div>

          <Input
            label="Required Equipment (comma-separated)"
            placeholder="e.g. Ultrasound Device, Coupling Gel, Towels"
            value={treatmentFormData.equipmentStr}
            onChange={(e) =>
              setTreatmentFormData({ ...treatmentFormData, equipmentStr: e.target.value })
            }
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsTreatmentModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTreatment ? 'Save Changes' : 'Create Modality'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Exercise Modal */}
      <Modal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        title={editingExercise ? 'Edit Exercise' : 'Add New Clinical Exercise'}
        size="lg"
      >
        <form onSubmit={handleExerciseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Exercise Title *"
            placeholder="e.g. Lumbar Prone Extension"
            value={exerciseFormData.title}
            onChange={(e) => setExerciseFormData({ ...exerciseFormData, title: e.target.value })}
            required
          />

          <div className="form-grid-2">
            <div>
              <label className="input-label">Category</label>
              <select
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={exerciseFormData.category}
                onChange={(e) =>
                  setExerciseFormData({
                    ...exerciseFormData,
                    category: e.target.value as Exercise['category'],
                  })
                }
              >
                {EXERCISE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Target Muscle Group</label>
              <select
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={exerciseFormData.targetMuscleGroup}
                onChange={(e) =>
                  setExerciseFormData({ ...exerciseFormData, targetMuscleGroup: e.target.value })
                }
              >
                {MUSCLE_GROUPS.filter((m) => m !== 'All').map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="input-label">Difficulty Level</label>
              <select
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={exerciseFormData.difficulty}
                onChange={(e) =>
                  setExerciseFormData({
                    ...exerciseFormData,
                    difficulty: e.target.value as Exercise['difficulty'],
                  })
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <Input
              label="Equipment"
              placeholder="e.g. Resistance Band / Mat"
              value={exerciseFormData.equipment}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, equipment: e.target.value })
              }
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Default Sets"
              type="number"
              value={exerciseFormData.defaultSets}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, defaultSets: Number(e.target.value) })
              }
            />

            <Input
              label="Default Reps"
              type="number"
              value={exerciseFormData.defaultReps}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, defaultReps: Number(e.target.value) })
              }
            />

            <Input
              label="Hold Time (seconds)"
              type="number"
              value={exerciseFormData.defaultHoldSec}
              onChange={(e) =>
                setExerciseFormData({
                  ...exerciseFormData,
                  defaultHoldSec: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="input-label">Step-by-Step Instructions (One per line)</label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Step 1: Lie flat on back...&#10;Step 2: Engage core and squeeze glutes...&#10;Step 3: Lift hips slowly..."
              value={exerciseFormData.instructionsStr}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, instructionsStr: e.target.value })
              }
            />
          </div>

          <div>
            <label className="input-label">Clinical Precautions & Contraindications</label>
            <Input
              placeholder="e.g. Stop if acute nerve radiculopathy or sharp pain is felt."
              value={exerciseFormData.precautions}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, precautions: e.target.value })
              }
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsExerciseModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingExercise ? 'Save Changes' : 'Save Exercise'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Exercise Detail / Guide Modal */}
      <Modal
        isOpen={Boolean(selectedGuideExercise)}
        onClose={() => setSelectedGuideExercise(null)}
        title={selectedGuideExercise?.title || 'Exercise Guide'}
        size="lg"
      >
        {selectedGuideExercise && (
          <div className="exercise-guide-container">
            <div className="exercise-guide-header">
              <div>
                <span className={`exercise-difficulty-badge ${selectedGuideExercise.difficulty}`}>
                  {selectedGuideExercise.difficulty} Level
                </span>
                <span className="category-badge" style={{ marginLeft: '8px' }}>
                  {selectedGuideExercise.category}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Target: <strong>{selectedGuideExercise.targetMuscleGroup}</strong>
              </div>
            </div>

            {/* Dosage parameters box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                backgroundColor: '#f8fafc',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sets</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedGuideExercise.defaultSets}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reps</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedGuideExercise.defaultReps}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Hold Time</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedGuideExercise.defaultHoldSec ? `${selectedGuideExercise.defaultHoldSec}s` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Equipment</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                  {selectedGuideExercise.equipment}
                </div>
              </div>
            </div>

            {/* Step by step */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Instructions for Patient:
              </h4>
              <div className="exercise-guide-steps">
                {selectedGuideExercise.instructions.map((step, idx) => (
                  <div key={idx} className="step-row">
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Precautions */}
            {selectedGuideExercise.precautions && (
              <div className="precaution-alert-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '3px' }}>
                  <ShieldAlert size={16} />
                  <span>Clinical Precautions:</span>
                </div>
                <div>{selectedGuideExercise.precautions}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="primary" onClick={() => setSelectedGuideExercise(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
