import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { 
    Trash2, MoveUp, MoveDown, MapPin, 
    Navigation, Clock, Info, Plus, Route, Check, Star, Search, ListChecks
} from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import axios from 'axios';

const BASE_LOCATION = { lat: 6.892, lng: 79.963, name: 'Athurugiriya Pore' };

const MultiRoutingMachine = ({ locations, baseLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || locations.length === 0 || !baseLocation) return;

        const waypoints = [
            L.latLng(baseLocation.lat, baseLocation.lng),
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
    }, [map, locations, baseLocation]);

    return null;
}

const TripPlanner = () => {
    const { plannedTrips, activeTripId, setTrips, setActiveTripId, saveTripAsFavorite, loading } = useTripContext();
    const navigate = useNavigate();

    const [newTripName, setNewTripName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [totalStats, setTotalStats] = useState({ distance: 0, time: 0 });
    
    
    const [places, setPlaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [fetchingPlaces, setFetchingPlaces] = useState(true);
    

    const [activeTab, setActiveTab] = useState('browse'); 
    const [userLocation, setUserLocation] = useState(BASE_LOCATION);

    const apiUrl = 'http://localhost:5000/api/places';
    const catUrl = 'http://localhost:5000/api/categories';

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Current Location' }),
                (err) => console.warn('Geolocation error:', err),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    }, []);

    useEffect(() => {
        const fetchPlacesData = async () => {
            try {
                const [placesRes, catsRes] = await Promise.all([
                    axios.get(apiUrl),
                    axios.get(catUrl)
                ]);
                setPlaces(placesRes.data);
                setCategories(catsRes.data);
            } catch (err) {
                console.error('Error fetching places:', err);
            } finally {
                setFetchingPlaces(false);
            }
        };
        fetchPlacesData();
    }, []);

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

    const togglePlaceSelection = (place) => {
        if (!activeTrip) return;
        
        const isSelected = tripItems.find(loc => loc.id === place._id);
        let newLocations;
        
        if (isSelected) {
          
            newLocations = tripItems.filter(loc => loc.id !== place._id);
        } else {
          
            const newLoc = {
                id: place._id,
                name: place.name,
                lat: place.location.latitude,
                lng: place.location.longitude,
                distance: place.distance
            };
            newLocations = [...tripItems, newLoc];
        }
        
        const newTrips = plannedTrips.map(t => t.id === activeTrip.id ? { ...t, locations: newLocations } : t);
        setTrips(newTrips);
    };

    const moveItem = (index, direction) => {
        if (!activeTrip) return;
        const newLocations = [...tripItems];
        if (direction === 'up' && index > 0) {
            [newLocations[index], newLocations[index - 1]] = [newLocations[index - 1], newLocations[index]];
        } else if (direction === 'down' && index < newLocations.length - 1) {
            [newLocations[index], newLocations[index + 1]] = [newLocations[index + 1], newLocations[index]];
        }
        const newTrips = plannedTrips.map(t => t.id === activeTrip.id ? { ...t, locations: newLocations } : t);
        setTrips(newTrips);
    };

    const handleSaveTrip = () => {
        if (!activeTrip) return;
        if (window.confirm('Save this trip to your Saved Trips? It will be removed from your active planned trips.')) {
            saveTripAsFavorite(activeTrip.id);
            navigate('/saved-trips');
        }
    };

    const filteredPlaces = places.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === '' || p.category?._id === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="trip-planner-page" style={{padding: '100px', textAlign: 'center'}}>Loading planner...</div>;

    return (
        <div className="trip-planner-page">
            <header className="planner-header">
                <div className="planner-header-content">
                    <h1>Manage Your <span>Routes</span></h1>
                    <p>Select locations from the directory and organize your ultimate journeys.</p>
                </div>
            </header>

            <div className="planner-container">
                
                <aside className="route-manager">
                    
                    <div className="trip-selector-header">
                        <select 
                            value={activeTripId || ''} 
                            onChange={(e) => setActiveTripId(e.target.value)}
                            className="trip-dropdown"
                        >
                            {plannedTrips.length === 0 && <option value="">No Planned Trips</option>}
                            {plannedTrips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button className="btn-new-route" onClick={() => setIsCreating(!isCreating)} title="New Trip">
                            <Plus size={18} />
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

                    {activeTrip ? (
                        <div className="sidebar-group">
                            <div className="tabs">
                                <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
                                    <Search size={16} /> Browse Places
                                </button>
                                <button className={`tab ${activeTab === 'route' ? 'active' : ''}`} onClick={() => setActiveTab('route')}>
                                    <Route size={16} /> Route Stops ({tripItems.length})
                                </button>
                            </div>

                            {activeTab === 'browse' ? (
                                <div className="browse-section">
                                    <div className="sidebar-search">
                                        <Search size={16} color="#64748b" />
                                        <input 
                                            type="text" 
                                            placeholder="Search locations..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="sidebar-filter">
                                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                            <option value="">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="places-selection-list">
                                        {fetchingPlaces ? (
                                            <div style={{padding: '20px', textAlign: 'center'}}>Loading places...</div>
                                        ) : filteredPlaces.map(place => {
                                            const isSelected = tripItems.find(p => p.id === place._id);
                                            return (
                                                <div 
                                                    key={place._id} 
                                                    className={`selection-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => togglePlaceSelection(place)}
                                                >
                                                    <div className="item-icon">
                                                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                                                    </div>
                                                    <div className="item-info">
                                                        <span className="item-name">{place.name}</span>
                                                        <span className="item-cat">{place.category?.name}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="route-section">
                                    <div className="stops-title-container">
                                        <div className="trip-actions">
                                            <button className="del-route-btn" onClick={() => deleteTrip(activeTrip.id)}>
                                                <Trash2 size={16} /> Delete Trip
                                            </button>
                                            {tripItems.length > 0 && (
                                                <button className="save-trip-btn" onClick={handleSaveTrip}>
                                                    <Star size={16} fill="#1a1a1a" /> Save
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {tripItems.length === 0 ? (
                                        <div className="empty-trip">
                                            <p>No locations added. Go to 'Browse Places' to add some.</p>
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
                                                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0}><MoveUp size={14} /></button>
                                                        <button onClick={() => moveItem(index, 'down')} disabled={index === tripItems.length - 1}><MoveDown size={14} /></button>
                                                        <button className="remove-btn" onClick={() => togglePlaceSelection({_id: item.id})}><Trash2 size={14} /></button>
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
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-routes">
                            No planned trips. Create one to start!
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
                                    <MultiRoutingMachine locations={tripItems} baseLocation={userLocation} />
                                )}
                            </MapContainer>
                        ) : (
                            <div className="map-placeholder">
                                <div className="placeholder-content">
                                    <MapPin size={48} />
                                    <h3>Interactive Route Map</h3>
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

                .route-manager { display: flex; flex-direction: column; gap: 20px; }
                
                .trip-selector-header { 
                    display: flex; gap: 10px; align-items: center; 
                    background: #fff; padding: 10px; border-radius: 16px; 
                    border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .trip-dropdown {
                    flex: 1; padding: 12px; border: 1px solid #e2e8f0;
                    border-radius: 10px; background: #f8fafc; outline: none;
                    font-size: 1rem; font-weight: 600; color: #1e293b;
                }
                .btn-new-route { 
                    background: #2e7d32; color: #fff; border: none; 
                    width: 44px; height: 44px; border-radius: 10px; 
                    display: flex; align-items: center; justify-content: center;
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

                .no-routes { padding: 20px; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; }
                
                .sidebar-group { 
                    background: #fff; border-radius: 20px; 
                    border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
                    display: flex; flex-direction: column; overflow: hidden;
                    height: 700px;
                }
                
                .tabs { display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
                .tab {
                    flex: 1; padding: 15px; background: none; border: none;
                    font-weight: 600; color: #64748b; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    border-bottom: 2px solid transparent; transition: all 0.2s;
                }
                .tab.active { color: #2e7d32; border-bottom-color: #2e7d32; background: #fff; }

                .browse-section, .route-section {
                    display: flex; flex-direction: column; flex: 1; overflow: hidden;
                }
                .route-section { padding: 20px; overflow-y: auto; }

                .sidebar-search {
                    padding: 15px 20px; display: flex; align-items: center;
                    gap: 10px; border-bottom: 1px solid #f1f5f9;
                }
                .sidebar-search input {
                    border: none; outline: none; width: 100%; font-size: 0.95rem;
                }
                .sidebar-filter {
                    padding: 10px 20px; border-bottom: 1px solid #f1f5f9; background: #fafafa;
                }
                .sidebar-filter select {
                    width: 100%; padding: 8px; border: 1px solid #e2e8f0;
                    border-radius: 6px; outline: none; background: #fff;
                }
                .places-selection-list { flex: 1; overflow-y: auto; padding: 10px; }
                
                .selection-item {
                    display: flex; align-items: center; gap: 12px;
                    padding: 12px; border-radius: 10px; cursor: pointer;
                    transition: all 0.2s; border: 1px solid transparent;
                }
                .selection-item:hover { background: #f8fafc; border-color: #e2e8f0; }
                .selection-item.selected { background: #f1f8f1; border-color: #2e7d32; }
                
                .item-icon {
                    width: 28px; height: 28px; background: #e2e8f0; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; color: #64748b;
                }
                .selected .item-icon { background: #2e7d32; color: #fff; }
                
                .item-info { display: flex; flex-direction: column; }
                .item-name { font-weight: 600; font-size: 0.95rem; color: #1e293b; }
                .item-cat { font-size: 0.75rem; color: #64748b; }

                .stops-title-container { margin-bottom: 20px; }
                .trip-actions { display: flex; justify-content: space-between; gap: 10px; }
                
                .del-route-btn { 
                    display: flex; align-items: center; gap: 6px;
                    background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; 
                    padding: 8px 12px; border-radius: 8px; cursor: pointer; 
                    font-weight: 600; font-size: 0.85rem; transition: all 0.2s;
                }
                .del-route-btn:hover { background: #fee2e2; }

                .save-trip-btn { 
                    display: flex; align-items: center; gap: 6px; 
                    background: #ffc107; color: #1a1a1a; border: none; 
                    padding: 8px 16px; border-radius: 8px; font-weight: bold; 
                    cursor: pointer; font-size: 0.85rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .save-trip-btn:hover { background: #ffb300; transform: translateY(-1px); }

                .itinerary-list { display: flex; flex-direction: column; gap: 10px; }
                .itinerary-card { 
                    display: flex; align-items: center; gap: 12px; background: #f8fafc; 
                    padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; 
                }
                .card-index { 
                    width: 28px; height: 28px; background: #2e7d32; color: #fff; 
                    border-radius: 50%; display: flex; align-items: center; 
                    justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
                }
                .card-details { flex: 1; min-width: 0; }
                .card-details h4 { font-size: 0.95rem; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .card-details span { font-size: 0.75rem; color: #64748b; }

                .card-actions { display: flex; gap: 4px; }
                .card-actions button { 
                    background: #fff; border: 1px solid #e2e8f0; width: 28px; height: 28px; 
                    border-radius: 6px; display: flex; align-items: center; 
                    justify-content: center; cursor: pointer; color: #64748b; 
                }
                .card-actions button:hover:not(:disabled) { color: #2e7d32; border-color: #2e7d32; }
                .card-actions button.remove-btn:hover { color: #ef4444; border-color: #ef4444; }

                .trip-summary { 
                    background: #1a1a1a; color: #fff; border-radius: 16px; 
                    padding: 20px; display: flex; flex-direction: column; gap: 12px; 
                    margin-top: 20px;
                }
                .summary-row { display: flex; align-items: center; gap: 10px; opacity: 0.9; font-size: 0.9rem; }

                .map-view { border-radius: 24px; overflow: hidden; height: 700px; background: #f1f5f9; border: 1px solid #e2e8f0; }
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
                .empty-trip p { color: #64748b; font-size: 0.95rem; }

                @media (max-width: 1024px) {
                    .planner-container { grid-template-columns: 1fr; }
                    .route-manager { order: 2; }
                    .map-view { order: 1; height: 500px; }
                }
            `}</style>
        </div>
    );
};

export default TripPlanner;
