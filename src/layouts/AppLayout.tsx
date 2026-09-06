import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  Layers,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const rawNavigationItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'superadmin', 'physiotherapist', 'doctor', 'receptionist', 'accountant', 'patient'] },
    { label: 'Patients', path: '/patients', icon: <Users size={20} />, roles: ['admin', 'superadmin', 'physiotherapist', 'doctor', 'receptionist'] },
    { label: 'Appointments', path: '/appointments', icon: <Calendar size={20} />, roles: ['admin', 'superadmin', 'physiotherapist', 'doctor', 'receptionist', 'patient'] },
    { label: 'Treatments', path: '/treatments', icon: <Layers size={20} />, roles: ['admin', 'superadmin', 'physiotherapist', 'doctor'] },
    { label: 'Billing', path: '/billing', icon: <CreditCard size={20} />, roles: ['admin', 'superadmin', 'accountant'] },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['admin', 'superadmin', 'physiotherapist', 'doctor', 'receptionist', 'accountant', 'patient'] },
  ];

  const navigationItems = rawNavigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const getPageTitle = () => {
    const currentItem = rawNavigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Management System';
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  // Get first letter of names for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Activity size={24} />
          </div>
          <span className={`sidebar-brand-text ${isCollapsed ? 'sidebar-brand-text-collapsed' : ''}`}>
            Glory Florence
          </span>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className={`sidebar-nav-label ${isCollapsed ? 'sidebar-nav-label-collapsed' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-toggle-btn"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="header">
          <div className="header-left">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="header-mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="header-title-container">
              <h2 className="header-title">{getPageTitle()}</h2>
            </div>
          </div>

          <div className="header-right">
            {user && (
              <div className="header-user-profile">
                <div className="header-user-avatar">
                  {getInitials(user.name)}
                </div>
                <div className="header-user-info">
                  <span className="header-user-name">{user.name}</span>
                  <span className="header-user-role">{user.role}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={logout}
              className="header-logout-btn"
              title="Logout"
              aria-label="Logout button"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Page Layout */}
        <main className="main-content">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
