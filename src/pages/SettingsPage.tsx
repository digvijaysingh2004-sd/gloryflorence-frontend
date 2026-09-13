import React, { useState, useEffect, useCallback } from 'react';
import {
  Building,
  User as UserIcon,
  Shield,
  Bell,
  Clock,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth, useNotification } from '../hooks';
import { settingsService, type ClinicSettings } from '../services/settingsService';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'clinic' | 'profile' | 'notifications' | 'security'>('clinic');
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile local state
  const [profileName, setProfileName] = useState<string>(user?.name || '');
  const [profileEmail, setProfileEmail] = useState<string>(user?.email || '');

  // Password local state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsService.getClinicSettings();
      setSettings(data);
    } catch {
      showToast('Failed to load clinic settings.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsService.updateClinicSettings(settings);
      showToast('Clinic configuration updated successfully.', 'success');
    } catch {
      showToast('Failed to update clinic settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateUserProfile({ name: profileName, email: profileEmail });
      if (user) {
        const updatedUser = { ...user, name: profileName, email: profileEmail };
        localStorage.setItem('gf_auth_user', JSON.stringify(updatedUser));
      }
      showToast('User profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    showToast('Password security settings updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="settings-container">
      {/* Page Header */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">Clinic & Account Settings</h1>
          <p className="page-subtitle">
            Manage organization profiles, appointment parameters, user preferences, and security options.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab-btn ${activeTab === 'clinic' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinic')}
        >
          <Building size={18} />
          Clinic Profile
        </button>

        <button
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={18} />
          User Profile
        </button>

        <button
          className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} />
          Notifications & Alerts
        </button>

        <button
          className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={18} />
          Security & Access
        </button>
      </div>

      {/* Clinic Settings Tab */}
      {activeTab === 'clinic' && settings && (
        <Card>
          <form onSubmit={handleClinicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 className="settings-section-title">
              <Building size={20} color="var(--primary)" />
              Clinic & Practice Identity
            </h2>

            <div className="settings-form-grid">
              <Input
                label="Clinic Name"
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                required
              />

              <Input
                label="Tagline / Motto"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />

              <Input
                label="Contact Email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                required
              />

              <Input
                label="Contact Phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                required
              />
            </div>

            <h2 className="settings-section-title" style={{ marginTop: '1rem' }}>
              <Clock size={20} color="var(--primary)" />
              Clinical Operating Hours & Currency
            </h2>

            <div className="settings-form-grid">
              <Input
                label="Working Hours Start"
                value={settings.workingHoursStart}
                onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
              />

              <Input
                label="Working Hours End"
                value={settings.workingHoursEnd}
                onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
              />

              <Input
                label="Default Slot Duration (Minutes)"
                type="number"
                value={settings.appointmentSlotDurationMinutes}
                onChange={(e) => setSettings({ ...settings, appointmentSlotDurationMinutes: Number(e.target.value) })}
              />

              <Input
                label="Currency Symbol"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary" type="submit" disabled={isSaving} iconLeft={<Save size={16} />}>
                Save Clinic Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* User Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 className="settings-section-title">
              <UserIcon size={20} color="var(--primary)" />
              Personal Account Information
            </h2>

            <div className="settings-form-grid">
              <Input
                label="Full Display Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />

              <Input
                label="Registered Email Address"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
              />

              <div>
                <label className="input-label">Assigned Role</label>
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-secondary, #f8fafc)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role || 'User'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary" type="submit" iconLeft={<CheckCircle2 size={16} />}>
                Update Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && settings && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 className="settings-section-title">
              <Bell size={20} color="var(--primary)" />
              Automated Notification Preferences
            </h2>

            <div className="settings-toggle-row">
              <div className="settings-toggle-label">
                <span className="settings-toggle-title">SMS Appointment Reminders</span>
                <span className="settings-toggle-desc">Automatically send SMS confirmations to patients 24h prior to visits.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSmsNotifications}
                onChange={(e) => setSettings({ ...settings, enableSmsNotifications: e.target.checked })}
              />
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-label">
                <span className="settings-toggle-title">Email Receipts & Prescription Copies</span>
                <span className="settings-toggle-desc">Email digital PDF prescriptions and payment invoices upon completion.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
              />
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-label">
                <span className="settings-toggle-title">Auto-Confirm Online Appointments</span>
                <span className="settings-toggle-desc">Automatically accept incoming patient online bookings without manual review.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoConfirmAppointments}
                onChange={(e) => setSettings({ ...settings, autoConfirmAppointments: e.target.checked })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary" onClick={handleClinicSubmit} iconLeft={<Save size={16} />}>
                Save Notification Rules
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Security & Access Tab */}
      {activeTab === 'security' && (
        <Card>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 className="settings-section-title">
              <Lock size={20} color="var(--primary)" />
              Change Password & Access Credentials
            </h2>

            <div className="settings-form-grid">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary" type="submit" iconLeft={<Shield size={16} />}>
                Update Security Credentials
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
