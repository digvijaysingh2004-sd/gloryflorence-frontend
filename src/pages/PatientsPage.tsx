import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserPlus, Filter, Edit, Eye, Trash2 } from 'lucide-react';
import { Table, type Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { patientService } from '../services/patientService';
import type { Patient } from '../types';
import './PatientsPage.css';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Core Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '',
    bloodGroup: 'O+',
    address: '',
    city: '',
    state: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    status: 'Active' as 'Active' | 'Inactive',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getAll({
        search,
        status: statusFilter,
        gender: genderFilter,
      });
      setPatients(data);
    } catch {
      showToast('Failed to load patients data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, genderFilter, showToast]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenderFilter(e.target.value);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await patientService.create(formData);
      showToast(`Patient "${formData.name}" added successfully.`, 'success');
      setIsAddModalOpen(false);
      loadPatients();
    } catch {
      showToast('Failed to register new patient.', 'error');
    }
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      city: patient.city,
      state: patient.state,
      country: patient.country,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      status: patient.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!validateForm()) return;

    try {
      await patientService.update(selectedPatient.id, formData);
      showToast(`Patient info for "${formData.name}" updated successfully.`, 'success');
      setIsEditModalOpen(false);
      loadPatients();
    } catch {
      showToast('Failed to update patient info.', 'error');
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete patient "${name}"?`)) {
      try {
        await patientService.delete(id);
        showToast(`Patient "${name}" has been deleted.`, 'info');
        loadPatients();
      } catch {
        showToast('Failed to delete patient.', 'error');
      }
    }
  };

  // Calculate age based on birth date
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

  // Table Columns config
  const columns: Column<Patient>[] = [
    {
      key: 'name',
      title: 'Name',
      render: (patient) => (
        <div className="patient-table-cell-name">
          <div className="patient-avatar-placeholder">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="patient-row-fullname">{patient.name}</div>
            <div className="patient-row-subtext">ID: {patient.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      title: 'Gender / Age',
      render: (patient) => (
        <div>
          <span>{patient.gender}</span>
          <span className="patient-age-badge">{calculateAge(patient.dateOfBirth)} yrs</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Contact Details',
      render: (patient) => (
        <div>
          <div className="patient-row-phone">{patient.phone}</div>
          <div className="patient-row-subtext">{patient.email || 'No email'}</div>
        </div>
      ),
    },
    {
      key: 'bloodGroup',
      title: 'Blood Group',
      width: '100px',
    },
    {
      key: 'status',
      title: 'Status',
      width: '120px',
      render: (patient) => (
        <span className={`status-badge status-badge-${patient.status.toLowerCase()}`}>
          {patient.status}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '150px',
      render: (patient) => (
        <div className="patient-actions-cell" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="patient-btn-action btn-view"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openEditModal(patient)}
            className="patient-btn-action btn-edit"
            title="Edit Info"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeletePatient(patient.id, patient.name)}
            className="patient-btn-action btn-delete"
            title="Delete Patient"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="patients-page-container">
      {/* Top Banner Dashboard Actions */}
      <div className="patients-header-actions animate-slide-in">
        <div>
          <p className="patients-subtitle">Manage medical profiles, history, and treatment plans.</p>
        </div>
        <Button onClick={openAddModal} variant="primary" iconLeft={<Plus size={18} />}>
          Register Patient
        </Button>
      </div>

      {/* Filters Bar Card */}
      <Card className="patients-filter-card animate-slide-in">
        <div className="patients-filters-row">
          <div className="search-box-wrapper">
            <Input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={handleSearchChange}
              iconLeft={<Search size={18} />}
              className="patients-search-input"
            />
          </div>

          <div className="filters-selectors-wrapper">
            <div className="filter-select-group">
              <label className="select-label">
                <Filter size={14} /> Status
              </label>
              <select value={statusFilter} onChange={handleStatusChange} className="filter-select">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="filter-select-group">
              <label className="select-label">
                <Filter size={14} /> Gender
              </label>
              <select value={genderFilter} onChange={handleGenderChange} className="filter-select">
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table Grid */}
      <Card className="patients-table-card animate-slide-in" style={{ padding: 0 }}>
        <Table
          columns={columns}
          data={patients}
          isLoading={isLoading}
          emptyMessage="No patients match the search criteria."
          onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
        />
      </Card>

      {/* ADD PATIENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="patient-form">
          <h4 className="form-section-title">
            <UserPlus size={18} /> Primary Credentials
          </h4>
          <div className="form-grid-3">
            <Input
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              placeholder="e.g. Emily Watson"
            />
            <Input
              label="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={formErrors.phone}
              placeholder="e.g. +1 (555) 019-2834"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              placeholder="e.g. emily@gmail.com"
            />
          </div>

          <div className="form-grid-3">
            <div className="input-group">
              <label className="input-label">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Date of Birth *"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={formErrors.dateOfBirth}
            />
            <div className="input-group">
              <label className="input-label">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <h4 className="form-section-title" style={{ marginTop: '1.5rem' }}>
            📍 Address Information
          </h4>
          <div className="form-grid-2">
            <Input
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 42 Wallaby Way"
            />
            <div className="form-grid-3" style={{ gap: '0.75rem', margin: 0, padding: 0 }}>
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Sydney"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="NSW"
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Australia"
              />
            </div>
          </div>

          <h4 className="form-section-title" style={{ marginTop: '1.5rem' }}>
            🚨 Emergency Contact
          </h4>
          <div className="form-grid-2">
            <Input
              label="Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              placeholder="e.g. John Watson"
            />
            <Input
              label="Contact Phone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              placeholder="e.g. +1 (555) 019-2835"
            />
          </div>

          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PATIENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Details"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="patient-form">
          <h4 className="form-section-title">Primary Credentials</h4>
          <div className="form-grid-3">
            <Input
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
            />
            <Input
              label="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={formErrors.phone}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
            />
          </div>

          <div className="form-grid-3">
            <div className="input-group">
              <label className="input-label">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Date of Birth *"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={formErrors.dateOfBirth}
            />
            <div className="input-group">
              <label className="input-label">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="input-group">
              <label className="input-label">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <h4 className="form-section-title" style={{ marginTop: '1.5rem' }}>
            📍 Address Information
          </h4>
          <div className="form-grid-2">
            <Input
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <div className="form-grid-3" style={{ gap: '0.75rem', margin: 0, padding: 0 }}>
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <h4 className="form-section-title" style={{ marginTop: '1.5rem' }}>
            🚨 Emergency Contact
          </h4>
          <div className="form-grid-2">
            <Input
              label="Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
            />
            <Input
              label="Contact Phone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-actions-container">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
