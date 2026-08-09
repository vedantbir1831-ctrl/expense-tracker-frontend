import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Coins, 
  Sliders, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Wallet,
  Globe
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { currency, changeCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: Coins },
    { id: 'budget', label: 'Budget Limits', icon: Sliders },
    { id: 'reports', label: 'Monthly Reports', icon: BarChart3 },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'S';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <div className="sidebar-logo">
          <Wallet style={{ color: 'white', width: '18px', height: '18px' }} />
        </div>
        <span className="sidebar-brand">Student Spend</span>
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Overlay when sidebar open on mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Wallet style={{ color: 'white', width: '22px', height: '22px' }} />
          </div>
          <span className="sidebar-brand">Student Spend</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">Menu</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}

          <span className="nav-label" style={{ marginTop: '16px' }}>Currency Preference</span>
          <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            <select
              className="form-input"
              style={{ 
                padding: '6px 24px 6px 8px', 
                fontSize: '12px', 
                background: 'var(--bg-card)',
                borderColor: 'var(--border)'
              }}
              value={currency.code}
              onChange={(e) => changeCurrency(e.target.value)}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={logout} title="Click to Sign Out">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Student'}</div>
              <div className="user-email">{user?.email || 'student@school.edu'}</div>
            </div>
            <LogOut style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
