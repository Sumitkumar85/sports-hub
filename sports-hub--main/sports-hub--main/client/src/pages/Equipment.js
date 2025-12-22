import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiFilter, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import RentEquipmentModal from '../components/RentEquipmentModal';
import './Equipment.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    category: ''
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sports = ['tennis', 'basketball', 'volleyball', 'badminton', 'squash', 'football', 'soccer', 'general'];
  const categories = ['racket', 'ball', 'net', 'shoes', 'protective-gear', 'training-equipment', 'other'];

  useEffect(() => {
    fetchEquipment();
  }, [filters]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.category) params.append('category', filters.category);

      const response = await api.get(`/equipment?${params}`);
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRentClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleRentSubmit = async (equipmentId, rentalData) => {
    try {
      await api.post(`/equipment/${equipmentId}/rent`, rentalData);
      toast.success('Equipment rented successfully!');
      setIsModalOpen(false);
      fetchEquipment(); // Refresh inventory
    } catch (error) {
      console.error('Rental error:', error);
      toast.error(error.response?.data?.message || 'Failed to rent equipment');
    }
  };

  const equipmentImages = {
    racket: 'https://images.unsplash.com/photo-1617083934555-ac7f61f30346?w=400',
    ball: 'https://images.unsplash.com/photo-1518407613690-d9fc990e795f?w=400',
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    default: 'https://images.unsplash.com/photo-1461896836934- voices?w=400'
  };

  return (
    <div className="equipment-page">
      <div className="page-header">
        <div className="container">
          <h1>Equipment Rental</h1>
          <p>Rent high-quality sports equipment at affordable rates</p>
        </div>
      </div>

      <div className="container">
        <div className="equipment-content">
          {/* Filters */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <FiFilter />
              <h3>Filters</h3>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sport</label>
              <select
                className="form-select"
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-secondary btn-block"
              onClick={() => setFilters({ sport: '', category: '' })}
            >
              Clear Filters
            </button>
          </aside>

          {/* Equipment List */}
          <div className="equipment-list">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : equipment.length === 0 ? (
              <div className="empty-state">
                <FiShoppingBag className="empty-state-icon" />
                <h3>No equipment found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="equipment-grid">
                {equipment.map(item => (
                  <div key={item._id} className="equipment-card">
                    <div className="equipment-image">
                      <img
                        src={item.images?.[0] || equipmentImages[item.category] || equipmentImages.default}
                        alt={item.name}
                      />
                      {item.availableQuantity < 3 && item.availableQuantity > 0 && (
                        <span className="stock-badge low">Only {item.availableQuantity} left</span>
                      )}
                      {item.availableQuantity === 0 && (
                        <span className="stock-badge out">Out of Stock</span>
                      )}
                    </div>
                    <div className="equipment-info">
                      <div className="equipment-category">
                        {item.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </div>
                      <h3 className="equipment-name">{item.name}</h3>
                      {item.brand && (
                        <p className="equipment-brand">{item.brand} {item.model || ''}</p>
                      )}
                      <div className="equipment-meta">
                        <span className="equipment-sport">{item.sport}</span>
                        <span className="equipment-condition">{item.condition}</span>
                      </div>
                      <div className="equipment-footer">
                        <div className="equipment-price">
                          <FiDollarSign />{item.pricePerHour}/hr
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={item.availableQuantity === 0}
                          onClick={() => handleRentClick(item)}
                        >
                          Rent Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RentEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipment={selectedItem}
        onRent={handleRentSubmit}
      />
    </div>
  );
};

export default Equipment;
