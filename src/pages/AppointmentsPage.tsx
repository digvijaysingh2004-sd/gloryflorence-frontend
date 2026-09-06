import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Stethoscope,
  DollarSign,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Table, type Column } from '../components/common/Table';
import { useNotification } from '../context/NotificationContext';
import {
  appointmentService,
  timeToMinutes,
} from '../services/appointmentService';
import { patientService } from '../services/patientService';
import type { Appointment, Patient } from '../types';
import './AppointmentsPage.css';

// Operating hours for timeline: 08:00 AM to 06:00 PM
const OPERATING_HOURS = [
  { hour: 8, label: '08:00 AM' },
  { hour: 9, label: '09:00 AM' },
  { hour: 10, label: '10:00 AM' },
  { hour: 11, label: '11:00 AM' },
  { hour: 12, label: '12:00 PM' },
  { hour: 13, label: '01:00 PM' },
  { hour: 14, label: '02:00 PM' },
  { hour: 15, label: '03:00 PM' },
  { hour: 16, label: '04:00 PM' },
  { hour: 17, label: '05:00 PM' },
  { hour: 18, label: '06:00 PM' },
];

export const AppointmentsPage: React.FC = () => {
  const { showToast } = useNotification();

  // View Mode: 'timeline' | 'table'
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Date Selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filters
  const [selectedTherapist, setSelectedTherapist] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form State
  const initialFormState = {
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    therapistName: appointmentService.getTherapists()[0] || 'Dr. Glory Physiotherapist',
    date: selectedDate,
    time: '10:00 AM',
    durationMinutes: 45,
    type: appointmentService.getAppointmentTypes()[0] || 'Physiotherapy Session',
    room: appointmentService.getRooms()[0] || 'Room 101 (Assessment)',
    fee: 65,
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Load appointments and patients
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apptsData, patientsData] = await Promise.all([
        appointmentService.getAll({
          date: viewMode === 'timeline' ? selectedDate : undefined,
          therapist: selectedTherapist,
          status: statusFilter,
          search: searchQuery,
        }),
        patientService.getAll(),
      ]);
      setAppointments(apptsData);
      setPatients(patientsData);
    } catch {
      showToast('Failed to load appointments.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedTherapist, statusFilter, searchQuery, viewMode, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Date Navigation
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Conflict Checking on Form Change
  const runConflictCheck = (therapist: string, date: string, time: string, duration: number, excludeId?: string) => {
    const result = appointmentService.checkConflict(therapist, date, time, duration, excludeId);
    if (result.hasConflict && result.conflictingAppointment) {
      setConflictWarning(
        `Conflict Alert: ${therapist} is already booked with ${result.conflictingAppointment.patientName} at ${result.conflictingAppointment.time} (${result.conflictingAppointment.durationMinutes} mins).`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleOpenAddModal = (presetTime?: string) => {
    setEditingAppointment(null);
    const newForm = {
      ...initialFormState,
      date: selectedDate,
      time: presetTime || '10:00 AM',
    };
    setFormData(newForm);
    setFormErrors({});
    setConflictWarning(null);
    runConflictCheck(newForm.therapistName, newForm.date, newForm.time, newForm.durationMinutes);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      patientId: apt.patientId || '',
      patientName: apt.patientName || '',
      patientPhone: apt.patientPhone || '',
      patientEmail: apt.patientEmail || '',
      therapistName: apt.therapistName,
      date: apt.date,
      time: apt.time,
      durationMinutes: apt.durationMinutes || 45,
      type: apt.type,
      room: apt.room || appointmentService.getRooms()[0],
      fee: apt.fee || 65,
      status: apt.status,
      notes: apt.notes || '',
    });
    setFormErrors({});
    setConflictWarning(null);
    runConflictCheck(apt.therapistName, apt.date, apt.time, apt.durationMinutes || 45, apt.id);
    setIsModalOpen(true);
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    if (!patientId) {
      setFormData((prev) => ({
        ...prev,
        patientId: '',
        patientName: '',
        patientPhone: '',
        patientEmail: '',
      }));
      return;
    }
    const pat = patients.find((p) => p.id === patientId);
    if (pat) {
      setFormData((prev) => ({
        ...prev,
        patientId: pat.id,
        patientName: pat.name,
        patientPhone: pat.phone,
        patientEmail: pat.email,
      }));
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: name === 'durationMinutes' || name === 'fee' ? Number(value) : value,
    };
    setFormData(updated);

    if (['therapistName', 'date', 'time', 'durationMinutes'].includes(name)) {
      runConflictCheck(
        updated.therapistName,
        updated.date,
        updated.time,
        updated.durationMinutes,
        editingAppointment?.id
      );
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.patientName.trim()) {
      errors.patientName = 'Patient is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.time) {
      errors.time = 'Time is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, formData);
        showToast('Appointment updated successfully.', 'success');
      } else {
        await appointmentService.create(formData);
        showToast('Appointment booked successfully.', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      showToast('Failed to save appointment.', 'error');
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show'
  ) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      showToast(`Appointment status updated to ${newStatus}.`, 'success');
      loadData();
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this appointment?')) return;
    try {
      await appointmentService.delete(id);
      showToast('Appointment removed.', 'info');
      loadData();
    } catch {
      showToast('Failed to delete appointment.', 'error');
    }
  };

  // Formatted date string for display
  const formattedDateTitle = useMemo(() => {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { All: appointments.length, Scheduled: 0, Completed: 0, Cancelled: 0, 'No Show': 0 };
    for (const a of appointments) {
      if (counts[a.status] !== undefined) counts[a.status]++;
    }
    return counts;
  }, [appointments]);

  // Group appointments into operating hour slots for timeline
  const timelineSlots = useMemo(() => {
    return OPERATING_HOURS.map((hourObj) => {
      const slotStartMin = hourObj.hour * 60;
      const slotEndMin = slotStartMin + 60;

      const apptsInSlot = appointments.filter((apt) => {
        const aptStartMin = timeToMinutes(apt.time);
        return aptStartMin >= slotStartMin && aptStartMin < slotEndMin;
      });

      return {
        ...hourObj,
        appointments: apptsInSlot,
      };
    });
  }, [appointments]);

  // Table Columns
  const tableColumns: Column<Appointment>[] = [
    {
      key: 'time',
      title: 'Time & Date',
      render: (apt) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{apt.time}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {apt.date} • {apt.durationMinutes || 45} mins
          </div>
        </div>
      ),
    },
    {
      key: 'patientName',
      title: 'Patient Details',
      render: (apt) => (
        <div>
          {apt.patientId ? (
            <Link to={`/patients/${apt.patientId}`} className="appointment-patient-name">
              {apt.patientName}
            </Link>
          ) : (
            <span style={{ fontWeight: 600 }}>{apt.patientName}</span>
          )}
          {apt.patientPhone && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {apt.patientPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'therapistName',
      title: 'Therapist',
      render: (apt) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Stethoscope size={15} color="var(--primary)" />
          <span>{apt.therapistName}</span>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Treatment Type',
      render: (apt) => (
        <div>
          <span style={{ fontWeight: 500 }}>{apt.type}</span>
          {apt.room && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{apt.room}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (apt) => (
        <span className={`appointment-status-tag ${apt.status.replace(' ', '-')}`}>
          {apt.status}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (apt) => (
        <div className="appointment-actions-group">
          {apt.status === 'Scheduled' && (
            <button
              className="action-icon-btn success"
              title="Mark Completed"
              onClick={() => handleStatusChange(apt.id, 'Completed')}
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          {apt.status === 'Scheduled' && (
            <button
              className="action-icon-btn danger"
              title="Cancel Appointment"
              onClick={() => handleStatusChange(apt.id, 'Cancelled')}
            >
              <XCircle size={16} />
            </button>
          )}
          <button
            className="action-icon-btn"
            title="Edit"
            onClick={() => handleOpenEditModal(apt)}
          >
            <Edit2 size={15} />
          </button>
          <button
            className="action-icon-btn danger"
            title="Delete"
            onClick={() => handleDelete(apt.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="appointments-container">
      {/* Page Header */}
      <div className="appointments-header">
        <div>
          <h1 className="page-title">Appointments & Scheduling</h1>
          <p className="page-subtitle">
            Plan therapist schedules, manage daily clinical visits, and avoid booking conflicts.
          </p>
        </div>

        <div className="appointments-header-actions">
          {/* View Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <CalendarIcon size={16} />
              Day Timeline
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={16} />
              Table View
            </button>
          </div>

          <Button
            variant="primary"
            iconLeft={<Plus size={18} />}
            onClick={() => handleOpenAddModal()}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Filter Controls Card */}
      <Card className="appointments-controls-card">
        <div className="appointments-controls">
          {/* Date Navigation Bar */}
          <div className="date-navigation-bar">
            <div className="date-nav-controls">
              <Button variant="secondary" size="sm" onClick={handlePrevDay} iconLeft={<ChevronLeft size={16} />}>
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="secondary" size="sm" onClick={handleNextDay} iconLeft={<ChevronRight size={16} />}>
                Next
              </Button>
            </div>

            <div className="current-date-heading">
              <CalendarIcon size={20} color="var(--primary)" />
              <span>{formattedDateTitle}</span>
            </div>

            <div className="date-picker-wrapper">
              <input
                type="date"
                className="date-input-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Secondary Filters Bar */}
          <div className="secondary-filters-bar">
            <div className="status-filter-pills">
              {(['All', 'Scheduled', 'Completed', 'Cancelled', 'No Show'] as const).map((st) => (
                <button
                  key={st}
                  className={`status-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  <span>{st}</span>
                  <span className="status-pill-count">{statusCounts[st] ?? 0}</span>
                </button>
              ))}
            </div>

            <div className="search-and-therapist-group">
              <select
                className="therapist-select-control"
                value={selectedTherapist}
                onChange={(e) => setSelectedTherapist(e.target.value)}
              >
                <option value="All">All Physiotherapists</option>
                {appointmentService.getTherapists().map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Search patient, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={<Search size={16} />}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content: Timeline vs Table */}
      {viewMode === 'timeline' ? (
        <Card className="timeline-card">
          <div className="timeline-container">
            <div className="timeline-header-meta">
              <span>
                Daily Timeline for <strong>{formattedDateTitle}</strong>
              </span>
              <span>{appointments.length} appointment(s) found</span>
            </div>

            <div className="timeline-hours-list">
              {timelineSlots.map((slot) => (
                <div key={slot.hour} className="timeline-hour-row">
                  <div className="timeline-hour-time">{slot.label}</div>
                  <div className="timeline-hour-content">
                    {slot.appointments.length === 0 ? (
                      <div
                        className="empty-timeline-slot"
                        onClick={() => handleOpenAddModal(slot.label)}
                      >
                        <Plus size={14} style={{ marginRight: '6px' }} />
                        Available for booking
                      </div>
                    ) : (
                      <div className="timeline-appointments-grid">
                        {slot.appointments.map((apt) => (
                          <div
                            key={apt.id}
                            className={`appointment-card status-${apt.status.replace(' ', '-')}`}
                          >
                            <div className="appointment-card-header">
                              {apt.patientId ? (
                                <Link
                                  to={`/patients/${apt.patientId}`}
                                  className="appointment-patient-name"
                                >
                                  <User size={15} />
                                  {apt.patientName}
                                </Link>
                              ) : (
                                <span className="appointment-patient-name">
                                  <User size={15} />
                                  {apt.patientName}
                                </span>
                              )}

                              <span className="appointment-time-badge">
                                <Clock size={12} />
                                {apt.time} ({apt.durationMinutes || 45}m)
                              </span>
                            </div>

                            <div className="appointment-meta-row">
                              <span className="appointment-meta-item">
                                <Stethoscope size={13} />
                                {apt.therapistName}
                              </span>
                              <span className="appointment-meta-item">
                                <MapPin size={13} />
                                {apt.room || 'Room 101'}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                              <strong>{apt.type}</strong>
                              {apt.notes && (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                                  {apt.notes}
                                </div>
                              )}
                            </div>

                            <div className="appointment-card-footer">
                              <span className={`appointment-status-tag ${apt.status.replace(' ', '-')}`}>
                                {apt.status}
                              </span>

                              <div className="appointment-actions-group">
                                {apt.status === 'Scheduled' && (
                                  <button
                                    className="action-icon-btn success"
                                    title="Mark Completed"
                                    onClick={() => handleStatusChange(apt.id, 'Completed')}
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                )}
                                {apt.status === 'Scheduled' && (
                                  <button
                                    className="action-icon-btn danger"
                                    title="Cancel"
                                    onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                                  >
                                    <XCircle size={16} />
                                  </button>
                                )}
                                <button
                                  className="action-icon-btn"
                                  title="Edit"
                                  onClick={() => handleOpenEditModal(apt)}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="action-icon-btn danger"
                                  title="Delete"
                                  onClick={() => handleDelete(apt.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <Table
            columns={tableColumns}
            data={appointments}
            isLoading={isLoading}
            emptyMessage="No appointments found for the selected criteria."
          />
        </Card>
      )}

      {/* Book / Edit Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Patient Selector */}
          <div>
            <label className="input-label">Select Patient *</label>
            <select
              className="therapist-select-control"
              style={{ width: '100%', marginBottom: '0.5rem' }}
              value={formData.patientId}
              onChange={handlePatientSelect}
            >
              <option value="">-- Choose Existing Registered Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>

            <Input
              name="patientName"
              placeholder="Or enter patient name manually"
              value={formData.patientName}
              onChange={handleFormChange}
              error={formErrors.patientName}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              name="patientPhone"
              label="Contact Phone"
              placeholder="+1 (555) 000-0000"
              value={formData.patientPhone}
              onChange={handleFormChange}
            />

            <div>
              <label className="input-label">Physiotherapist / Doctor *</label>
              <select
                name="therapistName"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.therapistName}
                onChange={handleFormChange}
              >
                {appointmentService.getTherapists().map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <Input
              name="date"
              label="Appointment Date *"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              error={formErrors.date}
              required
            />

            <div>
              <label className="input-label">Start Time *</label>
              <select
                name="time"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.time}
                onChange={handleFormChange}
              >
                {[
                  '08:00 AM',
                  '08:30 AM',
                  '09:00 AM',
                  '09:30 AM',
                  '10:00 AM',
                  '10:30 AM',
                  '11:00 AM',
                  '11:30 AM',
                  '12:00 PM',
                  '12:30 PM',
                  '01:00 PM',
                  '01:30 PM',
                  '02:00 PM',
                  '02:30 PM',
                  '03:00 PM',
                  '03:30 PM',
                  '04:00 PM',
                  '04:30 PM',
                  '05:00 PM',
                  '05:30 PM',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conflict Warning Alert */}
          {conflictWarning && (
            <div className="conflict-warning-box">
              <AlertTriangle size={20} />
              <div>
                <div className="conflict-warning-title">Scheduling Conflict Detected</div>
                <div>{conflictWarning}</div>
              </div>
            </div>
          )}

          <div className="form-grid-2">
            <div>
              <label className="input-label">Duration</label>
              <select
                name="durationMinutes"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.durationMinutes}
                onChange={handleFormChange}
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Standard)</option>
                <option value={60}>60 Minutes (Comprehensive)</option>
                <option value={90}>90 Minutes (Specialized)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Treatment Type</label>
              <select
                name="type"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.type}
                onChange={handleFormChange}
              >
                {appointmentService.getAppointmentTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="input-label">Assigned Room / Facility</label>
              <select
                name="room"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.room}
                onChange={handleFormChange}
              >
                {appointmentService.getRooms().map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <Input
              name="fee"
              label="Session Fee ($)"
              type="number"
              value={formData.fee}
              onChange={handleFormChange}
              iconLeft={<DollarSign size={16} />}
            />
          </div>

          <div>
            <label className="input-label">Clinical / Scheduling Notes</label>
            <textarea
              name="notes"
              className="input-field"
              rows={3}
              placeholder="e.g. Needs heat pad before treatment, post-surgery follow up..."
              value={formData.notes}
              onChange={handleFormChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingAppointment ? 'Save Changes' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
