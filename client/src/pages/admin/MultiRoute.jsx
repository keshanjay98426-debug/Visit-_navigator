import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Search, MapPin, Navigation, ListChecks, Check, X } from 'lucide-react';

const RoutingMachine = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 4 }]
      },
      show: true,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, waypoints]);

  return null;
};

const MultiRoute = () => {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const apiUrl = 'http://localhost:5000/api/places';
  const catUrl = 'http://localhost:5000/api/categories';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [placesRes, catsRes] = await Promise.all([
        axios.get(apiUrl),
        axios.get(catUrl)
      ]);
      setPlaces(placesRes.data);
      setCategories(catsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const togglePlaceSelection = (place) => {
    if (selectedPlaces.find(p => p._id === place._id)) {
      setSelectedPlaces(selectedPlaces.filter(p => p._id !== place._id));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const filteredPlaces = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || p.category?._id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const waypoints = selectedPlaces.map(p => ({
    lat: p.location.latitude,
    lng: p.location.longitude,
    name: p.name
  }));

  return (
    <div className="multi-route-page">
      <div className="route-sidebar">
        <div className="sidebar-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search locations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sidebar-filter">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="selection-stats">
          <ListChecks size={20} />
          <span>{selectedPlaces.length} Locations Selected</span>
          {selectedPlaces.length > 0 && (
            <button className="clear-btn" onClick={() => setSelectedPlaces([])}>Clear All</button>
          )}
        </div>

        <div className="places-selection-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredPlaces.map(place => {
            const isSelected = selectedPlaces.find(p => p._id === place._id);
            return (
              <div 
                key={place._id} 
                className={`selection-item ${isSelected ? 'selected' : ''}`}
                onClick={() => togglePlaceSelection(place)}
              >
                <div className="item-icon">
                  {isSelected ? <Check size={16} /> : <MapPin size={16} />}
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

      <div className="route-map-container">
        <MapContainer 
          center={[6.8488, 79.9901]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {selectedPlaces.map(place => (
            <Marker 
              key={place._id} 
              position={[place.location.latitude, place.location.longitude]}
            >
              <Popup>
                <strong>{place.name}</strong><br/>
                {place.category?.name}
              </Popup>
            </Marker>
          ))}

          {waypoints.length >= 2 && <RoutingMachine waypoints={waypoints} />}
        </MapContainer>

        {waypoints.length < 2 && (
          <div className="map-overlay-hint">
            <Navigation size={48} />
            <h2>Multi-Location Router</h2>
            <p>Select at least 2 locations from the sidebar to calculate the best route between them.</p>
          </div>
        )}
      </div>

      <style>{`
        .multi-route-page {
          display: flex;
          height: calc(100vh - 140px);
          gap: 1.5rem;
        }

        .route-sidebar {
          width: 350px;
          background: #fff;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-search {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-search input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.875rem;
        }

        .sidebar-filter {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-filter select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background: #fff;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .selection-stats {
          padding: 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 5 star00;
        }

        .clear-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .places-selection-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .selection-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0.25rem;
        }

        .selection-item:hover {
          background: #f8fafc;
        }

        .selection-item.selected {
          background: #eff6ff;
        }

        .item-icon {
          width: 32px;
          height: 32px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .selected .item-icon {
          background: #3b82f6;
          color: #fff;
        }

        .item-info {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .item-cat {
          font-size: 0.75rem;
          color: #64748b;
        }

        .route-map-container {
          flex: 1;
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          position: relative;
        }

        .map-overlay-hint {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #64748b;
          backdrop-filter: blur(4px);
        }

        .map-overlay-hint h2 {
          margin: 1rem 0 0.5rem;
          color: #1e293b;
        }

        /* Routing machine custom styles */
        .leaflet-routing-container {
          background: #fff;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default MultiRoute;
