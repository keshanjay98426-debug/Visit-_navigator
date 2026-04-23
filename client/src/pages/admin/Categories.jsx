import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  LayoutGrid
} from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  const apiUrl = 'http://localhost:5000/api/categories';
  const token = localStorage.getItem('token'); // Assuming token is stored

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(apiUrl);
      setCategories(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (editingCategory) {
        await axios.put(`${apiUrl}/${editingCategory._id}`, formData, config);
      } else {
        await axios.post(apiUrl, formData, config);
      }
      
      fetchCategories();
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${apiUrl}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-page">
      <div className="page-actions">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="data-grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <div className="category-card" key={category._id}>
              <div className="card-header">
                <div className="cat-icon-placeholder">
                  <LayoutGrid size={24} />
                </div>
                <div className="cat-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </div>
              <div className="card-actions">
                <button className="icon-btn edit" onClick={() => handleOpenModal(category)}>
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn delete" onClick={() => handleDelete(category._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No categories found.</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Heritage"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the category..."
                />
              </div>
              <div className="form-group">
                <label>Icon Name (Lucide)</label>
                <input 
                  type="text" 
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="e.g. Landmark"
                />
              </div>
              <div className="form-footer">
                <button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .management-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          width: 300px;
          gap: 0.75rem;
        }

        .search-bar input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.875rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #3b82f6;
          color: #fff;
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-btn:hover {
          background-color: #2563eb;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .category-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: box-shadow 0.2s;
        }

        .category-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .card-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .cat-icon-placeholder {
          width: 48px;
          height: 48px;
          background: #eff6ff;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          flex-shrink: 0;
        }

        .cat-info h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .cat-info p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
        }

        .icon-btn {
          background: none;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .icon-btn.edit:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #eff6ff;
        }

        .icon-btn.delete:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #fff;
          width: 500px;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-btn {
          padding: 0.625rem 1.25rem;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn {
          padding: 0.625rem 1.25rem;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default CategoryManagement;
