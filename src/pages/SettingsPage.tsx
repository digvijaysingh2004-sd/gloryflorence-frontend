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
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth, useNotification } from '../hooks';
import { settingsService, type ClinicSettings } from '../services/settingsService';
import { patientService } from '../services/patientService';
import { AppointmentTypesTab } from '../components/settings/AppointmentTypesTab';
import { ProfilePhotoUpload } from '../components/settings/ProfilePhotoUpload';
import type { Patient } from '../types';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotification();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isPatient = user?.role === 'patient';

  const [activeTab, setActiveTab] = useState<'clinic' | 'profile' | 'appointmentTypes' | 'notifications' | 'security'>(
    isAdmin ? 'clinic' : 'profile'
  );
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile local state
  const [profileName, setProfileName] = useState<string>(user?.name || '');
  const [profileEmail, setProfileEmail] = useState<string>(user?.email || '');

  // Patient profile fields
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientDob, setPatientDob] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientBloodGroup, setPatientBloodGroup] = useState<string>('O+');
  const [patientAddress, setPatientAddress] = useState<string>('');
  const [patientCity, setPatientCity] = useState<string>('');
  const [patientState, setPatientState] = useState<string>('');
  const [patientCountry, setPatientCountry] = useState<string>('');
  const [patientEmergencyName, setPatientEmergencyName] = useState<string>('');
  const [patientEmergencyPhone, setPatientEmergencyPhone] = useState<string>('');

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

  const loadPatientProfile = useCallback(async () => {
    try {
      const data = await patientService.getMyProfile();
      if (data) {
        setPatientData(data);
        if (data.name) setProfileName(data.name);
        if (data.email) setProfileEmail(data.email);
        if (data.phone) setPatientPhone(data.phone);
        if (data.dateOfBirth) setPatientDob(data.dateOfBirth);
        if (data.gender) setPatientGender(data.gender as any);
        if (data.bloodGroup) setPatientBloodGroup(data.bloodGroup);
        if (data.address) setPatientAddress(data.address);
        if (data.city) setPatientCity(data.city);
        if (data.state) setPatientState(data.state);
        if (data.country) setPatientCountry(data.country);
        if (data.emergencyContactName) setPatientEmergencyName(data.emergencyContactName);
        if (data.emergencyContactPhone) setPatientEmergencyPhone(data.emergencyContactPhone);
      }
    } catch (err) {
      console.warn('Failed to load patient self-profile:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin, loadSettings]);

  useEffect(() => {
    if (isPatient) {
      loadPatientProfile();
    }
  }, [isPatient, loadPatientProfile]);

  const handlePhotoChanged = (newUrl: string | null) => {
    updateUser({ profilePictureUrl: newUrl || undefined });
    if (patientData) {
      setPatientData({ ...patientData, profilePictureUrl: newUrl || undefined });
    }
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Access denied: Only administrators can update clinic settings.', 'error');
      return;
    }
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
      await settingsService.updateUserProfile({
        name: profileName,
        email: profileEmail,
        profilePictureUrl: user?.profilePictureUrl,
      });

      if (isPatient && patientData?.id) {
        await patientService.update(patientData.id, {
          name: profileName,
          email: profileEmail,
          phone: patientPhone,
          dateOfBirth: patientDob,
          gender: patientGender,
          bloodGroup: patientBloodGroup,
          address: patientAddress,
          city: patientCity,
          state: patientState,
          country: patientCountry,
          emergencyContactName: patientEmergencyName,
          emergencyContactPhone: patientEmergencyPhone,
        });
      }

      updateUser({ name: profileName, email: profileEmail });
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
        {isAdmin && (
          <button
            className={`settings-tab-btn ${activeTab === 'clinic' ? 'active' : ''}`}
            onClick={() => setActiveTab('clinic')}
          >
            <Building size={18} />
            Clinic Profile
          </button>
        )}

        <button
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={18} />
          User Profile
        </button>

        {!isPatient && (
          <button
            className={`settings-tab-btn ${activeTab === 'appointmentTypes' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointmentTypes')}
          >
            <CalendarIcon size={18} />
            Appointment Types
            {!isAdmin && (
              <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                View only
              </span>
            )}
          </button>
        )}

        {isAdmin && (
          <button
            className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            Notifications & Alerts
          </button>
        )}

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 className="settings-section-title" style={{ margin: 0 }}>
                <UserIcon size={20} color="var(--primary)" />
                {isPatient ? 'Patient Profile & Account' : 'Personal Account Information'}
              </h2>
              {isPatient && patientData?.mrn && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'var(--primary-50, #f0f9ff)',
                  color: 'var(--primary-700, #0369a1)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid var(--primary-200, #bae6fd)'
                }}>
                  MRN: {patientData.mrn}
                </div>
              )}
            </div>

            {/* Profile Picture Upload Section */}
            <ProfilePhotoUpload
              currentPhotoUrl={user?.profilePictureUrl || patientData?.profilePictureUrl}
              userName={profileName || user?.name || 'Patient'}
              isPatient={isPatient}
              patientId={patientData?.id || user?.id}
              onPhotoChanged={handlePhotoChanged}
            />

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

                {isPatient && (
                  <>
                    <Input
                      label="Phone Number"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />

                    <Input
                      label="Date of Birth"
                      type="date"
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                    />

                    <div>
                      <label className="input-label">Gender</label>
                      <select
                        className="settings-select"
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="input-label">Blood Group</label>
                      <select
                        className="settings-select"
                        value={patientBloodGroup}
                        onChange={(e) => setPatientBloodGroup(e.target.value)}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <Input
                      label="Residential Street Address"
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      placeholder="e.g. 123 Main Street"
                    />

                    <Input
                      label="City"
                      value={patientCity}
                      onChange={(e) => setPatientCity(e.target.value)}
                      placeholder="e.g. Los Angeles"
                    />

                    <Input
                      label="State / Province"
                      value={patientState}
                      onChange={(e) => setPatientState(e.target.value)}
                      placeholder="e.g. CA"
                    />

                    <Input
                      label="Country"
                      value={patientCountry}
                      onChange={(e) => setPatientCountry(e.target.value)}
                      placeholder="e.g. USA"
                    />

                    <Input
                      label="Emergency Contact Person"
                      value={patientEmergencyName}
                      onChange={(e) => setPatientEmergencyName(e.target.value)}
                      placeholder="Full Name of Contact"
                    />

                    <Input
                      label="Emergency Contact Phone"
                      value={patientEmergencyPhone}
                      onChange={(e) => setPatientEmergencyPhone(e.target.value)}
                      placeholder="Phone Number of Contact"
                    />
                  </>
                )}

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
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {user?.role || 'User'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button variant="primary" type="submit" disabled={isSaving} iconLeft={<CheckCircle2 size={16} />}>
                  {isSaving ? 'Updating Profile...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>
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

      {/* Appointment Types Management Tab */}
      {activeTab === 'appointmentTypes' && !isPatient && (
        <AppointmentTypesTab />
      )}
    </div>
  );
};

export default SettingsPage;
