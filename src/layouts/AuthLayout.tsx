import React from 'react';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Users } from 'lucide-react';
import './AuthLayout.css';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-layout-container">
      {/* Background ambient lighting */}
      <div className="auth-bg-blob blob-1" />
      <div className="auth-bg-blob blob-2" />

      <div className="auth-split-wrapper">
        {/* Left Branding / Hero Side */}
        <div className="auth-hero-section">
          <div className="auth-hero-brand">
            <div className="auth-brand-logo">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="auth-brand-title">Glory Florence</h1>
              <p className="auth-brand-tagline">Clinical & Physiotherapy Management</p>
            </div>
          </div>

          <div className="auth-hero-body">
            <h2 className="auth-hero-heading">Elevate Clinical Care & Patient Recovery</h2>
            <p className="auth-hero-description">
              Streamline assessments, exercise prescriptions, appointment scheduling, and patient billing with our next-generation EMR platform.
            </p>

            <div className="auth-hero-features">
              <div className="auth-feature-pill">
                <ShieldCheck size={18} />
                <span>HIPAA Compliant Security</span>
              </div>
              <div className="auth-feature-pill">
                <HeartPulse size={18} />
                <span>Real-time Clinical Vitals</span>
              </div>
              <div className="auth-feature-pill">
                <Stethoscope size={18} />
                <span>Exercise Prescriptions</span>
              </div>
              <div className="auth-feature-pill">
                <Users size={18} />
                <span>Multi-role Access Control</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>© 2026 Glory Florence Health Systems. All rights reserved.</span>
          </div>
        </div>

        {/* Right Form Card Side */}
        <div className="auth-form-section">
          <div className="auth-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
