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
import api from '../services/api';
import './DashboardPage.css';

interface Appointment {
  id: string;
  patientName: string;
  physioName: string;
  time: string;
  treatment: string;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled';
}

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

  // Table Data State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'apt_1',
      patientName: 'Emma Watson',
      physioName: 'Dr. Glory Florence',
      time: '09:30 AM',
      treatment: 'Spinal Decompression',
      status: 'completed',
    },
    {
      id: 'apt_2',
      patientName: 'John Doe',
      physioName: 'Alex Mercer',
      time: '11:00 AM',
      treatment: 'Knee Joint Mobilization',
      status: 'scheduled',
    },
    {
      id: 'apt_3',
      patientName: 'Sarah Jenkins',
      physioName: 'Dr. Glory Florence',
      time: '02:00 PM',
      treatment: 'Cervical Traction',
      status: 'pending',
    },
    {
      id: 'apt_4',
      patientName: 'Michael Chang',
      physioName: 'Emma Stone',
      time: '04:30 PM',
      treatment: 'Myofascial Release',
      status: 'scheduled',
    },
  ]);

  // Handle Form Submission inside Modal
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient || !newPhysio || !newTime || !newTreatment) {
      showToast('Please fill out all fields', 'warning');
      return;
    }

    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientName: newPatient,
      physioName: newPhysio,
      time: newTime,
      treatment: newTreatment,
      status: 'scheduled',
    };

    setAppointments((prev) => [newApt, ...prev]);
    showToast(`Appointment scheduled for ${newPatient} successfully!`, 'success');
    
    // Clear inputs and close modal
    setNewPatient('');
    setNewPhysio('');
    setNewTime('');
    setNewTreatment('');
    setIsModalOpen(false);
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
    { key: 'physioName', title: 'Physiotherapist' },
    { key: 'time', title: 'Scheduled Time', width: '130px' },
    { key: 'treatment', title: 'Treatment Protocol' },
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
              <span className="metric-card-value">128</span>
              <span className="metric-card-trend metric-card-trend-up">
                ▲ +8% this week
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
                ▲ 4 completed
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
              <span className="metric-card-label">Sessions Active</span>
              <span className="metric-card-value">8</span>
              <span className="metric-card-trend metric-card-trend-down">
                ▼ -2 from yesterday
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
              <span className="metric-card-label">Billing Pending</span>
              <span className="metric-card-value">$2,450</span>
              <span className="metric-card-trend metric-card-trend-up">
                ▲ +$350 today
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
            placeholder="e.g. Robert Downey Jr."
            value={newPatient}
            onChange={(e) => setNewPatient(e.target.value)}
            required
          />

          <Input
            label="Physiotherapist"
            placeholder="e.g. Dr. Glory Florence"
            value={newPhysio}
            onChange={(e) => setNewPhysio(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Session Time"
              placeholder="e.g. 03:30 PM"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
            <Input
              label="Treatment Protocol"
              placeholder="e.g. Electrotherapy"
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
