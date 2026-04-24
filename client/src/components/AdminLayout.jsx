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

     =
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

      <style>{`
        :root {
          --sidebar-bg: #0f172a;
          --sidebar-hover: #1e293b;
          --sidebar-active: #3b82f6;
          --primary-blue: #3b82f6;
          --bg-gray: #f8fafc;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border-color: #e2e8f0;
          --card-bg: #ffffff;
          --sidebar-width: 260px;
        }

        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-gray);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
        }

        .admin-sidebar {
          width: var(--sidebar-width);
          background-color: var(--sidebar-bg);
          color: #fff;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .admin-sidebar.closed {
          width: 80px;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .logo-text span {
          color: var(--primary-blue);
        }

        .admin-sidebar.closed .logo-text,
        .admin-sidebar.closed .nav-label {
          display: none;
        }

        .sidebar-nav {
          padding: 1rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.875rem 1rem;
          color: #94a3b8;
          text-decoration: none;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background-color: var(--sidebar-hover);
          color: #fff;
        }

        .nav-item.active {
          background-color: var(--sidebar-active);
          color: #fff;
        }

        .nav-item svg {
          margin-right: 0.75rem;
        }

        .admin-sidebar.closed .nav-item svg {
          margin-right: 0;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }

        .logout-btn:hover {
          color: #ef4444;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          height: 70px;
          background-color: #fff;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 900;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .toggle-sidebar {
          background: none;
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          color: var(--text-muted);
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .profile-info {
          text-align: right;
        }

        .admin-name {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .admin-role {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          background-color: var(--primary-blue);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
        }

        .admin-content {
          padding: 2rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .mobile-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: -100%;
            height: 100vh;
          }
          .admin-sidebar.open {
            left: 0;
          }
          .mobile-toggle {
            display: block;
            background: none;
            border: none;
            color: #fff;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          background: #fff;
          padding: 2rem;
          border-radius: 1rem;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .modal-icon.warning {
          background: #fef2f2;
          color: #ef4444;
        }

        .modal-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .modal-content p {
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .modal-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .cancel-btn {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #f8fafc;
        }

        .confirm-btn {
          padding: 0.75rem;
          border: none;
          background: #1a1a1a;
          color: #fff;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .confirm-btn.delete {
          background: #ef4444;
        }

        .confirm-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
