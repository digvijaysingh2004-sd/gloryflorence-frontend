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
  Edit2,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Table, type Column } from '../components/common/Table';
import { useNotification } from '../hooks';
import {
  appointmentService,
  timeToMinutes,
  minutesToTimeStr,
} from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { settingsService, type ClinicSettings } from '../services/settingsService';
import type { Appointment, Patient } from '../types';
import './AppointmentsPage.css';



const getTodayStr = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr: string, days: number): string => {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10) || 2026;
  const m = parseInt(parts[1], 10) || 1;
  const d = parseInt(parts[2], 10) || 1;
  const date = new Date(y, m - 1, d + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppointmentsPage: React.FC = () => {
  const { showToast } = useNotification();

  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Array<{ id: string; name: string }>>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<Array<{ id: number; name: string; durationMinutes?: number }>>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    therapistId: '',
    therapistName: '',
    appointmentTypeId: 1,
    date: selectedDate,
    time: '10:00 AM',
    durationMinutes: 45,
    type: '',
    room: '',
    fee: 0,
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apptsData, patientsData, staffList, typesList, settingsData] = await Promise.all([
        appointmentService.getAll({
          therapist: selectedTherapist,
          search: searchQuery,
        }),
        patientService.getAll(),
        appointmentService.getTherapists(),
        appointmentService.fetchAppointmentTypesApi(true),
        settingsService.getClinicSettings(),
      ]);
      const enrichedAppts = apptsData.map((apt) => {
        let pName = apt.patientName;
        if ((!pName || pName === 'Patient') && apt.patientId) {
          const matchedPat = patientsData.find((p) => String(p.id) === String(apt.patientId));
          if (matchedPat) pName = matchedPat.name;
        }
        let tName = apt.therapistName;
        if ((!tName || tName === 'Physiotherapist' || !tName.trim()) && apt.therapistId) {
          const matchedStaff = staffList.find((s) => String(s.id) === String(apt.therapistId));
          if (matchedStaff) tName = matchedStaff.name;
        }
        return {
          ...apt,
          patientName: pName || 'Patient',
          therapistName: tName || (staffList[0]?.name || 'Physiotherapist'),
        };
      });

      setAppointments(enrichedAppts);
      setPatients(patientsData);
      setTherapists(staffList);
      setAppointmentTypes(typesList);
      setClinicSettings(settingsData);
    } catch {
      showToast('Failed to load appointments data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTherapist, searchQuery, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'All') return appointments;
    return appointments.filter((apt) => apt.status.toLowerCase() === statusFilter.toLowerCase());
  }, [appointments, statusFilter]);

  const handlePrevDay = () => {
    const uniqueDates = Array.from(new Set(filteredAppointments.map((a) => a.date))).sort((a, b) => a.localeCompare(b));
    const pastDates = uniqueDates.filter((d) => d < selectedDate);

    if (pastDates.length > 0) {
      setSelectedDate(pastDates[pastDates.length - 1]);
    } else if (dateAppointments.length === 0 && uniqueDates.length > 0) {
      const currentTs = new Date(selectedDate + 'T00:00:00').getTime();
      let bestDate = uniqueDates[0];
      let minDiff = Math.abs(new Date(bestDate + 'T00:00:00').getTime() - currentTs);
      for (let i = 1; i < uniqueDates.length; i++) {
        const d = uniqueDates[i];
        const diff = Math.abs(new Date(d + 'T00:00:00').getTime() - currentTs);
        if (diff < minDiff) {
          minDiff = diff;
          bestDate = d;
        }
      }
      setSelectedDate(bestDate);
    } else {
      setSelectedDate((prev) => addDays(prev, -1));
    }
  };

  const handleNextDay = () => {
    const uniqueDates = Array.from(new Set(filteredAppointments.map((a) => a.date))).sort((a, b) => a.localeCompare(b));
    const futureDates = uniqueDates.filter((d) => d > selectedDate);

    if (futureDates.length > 0) {
      setSelectedDate(futureDates[0]);
    } else if (dateAppointments.length === 0 && uniqueDates.length > 0) {
      const currentTs = new Date(selectedDate + 'T00:00:00').getTime();
      let bestDate = uniqueDates[0];
      let minDiff = Math.abs(new Date(bestDate + 'T00:00:00').getTime() - currentTs);
      for (let i = 1; i < uniqueDates.length; i++) {
        const d = uniqueDates[i];
        const diff = Math.abs(new Date(d + 'T00:00:00').getTime() - currentTs);
        if (diff < minDiff) {
          minDiff = diff;
          bestDate = d;
        }
      }
      setSelectedDate(bestDate);
    } else {
      setSelectedDate((prev) => addDays(prev, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(getTodayStr());
  };

  const handleOpenAddModal = (presetTime?: string) => {
    setEditingAppointment(null);
    const defaultStaff = therapists[0];
    const defaultType = appointmentTypes[0];

    setFormData({
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      therapistId: defaultStaff ? defaultStaff.id : '',
      therapistName: defaultStaff ? defaultStaff.name : '',
      appointmentTypeId: defaultType ? defaultType.id : (appointmentTypes[0]?.id || 1),
      date: selectedDate,
      time: presetTime || '10:00 AM',
      durationMinutes: defaultType?.durationMinutes || 45,
      type: defaultType ? defaultType.name : '',
      room: '',
      fee: 0,
      status: 'Scheduled',
      notes: '',
    });
    setFormErrors({});
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    const matchedType = appointmentTypes.find((t) => t.name.toLowerCase() === apt.type.toLowerCase());
    const matchedTherapist = therapists.find((t) => t.name.toLowerCase() === apt.therapistName.toLowerCase());

    setFormData({
      patientId: apt.patientId || '',
      patientName: apt.patientName || '',
      patientPhone: apt.patientPhone || '',
      patientEmail: apt.patientEmail || '',
      therapistId: matchedTherapist ? matchedTherapist.id : (apt.therapistId || ''),
      therapistName: apt.therapistName,
      appointmentTypeId: matchedType ? matchedType.id : (appointmentTypes[0]?.id || 1),
      date: apt.date,
      time: apt.time,
      durationMinutes: apt.durationMinutes || 45,
      type: apt.type,
      room: apt.room || '',
      fee: apt.fee !== undefined ? apt.fee : 0,
      status: apt.status,
      notes: apt.notes || '',
    });
    setFormErrors({});
    setConflictWarning(null);
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

  const handleTherapistSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const staff = therapists.find((t) => t.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      therapistId: selectedId,
      therapistName: staff ? staff.name : prev.therapistName,
    }));
  };

  const handleAppointmentTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = parseInt(e.target.value, 10);
    const selectedType = appointmentTypes.find((t) => t.id === typeId);
    setFormData((prev) => ({
      ...prev,
      appointmentTypeId: typeId,
      type: selectedType ? selectedType.name : prev.type,
      durationMinutes: selectedType?.durationMinutes || prev.durationMinutes,
    }));
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes' || name === 'fee' ? Number(value) : value,
    }));
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
        await appointmentService.create({
          patientId: formData.patientId || '1',
          therapistId: formData.therapistId || '1',
          appointmentTypeId: formData.appointmentTypeId,
          date: formData.date,
          time: formData.time,
          durationMinutes: formData.durationMinutes,
          type: formData.type,
          notes: formData.notes,
        });
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

  const formattedDateTitle = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  const statusCounts = useMemo(() => {
    const counts = { All: appointments.length, Scheduled: 0, Completed: 0, Cancelled: 0, 'No Show': 0 };
    for (const a of appointments) {
      if (counts[a.status] !== undefined) counts[a.status]++;
    }
    return counts;
  }, [appointments]);

  const dateAppointments = useMemo(() => {
    return filteredAppointments.filter((apt) => apt.date === selectedDate);
  }, [filteredAppointments, selectedDate]);

  const isFiltered = selectedTherapist !== 'All' || statusFilter !== 'All' || searchQuery.trim() !== '';

  const closestTargetInfo = useMemo(() => {
    if (dateAppointments.length > 0 || filteredAppointments.length === 0) {
      return null;
    }

    const uniqueDates = Array.from(new Set(filteredAppointments.map((a) => a.date)));
    const currentTs = new Date(selectedDate + 'T00:00:00').getTime();

    let bestDate = uniqueDates[0];
    let minDiff = Math.abs(new Date(bestDate + 'T00:00:00').getTime() - currentTs);

    for (let i = 1; i < uniqueDates.length; i++) {
      const d = uniqueDates[i];
      const diff = Math.abs(new Date(d + 'T00:00:00').getTime() - currentTs);
      if (diff < minDiff) {
        minDiff = diff;
        bestDate = d;
      } else if (diff === minDiff) {
        if (d > selectedDate) {
          bestDate = d;
        }
      }
    }

    const countOnTargetDate = filteredAppointments.filter((a) => a.date === bestDate).length;

    return {
      targetDate: bestDate,
      countOnTargetDate,
      totalMatching: filteredAppointments.length,
    };
  }, [dateAppointments.length, filteredAppointments, selectedDate]);

  const operatingHours = useMemo(() => {
    let startHour = 8;
    let endHour = 18;

    if (clinicSettings?.workingHoursStart) {
      const mins = timeToMinutes(clinicSettings.workingHoursStart);
      startHour = Math.floor(mins / 60);
    }
    if (clinicSettings?.workingHoursEnd) {
      const mins = timeToMinutes(clinicSettings.workingHoursEnd);
      if (mins > 0) endHour = Math.ceil(mins / 60);
    }

    if (startHour < 0) startHour = 0;
    if (endHour > 23) endHour = 23;
    if (startHour >= endHour) {
      startHour = 8;
      endHour = 18;
    }

    for (const apt of dateAppointments) {
      const aptMins = timeToMinutes(apt.time);
      const aptHour = Math.floor(aptMins / 60);
      if (aptHour < startHour) startHour = aptHour;
      if (aptHour > endHour) endHour = aptHour;
    }

    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      const label = minutesToTimeStr(h * 60);
      slots.push({ hour: h, label });
    }
    return slots;
  }, [clinicSettings, dateAppointments]);

  const bookingTimeOptions = useMemo(() => {
    let startHour = 8;
    let endHour = 18;

    if (clinicSettings?.workingHoursStart) {
      const mins = timeToMinutes(clinicSettings.workingHoursStart);
      startHour = Math.floor(mins / 60);
    }
    if (clinicSettings?.workingHoursEnd) {
      const mins = timeToMinutes(clinicSettings.workingHoursEnd);
      if (mins > 0) endHour = Math.ceil(mins / 60);
    }
    if (startHour >= endHour) {
      startHour = 8;
      endHour = 18;
    }

    const options: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      options.push(minutesToTimeStr(h * 60));
      if (h < endHour) {
        options.push(minutesToTimeStr(h * 60 + 30));
      }
    }
    return options;
  }, [clinicSettings]);

  const timelineSlots = useMemo(() => {
    return operatingHours.map((hourObj) => {
      const slotStartMin = hourObj.hour * 60;
      const slotEndMin = slotStartMin + 60;

      const apptsInSlot = dateAppointments.filter((apt) => {
        const aptStartMin = timeToMinutes(apt.time);
        return aptStartMin >= slotStartMin && aptStartMin < slotEndMin;
      });

      return {
        ...hourObj,
        appointments: apptsInSlot,
      };
    });
  }, [operatingHours, dateAppointments]);

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
                {therapists.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
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

      {/* Content */}
      {viewMode === 'timeline' ? (
        <Card className="timeline-card">
          <div className="timeline-container">
            <div className="timeline-header-meta">
              <span>
                Daily Timeline for <strong>{formattedDateTitle}</strong>
              </span>
              <span>{dateAppointments.length} appointment(s) on this day ({filteredAppointments.length} total)</span>
            </div>

            {closestTargetInfo && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1.25rem',
                  marginBottom: '1rem',
                  background: 'var(--bg-secondary, #1c2638)',
                  border: '1px solid var(--primary, #3b82f6)',
                  borderRadius: '8px',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => setSelectedDate(closestTargetInfo.targetDate)}
                title={`Click to jump to ${closestTargetInfo.targetDate}`}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  No appointments scheduled for <strong>{formattedDateTitle}</strong>
                  {isFiltered ? ' matching your active filter' : ''}. You have{' '}
                  <strong>{closestTargetInfo.countOnTargetDate}</strong> appointment(s) on{' '}
                  <strong>{closestTargetInfo.targetDate}</strong>
                  {closestTargetInfo.totalMatching > closestTargetInfo.countOnTargetDate
                    ? ` (${closestTargetInfo.totalMatching} total matching filter)`
                    : ''}
                  .
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(closestTargetInfo.targetDate);
                  }}
                >
                  Jump to {closestTargetInfo.targetDate}
                </Button>
              </div>
            )}

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
                              <span className="appointment-patient-name">
                                <User size={15} />
                                {apt.patientName}
                              </span>
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
                                {apt.room || '—'}
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
            data={filteredAppointments}
            isLoading={isLoading}
            emptyMessage="No appointments found for the selected criteria."
          />
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Select Patient *</label>
            <select
              className="therapist-select-control"
              style={{ width: '100%', marginBottom: '0.5rem' }}
              value={formData.patientId}
              onChange={handlePatientSelect}
            >
              <option value="">-- Choose Registered Patient --</option>
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
            <div>
              <label className="input-label">Physiotherapist *</label>
              <select
                name="therapistId"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.therapistId}
                onChange={handleTherapistSelect}
              >
                {therapists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Appointment Type *</label>
              <select
                name="appointmentTypeId"
                className="therapist-select-control"
                style={{ width: '100%' }}
                value={formData.appointmentTypeId}
                onChange={handleAppointmentTypeSelect}
              >
                {appointmentTypes.map((aptType) => (
                  <option key={aptType.id} value={aptType.id}>
                    {aptType.name} ({aptType.durationMinutes || 45} mins)
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
                {bookingTimeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {conflictWarning && (
            <div className="conflict-warning-box">
              <AlertTriangle size={20} />
              <div>{conflictWarning}</div>
            </div>
          )}

          <div>
            <label className="input-label">Clinical Notes / Reason for Visit</label>
            <textarea
              name="notes"
              className="form-textarea"
              rows={3}
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="e.g. Lumbar spine evaluation & posture assessment..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingAppointment ? 'Update Appointment' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
