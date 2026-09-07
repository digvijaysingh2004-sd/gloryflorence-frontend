import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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

  // Retrieve redirect route from state, default to root dashboard
  const redirectPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

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
    <div className="login-page-wrapper">
      <div className="login-form-header">
        <h2 className="login-form-title">Account Sign In</h2>
        <p className="login-form-subtitle">Enter your clinical credentials to access your console</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <Input
          label="Username or Email"
          type="text"
          placeholder="e.g. therapist or admin@gloryflorence.com"
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

        <div className="login-credentials-helper">
          💡 <strong>Backend Seed Accounts (.NET 8):</strong>
          <br />
          Therapist: <code>therapist</code> / <code>Therapist123!</code>
          <br />
          Admin: <code>admin</code> / <code>Admin123!</code>
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            (Or offline demo: <code>admin@gloryflorence.com</code> / <code>admin123</code>)
          </span>
        </div>
      </form>
    </div>
  );
};
