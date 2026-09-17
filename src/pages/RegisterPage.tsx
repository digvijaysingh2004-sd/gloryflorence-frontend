import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  MapPin,
  Heart,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth, useNotification } from '../hooks';
import type { RegisterPatientDto } from '../types/api.types';
import './RegisterPage.css';

export const RegisterPage: React.FC = () => {
  const { registerPatient } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.trim().length < 7) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the registration form.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RegisterPatientDto = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth
          ? `${formData.dateOfBirth}T00:00:00Z`
          : undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        medicalHistory: formData.medicalHistory.trim(),
      };

      const success = await registerPatient(payload);
      if (success) {
        navigate('/', { replace: true });
      }
    } catch {
      // Handled inside registerPatient with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page-wrapper animate-fade-in">
      <div className="register-form-header">
        <h2 className="register-form-title">Patient Portal Sign Up</h2>
        <p className="register-form-subtitle">
          Register to book clinical physiotherapy sessions and manage your care plan.
        </p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        {/* 1. Account Credentials */}
        <div className="register-section-heading">
          <ShieldCheck size={16} />
          <span>Account Credentials</span>
        </div>

        <div className="register-grid-2">
          <Input
            label="Email Address *"
            name="email"
            type="email"
            placeholder="e.g. yourname@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            iconLeft={<Mail size={16} />}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Phone Number *"
            name="phoneNumber"
            type="tel"
            placeholder="e.g. +1 234 567 8900"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            iconLeft={<Phone size={16} />}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="register-grid-2">
          <Input
            label="Create Password *"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            iconLeft={<Lock size={16} />}
            iconRight={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            onIconRightClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Confirm Password *"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            iconLeft={<Lock size={16} />}
            iconRight={showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            onIconRightClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* 2. Personal Information */}
        <div className="register-section-heading">
          <User size={16} />
          <span>Personal Information</span>
        </div>

        <div className="register-grid-2">
          <Input
            label="First Name *"
            name="firstName"
            placeholder="e.g. John"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Last Name *"
            name="lastName"
            placeholder="e.g. Doe"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="register-grid-2">
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            iconLeft={<Calendar size={16} />}
            disabled={isSubmitting}
          />

          <div className="register-select-wrapper">
            <label className="input-label">Gender</label>
            <select
              name="gender"
              className="register-select-control"
              value={formData.gender}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="register-grid-2">
          <div className="register-select-wrapper">
            <label className="input-label">Blood Group</label>
            <select
              name="bloodGroup"
              className="register-select-control"
              value={formData.bloodGroup}
              onChange={handleChange}
              disabled={isSubmitting}
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
            label="City"
            name="city"
            placeholder="e.g. New York"
            value={formData.city}
            onChange={handleChange}
            iconLeft={<MapPin size={16} />}
            disabled={isSubmitting}
          />
        </div>

        <Input
          label="Residential Street Address"
          name="address"
          placeholder="e.g. 123 Health Ave, Suite 4B"
          value={formData.address}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        {/* 3. Emergency Contact & Health */}
        <div className="register-section-heading">
          <Heart size={16} />
          <span>Emergency Contact & Chief Complaint</span>
        </div>

        <div className="register-grid-2">
          <Input
            label="Emergency Contact Name"
            name="emergencyContactName"
            placeholder="e.g. Jane Doe"
            value={formData.emergencyContactName}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <Input
            label="Emergency Contact Phone"
            name="emergencyContactPhone"
            placeholder="e.g. +1 987 654 3210"
            value={formData.emergencyContactPhone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="register-select-wrapper">
          <label className="input-label">Chief Medical Complaint / Reason for Therapy</label>
          <textarea
            name="medicalHistory"
            className="register-textarea"
            placeholder="Describe your current pain, injury, or therapy goals (e.g. lower back stiffness, sports rehab)..."
            value={formData.medicalHistory}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          className="register-submit-btn"
          loading={isSubmitting}
          size="lg"
          iconLeft={<Activity size={18} />}
        >
          Create Patient Account
        </Button>

        <div className="register-footer-prompt">
          Already have an account? <Link to="/login">Sign In here</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
