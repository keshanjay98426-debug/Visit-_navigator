import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Filter, ArrowRight, Grid, List as ListIcon } from 'lucide-react';

const PublicLocations = () => {
    const [places, setPlaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [placesRes, catsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/places'),
                axios.get('http://localhost:5000/api/categories')
            ]);
            setPlaces(placesRes.data);
            setCategories(catsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    const filteredPlaces = places.filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            place.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || place.category?._id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="explore-page">
          
            <section className="explore-header">
                <div className="explore-header-content">
                    <h1>Explore <span>Destinations</span></h1>
                    <p>Find your next adventure from our handpicked selection of top-rated locations.</p>
                </div>
            </section>

           
            <section className="filter-hub">
                <div className="filter-content-wrapper">
                    <div className="search-group">
                        <div className="search-input-wrapper">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, city, or keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <div className="category-chips">
                            <button
                                className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All Places
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    className={`chip ${selectedCategory === cat._id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat._id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="view-toggles">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Grid */}
            <section className="results-section">
                <div className="results-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Discovering places...</p>
                        </div>
                    ) : filteredPlaces.length > 0 ? (
                        <div className={`places-${viewMode}`}>
                            {filteredPlaces.map(place => (
                                <Link key={place._id} to={`/locations/${place._id}`} className="explore-card">
                                    <div className="card-img">
                                        <img src={place.images?.[0] || '/temple.png'} alt={place.name} />
                                        <div className="card-overlay">
                                            <span className="card-cat">{place.category?.name}</span>
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-header">
                                            <h3>{place.name}</h3>
                                            <div className="rating">
                                                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                                <span>{place.averageRating || "0.0"} ({place.reviewCount || 0} reviews)</span>
                                            </div>
                                        </div>
                                        <div className="card-meta">
                                            <span><MapPin size={14} /> {place.distance} km from Athurugiriya</span>
                                        </div>
                                        <p>{place.description.substring(0, 100)}...</p>
                                        <div className="card-footer">
                                            <span className="hours">
                                                {place.is24Hours ? (
                                                    <span className="open-24h-text">24 Hours Open</span>
                                                ) : (
                                                    `Open: ${place.openingHours} - ${place.closingTimes}`
                                                )}
                                            </span>
                                            <span className="explore-btn">Details <ArrowRight size={16} /></span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <div className="no-results-icon">🔎</div>
                            <h3>No locations found</h3>
                            <p>We couldn't find any places matching your criteria. Try adjusting your search or filters.</p>
                            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="reset-btn">
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .explore-page { min-height: 100vh; padding-top: 80px; }

                /* Header */
                .explore-header {
                    background: #f1f8f1;
                    padding: 80px 40px;
                    text-align: center;
                }

                .explore-header-content h1 { font-size: 3rem; margin-bottom: 15px; }
                .explore-header-content h1 span { color: #2e7d32; }
                .explore-header-content p { color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto; }

                /* Filters */
                .filter-hub {
                    position: sticky;
                    top: 80px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(12px);
                    z-index: 100;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 20px 40px;
                }

                .filter-content-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 30px;
                }

                .search-group { flex: 1; max-width: 500px; }
                .search-input-wrapper {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    gap: 12px;
                    color: #94a3b8;
                    transition: all 0.2s;
                }

                .search-input-wrapper:focus-within {
                    border-color: #2e7d32;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
                }

                .search-input-wrapper input {
                    border: none;
                    background: none;
                    height: 48px;
                    width: 100%;
                    outline: none;
                    color: #1a1a1a;
                    font-size: 0.95rem;
                }

                .filter-actions { display: flex; align-items: center; gap: 30px; }

                .category-chips { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
                .chip {
                    white-space: nowrap;
                    padding: 8px 18px;
                    border-radius: 30px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .chip:hover { border-color: #2e7d32; color: #2e7d32; }
                .chip.active { background: #2e7d32; color: #fff; border-color: #2e7d32; }

                .view-toggles { display: flex; gap: 8px; }
                .view-toggles button {
                    background: #f1f5f9;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .view-toggles button.active { background: #1a1a1a; color: #fff; }

                /* Results */
                .results-section { padding: 60px 40px; }
                .results-container { max-width: 1400px; margin: 0 auto; }

                .places-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 30px;
                }

                .explore-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    text-decoration: none;
                    color: inherit;
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                }

                .explore-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }

                .card-img { position: relative; height: 260px; }
                .card-img img { width: 100%; height: 100%; object-fit: cover; }
                .card-overlay {
                    position: absolute;
                    inset: 0;
                    padding: 20px;
                    background: linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 40%);
                    display: flex;
                    align-items: flex-end;
                }

                .card-cat {
                    background: #fff;
                    padding: 5px 14px;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #2e7d32;
                }

                .cat-badge-24h {
                    background: #2e7d32;
                    color: #fff;
                    padding: 5px 14px;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-left: 10px;
                }

                .open-24h-text {
                    color: #2e7d32;
                    font-weight: 700;
                }

                .card-content { padding: 25px; }
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
                .card-header h3 { font-size: 1.4rem; color: #1a1a1a; }
                .rating { display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 0.9rem; }

                .card-meta { margin-bottom: 15px; color: #64748b; font-size: 0.85rem; display: flex; gap: 15px; }
                .card-content p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 25px; }

                .card-footer {
                    padding-top: 20px;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .hours { font-size: 0.85rem; color: #94a3b8; font-weight: 500; }
                .explore-btn { color: #2e7d32; font-weight: 700; display: flex; align-items: center; gap: 6px; }

                /* List View */
                .places-list { display: flex; flex-direction: column; gap: 24px; }
                .places-list .explore-card { display: flex; height: 280px; }
                .places-list .card-img { width: 350px; height: 100%; }
                .places-list .card-content { flex: 1; display: flex; flex-direction: column; }
                .places-list .card-footer { margin-top: auto; }

                /* Loading State */
                .loading-state { text-align: center; padding: 100px 0; }
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #f1f8f1;
                    border-top-color: #2e7d32;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .no-results { text-align: center; padding: 100px 0; max-width: 400px; margin: 0 auto; }
                .no-results-icon { font-size: 3rem; margin-bottom: 20px; }
                .reset-btn {
                    margin-top: 25px;
                    background: #1a1a1a;
                    color: #fff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 1024px) {
                    .filter-content-wrapper { flex-direction: column; align-items: stretch; }
                    .search-group { max-width: none; }
                    .places-grid { grid-template-columns: 1fr; }
                    .places-list .explore-card { flex-direction: column; height: auto; }
                    .places-list .card-img { width: 100%; height: 240px; }
                }
            `}</style>
        </div>
    );
};

export default PublicLocations;
