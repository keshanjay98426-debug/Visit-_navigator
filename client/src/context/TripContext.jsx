import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const TripContext = createContext();

export const useTripContext = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
    const [plannedTrips, setPlannedTrips] = useState([]);
    const [savedTrips, setSavedTrips] = useState([]);
    const [activeTripId, setActiveTripId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTrips = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            clearState();
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const pt = res.data.plannedTrips || [];
            const st = res.data.savedTrips || [];
            
            setPlannedTrips(pt);
            setSavedTrips(st);
            
            if (pt.length > 0) {
                setActiveTripId(pt[0].id);
            }
        } catch (err) {
            console.error('Failed to sync trips from cloud', err);
            clearState();
            if (err.response && err.response.status === 401) {
             
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTrips();
        
       
        const handleAuthChange = () => fetchTrips();
        window.addEventListener('authChange', handleAuthChange);
        
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const clearState = () => {
        setPlannedTrips([]);
        setSavedTrips([]);
        setActiveTripId(null);
    };

    const _syncPlannedTrips = async (newPlannedTrips) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post('http://localhost:5000/api/users/plannedTrips', { trips: newPlannedTrips }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch(e) {
            console.error('Failed to save planned trips', e);
        }
    };

    const _syncSavedTrips = async (newSavedTrips) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post('http://localhost:5000/api/users/savedTrips', { trips: newSavedTrips }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch(e) {
            console.error('Failed to save saved trips', e);
        }
    };

    const setTrips = (newTrips, newActiveId = activeTripId) => {
        setPlannedTrips(newTrips);
        if (newActiveId) setActiveTripId(newActiveId);
        _syncPlannedTrips(newTrips);
    };

    const addLocationToTrip = (locationData) => {
        let trips = [...plannedTrips];
        let currentActiveId = activeTripId;

        if (trips.length === 0) {
            const defaultTrip = { id: Date.now().toString(), name: 'My First Route', locations: [] };
            trips.push(defaultTrip);
            currentActiveId = defaultTrip.id;
            setActiveTripId(currentActiveId);
        }

        const tripIndex = trips.findIndex(t => t.id === currentActiveId);
        if (tripIndex !== -1) {
            if (!trips[tripIndex].locations.some(item => item.id === locationData.id)) {
                trips[tripIndex].locations.push(locationData);
                setPlannedTrips(trips);
                _syncPlannedTrips(trips);
            }
        }
    };

    const saveTripAsFavorite = (tripId) => {
        const trip = plannedTrips.find(t => t.id === tripId);
        if (!trip) return;

    
        const newSavedTrips = [...savedTrips, trip];
        setSavedTrips(newSavedTrips);
        _syncSavedTrips(newSavedTrips);

      
        const newPlannedTrips = plannedTrips.filter(t => t.id !== tripId);
        setPlannedTrips(newPlannedTrips);
        _syncPlannedTrips(newPlannedTrips);
        
        if (newPlannedTrips.length > 0) {
            setActiveTripId(newPlannedTrips[0].id);
        } else {
            setActiveTripId(null);
        }
    };

    const removeSavedTrip = (tripId) => {
        const newSavedTrips = savedTrips.filter(t => t.id !== tripId);
        setSavedTrips(newSavedTrips);
        _syncSavedTrips(newSavedTrips);
    };

    const value = {
        plannedTrips,
        savedTrips,
        activeTripId,
        loading,
        setTrips,
        setActiveTripId,
        addLocationToTrip,
        saveTripAsFavorite,
        removeSavedTrip,
        clearState,
        refreshTrips: fetchTrips
    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
};
