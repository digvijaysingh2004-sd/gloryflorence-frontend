import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import './NotFoundPage.css'; // Reusing layout styles

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <Card className="notfound-card">
        <Card.Body className="notfound-content">
          <span className="notfound-code" style={{ background: 'linear-gradient(135deg, var(--danger-500) 0%, var(--danger-700) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            403
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-600)' }}>
            <ShieldAlert size={24} />
            <h1 className="notfound-title" style={{ margin: 0 }}>Access Denied</h1>
          </div>
          <p className="notfound-desc">
            You do not have the required permissions to view this clinical console module. Please contact the system administrator if you believe this is an error.
          </p>
          <Button
            className="notfound-btn"
            variant="outline"
            iconLeft={<ArrowLeft size={18} />}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
