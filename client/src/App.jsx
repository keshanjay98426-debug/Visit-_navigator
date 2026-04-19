import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import PublicLocations from './pages/PublicLocations';
import LocationDetail from './pages/LocationDetail';

function App() {
  return (
    <TripProvider>
      <Router>
        <Routes>
             <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/locations" element={<PublicLocations />} />
            <Route path="/locations/:id" element={<LocationDetail />} />
          </Route>
        </Routes>
        </Router>
    </TripProvider>
  );
}

export default App;