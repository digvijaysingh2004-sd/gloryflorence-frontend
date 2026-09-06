import React from 'react';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { Button } from './Button';
import './FeedbackStates.css';

// 1. Spinner Loader
interface SpinnerProps {
  message?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className="spinner" />
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );
};

// 2. Skeleton Box
interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const styles: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`skeleton skeleton-${variant} shimmer ${className}`}
      style={styles}
    />
  );
};

// 3. Empty State Card
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`feedback-state ${className}`}>
      <div className="feedback-icon-container">
        {icon || <FolderOpen size={32} />}
      </div>
      <h3 className="feedback-title">{title}</h3>
      <p className="feedback-desc">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="feedback-action" variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// 4. Error State Panel
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`feedback-state feedback-state-error ${className}`}>
      <div className="feedback-icon-container">
        <AlertCircle size={32} />
      </div>
      <h3 className="feedback-title">{title}</h3>
      <p className="feedback-desc">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} className="feedback-action" variant="danger" size="sm">
          Retry
        </Button>
      )}
    </div>
  );
};
