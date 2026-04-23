import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { 
    Trash2, MoveUp, MoveDown, MapPin, 
    Navigation, Clock, Info, Plus, Route, Check, Star
} from 'lucide-react';
import { useTripContext } from '../context/TripContext';

const BASE_LOCATION = { lat: 6.892, lng: 79.963, name: 'Athurugiriya Pore' };


const MultiRoutingMachine = ({ locations }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || locations.length === 0) return;

        const waypoints = [
            L.latLng(BASE_LOCATION.lat, BASE_LOCATION.lng),
            ...locations.map(loc => L.latLng(loc.lat, loc.lng))
        ];

        const routingControl = L.Routing.control({
            waypoints: waypoints,
            lineOptions: {
                styles: [{ color: '#2e7d32', weight: 6, opacity: 0.8 }]
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: function(i, wp) {
                const isBase = i === 0;
                const isFinal = i === waypoints.length - 1;
                return L.marker(wp.latLng, {
                    icon: L.divIcon({
                        className: 'custom-marker-wrapper',
                        html: `<div class="marker-pin ${isBase ? 'start' : isFinal ? 'end' : 'stop'}"><span class="marker-num">${isBase ? 'B' : i}</span></div>`
                    })
                });
            }
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, locations]);

    return null;
};

const TripPlanner = () => {
    const { plannedTrips, activeTripId, setTrips, setActiveTripId, saveTripAsFavorite, loading } = useTripContext();
    const navigate = useNavigate();

    const [newTripName, setNewTripName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [totalStats, setTotalStats] = useState({ distance: 0, time: 0 });

    const activeTrip = plannedTrips.find(t => t.id === activeTripId);
    const tripItems = activeTrip ? activeTrip.locations : [];

    useEffect(() => {
        if (activeTrip) {
            const d = tripItems.reduce((acc, item) => acc + (item.distance || 0), 0);
            setTotalStats({ distance: d, time: d * 2 });
        }
    }, [tripItems, activeTrip]);

    const handleCreateTrip = (e) => {
        e.preventDefault();
        if (!newTripName.trim()) return;
        
        const newTrip = {
            id: Date.now().toString(),
            name: newTripName,
            locations: []
        };
        
        setTrips([...plannedTrips, newTrip], newTrip.id);
        setNewTripName('');
        setIsCreating(false);
    };

    const deleteTrip = (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;
        const newTrips = plannedTrips.filter(t => t.id !== id);
        let newActiveId = null;
        if (newTrips.length > 0) {
            newActiveId = newTrips[0].id;
        }
        setTrips(newTrips, newActiveId);
    };

    const removeFromTrip = (locId) => {
        if (!activeTrip) return;
        const newLocations = activeTrip.locations.filter(loc => loc.id !== locId);
        const newTrips = plannedTrips.map(t => t.id === activeTrip.id ? { ...t, locations: newLocations } : t);
        setTrips(newTrips);
    };

    const moveItem = (index, direction) => {
        if (!activeTrip) return;
        const newLocations = [...activeTrip.locations];
        if (direction === 'up' && index > 0) {
            [newLocations[index], newLocations[index - 1]] = [newLocations[index - 1], newLocations[index]];
        } else if (direction === 'down' && index < newLocations.length - 1) {
            [newLocations[index], newLocations[index + 1]] = [newLocations[index + 1], newLocations[index]];
        }
        const newTrips = plannedTrips.map(t => t.id === activeTrip.id ? { ...t, locations: newLocations } : t);
        setTrips(newTrips);
    };

    const handleSetActive = (id) => {
        setActiveTripId(id);
    };

    const handleSaveTrip = () => {
        if (!activeTrip) return;
        if (window.confirm('Save this trip to your Saved Trips? It will be removed from your active planned trips.')) {
            saveTripAsFavorite(activeTrip.id);
            navigate('/saved-trips');
        }
    };

    if (loading) return <div className="trip-planner-page" style={{padding: '100px', textAlign: 'center'}}>Loading planner...</div>;

    return (
        <div className="trip-planner-page">
            <header className="planner-header">
                <div className="planner-header-content">
                    <h1>Manage Your <span>Routes</span></h1>
                    <p>Create separate itineraries, add locations, and organize your ultimate journeys.</p>
                </div>
            </header>

            <div className="planner-container">
             
                <aside className="route-manager">
                    <div className="route-controls">
                        <h3>My Planned Trips</h3>
                        <button className="btn-new-route" onClick={() => setIsCreating(!isCreating)}>
                            <Plus size={16} /> New Route
                        </button>
                    </div>

                    {isCreating && (
                        <form className="create-route-form" onSubmit={handleCreateTrip}>
                            <input 
                                type="text" 
                                placeholder="e.g. Cultural Triangle" 
                                value={newTripName} 
                                onChange={(e) => setNewTripName(e.target.value)}
                                autoFocus
                            />
                            <div className="form-actions">
                                <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="save">Create</button>
                            </div>
                        </form>
                    )}

                    <div className="route-list">
                        {plannedTrips.length === 0 && !isCreating ? (
                            <div className="no-routes">No planned trips. Create one to start!</div>
                        ) : (
                            plannedTrips.map(trip => (
                                <div 
                                    key={trip.id} 
                                    className={`route-item ${trip.id === activeTripId ? 'active' : ''}`}
                                    onClick={() => handleSetActive(trip.id)}
                                >
                                    <div className="route-info">
                                        <Route size={18} />
                                        <span>{trip.name}</span>
                                        {trip.id === activeTripId && <Check size={16} className="active-icon" />}
                                    </div>
                                    <div className="route-meta">
                                        <span>{trip.locations.length} stops</span>
                                        <button className="del-route-btn" onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {activeTrip && (
                        <div className="sidebar-group">
                            <div className="stops-title-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                <h3 className="stops-title" style={{margin: 0}}><MapPin size={20} /> Stops in '{activeTrip.name}'</h3>
                                {tripItems.length > 0 && (
                                    <button 
                                        className="save-trip-btn" 
                                        onClick={handleSaveTrip}
                                        style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#ffc107', color: '#1a1a1a', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'}}
                                    >
                                        <Star size={16} fill="#1a1a1a" /> Save Trip
                                    </button>
                                )}
                            </div>
                            {tripItems.length === 0 ? (
                                <div className="empty-trip">
                                    <p>No locations added to this route yet.</p>
                                    <Link to="/locations" className="browse-btn">Browse Locations</Link>
                                </div>
                            ) : (
                                <div className="itinerary-list">
                                    {tripItems.map((item, index) => (
                                        <div key={item.id} className="itinerary-card">
                                            <div className="card-index">{index + 1}</div>
                                            <div className="card-details">
                                                <h4>{item.name}</h4>
                                                <span>{item.distance} km from base</span>
                                            </div>
                                            <div className="card-actions">
                                                <button onClick={() => moveItem(index, 'up')} disabled={index === 0}><MoveUp size={16} /></button>
                                                <button onClick={() => moveItem(index, 'down')} disabled={index === tripItems.length - 1}><MoveDown size={16} /></button>
                                                <button className="remove-btn" onClick={() => removeFromTrip(item.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tripItems.length > 0 && (
                                <div className="trip-summary">
                                    <div className="summary-row">
                                        <Clock size={16} />
                                        <span>Est. Time: {totalStats.time} mins</span>
                                    </div>
                                    <div className="summary-row">
                                        <Navigation size={16} />
                                        <span>Total Distance: {totalStats.distance} km</span>
                                    </div>
                                    <div className="itinerary-info">
                                        <Info size={16} />
                                        <p>Optimized from Athurugiriya Pore.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </aside>

             
                <main className="map-view">
                    <div className="map-container-wrapper">
                        {tripItems.length > 0 ? (
                            <MapContainer 
                                center={[6.892, 79.963]} 
                                zoom={12} 
                                style={{ height: '700px', width: '100%', borderRadius: '24px' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {tripItems.length > 0 && (
                                    <MultiRoutingMachine locations={tripItems} />
                                )}
                            </MapContainer>
                        ) : (
                            <div className="map-placeholder">
                                <div className="placeholder-content">
                                    <MapPin size={48} />
                                    <h3>Interative Route Map</h3>
                                    <p>Select a route and add locations to see your trip path here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style>{`
                .trip-planner-page { min-height: 100vh; padding-top: 80px; background: #fcfdfb; }
                
                .planner-header { background: #f1f8f1; padding: 50px 40px; text-align: center; border-bottom: 1px solid #e1e8e1; }
                .planner-header-content h1 { font-size: 2.4rem; margin-bottom: 10px; }
                .planner-header-content h1 span { color: #2e7d32; }
                .planner-header-content p { color: #64748b; font-size: 1.05rem; }

                .planner-container { 
                    max-width: 1400px; margin: 40px auto; 
                    padding: 0 40px; display: grid; 
                    grid-template-columns: 420px 1fr; gap: 40px; 
                }

                .route-manager { display: flex; flex-direction: column; gap: 24px; }
                
                .route-controls { display: flex; justify-content: space-between; align-items: center; }
                .route-controls h3 { font-size: 1.2rem; color: #1a1a1a; }
                .btn-new-route { 
                    display: flex; align-items: center; gap: 6px; 
                    background: #2e7d32; color: #fff; border: none; 
                    padding: 8px 16px; border-radius: 8px; font-weight: 600; 
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-new-route:hover { background: #166534; }

                .create-route-form { 
                    background: #fff; padding: 20px; border-radius: 16px; 
                    border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
                }
                .create-route-form input { 
                    width: 100%; padding: 12px; border: 1px solid #e2e8f0; 
                    border-radius: 8px; margin-bottom: 15px; outline: none; 
                }
                .create-route-form input:focus { border-color: #2e7d32; }
                .form-actions { display: flex; justify-content: flex-end; gap: 10px; }
                .form-actions button { padding: 8px 15px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
                .form-actions button[type="button"] { background: #f1f5f9; color: #475569; }
                .form-actions button.save { background: #2e7d32; color: #fff; }

                .route-list { display: flex; flex-direction: column; gap: 10px; }
                .no-routes { padding: 20px; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 12px; }
                
                .route-item { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 15px 20px; background: #fff; border: 1px solid #e2e8f0; 
                    border-radius: 12px; cursor: pointer; transition: all 0.2s; 
                }
                .route-item:hover { border-color: #2e7d32; }
                .route-item.active { background: #f1f8f1; border-color: #2e7d32; }
                
                .route-info { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #1a1a1a; }
                .active-icon { color: #2e7d32; }
                
                .route-meta { display: flex; align-items: center; gap: 15px; }
                .route-meta span { font-size: 0.85rem; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 20px; }
                .del-route-btn { background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
                .del-route-btn:hover { opacity: 1; }

                .sidebar-group { 
                    background: #fff; border-radius: 24px; padding: 30px; 
                    border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
                }
                .stops-title { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; font-size: 1.1rem; }

                .itinerary-list { display: flex; flex-direction: column; gap: 12px; }
                .itinerary-card { 
                    display: flex; align-items: center; gap: 15px; background: #f8fafc; 
                    padding: 15px; border-radius: 16px; border: 1px solid #f1f5f9; 
                }
                .card-index { 
                    width: 32px; height: 32px; background: #2e7d32; color: #fff; 
                    border-radius: 50%; display: flex; align-items: center; 
                    justify-content: center; font-weight: 700; font-size: 0.9rem; 
                }
                .card-details { flex: 1; }
                .card-details h4 { font-size: 1rem; margin-bottom: 2px; }
                .card-details span { font-size: 0.8rem; color: #64748b; }

                .card-actions { display: flex; gap: 8px; }
                .card-actions button { 
                    background: #fff; border: 1px solid #e2e8f0; width: 32px; height: 32px; 
                    border-radius: 8px; display: flex; align-items: center; 
                    justify-content: center; cursor: pointer; color: #64748b; 
                }
                .card-actions button:hover:not(:disabled) { color: #2e7d32; border-color: #2e7d32; }
                .card-actions button.remove-btn:hover { color: #ef4444; border-color: #ef4444; }

                .trip-summary { 
                    background: #1a1a1a; color: #fff; border-radius: 20px; 
                    padding: 25px; display: flex; flex-direction: column; gap: 15px; 
                    margin-top: 25px;
                }
                .summary-row { display: flex; align-items: center; gap: 12px; opacity: 0.9; font-size: 0.95rem; }
                .itinerary-info { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; display: flex; gap: 10px; }
                .itinerary-info p { font-size: 0.8rem; color: #94a3b8; line-height: 1.5; }

                .map-view { border-radius: 24px; overflow: hidden; height: 700px; background: #f1f5f9; border: 1px solid #e2e8f0; position: sticky; top: 100px; }
                .map-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; }
                .placeholder-content { color: #94a3b8; max-width: 300px; }
                .placeholder-content h3 { color: #475569; margin: 15px 0 10px; }

                .marker-pin { 
                    width: 30px; height: 30px; border-radius: 50% 50% 50% 0; 
                    background: #2e7d32; position: absolute; transform: rotate(-45deg); 
                    left: 50%; top: 50%; margin: -15px 0 0 -15px; border: 2px solid #fff; 
                    display: flex; align-items: center; justify-content: center; 
                }
                .marker-num { transform: rotate(45deg); color: #fff; font-size: 0.8rem; font-weight: 800; }
                .marker-pin.start { background: #3b82f6; }
                .marker-pin.end { background: #ef4444; }

                .empty-trip { text-align: center; padding: 20px 0; }
                .empty-trip p { color: #64748b; margin-bottom: 20px; font-size: 0.95rem; }
                .browse-btn { 
                    display: inline-block; background: #2e7d32; color: #fff; 
                    padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; 
                }

                @media (max-width: 1024px) {
                    .planner-container { grid-template-columns: 1fr; }
                    .route-manager { order: 2; }
                    .map-view { order: 1; height: 500px; position: static; }
                }
            `}</style>
        </div>
    );
};

export default TripPlanner;
