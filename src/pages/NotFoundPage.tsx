import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <Card className="notfound-card">
        <Card.Body className="notfound-content">
          <span className="notfound-code">404</span>
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-desc">
            The page you are looking for does not exist or has been relocated within the clinical system.
          </p>
          <Button
            className="notfound-btn"
            variant="primary"
            iconLeft={<Home size={18} />}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};
export default NotFoundPage;
