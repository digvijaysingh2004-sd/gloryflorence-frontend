import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../components/common/Card';
import './AuthLayout.css';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-layout-container">
      {/* Decorative ambient background spots */}
      <div className="auth-layout-bg-shape auth-layout-bg-shape-1" />
      <div className="auth-layout-bg-shape auth-layout-bg-shape-2" />

      <div className="auth-card-wrapper">
        <Card className="auth-card">
          <Card.Body>
            <div className="auth-logo-section">
              <div className="auth-logo-icon">
                <Activity size={26} />
              </div>
              <h1 className="auth-logo-title">Glory Florence</h1>
              <span className="auth-logo-subtitle">Physiotherapy Management</span>
            </div>
            {children}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
