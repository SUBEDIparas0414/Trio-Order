import React, { useState, useEffect } from 'react';
import { styles } from '../assets/dummyadmin';
import { FiUpload, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiTag, FiCalendar, FiPercent } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import axios from 'axios';
import { useNotification, NotificationContainer } from './Notification';
import ConfirmationDialog from './ConfirmationDialog';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (offerId) => {
    const offer = specialOffers.find(o => o._id === offerId);
    setOfferToDelete(offer);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/special-offers/${offerToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialOffers(prev => prev.filter(offer => offer._id !== offerToDelete._id));
      showSuccess(
        'Special Offer Deleted',
        'The special offer has been removed successfully',
        'This offer is no longer visible to customers.'
      );
      setShowDeleteDialog(false);
      setOfferToDelete(null);
    } catch (err) {
      console.error('Error deleting special offer:', err);
      showError(
        'Failed to Delete Special Offer',
        err.response?.data?.message || err.message,
        'Please try again or contact support if the issue persists.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setOfferToDelete(null);
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card-glass"
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-h2 font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent"
            >
              Manage Special Offers
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('Add Special Offer button clicked');
                setShowForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <FiTag className="text-lg" />
              Add Special Offer
            </motion.button>
          </div>

          {/* Form Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="card-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-h3 font-bold text-[#F5F5F5]">
                      {editingOffer ? 'Edit Special Offer' : 'Add New Special Offer'}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={resetForm}
                      className="text-[#B3B3B3] hover:text-white text-2xl p-2 rounded-lg hover:bg-white/5 transition-all"
                    >
                      ×
                    </motion.button>
                  </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <label className="cursor-pointer border-2 border-dashed border-[#FF4C29]/50 rounded-xl p-6 flex justify-center items-center bg-white/5 hover:bg-white/10 hover:border-[#FF4C29] transition-all duration-300 w-full max-w-xs h-48">
                      {formData.preview ? (
                        <img
                          src={formData.preview}
                          alt="Preview"
                          className="max-h-full rounded-lg shadow-md object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <FiUpload className="text-4xl text-[#FF4C29] mb-3" />
                          <p className="text-[#B3B3B3] text-sm">
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
                  </motion.div>

                  {/* Title */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-[#B3B3B3] mb-2 font-medium">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g., Weekend Special - 30% Off"
                      required
                    />
                  </motion.div>

                  {/* Description */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-[#B3B3B3] mb-2 font-medium">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input h-24 resize-none"
                      placeholder="Describe the special offer..."
                      required
                    />
                  </motion.div>

                  {/* Item Selection */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-[#B3B3B3] mb-2 font-medium">Select Item</label>
                    <select
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Choose an item...</option>
                      {items.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name} - ₹{item.price}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Price Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-[#B3B3B3] mb-2 font-medium">Original Price</label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="0.00"
                          style={{ paddingLeft: '2.5rem' }}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.55 }}
                    >
                      <label className="block text-[#B3B3B3] mb-2 font-medium">Discounted Price</label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                        <input
                          type="number"
                          name="discountedPrice"
                          value={formData.discountedPrice}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="0.00"
                          style={{ paddingLeft: '2.5rem' }}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Discount Percentage */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-[#B3B3B3] mb-2 font-medium">Discount Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="0"
                        style={{ paddingRight: '2.5rem' }}
                        min="0"
                        max="100"
                        required
                      />
                      <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                    </div>
                  </motion.div>

                  {/* Valid Until */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.65 }}
                  >
                    <label className="block text-[#B3B3B3] mb-2 font-medium">Valid Until</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                      <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleInputChange}
                        className="input"
                        style={{ paddingLeft: '2.5rem' }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Priority and Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label className="block text-[#B3B3B3] mb-2 font-medium">Priority (0-10)</label>
                      <input
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="0"
                        min="0"
                        max="10"
                      />
                    </motion.div>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.75 }}
                    >
                      <label className="block text-[#B3B3B3] mb-2 font-medium">Tags (comma separated)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="limited-time, popular, new"
                      />
                    </motion.div>
                  </div>

                  {/* Submit Buttons */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 pt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      {editingOffer ? 'Update Offer' : 'Create Offer'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Special Offers List */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Image</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Title</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Item</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Prices</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Discount</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Valid Until</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Status</th>
                  <th className="p-4 text-center text-[#FFD369] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {specialOffers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-[#B3B3B3] text-xl">
                      No special offers found
                    </td>
                  </tr>
                ) : (
                  specialOffers.map((offer, index) => (
                    <motion.tr 
                      key={offer._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/10 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-4">
                        {offer.imageUrl ? (
                          <img
                            src={offer.imageUrl}
                            alt={offer.title}
                            className="w-16 h-16 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                            <FiTag className="text-[#FF4C29]" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-[#F5F5F5] font-medium text-lg">{offer.title}</div>
                        <div className="text-sm text-[#B3B3B3]">{offer.description}</div>
                      </td>
                      <td className="p-4 text-[#B3B3B3]">
                        {offer.item?.name || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="text-[#F5F5F5]">₹{offer.originalPrice}</div>
                        <div className="text-green-400 font-semibold">₹{offer.discountedPrice}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-red-400 font-semibold">{offer.discountPercentage}%</span>
                      </td>
                      <td className="p-4">
                        <div className={isExpired(offer.validUntil) ? 'text-red-400' : 'text-[#F5F5F5]'}>
                          {formatDate(offer.validUntil)}
                        </div>
                      </td>
                      <td className="p-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
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
                        </motion.button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(offer)}
                            className="text-[#FFD369] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                          >
                            <FiEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(offer._id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Special Offer"
        message={`Are you sure you want to delete "${offerToDelete?.title}"? This action cannot be undone and the offer will be permanently removed.`}
        confirmText="Delete Offer"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  );
};

export default ManageSpecialOffers;
