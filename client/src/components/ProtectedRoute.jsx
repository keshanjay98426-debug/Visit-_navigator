import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const location = useLocation();

    if (!token) {
        
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && userRole !== role) {
        
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
