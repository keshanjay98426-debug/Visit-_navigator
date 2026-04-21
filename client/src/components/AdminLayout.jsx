import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Tags, 
  Navigation, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/locations', icon: <MapPin size={20} />, label: 'Locations' },
    { path: '/admin/categories', icon: <Tags size={20} />, label: 'Categories' },
    { path: '/admin/multi-route', icon: <Navigation size={20} />, label: 'Multi-Route' },
  ];

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const username = localStorage.getItem('username') || 'Administrator';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <div className="admin-container">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content logout-confirm">
            <div className="modal-icon warning">
              <LogOut size={32} />
            </div>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to end your session? You will need to login again to access the admin area.</p>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="confirm-btn delete" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-text">Visit<span>Admin</span></span>
          </div>
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={20} />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="toggle-sidebar" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <Menu size={20} />
            </button>
            <h1 className="page-title">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <div className="profile-info">
                <span className="admin-name">{username}</span>
                <span className="admin-role">Super Admin</span>
              </div>
              <div className="profile-avatar">{username.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>


      </div>
  );
};

export default AdminLayout;