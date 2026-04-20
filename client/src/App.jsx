import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import PublicLocations from './pages/PublicLocations';
import LocationDetail from './pages/LocationDetail';
import TripPlanner from './pages/TripPlanner';
import SavedTrips from './pages/SavedTrips';
import UserManual from './pages/UserManual';

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
        </Routes>
        </Router>
    </TripProvider>
  );
}

export default App;