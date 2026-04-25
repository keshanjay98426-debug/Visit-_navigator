import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Plus, Search, Edit2, Trash2, X, Image as ImageIcon, 
  Map as MapIcon, Info, Clock, Navigation2, Filter
} from 'lucide-react';


import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationManagement = () => {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    latitude: 6.8488, 
    longitude: 79.9901,
    distance: 0,
    openingHours: '',
    closingTimes: '',
    is24Hours: false,
    tips: '',
    images: []
  });

  const apiUrl = 'http://localhost:5000/api/places';
  const catUrl = 'http://localhost:5000/api/categories';
  const token = localStorage.getItem('token');

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

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
      },
    });

    return formData.latitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  };

  
  function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 15);
      }
    }, [center, map]);
    return null;
  }

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!mapSearchTerm.trim()) return;

    setIsSearchingMap(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchTerm)}`
      );
      
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        setFormData({
          ...formData,
          latitude: newLat,
          longitude: newLng
        });
      } else {
        alert('Location not found. Please try a more specific search.');
      }
    } catch (err) {
      console.error('Map search error:', err);
      alert('Error searching for location. Please try again.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const base64Promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    });

    const base64Images = await Promise.all(base64Promises);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...base64Images]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleOpenModal = (place = null) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name,
        category: place.category?._id || '',
        description: place.description,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        distance: place.distance,
        openingHours: place.openingHours,
        closingTimes: place.closingTimes,
        tips: place.tips || '',
        images: place.images || []
      });
    } else {
      setEditingPlace(null);
      setFormData({
        name: '', category: '', description: '', 
        latitude: 6.8488, longitude: 79.9901, distance: 0,
        openingHours: '', closingTimes: '', tips: '', images: []
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      location: {
        latitude: formData.latitude,
        longitude: formData.longitude
      }
    };

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      if (editingPlace) {
        await axios.put(`${apiUrl}/${editingPlace._id}`, payload, config);
      } else {
        await axios.post(apiUrl, payload, config);
      }
      fetchData();
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error saving location');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      await axios.delete(`${apiUrl}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
      alert('Location deleted successfully');
    } catch (err) {
      alert('Error deleting location');
    }
  };

  const filteredPlaces = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || p.category?._id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="management-page">
      <div className="page-actions">
        <div className="actions-left">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="cat-filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Location
        </button>
      </div>

      <div className="locations-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredPlaces.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Category</th>
                <th>Coordinates</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaces.map(place => (
                <tr key={place._id}>
                  <td>
                    <div className="place-cell">
                      <strong>{place.name}</strong>
                      <span>{place.distance} km from Athurugiriya</span>
                    </div>
                  </td>
                  <td><span className="badge">{place.category?.name || 'Uncategorized'}</span></td>
                  <td>{place.location.latitude.toFixed(4)}, {place.location.longitude.toFixed(4)}</td>
                  <td>
                    <div className="image-count">
                      <ImageIcon size={14} />
                      {place.images?.length || 0}/10
                    </div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit" onClick={() => handleOpenModal(place)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(place._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No locations found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h2>{editingPlace ? 'Edit Location' : 'Add New Location'}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="multi-column-form">
              <div className="form-left">
                <div className="form-group">
                  <label>Location Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label>Distance (km)</label>
                    <input type="number" required step="0.1" value={formData.distance} onChange={(e) => setFormData({...formData, distance: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formData.is24Hours} 
                      onChange={(e) => setFormData({...formData, is24Hours: e.target.checked})} 
                    />
                    <span>Open 24 Hours</span>
                  </label>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Opening Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 8:00 AM" 
                      required={!formData.is24Hours} 
                      disabled={formData.is24Hours}
                      value={formData.is24Hours ? '00:00' : formData.openingHours} 
                      onChange={(e) => setFormData({...formData, openingHours: e.target.value})} 
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Closing Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 6:00 PM" 
                      required={!formData.is24Hours} 
                      disabled={formData.is24Hours}
                      value={formData.is24Hours ? '00:00' : formData.closingTimes} 
                      onChange={(e) => setFormData({...formData, closingTimes: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tips for Visitors</label>
                  <input type="text" value={formData.tips} onChange={(e) => setFormData({...formData, tips: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Images (Max 10)</label>
                  <div className="image-uploader">
                    <label className="upload-btn">
                      <Plus size={24} />
                      <span>Add Images</span>
                      <input type="file" multiple accept="image/*" style={{display: 'none'}} onChange={handleFileChange} />
                    </label>
                    <div className="preview-grid">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="preview-item">
                          <img src={img} alt="preview" />
                          <button type="button" onClick={() => removeImage(idx)}><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-right">
                <div className="form-group">
                  <label>Pick Location on Map</label>
                  <div className="map-picker">
                    <div className="map-search-overlay">
                      <div className="map-search-bar">
                        <input 
                          type="text" 
                          placeholder="Search for a place (e.g. Galle Face, Colombo)..." 
                          value={mapSearchTerm}
                          onChange={(e) => setMapSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleMapSearch(e)}
                        />
                        <button type="button" onClick={handleMapSearch} disabled={isSearchingMap}>
                          {isSearchingMap ? '...' : <Search size={16} />}
                        </button>
                      </div>
                    </div>
                    <MapContainer 
                      center={[formData.latitude, formData.longitude]} 
                      zoom={13} 
                      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <ChangeView center={[formData.latitude, formData.longitude]} />
                      <LocationMarker />
                    </MapContainer>
                    <div className="coords-display">
                      <span>Lat: {formData.latitude.toFixed(6)}</span>
                      <span>Lng: {formData.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-footer">
                  <button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="save-btn">Save Location</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .management-page {
          padding: 10px;
        }

        .page-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .actions-left {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex: 1;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0.625rem 1rem;
          border-radius: 12px;
          flex: 1;
          max-width: 400px;
          gap: 0.75rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          
        }

        .search-bar input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.875rem;
          background: transparent;
          color: #1e293b;
        }

        .filter-group {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0.625rem 1rem;
          border-radius: 12px;
          gap: 0.75rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .cat-filter-select {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.875rem;
          color: #1e293b;
          cursor: pointer;
          min-width: 150px;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background-color: #3b82f6;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }

        .add-btn:hover { background-color: #2563eb; transform: translateY(-1px); }

        .locations-list {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 2px solid #f1f5f9;
        }

        .data-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .badge {
          background: #eff6ff;
          color: #3b82f6;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(8px);
          padding: 20px;
        }

        .modal-content.wide {
          background: #fff;
          width: 100%;
          max-width: 1100px;
          max-height: 95vh;
          overflow-y: auto;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
        }

        .modal-header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
        }

        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .close-btn:hover { background: #e2e8f0; color: #0f172a; }

        .multi-column-form {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-direction: row !important;
          margin-bottom: 0 !important;
        }
        .checkbox-label input { width: 18px !important; height: 18px !important; cursor: pointer; }

        .form-group { margin-bottom: 25px; }
        .form-group label { 
          display: block; 
          font-size: 0.875rem; 
          font-weight: 600; 
          margin-bottom: 8px; 
          color: #334155; // Darker text for visibility
        }
        
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          background-color: #fff;
          color: #1e293b;
          transition: all 0.2s;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-row { display: flex; gap: 20px; }
        .flex-1 { flex: 1; }

        .image-uploader { 
          border: 2px dashed #cbd5e1; 
          padding: 20px; 
          border-radius: 16px; 
          background: #f8fafc;
        }
        
        .upload-btn { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 10px; 
          cursor: pointer; 
          color: #64748b; 
          padding: 20px;
          transition: color 0.2s;
        }
        .upload-btn:hover { color: #3b82f6; }

        .preview-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); 
          gap: 12px; 
          margin-top: 20px; 
        }
        
        .preview-item { 
          position: relative; 
          aspect-ratio: 1; 
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .preview-item button { 
          position: absolute; 
          top: 4px; right: 4px; 
          background: rgba(239, 68, 68, 0.9); 
          color: #fff; 
          border: none; 
          border-radius: 50%; 
          width: 22px; height: 22px; 
          cursor: pointer; 
          display: flex; align-items: center; justify-content: center;
        }

        .map-picker { 
          border: 1.5px solid #e2e8f0; 
          top: 500px;
          border-radius: 16px; 
          padding: 12px; 
          background: #f8fafc; 
          position: default;
         
        }
        
        .map-search-overlay {
          position: default;
          left: 25px;
          right: 25px;
          z-index: 1000;
          
        }
        
        .map-search-bar {
          display: flex;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1.5px solid #e2e8f0;
          overflow: hidden;
        }
        
        .map-search-bar input {
          flex: 1;
          border: none !important;
          padding: 12px 16px !important;
          font-size: 0.9rem;
          outline: none;
          background: transparent;
        }
        
        .map-search-bar button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0 20px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .map-search-bar button:hover { background: #2563eb; }
        
        .coords-display { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 4px 0; 
          font-family: 'JetBrains Mono', monospace; 
          font-size: 0.75rem; 
          color: #64748b; 
          font-weight: 500;
        }

     

        .form-footer { 
          display: flex; 
          justify-content: flex-end; 
          gap: 15px; 
          margin-top: 30px; 
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }
        
        .cancel-btn { 
          padding: 0.875rem 1.75rem; 
          top:80px;
          border: 1.5px solid #e2e8f0; 
          background: #fff; 
          border-radius: 12px; 
          font-weight: 600;
          color: #64748b;
          cursor: pointer; 
          transition: all 0.2s;
        }
        .cancel-btn:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
        
        .save-btn { 
          top:80px;
          padding: 0.875rem 1.75rem; 
          background: #0f172a; 
          color: #fff; 
          border: none; 
          border-radius: 12px; 
          font-weight: 600;
          cursor: pointer; 
          transition: all 0.2s;
        }
        .save-btn:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default LocationManagement;
