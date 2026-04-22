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

                        <style>{`
                .public-layout {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #fcfdfb;
                    font-family: 'Outfit', 'Inter', sans-serif;
                }

                /* Navigation Styles */
                .public-nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    z-index: 1000;
                    transition: all 0.3s ease;
                    padding: 0 40px;
                }

                .public-nav.scrolled {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    height: 70px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }

                .nav-content {
                    max-width: 1400px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    color: #1a1a1a;
                    font-size: 1.5rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .logo-text span { color: #2e7d32; }

                .desktop-links {
                    display: flex;
                    gap: 32px;
                }

                .nav-link {
                    text-decoration: none;
                    color: #4a4a4a;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .nav-link:hover {
                    color: #2e7d32;
                    background: rgba(46, 125, 50, 0.05);
                }

                .nav-link.active {
                    color: #2e7d32;
                    background: rgba(46, 125, 50, 0.1);
                }

                .trip-badge {
                    position: absolute;
                    top: -8px;
                    right: -10px;
                    background: #e11d48;
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 800;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #fff;
                }

                .admin-access-btn {
                    text-decoration: none;
                    color: #fff;
                    background: #1a1a1a;
                    padding: 10px 22px;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .admin-access-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }

                .mobile-menu-toggle {
                    display: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #1a1a1a;
                }

                /* Mobile Menu */
                .mobile-menu {
                    position: absolute;
                    top: 80px;
                    left: 20px;
                    right: 20px;
                    background: #fff;
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    animation: slideDown 0.3s ease-out;
                }

                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .mobile-link {
                    text-decoration: none;
                    color: #4a4a4a;
                    padding: 15px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                /* Footer Styles */
                .public-footer {
                    background: #1a1a1a;
                    color: #fff;
                    padding: 80px 40px 20px;
                    margin-top: auto;
                }

                .footer-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 80px;
                }

                .footer-section h3 { font-size: 1.8rem; margin-bottom: 20px; }
                .footer-section h4 { font-size: 1.2rem; margin-bottom: 25px; color: #81c784; }
                .footer-section p { color: #94a3b8; line-height: 1.6; max-width: 400px; }

                .social-links { display: flex; gap: 20px; margin-top: 30px; }
                .social-links a { color: #fff; opacity: 0.7; transition: opacity 0.2s; }
                .social-links a:hover { opacity: 1; }

                .footer-section ul { list-style: none; padding: 0; }
                .footer-section ul li { margin-bottom: 12px; }
                .footer-section ul a { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
                .footer-section ul a:hover { color: #fff; }

                .contact-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; color: #94a3b8; }

                .footer-bottom {
                    max-width: 1400px;
                    margin: 60px auto 0;
                    padding-top: 30px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                @media (max-width: 1024px) {
                    .footer-content { grid-template-columns: 1fr 1fr; gap: 40px; }
                }

                @media (max-width: 768px) {
                    .desktop-links { display: none; }
                    .mobile-menu-toggle { display: block; }
                    .footer-content { grid-template-columns: 1fr; gap: 40px; }
                    .public-nav { padding: 0 20px; }
                }
            `}</style>


            </div>
    );
};

export default PublicLayout;