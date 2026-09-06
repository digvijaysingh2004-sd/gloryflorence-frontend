import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import type { Toast, ToastType } from '../types';
import '../components/common/Toast.css';

interface NotificationContextProps {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  useEffect(() => {
    const handleGlobalError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; status?: number }>;
      showToast(customEvent.detail.message, 'error');
    };

    window.addEventListener('gf-toast-error', handleGlobalError as EventListener);
    return () => {
      window.removeEventListener('gf-toast-error', handleGlobalError as EventListener);
    };
  }, [showToast]);

  const getIcon = (type: ToastType) => {
    const size = 20;
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon" size={size} />;
      case 'error':
        return <XCircle className="toast-icon" size={size} />;
      case 'warning':
        return <AlertTriangle className="toast-icon" size={size} />;
      case 'info':
        return <Info className="toast-icon" size={size} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container" id="toast-root">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <span className="toast-icon-container">{getIcon(toast.type)}</span>
            <div className="toast-content">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
