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
            <style>{`
                .home-page { padding-top: 0; }

                /* Hero Section */
                .hero {
                    position: relative;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    text-align: center;
                    overflow: hidden;
                }

                .hero-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 1;
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
                    z-index: 2;
                }

                .hero-content {
                    position: relative;
                    z-index: 3;
                    max-width: 900px;
                    padding: 0 20px;
                    animation: fadeInUp 1s ease-out;
                }

                @keyframes fadeInUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .hero-tag {
                    display: inline-block;
                    padding: 8px 20px;
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(8px);
                    border-radius: 30px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 24px;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .hero-content h1 {
                    font-size: clamp(2.5rem, 8vw, 4.5rem);
                    font-weight: 800;
                    margin-bottom: 24px;
                    line-height: 1.1;
                }

                .hero-content h1 span { color: #81c784; }

                .hero-content p {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    margin-bottom: 40px;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                    line-height: 1.6;
                }

                .hero-btns {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                }

                .btn-primary {
                    background: #2e7d32;
                    color: #fff;
                    padding: 16px 32px;
                    border-radius: 40px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                }

                .btn-primary:hover { transform: translateY(-3px); background: #1b5e20; }

                .btn-secondary {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(8px);
                    color: #fff;
                    padding: 16px 32px;
                    border-radius: 40px;
                    text-decoration: none;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.3);
                    transition: all 0.3s;
                }

                .btn-secondary:hover { background: rgba(255,255,255,0.2); }

                /* Stats Bar */
                .stats-bar {
                    max-width: 1200px;
                    margin: -60px auto 0;
                    position: relative;
                    z-index: 10;
                    background: #fff;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    padding: 30px;
                    border-radius: 24px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    justify-content: center;
                    border-right: 1px solid #f1f5f9;
                }

                .stat-item:last-child { border-right: none; }

                .stat-icon {
                    width: 50px;
                    height: 50px;
                    background: #f0fdf4;
                    color: #2e7d32;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-text strong { display: block; font-size: 1.5rem; color: #1a1a1a; }
                .stat-text span { font-size: 0.9rem; color: #64748b; }

                /* Featured Section */
                .featured-section {
                    max-width: 1300px;
                    margin: 100px auto;
                    padding: 0 40px;
                }

                .section-header { text-align: center; margin-bottom: 60px; }
                .section-header h2 { font-size: 2.5rem; color: #1a1a1a; margin-bottom: 15px; }
                .section-header p { color: #64748b; font-size: 1.1rem; }

                .places-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 30px;
                }

                .place-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    text-decoration: none;
                    color: inherit;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    transition: all 0.3s;
                    border: 1px solid #f1f5f9;
                }

                .place-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }

                .place-img { position: relative; height: 240px; }
                .place-img img { width: 100%; height: 100%; object-fit: cover; }
                .cat-badge {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(4px);
                    padding: 6px 15px;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #2e7d32;
                    text-transform: uppercase;
                }

                .place-info { padding: 25px; }
                .place-info h3 { font-size: 1.3rem; margin-bottom: 12px; }
                .place-meta { display: flex; gap: 20px; margin-bottom: 15px; color: #64748b; font-size: 0.85rem; }
                .place-meta span { display: flex; align-items: center; gap: 5px; }
                .place-info p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; }
                .view-more { color: #2e7d32; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }

                /* Info Section */
                .info-section {
                    background: #f8fafc;
                    padding: 100px 40px;
                }

                .info-grid {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 80px;
                    align-items: center;
                }

                .info-img img { width: 100%; border-radius: 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.1); }

                .info-content span { color: #2e7d32; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; }
                .info-content h2 { font-size: 2.5rem; margin: 15px 0 40px; line-height: 1.2; }

                .benefit { display: flex; gap: 25px; margin-bottom: 35px; }
                .benefit-icon {
                    flex-shrink: 0;
                    width: 56px;
                    height: 56px;
                    background: #fff;
                    color: #2e7d32;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }

                .benefit h4 { font-size: 1.2rem; margin-bottom: 8px; }
                .benefit p { color: #64748b; line-height: 1.5; }

                @media (max-width: 1024px) {
                    .places-grid { grid-template-columns: repeat(2, 1fr); }
                    .info-grid { grid-template-columns: 1fr; gap: 60px; }
                    .stats-bar { grid-template-columns: 1fr 1fr; gap: 20px; }
                }

                @media (max-width: 768px) {
                    .places-grid { grid-template-columns: 1fr; }
                    .stats-bar { grid-template-columns: 1fr; margin: -40px 20px 0; }
                    .hero-btns { flex-direction: column; }
                }
            `}</style>

            </div>
    );
};

export default Home;