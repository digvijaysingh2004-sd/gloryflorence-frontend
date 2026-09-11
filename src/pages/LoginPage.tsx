import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  Activity,
  Stethoscope,
  Headphones,
  DollarSign,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickRolesRef = useRef<HTMLDivElement>(null);

  // Retrieve redirect route from state, default to root dashboard
  const redirectPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const rolesList = [
    { label: 'Admin', email: 'admin@gloryflorence.com', pass: 'Admin123!', icon: <Shield size={14} /> },
    { label: 'Clinic Admin', email: 'clinicadmin@gloryflorence.com', pass: 'Admin123!', icon: <Building2 size={14} /> },
    { label: 'Therapist', email: 'therapist@gloryflorence.com', pass: 'Therapist123!', icon: <Activity size={14} /> },
    { label: 'Doctor', email: 'doctor@gloryflorence.com', pass: 'Doctor123!', icon: <Stethoscope size={14} /> },
    { label: 'Receptionist', email: 'receptionist@gloryflorence.com', pass: 'Receptionist123!', icon: <Headphones size={14} /> },
    { label: 'Accountant', email: 'accountant@gloryflorence.com', pass: 'Accountant123!', icon: <DollarSign size={14} /> },
    { label: 'Patient', email: 'patientuser@gloryflorence.com', pass: 'Patient123!', icon: <User size={14} /> },
  ];

  const quickFill = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setErrors({});
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Username or email address is required';
    } else if (email.includes('@') && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(redirectPath, { replace: true });
      }
    } catch {
      // Handled inside AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper animate-fade-in">
      <div className="login-form-header">
        <h2 className="login-form-title">Account Sign In</h2>
        <p className="login-form-subtitle">Enter your clinical credentials to access your console</p>
      </div>

      {/* Quick Demo Sign In Bar - Patient Details Tab Style */}
      <div className="login-quick-section">
        <div className="quick-roles-header">
          <UserCheck size={14} />
          <span>Quick Demo Sign In:</span>
        </div>

        <div className="quick-tabs-wrapper">
          <button
            type="button"
            className="quick-tabs-scroll-btn left"
            onClick={() => quickRolesRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="quick-tabs-bar" ref={quickRolesRef}>
            {rolesList.map((role) => {
              const isActive = email === role.email;
              return (
                <button
                  key={role.email}
                  type="button"
                  onClick={() => quickFill(role.email, role.pass)}
                  className={`quick-tab-btn ${isActive ? 'quick-tab-btn-active' : ''}`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="quick-tabs-scroll-btn right"
            onClick={() => quickRolesRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <Input
          label="Username or Email"
          type="text"
          placeholder="e.g. admin@gloryflorence.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          iconLeft={<Mail size={18} />}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          iconLeft={<Lock size={18} />}
          iconRight={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          onIconRightClick={() => setShowPassword(!showPassword)}
          disabled={isSubmitting}
          required
        />

        <div className="login-form-options">
          <label className="login-remember-me">
            <input
              type="checkbox"
              className="login-remember-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            Remember me
          </label>
          <button
            type="button"
            className="login-forgot-pwd"
            onClick={() => alert('Demo Feature: Contact system administrator for password resets.')}
            disabled={isSubmitting}
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          className="login-submit-btn"
          loading={isSubmitting}
          size="lg"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};
