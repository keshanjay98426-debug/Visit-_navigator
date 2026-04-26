import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import AdminLayout from './components/AdminLayout';
import CategoryManagement from './pages/admin/Categories';
import LocationManagement from './pages/admin/Locations';
import MultiRoute from './pages/admin/MultiRoute';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import PublicLocations from './pages/PublicLocations';
import LocationDetail from './pages/LocationDetail';
import TripPlanner from './pages/TripPlanner';
import SavedTrips from './pages/SavedTrips';
import UserManual from './pages/UserManual';

// Main application routing setup using React Router
function App() {
  return (
    <TripProvider>
      <Router>
        <Routes>
          
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/locations" element={<PublicLocations />} />
            <Route path="/locations/:id" element={<LocationDetail />} />

            
            <Route path="/trip-planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
            <Route path="/saved-trips" element={<ProtectedRoute><SavedTrips /></ProtectedRoute>} />

            <Route path="/user-manual" element={<UserManual />} />
          </Route>

          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

         
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="locations" element={<LocationManagement />} />
            <Route path="multi-route" element={<MultiRoute />} />
          </Route>

        
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TripProvider>
  );
}

export default App;
