import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Activity,
  CreditCard,
  Plus,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Table, type Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useNotification } from '../context/NotificationContext';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import type { Appointment } from '../types';
import api from '../services/api';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { showToast } = useNotification();
  
  // State for loading state demonstration
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState('');
  const [newPhysio, setNewPhysio] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newTreatment, setNewTreatment] = useState('');

  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activePatientCount, setActivePatientCount] = useState<number>(0);

  // Computed metrics
  const completedTodayCount = React.useMemo(
    () => appointments.filter((a) => a.status === 'Completed').length,
    [appointments]
  );
  const activeSessionsCount = React.useMemo(
    () => appointments.filter((a) => a.status === 'Scheduled').length,
    [appointments]
  );
  const totalPendingFee = React.useMemo(
    () => appointments.reduce((sum, a) => sum + (a.fee || 65), 0),
    [appointments]
  );

  // Load appointments and patients from services
  const loadDashboardData = React.useCallback(async () => {
    setIsTableLoading(true);
    try {
      const [apptsData, patientsData] = await Promise.all([
        appointmentService.getAll({ date: new Date().toISOString().split('T')[0] }),
        patientService.getAll(),
      ]);
      setAppointments(apptsData);
      setActivePatientCount(patientsData.length);
    } catch {
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setIsTableLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Form Submission inside Modal
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.trim() || !newPhysio.trim() || !newTime.trim() || !newTreatment.trim()) {
      showToast('Please fill out all required appointment fields.', 'warning');
      return;
    }

    try {
      await appointmentService.create({
        patientName: newPatient,
        therapistName: newPhysio,
        time: newTime,
        type: newTreatment,
        date: new Date().toISOString().split('T')[0],
        status: 'Scheduled',
      });
      showToast(`Appointment scheduled for ${newPatient} successfully!`, 'success');
      setNewPatient('');
      setNewPhysio('');
      setNewTime('');
      setNewTreatment('');
      setIsModalOpen(false);
      loadDashboardData();
    } catch {
      showToast('Failed to schedule appointment.', 'error');
    }
  };

  // Simulate API error handling
  const handleSimulateApiError = async () => {
    showToast('Triggering endpoint request...', 'info', 1500);
    try {
      // Calls a non-existent route to trigger Axios response error interceptor
      await api.get('/non-existent-endpoint-demo-404-error');
    } catch (e) {
      // The interceptor automatically broadcasts this error and displays it as a Toast.
      // No extra logic needed here.
    }
  };

  const handleSimulateAuthExpiration = () => {
    showToast('Simulating session expiration...', 'info', 1500);
    setTimeout(() => {
      // Manually trigger a 401 broadcast to force redirect
      window.dispatchEvent(new Event('gf-auth-logout'));
    }, 1000);
  };

  // Table Column Definitions
  const columns: Column<Appointment>[] = [
    {
      key: 'patientName',
      title: 'Patient Name',
      render: (item) => (
        <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{item.patientName}</span>
      ),
    },
    {
      key: 'therapistName',
      title: 'Physiotherapist',
      render: (item) => (
        <span>{item.therapistName || 'Dr. Glory Physiotherapist'}</span>
      ),
    },
    { key: 'time', title: 'Scheduled Time', width: '130px' },
    {
      key: 'type',
      title: 'Treatment Protocol',
      render: (item) => <span>{item.type || 'Physiotherapy Session'}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      width: '120px',
      render: (item) => (
        <span className={`badge badge-${item.status}`}>{item.status}</span>
      ),
    },
  ];

  return (
    <div>
      {/* 1. Metrics Grid */}
      <div className="dashboard-grid">
        <Card hoverable>
          <Card.Body className="metric-card-content">
            <div className="metric-card-info">
              <span className="metric-card-label">Patients Active</span>
              <span className="metric-card-value">{activePatientCount}</span>
              <span className="metric-card-trend metric-card-trend-up">
                ▲ Registered Patients
              </span>
            </div>
            <div className="metric-card-icon-container">
              <Users size={24} />
            </div>
          </Card.Body>
        </Card>

        <Card hoverable>
          <Card.Body className="metric-card-content">
            <div className="metric-card-info">
              <span className="metric-card-label">Today's Visits</span>
              <span className="metric-card-value">{appointments.length}</span>
              <span className="metric-card-trend metric-card-trend-up">
                ▲ {completedTodayCount} completed
              </span>
            </div>
            <div className="metric-card-icon-container">
              <Calendar size={24} />
            </div>
          </Card.Body>
        </Card>

        <Card hoverable>
          <Card.Body className="metric-card-content">
            <div className="metric-card-info">
              <span className="metric-card-label">Sessions Scheduled</span>
              <span className="metric-card-value">{activeSessionsCount}</span>
              <span className="metric-card-trend metric-card-trend-up">
                ▲ Active Today
              </span>
            </div>
            <div className="metric-card-icon-container">
              <Activity size={24} />
            </div>
          </Card.Body>
        </Card>

        <Card hoverable>
          <Card.Body className="metric-card-content">
            <div className="metric-card-info">
              <span className="metric-card-label">Estimated Today Fee</span>
              <span className="metric-card-value">${totalPendingFee}</span>
              <span className="metric-card-trend metric-card-trend-up">
                ▲ Today's Visits Fee
              </span>
            </div>
            <div className="metric-card-icon-container">
              <CreditCard size={24} />
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* 2. Main Dashboard Row */}
      <div className="dashboard-details-row">
        {/* Left Side: Recent Appointments Table */}
        <Card>
          <Card.Header
            title="Today's Session Schedule"
            subtitle="Real-time patient scheduling and clinical status overview"
            action={
              <Button
                variant="outline"
                size="sm"
                iconLeft={<RefreshCw size={14} />}
                onClick={() => {
                  setIsTableLoading(true);
                  setTimeout(() => setIsTableLoading(false), 1200);
                  showToast('Appointment list reloaded', 'info');
                }}
              >
                Sync
              </Button>
            }
          />
          <Card.Body style={{ padding: 0 }}>
            <Table
              columns={columns}
              data={appointments}
              isLoading={isTableLoading}
              emptyMessage="No appointments scheduled for today."
            />
          </Card.Body>
        </Card>

        {/* Right Side: Quick Actions Panel */}
        <Card style={{ height: 'fit-content' }}>
          <Card.Header title="Operations Console" />
          <Card.Body className="quick-actions-list">
            <Button
              className="quick-action-btn"
              variant="primary"
              iconLeft={<Plus size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              Book Appointment
            </Button>
            
            <Button
              className="quick-action-btn"
              variant="outline"
              iconLeft={<RefreshCw size={18} />}
              onClick={() => {
                setIsTableLoading(true);
                setTimeout(() => setIsTableLoading(false), 2000);
              }}
            >
              Toggle Table Loading
            </Button>

            <Button
              className="quick-action-btn"
              variant="danger"
              iconLeft={<AlertTriangle size={18} />}
              onClick={handleSimulateApiError}
            >
              Simulate API Error
            </Button>

            <Button
              className="quick-action-btn"
              variant="secondary"
              iconLeft={<Sparkles size={18} />}
              onClick={handleSimulateAuthExpiration}
            >
              Simulate 401 Logout
            </Button>
          </Card.Body>
        </Card>
      </div>

      {/* 3. New Appointment Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Treatment Session"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAppointment}>
              Save Schedule
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAppointment}>
          <Input
            label="Patient Name"
            placeholder="Enter patient full name"
            value={newPatient}
            onChange={(e) => setNewPatient(e.target.value)}
            required
          />

          <Input
            label="Physiotherapist"
            placeholder="Select or enter physiotherapist name"
            value={newPhysio}
            onChange={(e) => setNewPhysio(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Session Time"
              placeholder="e.g. 10:00 AM"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
            <Input
              label="Treatment Protocol"
              placeholder="e.g. Physical Therapy"
              value={newTreatment}
              onChange={(e) => setNewTreatment(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default DashboardPage;
