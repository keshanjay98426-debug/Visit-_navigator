import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
            if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);

            if (res.data.role === 'admin') {
                const origin = location.state?.from?.pathname || '/admin/dashboard';
                navigate(origin, { replace: true });
            } else {
                const origin = location.state?.from?.pathname || '/';
                navigate(origin, { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
            </div>
            
            <div className="login-card-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-section">
                            <span className="logo-icon">📍</span>
                            <h1>Visit Navigator</h1>
                        </div>
                        <p>Welcome back! Please login to your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? (
                                <span className="loader"></span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/register" style={{color: '#2e7d32', fontWeight: 600}}>Sign Up</Link></p>
                        <p>© 2026 Visit Navigator</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
