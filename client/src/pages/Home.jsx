import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Compass, MapPin, Star, ArrowRight, Shield, Clock, Navigation } from 'lucide-react';

const Home = () => {
    const [stats, setStats] = useState({ locations: 0, categories: 0 });
    const [featuredPlaces, setFeaturedPlaces] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [placesRes, catsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/places'),
                    axios.get('http://localhost:5000/api/categories')
                ]);
                const placesWithReviews = placesRes.data.filter(place => (place.reviewCount || 0) > 0);
                const totalRating = placesWithReviews.reduce((acc, place) => acc + (place.averageRating || 0), 0);
                const avgRating = placesWithReviews.length > 0 ? (totalRating / placesWithReviews.length).toFixed(1) : "0.0";
                setStats({
                    locations: placesRes.data.length,
                    categories: catsRes.data.length,
                    avgRating
                });
                // Get top 3 rated or first 3
                setFeaturedPlaces(placesRes.data.slice(0, 3));
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();

        // Set up polling for real-time stats updates
        const intervalId = setInterval(fetchStats, 10000);
        
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <img src="/hero.png" alt="Sri Lanka Landscape" className="hero-bg" />
                <div className="hero-content">
                    <span className="hero-tag">Start Your Journey from Athurugiriya</span>
                    <h1>Navigate the Best of <span>Sri Lanka</span></h1>
                    <p>Discover handpicked locations, hidden trails, and cultural wonders. Your ultimate professional travel companion for an unforgettable experience.</p>
                    <div className="hero-btns">
                        <Link to="/locations" className="btn-primary">
                            <Compass size={20} />
                            Explore All Locations
                        </Link>
                        <a href="#about" className="btn-secondary">Learn More</a>
                    </div>
                </div>
            </section>

            {/* Stats Dashboard */}
            <section className="stats-bar">
                <div className="stat-item">
                    <div className="stat-icon"><MapPin size={24} /></div>
                    <div className="stat-text">
                        <strong>{stats.locations}+</strong>
                        <span>Curated Places</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon"><Star size={24} /></div>
                    <div className="stat-text">
                        <strong>{stats.avgRating || "0.0"}</strong>
                        <span>Average Rating</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon"><Navigation size={24} /></div>
                    <div className="stat-text">
                        <strong>Real-time</strong>
                        <span>Live Directions</span>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section id="featured" className="featured-section">
                <div className="section-header">
                    <h2>Popular Destinations</h2>
                    <p>Explore some of the most visited locations by our community.</p>
                </div>
                
                <div className="places-grid">
                    {featuredPlaces.map(place => (
                        <Link key={place._id} to={`/locations/${place._id}`} className="place-card">
                            <div className="place-img">
                                <img src={place.images?.[0] || '/temple.png'} alt={place.name} />
                                <span className="cat-badge">{place.category?.name}</span>
                            </div>
                            <div className="place-info">
                                <h3>{place.name}</h3>
                                <div className="place-meta">
                                    <span><MapPin size={14} /> {place.distance} km away</span>
                                    <span><Star size={14} fill="#fbbf24" color="#fbbf24" /> {place.averageRating || "0.0"} ({place.reviewCount || 0})</span>
                                </div>
                                <p>{place.description.substring(0, 80)}...</p>
                                <span className="view-more">View Details <ArrowRight size={14} /></span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Why Choose Us */}
            <section id="about" className="info-section">
                <div className="info-grid">
                    <div className="info-img">
                        <img src="/temple.png" alt="Experience" />
                    </div>
                    <div className="info-content">
                        <span>The Professional Choice</span>
                        <h2>Why Explorers Trust Visit Navigator</h2>
                        <div className="benefit">
                            <div className="benefit-icon"><Shield size={24} /></div>
                            <div>
                                <h4>Verified Locations</h4>
                                <p>Every spot in our directory is verified for safety, quality, and accessibility.</p>
                            </div>
                        </div>
                        <div className="benefit">
                            <div className="benefit-icon"><Clock size={24} /></div>
                            <div>
                                <h4>Accurate Timing</h4>
                                <p>Get real opening and closing hours updated by our admin community.</p>
                            </div>
                        </div>
                        <div className="benefit">
                            <div className="benefit-icon"><Compass size={24} /></div>
                            <div>
                                <h4>Precision Directions</h4>
                                <p>Navigate with confidence using our integrated mapping system.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            </div>
    );
};

export default Home;