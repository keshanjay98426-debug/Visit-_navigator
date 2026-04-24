import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Tags, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Navigation
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    locations: 0,
    categories: 0,
    reviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [places, cats, reviews] = await Promise.all([
          axios.get('http://localhost:5000/api/places'),
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/reviews')
        ]);
        setStats({
          locations: places.data.length,
          categories: cats.data.length,
          reviews: reviews.data.length
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setLoading(false);
      }
    };
    fetchStats();
    
    // Set up polling for real-time dashboard updates
    const intervalId = setInterval(fetchStats, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const cards = [
    { label: 'Total Locations', value: stats.locations, icon: <MapPin size={24} />, color: '#3b82f6' },
    { label: 'Categories', value: stats.categories, icon: <Tags size={24} />, color: '#10b981' },
    { label: 'Total Reviews', value: stats.reviews, icon: <MessageSquare size={24} />, color: '#f59e0b' },
    { label: 'Active Routes', value: 'Enabled', icon: <Navigation size={24} />, color: '#8b5cf6' },
  ];

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{loading ? '...' : card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h2>Welcome back, Admin</h2>
          <p>Everything looks great! You have {stats.locations} locations mapped across {stats.categories} categories. Ready to add more explore-worthy spots?</p>
          <button className="primary-btn" onClick={() => window.location.href='/admin/locations'}>Manage Locations</button>
        </div>
        <div className="welcome-image">
          {/* Placeholder for a nice illustration */}
          <div className="illustration-placeholder">
            <TrendingUp size={64} />
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .dashboard-welcome {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 1.5rem;
          padding: 3rem;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-text {
          max-width: 500px;
        }

        .welcome-text h2 {
          color: #fff;
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .welcome-text p {
          color: #94a3b8;
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .primary-btn {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .primary-btn:hover {
          background: #2563eb;
        }

        .illustration-placeholder {
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
