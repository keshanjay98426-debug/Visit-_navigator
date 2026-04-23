import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import {
    Trash2, MapPin, Navigation, Clock, Info, FolderHeart, Route
} from 'lucide-react';
import { useTripContext } from '../context/TripContext';

const BASE_LOCATION = { lat: 6.892, lng: 79.963, name: 'Athurugiriya Pore' };

const RoutingPreviewMachine = ({ locations }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!map || locations.length === 0) return;

        const waypoints = [
            L.latLng(BASE_LOCATION.lat, BASE_LOCATION.lng),
            ...locations.map(loc => L.latLng(loc.lat, loc.lng))
        ];

        const routingControl = L.Routing.control({
            waypoints: waypoints,
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }]
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: function (i, wp) {
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

const SavedTrips = () => {
    const { savedTrips, removeSavedTrip, loading } = useTripContext();
    const [selectedTripId, setSelectedTripId] = useState(null);

    React.useEffect(() => {
        if (savedTrips.length > 0 && !selectedTripId) {
            setSelectedTripId(savedTrips[0].id);
        } else if (savedTrips.length === 0) {
            setSelectedTripId(null);
        }
    }, [savedTrips, selectedTripId]);

    const handleRemove = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Remove this trip from your saved list?")) {
            removeSavedTrip(id);
            if (selectedTripId === id) setSelectedTripId(null);
        }
    };

    if (loading) return <div className="trip-planner-page" style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    const selectedTrip = savedTrips.find(t => t.id === selectedTripId);
    const tripItems = selectedTrip ? selectedTrip.locations : [];
    const totalDistance = tripItems.reduce((acc, item) => acc + (item.distance || 0), 0);
    const totalTime = totalDistance * 2;

    return (
        <div className="trip-planner-page">
            <header className="planner-header">
                <div className="planner-header-content">
                    <h1>Your <span>Saved Trips</span></h1>
                    <p>Access all the magnificent routes you've archived for future journeys.</p>
                </div>
            </header>

            <div className="planner-container">
                <aside className="route-manager">
                    <div className="route-controls">
                        <h3><FolderHeart size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Saved Archive</h3>
                    </div>

                    <div className="route-list">
                        {savedTrips.length === 0 ? (
                            <div className="no-routes">You have no saved trips. Save a trip in the My Trips planner!</div>
                        ) : (
                            savedTrips.map(trip => (
                                <div
                                    key={trip.id}
                                    className={`route-item ${trip.id === selectedTripId ? 'active' : ''}`}
                                    onClick={() => setSelectedTripId(trip.id)}
                                >
                                    <div className="route-info">
                                        <Route size={18} />
                                        <span>{trip.name}</span>
                                    </div>
                                    <div className="route-meta">
                                        <span>{trip.locations.length} stops</span>
                                        <button className="del-route-btn" onClick={(e) => handleRemove(e, trip.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedTrip && (
                        <div className="sidebar-group">
                            <h3 className="stops-title"><MapPin size={20} /> Preview: '{selectedTrip.name}'</h3>

                            {tripItems.length === 0 ? (
                                <div className="empty-trip">
                                    <p>No locations in this saved trip.</p>
                                </div>
                            ) : (
                                <div className="itinerary-list">
                                    {tripItems.map((item, index) => (
                                        <div key={item.id} className="itinerary-card" style={{ paddingRight: '15px' }}>
                                            <div className="card-index">{index + 1}</div>
                                            <div className="card-details">
                                                <h4>{item.name}</h4>
                                                <span>{item.distance} km from base</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tripItems.length > 0 && (
                                <div className="trip-summary">
                                    <div className="summary-row">
                                        <Clock size={16} />
                                        <span>Est. Time: {totalTime} mins</span>
                                    </div>
                                    <div className="summary-row">
                                        <Navigation size={16} />
                                        <span>Total Distance: {totalDistance} km</span>
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
                                <RoutingPreviewMachine locations={tripItems} />
                            </MapContainer>
                        ) : (
                            <div className="map-placeholder">
                                <div className="placeholder-content">
                                    <FolderHeart size={48} />
                                    <h3>Saved Trip Preview</h3>
                                    <p>Select a saved trip from the list to preview its route.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

    
            <style>{`
                .trip-planner-page { min-height: 100vh; padding-top: 80px; background: #fcfdfb; }
                .planner-header { background: #f8fafc; padding: 50px 40px; text-align: center; border-bottom: 1px solid #e1e8e1; }
                .planner-header-content h1 { font-size: 2.4rem; margin-bottom: 10px; }
                .planner-header-content h1 span { color: #3b82f6; }
                .planner-header-content p { color: #64748b; font-size: 1.05rem; }

                .planner-container { 
                    max-width: 1400px; margin: 40px auto; 
                    padding: 0 40px; display: grid; 
                    grid-template-columns: 420px 1fr; gap: 40px; 
                }

                .route-manager { display: flex; flex-direction: column; gap: 24px; }
                .route-controls h3 { font-size: 1.2rem; color: #1a1a1a; margin-bottom: 10px;}

                .route-list { display: flex; flex-direction: column; gap: 10px; }
                .no-routes { padding: 20px; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 12px; }
                
                .route-item { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 15px 20px; background: #fff; border: 1px solid #e2e8f0; 
                    border-radius: 12px; cursor: pointer; transition: all 0.2s; 
                }
                .route-item:hover { border-color: #3b82f6; }
                .route-item.active { background: #eff6ff; border-color: #3b82f6; }
                
                .route-info { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #1a1a1a; }
                
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
                    width: 32px; height: 32px; background: #3b82f6; color: #fff; 
                    border-radius: 50%; display: flex; align-items: center; 
                    justify-content: center; font-weight: 700; font-size: 0.9rem; 
                }
                .card-details { flex: 1; }
                .card-details h4 { font-size: 1rem; margin-bottom: 2px; }
                .card-details span { font-size: 0.8rem; color: #64748b; }

                .trip-summary { 
                    background: #1a1a1a; color: #fff; border-radius: 20px; 
                    padding: 25px; display: flex; flex-direction: column; gap: 15px; 
                    margin-top: 25px;
                }
                .summary-row { display: flex; align-items: center; gap: 12px; opacity: 0.9; font-size: 0.95rem; }

                .map-view { border-radius: 24px; overflow: hidden; height: 700px; background: #f1f5f9; border: 1px solid #e2e8f0; position: sticky; top: 100px; }
                .map-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; }
                .placeholder-content { color: #94a3b8; max-width: 300px; }
                .placeholder-content h3 { color: #475569; margin: 15px 0 10px; }

                .marker-pin { 
                    width: 30px; height: 30px; border-radius: 50% 50% 50% 0; 
                    background: #3b82f6; position: absolute; transform: rotate(-45deg); 
                    left: 50%; top: 50%; margin: -15px 0 0 -15px; border: 2px solid #fff; 
                    display: flex; align-items: center; justify-content: center; 
                }
                .marker-num { transform: rotate(45deg); color: #fff; font-size: 0.8rem; font-weight: 800; }
                .marker-pin.start { background: #10b981; }
                .marker-pin.end { background: #ef4444; }

                @media (max-width: 1024px) {
                    .planner-container { grid-template-columns: 1fr; }
                    .route-manager { order: 2; }
                    .map-view { order: 1; height: 500px; position: static; }
                }
            `}</style>
        </div>
    );
};

export default SavedTrips;
