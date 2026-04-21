import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Map, Compass, Info, Home, Menu, X, Phone, Mail, Camera, Share2, Globe, BookOpen, LogOut, User, FolderHeart } from 'lucide-react';
import { useTripContext } from '../context/TripContext';

const PublicLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const { plannedTrips, activeTripId, clearState } = useTripContext();

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('travelerTrips'); // Clean up old data if any exists
        localStorage.removeItem('activeTripId');
        
        clearState(); // clear the context context
        
        navigate('/login');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Derived state for badge count
    const activeTrip = plannedTrips.find(t => t.id === activeTripId);
    const tripCount = activeTrip ? activeTrip.locations.length : 0;

    const navLinks = [
        { path: '/', label: 'Home', icon: <Home size={18} /> },
        { path: '/locations', label: 'Explore', icon: <Compass size={18} /> },
        { 
            path: '/trip-planner', 
            label: 'My Trips', 
            icon: (
                <div style={{ position: 'relative' }}>
                    <Map size={18} />
                    {tripCount > 0 && <span className="trip-badge">{tripCount}</span>}
                </div>
            ) 
        },
        { path: '/saved-trips', label: 'Saved Trips', icon: <FolderHeart size={18} /> },
        { path: '/user-manual', label: 'Manuals', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className="public-layout">
            {/* Professional Navigation Bar */}
            <nav className={`public-nav ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-content">
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon">🌿</span>
                        <span className="logo-text">Visit<span>Navigator</span></span>
                    </Link>

                    <div className="desktop-links">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="nav-actions">
                        {token ? (
                            <div className="auth-user" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                <span style={{fontWeight: 600, color: '#2e7d32'}}><User size={16} style={{marginRight: '5px', verticalAlign: 'middle'}}/>{username}</span>
                                {role === 'admin' && <Link to="/admin/dashboard" className="admin-access-btn" style={{padding: '6px 15px'}}>Admin</Link>}
                                <button onClick={handleLogout} className="logout-btn" style={{background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 15px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}><LogOut size={16}/> Logout</button>
                            </div>
                        ) : (
                            <div style={{display: 'flex', gap: '10px'}}>
                                <Link to="/login" className="admin-access-btn">Sign In</Link>
                                <Link to="/register" className="admin-access-btn" style={{background: '#fff', color: '#1a1a1a', border: '1px solid #e5e7eb'}}>Sign Up</Link>
                            </div>
                        )}
                        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Main Page Content */}
            <main className="public-main">
                <Outlet />
            </main>

            {/* Premium Footer */}
            <footer className="public-footer">
                <div className="footer-content">
                    <div className="footer-section brand">
                        <h3>Visit Navigator</h3>
                        <p>Discover the unseen beauty of Sri Lanka. Your companion for exploring hidden gems and iconic landmarks starting from Athurugiriya.</p>
                        <div className="social-links">
                            <a href="#"><Share2 size={20} /></a>
                            <a href="#"><Camera size={20} /></a>
                            <a href="#"><Mail size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-section links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/locations">Explore Locations</Link></li>
                            <li><Link to="/user-manual">User Manuals</Link></li>
                            <li><Link to="/login">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section contact">
                        <h4>Contact Us</h4>
                        <div className="contact-item">
                            <Phone size={16} />
                            <span>+94 77 123 4567</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>info@visitnavigator.lk</span>
                        </div>
                        <div className="contact-item">
                            <Globe size={16} />
                            <span>Athurugiriya, Sri Lanka</span>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Visit Navigator. Crafted for Explorers.</p>
                </div>
            </footer>


            </div>
    );
};

export default PublicLayout;