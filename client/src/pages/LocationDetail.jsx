import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { 
    Clock, MapPin, Star, Navigation, Info, ArrowLeft, 
    ChevronLeft, ChevronRight, CheckCircle, Phone, Share2
} from 'lucide-react';
import { useTripContext } from '../context/TripContext';

// Helper component to fix map size issues when toggled
const MapResizer = ({ isVisible }) => {
    const map = useMap();
    useEffect(() => {
        if (isVisible) {
            setTimeout(() => {
                map.invalidateSize();
            }, 300); // Wait for CSS transition
        }
    }, [isVisible, map]);
    return null;
};


const RoutingMachine = ({ userPos, destPos }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !userPos || !destPos) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userPos.lat, userPos.lng),
                L.latLng(destPos.lat, destPos.lng)
            ],
            lineOptions: {
                styles: [{ color: '#2e7d32', weight: 6, opacity: 0.8 }]
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            createMarker: function(i, wp) {
                return L.marker(wp.latLng, {
                    icon: L.divIcon({
                        className: 'custom-marker-wrapper',
                        html: `<div class="marker-pin ${i === 0 ? 'user' : 'dest'}"></div>`
                    })
                });
            }
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, userPos, destPos]);

    return null;
};

const LocationDetail = () => {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const [showDirections, setShowDirections] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isInTrip, setIsInTrip] = useState(false);
    const { plannedTrips, activeTripId, addLocationToTrip } = useTripContext();

    useEffect(() => {
        const defaultLocation = { lat: 6.892, lng: 79.963 }; 
        setUserLocation(defaultLocation);

        const fetchPlaceAndReviews = async () => {
            try {
                const [placeRes, reviewsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/places/${id}`),
                    axios.get(`http://localhost:5000/api/reviews/${id}`)
                ]);
                setPlace(placeRes.data);
                setReviews(reviewsRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setLoading(false);
            }
        };
        fetchPlaceAndReviews();

   
        if (plannedTrips && plannedTrips.length > 0) {
            const activeTrip = plannedTrips.find(t => t.id === activeTripId) || plannedTrips[0];
            if (activeTrip) {
                setIsInTrip(activeTrip.locations.some(item => item.id === id));
            } else {
                setIsInTrip(false);
            }
        } else {
            setIsInTrip(false);
        }

       
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.warn('Geolocation denied or unavailable, using Pore default.', err);
                    setUserLocation(defaultLocation);
                }
            );
        }
    }, [id]);

    const addToTrip = () => {
        if (place) {
            const locationData = {
                id: id,
                name: place.name,
                lat: place.location.latitude,
                lng: place.location.longitude,
                distance: place.distance
            };
            addLocationToTrip(locationData);
            setIsInTrip(true);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await axios.post(`http://localhost:5000/api/reviews/${id}`, {
                reviewerName: reviewForm.name,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            // Refresh reviews
            const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
            setReviews(res.data);
            setReviewForm({ name: '', rating: 5, comment: '' });
        } catch (err) {
            console.error('Error submitting review:', err);
        }
        setSubmittingReview(false);
    };

    const nextImage = () => {
        setActiveImage((prev) => (prev + 1) % place.images.length);
    };

    const prevImage = () => {
        setActiveImage((prev) => (prev - 1 + place.images.length) % place.images.length);
    };

    if (loading) return (
        <div className="loading-fullscreen">
            <div className="spinner"></div>
            <p>Gathering travel details...</p>
        </div>
    );

    if (!place) return <div className="error-state">Location not found.</div>;

    const destPos = { lat: place.location.latitude, lng: place.location.longitude };

    return (
        <div className="detail-page">
          
            <section className="detail-hero">
                <div className="gallery-main">
                    <img src={place.images[activeImage] || '/temple.png'} alt={place.name} className="main-img" />
                    
                    <button className="nav-btn prev" onClick={prevImage}><ChevronLeft size={30} /></button>
                    <button className="nav-btn next" onClick={nextImage}><ChevronRight size={30} /></button>
                    
                    <div className="gallery-indicators">
                        {place.images.map((_, idx) => (
                            <span 
                                key={idx} 
                                className={`indicator ${idx === activeImage ? 'active' : ''}`}
                                onClick={() => setActiveImage(idx)}
                            ></span>
                        ))}
                    </div>

                    <Link to="/locations" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Explore
                    </Link>
                </div>
            </section>

          
            <div className="detail-container">
                <div className="detail-main-content">
                    <header className="place-header">
                        <div className="category-tag">{place.category?.name}</div>
                        <h1>{place.name}</h1>
                        <div className="place-actions">
                            <div className="quick-meta">
                                <span><Star size={18} fill="#fbbf24" color="#fbbf24" /> {place.averageRating || "0.0"} ({place.reviewCount || 0} reviews)</span>
                                <span><MapPin size={18} /> Athurugiriya → {place.distance} km</span>
                            </div>
                            <div className="action-buttons">
                                <button className="btn-icon"><Share2 size={20} /></button>
                                <button 
                                    className={`btn-trip ${isInTrip ? 'added' : ''}`} 
                                    onClick={addToTrip}
                                    disabled={isInTrip}
                                >
                                    {isInTrip ? 'Added to Trip' : 'Add to Trip'}
                                </button>
                                <button className="btn-direction" onClick={() => setShowDirections(!showDirections)}>
                                    <Navigation size={20} />
                                    {showDirections ? 'Hide Map' : 'Get Directions'}
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="description-section">
                        <h2>About this location</h2>
                        <p>{place.description}</p>
                    </div>

                    <div className="tips-section">
                        <div className="tips-card">
                            <div className="tips-header">
                                <Info size={24} color="#2e7d32" />
                                <h3>Pro Tips for Travelers</h3>
                            </div>
                            <p>{place.tips || 'Be sure to carry enough water and wear comfortable shoes for trekking if required.'}</p>
                        </div>
                    </div>

                   
                    <div className={`directions-box ${showDirections ? 'visible' : ''}`}>
                        <div className="box-header">
                            <h3><Navigation size={20} /> Navigation Guide</h3>
                            {!userLocation && <span className="loc-warning">Please enable location access for real-time routing.</span>}
                        </div>
                        <div className="map-wrapper">
                            <MapContainer center={[destPos.lat, destPos.lng]} zoom={15} style={{ height: '450px', width: '100%', borderRadius: '16px' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapResizer isVisible={showDirections} />
                                <Marker position={[destPos.lat, destPos.lng]}>
                                    <Popup>{place.name}</Popup>
                                </Marker>
                                {showDirections && userLocation && (
                                    <RoutingMachine userPos={userLocation} destPos={destPos} />
                                )}
                            </MapContainer>
                        </div>
                    </div>

                    
                    <section className="reviews-section">
                        <h2>Traveler Reviews</h2>
                        <div className="reviews-grid">
                            <div className="review-form-card">
                                <h3>Share Your Experience</h3>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="form-group">
                                        <label>Your Name</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="Enter your name"
                                            value={reviewForm.name}
                                            onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <div className="rating-input">
                                            {[1,2,3,4,5].map(num => (
                                                <Star 
                                                    key={num} 
                                                    size={24} 
                                                    fill={reviewForm.rating >= num ? "#fbbf24" : "none"} 
                                                    color="#fbbf24"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setReviewForm({...reviewForm, rating: num})}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Your Feedback</label>
                                        <textarea 
                                            required 
                                            rows="4" 
                                            placeholder="Tell other travelers about your visit..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <button type="submit" disabled={submittingReview} className="submit-review-btn">
                                        {submittingReview ? 'Posting...' : 'Post Review'}
                                    </button>
                                </form>
                            </div>

                            <div className="reviews-list">
                                {reviews.length > 0 ? (
                                    reviews.map((rev, idx) => (
                                        <div key={idx} className="review-card">
                                            <div className="review-header">
                                                <div className="reviewer-avatar">
                                                    {(rev.reviewerName || rev.userId?.username || 'A').charAt(0)}
                                                </div>
                                                <div className="reviewer-info">
                                                    <h4>{rev.reviewerName || rev.userId?.username || 'Anonymous Traveler'}</h4>
                                                    <div className="review-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < rev.rating ? "#fbbf24" : "none"} color="#fbbf24" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="review-date">{new Date(rev.date || rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="review-comment">{rev.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-reviews">
                                        <p>No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <aside className="detail-sidebar">
                    <div className="sidebar-card">
                        <h3>Operating Hours</h3>
                        <div className="hour-item">
                            <Clock size={16} />
                            {place.is24Hours ? (
                                <span className="status-badge-24h">Open 24 Hours</span>
                            ) : (
                                <span>{place.openingHours} - {place.closingTimes}</span>
                            )}
                        </div>
                        <div className={`status-badge ${place.is24Hours ? 'open' : 'open'}`}>
                            {place.is24Hours ? 'Always Open' : 'Open Now'}
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .detail-page { min-height: 100vh; padding-top: 0; background: #fff; }

                /* Hero / Gallery */
                .detail-hero { position: relative; height: 70vh; min-height: 500px; }
                .gallery-main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #1a1a1a; }
                .main-img { width: 100%; height: 100%; object-fit: cover; animation: fadeIn 0.5s ease; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .nav-btn {
                    position: absolute;
                    top: 50%; transform: translateY(-50%);
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    border: none;
                    width: 60px; height: 60px;
                    border-radius: 50%;
                    color: #fff;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    z-index: 10;
                }
                .nav-btn:hover { background: rgba(255,255,255,0.4); }
                .nav-btn.prev { left: 40px; }
                .nav-btn.next { right: 40px; }

                .gallery-indicators {
                    position: absolute;
                    bottom: 40px; left: 50%; transform: translateX(-50%);
                    display: flex; gap: 10px; z-index: 10;
                }
                .indicator { width: 40px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 4px; cursor: pointer; }
                .indicator.active { background: #fff; }

                .back-link {
                    position: absolute; top: 100px; left: 40px;
                    z-index: 100; color: #fff; text-decoration: none;
                    display: flex; align-items: center; gap: 8px;
                    background: rgba(0,0,0,0.3); backdrop-filter: blur(10px);
                    padding: 10px 20px; border-radius: 30px; font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                /* Container */
                .detail-container {
                    max-width: 1400px; margin: -60px auto 100px;
                    padding: 0 40px; display: grid;
                    grid-template-columns: 1fr 350px; transition: all .3s;
                    gap: 60px; position: relative; z-index: 10;
                }

                .detail-main-content { background: #fff; border-radius: 32px; padding: 60px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }

                .place-header h1 { font-size: 3.5rem; margin-bottom: 24px; color: #1a1a1a; letter-spacing: -1px; text-transform: capitalize; }
                .category-tag { color: #2e7d32; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 12px; }

                .place-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                .quick-meta { display: flex; gap: 30px; color: #64748b; font-weight: 600; }
                .quick-meta span { display: flex; align-items: center; gap: 8px; }

                .action-buttons { display: flex; gap: 15px; }
                .btn-icon { width: 50px; height: 50px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; color: #64748b; }
                .btn-direction { 
                    background: #1a1a1a; color: #fff; border: none; 
                    padding: 0 25px; border-radius: 12px; font-weight: 700;
                    display: flex; align-items: center; gap: 10px; cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-direction:hover { background: #333; transform: scale(1.05); }

                .btn-trip {
                    background: #fff; color: #1a1a1a; 
                    border: 1.5px solid #1a1a1a; 
                    padding: 0 20px; border-radius: 12px; font-weight: 700;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-trip.added { background: #f1f8f1; color: #2e7d32; border-color: #2e7d32; cursor: default; }
                .btn-trip:hover:not(.added) { background: #f8fafc; }

                /* Reviews Section */
                .reviews-section { margin-top: 80px; padding-top: 60px; border-top: 1px solid #f1f5f9; }
                .reviews-section h2 { font-size: 2rem; margin-bottom: 40px; color: #1a1a1a; }
                
                .reviews-grid { display: grid; grid-template-columns: 400px 1fr; gap: 60px; }
                
                .review-form-card { background: #f8fafc; padding: 30px; border-radius: 20px; position: sticky; top: 100px; }
                .review-form-card h3 { font-size: 1.3rem; margin-bottom: 25px; color: #1a1a1a; }
                
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 8px; color: #475569; }
                .form-group input, .form-group textarea { 
                    width: 100%; padding: 12px; border: 1px solid #e2e8f0; 
                    border-radius: 10px; font-family: inherit; font-size: 0.95rem; 
                }
                .rating-input { display: flex; gap: 8px; margin-top: 5px; }
                
                .submit-review-btn { 
                    width: 100%; padding: 14px; background: #2e7d32; color: #fff; 
                    border: none; border-radius: 12px; font-weight: 700; cursor: pointer; 
                }
                
                .reviews-list { display: flex; flex-direction: column; gap: 24px; }
                .review-card { padding: 30px; border: 1px solid #f1f5f9; border-radius: 20px; background: #fff; }
                .review-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; position: relative; }
                .reviewer-avatar { 
                    width: 44px; height: 44px; background: #f1f8f1; color: #2e7d32; 
                    border-radius: 50%; display: flex; align-items: center; 
                    justify-content: center; font-weight: 800; font-size: 1.2rem; 
                }
                .reviewer-info h4 { font-size: 1.1rem; margin-bottom: 2px; }
                .review-date { position: absolute; top: 0; right: 0; font-size: 0.8rem; color: #94a3b8; }
                .review-comment { color: #4a4a4a; line-height: 1.7; font-size: 1.05rem; }
                
                .no-reviews { text-align: center; padding: 60px; color: #94a3b8; font-style: italic; }

                .description-section { margin-bottom: 50px; }
                .description-section h2 { font-size: 1.8rem; margin-bottom: 20px; color: #1a1a1a; }
                .description-section p { font-size: 1.15rem; line-height: 1.8; color: #4a4a4a; }

                .tips-card { background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 20px; padding: 30px; }
                .tips-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
                .tips-header h3 { font-size: 1.25rem; color: #166534; margin: 0; }
                .tips-card p { color: #166534; margin: 0; line-height: 1.6; }

                /* Map & Directions */
                .directions-box { margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 60px; display: none; }
                .directions-box.visible { display: block; animation: slideDown 0.5s ease-out; }

                .box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .box-header h3 { display: flex; align-items: center; gap: 10px; margin: 0; }
                .loc-warning { font-size: 0.85rem; color: #ef4444; background: #fef2f2; padding: 6px 12px; border-radius: 8px; }

                .map-wrapper { border: 2px solid #f1f5f9; border-radius: 20px; overflow: hidden; }

                /* Sidebar */
                .sidebar-card { background: #fff; border-radius: 24px; padding: 35px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; position: sticky; top: 120px; }
                .sidebar-card h3 { font-size: 1.1rem; margin-bottom: 20px; }
                .hour-item { display: flex; align-items: center; gap: 12px; color: #4a4a4a; margin-bottom: 15px; font-weight: 500; }
                .status-badge { display: inline-block; padding: 6px 15px; border-radius: 30px; font-size: 0.8rem; font-weight: 700; }
                .status-badge.open { background: #dcfce7; color: #166534; }
                .status-badge-24h { color: #2e7d32; font-weight: 700; font-size: 0.95rem; }

                .divider { height: 1px; background: #f1f5f9; margin: 30px 0; }
                
                .sidebar-info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; font-size: 0.9rem; color: #64748b; font-weight: 500; }
                .btn-outline { width: 100%; padding: 14px; background: #fff; border: 1.5px solid #1a1a1a; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; }

                /* Custom Markers */
                .custom-marker-wrapper { background: none; border: none; }
                .marker-pin { 
                    width: 30px; height: 30px; 
                    border-radius: 50% 50% 50% 0; 
                    background: #2e7d32; 
                    position: absolute; 
                    transform: rotate(-45deg) translate(0, -50%); 
                    left: 50%; top: 50%; 
                    border: 3px solid #fff; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
                }
                .marker-pin.user { background: #3b82f6; }
                .marker-pin.dest { background: #e11d48; }

                /* Hide Leaflet Routing Machine default UI */
                .leaflet-routing-container {
                    display: none !important;
                }

                .leaflet-routing-alt {
                    display: none !important;
                }

                /* Loading */
                .loading-fullscreen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
                .spinner { width: 50px; height: 50px; border: 5px solid #f1f8f1; border-top-color: #2e7d32; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .detail-container { grid-template-columns: 1fr; margin-top: -30px; }
                    .detail-sidebar { display: none; }
                    .detail-hero { height: 50vh; }
                }

                @media (max-width: 768px) {
                    .detail-main-content { padding: 40px 25px; border-radius: 20px; }
                    .place-header h1 { font-size: 2.2rem; }
                    .place-actions { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .quick-meta { gap: 15px; flex-wrap: wrap; }
                }
            `}</style>
        </div>
    );
};

export default LocationDetail;
