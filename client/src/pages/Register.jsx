import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);

            alert('Registration successful!');
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
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
                        <p>Create an account to save your ultimate journeys.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="cooltraveler99"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

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
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Already have an account? <Link to="/login" style={{color: '#2e7d32', fontWeight: 600}}>Sign In</Link></p>
                        <p>© 2026 Visit Navigator</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
