import React from 'react';
import { Kanban, Settings as SettingsIcon, CreditCard, Calendar, Users2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/FeedbackStates';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const getIcon = () => {
    const size = 48;
    switch (title.toLowerCase()) {
      case 'patients':
        return <Users2 size={size} />;
      case 'appointments':
        return <Calendar size={size} />;
      case 'treatments':
        return <Kanban size={size} />;
      case 'billing':
        return <CreditCard size={size} />;
      case 'settings':
        return <SettingsIcon size={size} />;
      default:
        return undefined;
    }
  };

  return (
    <div>
      <Card style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card.Body>
          <EmptyState
            title={`${title} Module`}
            description={`This module is currently in phase-2 development. The structure is configured and ready for implementation details.`}
            icon={getIcon()}
            actionLabel="Return to Dashboard"
            onAction={() => window.location.href = '/'}
          />
        </Card.Body>
      </Card>
    </div>
  );
};
export default PlaceholderPage;
