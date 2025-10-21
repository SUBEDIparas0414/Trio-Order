import React, { useState, useEffect } from 'react';
import { styles } from '../assets/dummyadmin';
import { FiUpload, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiTag, FiCalendar, FiPercent } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import axios from 'axios';
import { useNotification, NotificationContainer } from './Notification';

const ManageSpecialOffers = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itemId: '',
    originalPrice: '',
    discountedPrice: '',
    discountPercentage: '',
    validUntil: '',
    priority: 0,
    tags: '',
    image: null,
    preview: ''
  });

  const [items, setItems] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Notification system
  const { notifications, hideNotification, showSuccess, showError } = useNotification();

  // Fetch items for dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:4000/api/items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };
    fetchItems();
  }, []);

  // Fetch special offers
  useEffect(() => {
    const fetchSpecialOffers = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:4000/api/special-offers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSpecialOffers(data);
      } catch (err) {
        console.error('Error fetching special offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialOffers();
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate discount percentage when prices change
    if (name === 'originalPrice' || name === 'discountedPrice') {
      const original = parseFloat(formData.originalPrice || 0);
      const discounted = parseFloat(name === 'discountedPrice' ? value : formData.discountedPrice || 0);
      if (original > 0 && discounted > 0 && discounted < original) {
        const percentage = Math.round(((original - discounted) / original) * 100);
        setFormData(prev => ({ ...prev, discountPercentage: percentage }));
      }
    }
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'preview') return;
        payload.append(key, val);
      });

      console.log('Payload created, sending request...');

      if (editingOffer) {
        await axios.put(`http://localhost:4000/api/special-offers/${editingOffer._id}`, payload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post('http://localhost:4000/api/special-offers', payload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }

      console.log('Request successful, refreshing data...');
      // Reset form and refresh data
      resetForm();
      const { data } = await axios.get('http://localhost:4000/api/special-offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialOffers(data);
      
      showSuccess(
        'Special Offer Saved!',
        editingOffer ? 'Special offer updated successfully' : 'New special offer created successfully',
        'The offer is now active and visible to customers.'
      );
      
    } catch (err) {
      console.error('Error saving special offer:', err.response || err.message);
      showError(
        'Failed to Save Special Offer',
        err.response?.data?.message || err.message,
        'Please check your input and try again.'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      itemId: '',
      originalPrice: '',
      discountedPrice: '',
      discountPercentage: '',
      validUntil: '',
      priority: 0,
      tags: '',
      image: null,
      preview: ''
    });
    setEditingOffer(null);
    setShowForm(false);
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      itemId: offer.item._id,
      originalPrice: offer.originalPrice,
      discountedPrice: offer.discountedPrice,
      discountPercentage: offer.discountPercentage,
      validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
      priority: offer.priority,
      tags: offer.tags.join(', '),
      image: null,
      preview: offer.imageUrl || ''
    });
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this special offer?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/special-offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialOffers(prev => prev.filter(offer => offer._id !== offerId));
      showSuccess(
        'Special Offer Deleted',
        'The special offer has been removed successfully',
        'This offer is no longer visible to customers.'
      );
    } catch (err) {
      console.error('Error deleting special offer:', err);
      showError(
        'Failed to Delete Special Offer',
        err.response?.data?.message || err.message,
        'Please try again or contact support if the issue persists.'
      );
    }
  };

  const handleToggleStatus = async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(`http://localhost:4000/api/special-offers/${offerId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialOffers(prev => prev.map(offer => 
        offer._id === offerId ? data : offer
      ));
      showSuccess(
        'Offer Status Updated',
        `Special offer is now ${data.isActive ? 'active' : 'inactive'}`,
        data.isActive ? 'Customers can now see this offer' : 'This offer is hidden from customers'
      );
    } catch (err) {
      console.error('Error toggling offer status:', err);
      showError(
        'Failed to Update Offer Status',
        err.response?.data?.message || err.message,
        'Please try again or contact support if the issue persists.'
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className={`${styles.pageWrapper} flex items-center justify-center text-amber-100`}>
        Loading Special Offers...
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className="max-w-7xl mx-auto">
        <div className={styles.cardContainer}>
          <div className="flex justify-between items-center mb-8">
            <h2 className={styles.title}>Manage Special Offers</h2>
            <button
              onClick={() => {
                console.log('Add Special Offer button clicked');
                setShowForm(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <FiTag />
              Add Special Offer
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#4b3b3b] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-amber-400">
                    {editingOffer ? 'Edit Special Offer' : 'Add New Special Offer'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-amber-400 hover:text-amber-300 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className={styles.uploadWrapper}>
                    <label className={`${styles.uploadLabel} cursor-pointer border-2 border-dashed border-amber-400 rounded-xl p-6 flex justify-center items-center bg-[#3a2b2b]/30 hover:bg-[#3a2b2b]/60 transition`}>
                      {formData.preview ? (
                        <img
                          src={formData.preview}
                          alt="Preview"
                          className="max-h-48 rounded-lg shadow-md object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <FiUpload className="text-4xl text-amber-400 mb-3" />
                          <p className="text-amber-300 text-sm">
                            Click to upload offer image
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-amber-300 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={styles.inputField}
                      placeholder="e.g., Weekend Special - 30% Off"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-amber-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`${styles.inputField} h-24 resize-none`}
                      placeholder="Describe the special offer..."
                      required
                    />
                  </div>

                  {/* Item Selection */}
                  <div>
                    <label className="block text-amber-300 mb-2">Select Item</label>
                    <select
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleInputChange}
                      className={styles.inputField}
                      required
                    >
                      <option value="">Choose an item...</option>
                      {items.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name} - ₹{item.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Fields */}
                  <div className={styles.gridTwoCols}>
                    <div>
                      <label className="block text-amber-300 mb-2">Original Price</label>
                      <div className={styles.relativeInput}>
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          className={`${styles.inputField} pl-10`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-amber-300 mb-2">Discounted Price</label>
                      <div className={styles.relativeInput}>
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                        <input
                          type="number"
                          name="discountedPrice"
                          value={formData.discountedPrice}
                          onChange={handleInputChange}
                          className={`${styles.inputField} pl-10`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-amber-300 mb-2">Discount Percentage</label>
                    <div className={styles.relativeInput}>
                      <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <input
                        type="number"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={handleInputChange}
                        className={`${styles.inputField} pr-10`}
                        placeholder="0"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-amber-300 mb-2">Valid Until</label>
                    <div className={styles.relativeInput}>
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleInputChange}
                        className={`${styles.inputField} pl-10`}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Priority and Tags */}
                  <div className={styles.gridTwoCols}>
                    <div>
                      <label className="block text-amber-300 mb-2">Priority (0-10)</label>
                      <input
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className={styles.inputField}
                        min="0"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-300 mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className={styles.inputField}
                        placeholder="limited-time, popular, new"
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-lg font-semibold transition-colors"
                    >
                      {editingOffer ? 'Update Offer' : 'Create Offer'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Special Offers List */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Image</th>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Item</th>
                  <th className={styles.th}>Prices</th>
                  <th className={styles.th}>Discount</th>
                  <th className={styles.th}>Valid Until</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.thCenter}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {specialOffers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={styles.emptyState}>
                      No special offers found
                    </td>
                  </tr>
                ) : (
                  specialOffers.map(offer => (
                    <tr key={offer._id} className={styles.tr}>
                      <td className={styles.imgCell}>
                        {offer.imageUrl ? (
                          <img
                            src={offer.imageUrl}
                            alt={offer.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[#3a2b2b] rounded-lg flex items-center justify-center">
                            <FiTag className="text-amber-400" />
                          </div>
                        )}
                      </td>
                      <td className={styles.nameCell}>
                        <div className={styles.nameText}>{offer.title}</div>
                        <div className={styles.descText}>{offer.description}</div>
                      </td>
                      <td className={styles.categoryCell}>
                        {offer.item?.name || 'N/A'}
                      </td>
                      <td className={styles.priceCell}>
                        <div className="text-amber-300">₹{offer.originalPrice}</div>
                        <div className="text-green-400 font-semibold">₹{offer.discountedPrice}</div>
                      </td>
                      <td className={styles.priceCell}>
                        <span className="text-red-400 font-semibold">{offer.discountPercentage}%</span>
                      </td>
                      <td className={styles.categoryCell}>
                        <div className={isExpired(offer.validUntil) ? 'text-red-400' : 'text-amber-300'}>
                          {formatDate(offer.validUntil)}
                        </div>
                      </td>
                      <td className={styles.categoryCell}>
                        <button
                          onClick={() => handleToggleStatus(offer._id)}
                          className="flex items-center gap-2"
                        >
                          {offer.isActive ? (
                            <FiToggleRight className="text-green-400 text-xl" />
                          ) : (
                            <FiToggleLeft className="text-gray-400 text-xl" />
                          )}
                          <span className={offer.isActive ? 'text-green-400' : 'text-gray-400'}>
                            {offer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(offer)}
                            className="text-amber-500 hover:text-amber-400 transition-colors p-2 rounded-lg hover:bg-amber-900/20"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(offer._id)}
                            className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-900/20"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />
    </div>
  );
};

export default ManageSpecialOffers;
