import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Shield,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Table, type Column } from '../common/Table';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { useAuth, useNotification } from '../../hooks';
import appointmentService from '../../services/appointmentService';
import type { AppointmentType } from '../../types';
import './AppointmentTypesTab.css';

interface AppointmentTypesTabProps {
  onTypesChanged?: () => void;
  isCompact?: boolean;
}

export const AppointmentTypesTab: React.FC<AppointmentTypesTabProps> = ({
  onTypesChanged,
  isCompact = false,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [deletingType, setDeletingType] = useState<AppointmentType | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    durationMinutes: 45,
    description: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadAppointmentTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pass undefined to fetch both active and inactive types for management
      const data = await appointmentService.fetchAppointmentTypesApi();
      setTypes(data as AppointmentType[]);
    } catch {
      showToast('Failed to load appointment types.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAppointmentTypes();
  }, [loadAppointmentTypes]);

  // Filtered list
  const filteredTypes = useMemo(() => {
    return types.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? t.isActive
          : !t.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [types, search, statusFilter]);

  const openCreateModal = () => {
    if (!isAdmin) {
      showToast('Access denied: Only administrators can create appointment types.', 'error');
      return;
    }
    setEditingType(null);
    setFormData({
      name: '',
      durationMinutes: 45,
      description: '',
      isActive: true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (type: AppointmentType) => {
    if (!isAdmin) {
      showToast('Access denied: Only administrators can edit appointment types.', 'error');
      return;
    }
    setEditingType(type);
    setFormData({
      name: type.name,
      durationMinutes: type.durationMinutes || 45,
      description: type.description || '',
      isActive: type.isActive ?? true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (type: AppointmentType) => {
    if (!isAdmin) {
      showToast('Access denied: Only administrators can delete appointment types.', 'error');
      return;
    }
    setDeletingType(type);
    setIsDeleteModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Appointment type name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      errors.durationMinutes = 'Duration must be greater than 0 minutes';
    } else if (formData.durationMinutes > 480) {
      errors.durationMinutes = 'Duration cannot exceed 480 minutes (8 hours)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Access denied: Only administrators can create or modify appointment types.', 'error');
      return;
    }
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingType) {
        // Update existing type
        await appointmentService.updateAppointmentType(editingType.id, {
          name: formData.name.trim(),
          durationMinutes: Number(formData.durationMinutes),
          description: formData.description.trim(),
          isActive: formData.isActive,
        });
        showToast(`Appointment type "${formData.name}" updated successfully.`, 'success');
      } else {
        // Create new type
        await appointmentService.createAppointmentType({
          name: formData.name.trim(),
          durationMinutes: Number(formData.durationMinutes),
          description: formData.description.trim(),
          isActive: formData.isActive,
        });
        showToast(`Appointment type "${formData.name}" created successfully.`, 'success');
      }

      setIsFormModalOpen(false);
      await loadAppointmentTypes();
      if (onTypesChanged) onTypesChanged();
    } catch {
      showToast(
        editingType
          ? 'Failed to update appointment type.'
          : 'Failed to create appointment type.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isAdmin) {
      showToast('Access denied: Only administrators can delete appointment types.', 'error');
      return;
    }
    if (!deletingType) return;
    setIsDeleting(true);
    try {
      await appointmentService.deleteAppointmentType(deletingType.id);
      showToast(`Appointment type "${deletingType.name}" deleted successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setDeletingType(null);
      await loadAppointmentTypes();
      if (onTypesChanged) onTypesChanged();
    } catch {
      showToast(
        'Failed to delete appointment type. It may be linked to existing appointments.',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = useCallback(async (type: AppointmentType) => {
    if (!isAdmin) {
      showToast('Access denied: Only administrators can change appointment type status.', 'error');
      return;
    }
    const nextStatus = !type.isActive;
    try {
      await appointmentService.updateAppointmentType(type.id, {
        name: type.name,
        durationMinutes: type.durationMinutes,
        description: type.description || '',
        isActive: nextStatus,
      });
      showToast(
        `"${type.name}" is now ${nextStatus ? 'active' : 'inactive'}.`,
        'info'
      );
      await loadAppointmentTypes();
      if (onTypesChanged) onTypesChanged();
    } catch {
      showToast('Failed to toggle appointment type status.', 'error');
    }
  }, [isAdmin, loadAppointmentTypes, onTypesChanged, showToast]);

  const columns = useMemo<Column<AppointmentType>[]>(() => {
    const cols: Column<AppointmentType>[] = [
      {
        key: 'name',
        title: 'Appointment Type',
        render: (item) => (
          <div className="type-name-cell">
            <div className="type-icon-badge">
              <Calendar size={16} />
            </div>
            <div>
              <div>{item.name}</div>
              {item.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {item.description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'durationMinutes',
        title: 'Default Duration',
        width: '160px',
        render: (item) => (
          <div className="duration-badge">
            <Clock size={14} />
            <span>{item.durationMinutes || 45} mins</span>
          </div>
        ),
      },
      {
        key: 'isActive',
        title: 'Status',
        width: '130px',
        render: (item) =>
          isAdmin ? (
            <button
              type="button"
              onClick={() => handleToggleStatus(item)}
              title="Click to toggle active state"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {item.isActive ? (
                <span className="status-badge-active">
                  <CheckCircle2 size={13} />
                  Active
                </span>
              ) : (
                <span className="status-badge-inactive">
                  <XCircle size={13} />
                  Inactive
                </span>
              )}
            </button>
          ) : (
            <span title="Status (Admin only toggle)">
              {item.isActive ? (
                <span className="status-badge-active">
                  <CheckCircle2 size={13} />
                  Active
                </span>
              ) : (
                <span className="status-badge-inactive">
                  <XCircle size={13} />
                  Inactive
                </span>
              )}
            </span>
          ),
      },
    ];

    if (isAdmin) {
      cols.push({
        key: 'actions',
        title: 'Actions',
        width: '110px',
        render: (item) => (
          <div className="type-actions">
            <button
              type="button"
              className="action-icon-btn"
              title="Edit type"
              onClick={() => openEditModal(item)}
            >
              <Edit size={15} />
            </button>
            <button
              type="button"
              className="action-icon-btn delete-btn"
              title="Delete type"
              onClick={() => openDeleteModal(item)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      });
    }

    return cols;
  }, [isAdmin, handleToggleStatus]);

  return (
    <div className="appointment-types-container">
      {/* Header / Actions */}
      <div className="appointment-types-header">
        {!isCompact && (
          <div className="appointment-types-title-group">
            <h2>
              <Calendar size={20} color="var(--primary)" />
              Appointment & Consultation Types
            </h2>
            <p>
              Manage configurable session types, duration slots, and clinical booking availability.
            </p>
          </div>
        )}

        <div className="appointment-types-controls" style={{ marginLeft: isCompact ? 0 : 'auto' }}>
          {!isAdmin && (
            <div className="types-readonly-notice">
              <Shield size={14} />
              <span>Admin only to create or modify</span>
            </div>
          )}

          <div className="types-search-input">
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="types-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAppointmentTypes}
            title="Refresh types list"
            iconLeft={<RotateCw size={14} />}
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              iconLeft={<Plus size={16} />}
            >
              New Type
            </Button>
          )}
        </div>
      </div>

      {/* Types Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredTypes}
          isLoading={isLoading}
          emptyMessage="No appointment types found. Click 'New Type' to add one."
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingType ? 'Edit Appointment Type' : 'Add New Appointment Type'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="type-form-modal">
          <Input
            label="Type Name *"
            placeholder="e.g. Initial Consultation, Follow-up Rehab, Hydrotherapy"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
            autoFocus
          />

          <div>
            <label className="input-label">Standard Duration (Minutes) *</label>
            <Input
              type="number"
              min={5}
              max={480}
              step={5}
              placeholder="45"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: Number(e.target.value) })
              }
              error={formErrors.durationMinutes}
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Standard scheduling slot allocated in the clinical calendar.
            </span>
          </div>

          <div>
            <label className="input-label">Description / Clinical Notes</label>
            <textarea
              className="type-form-textarea"
              placeholder="Brief description of clinical procedures involved in this session type..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <label className="type-form-checkbox-row">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span>Active for clinical scheduling and patient booking</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSaving}>
              {editingType ? 'Save Changes' : 'Create Type'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Appointment Type"
        size="sm"
      >
        <div className="delete-dialog-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
            <AlertTriangle size={24} />
            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Confirm Deletion</span>
          </div>

          <p className="delete-dialog-msg">
            Are you sure you want to delete <strong>"{deletingType?.name}"</strong>?
            <br />
            If appointments already use this type, consider setting it to <em>Inactive</em> instead.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
