import React, { useState } from 'react'
import { FiHeart, FiStar, FiUpload } from 'react-icons/fi';
import axios from 'axios'
import { FaRupeeSign } from 'react-icons/fa'
import { motion } from 'framer-motion';
import { useNotification, NotificationContainer } from './Notification';

const AddItems = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    rating: 0,
    hearts: 0,
    total: 0,
    image: null,
    preview: ''
  });

  const [categories] = useState([
    'Breakfast', 'Lunch', 'Dinner', 'Mexican', 'Italian', 'Desserts', 'Drinks'
  ]);

  const [hoverRating, setHoverRating] = useState(0);
  const { notifications, hideNotification, showSuccess, showError } = useNotification();

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }))
    }
  };

  const handleRating = rating => setFormData(prev => ({ ...prev, rating }));
  const handleHearts = () => setFormData(prev => ({ ...prev, hearts: prev.hearts + 1 }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'preview') return;
        payload.append(key, val);
      });

      await axios.post(
        'http://localhost:4000/api/items',
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        rating: 0,
        hearts: 0,
        total: 0,
        image: null,
        preview: ''
      });

      showSuccess(
        'Item Added Successfully!',
        'New menu item has been created',
        'The item is now visible to customers.'
      );

    } catch (err) {
      console.log('Error uploading item', err.response || err.message);
      showError(
        'Failed to Add Item',
        err.response?.data?.message || err.message,
        'Please check your input and try again.'
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card-glass"
        >
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-h2 font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent mb-8"
          >
            Add New Menu Item
          </motion.h2>

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
                      Click to upload product image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  required
                />
              </label>
            </motion.div>

            {/* Product Name */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-[#B3B3B3] mb-2 font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter Product Name"
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
                placeholder="Enter product description"
                className="input h-32 resize-none"
                required
              />
            </motion.div>

            {/* Category */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-[#B3B3B3] mb-2 font-medium">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Price */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-[#B3B3B3] mb-2 font-medium">Price (₹)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter Price"
                  style={{ paddingLeft: '2.5rem' }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </motion.div>

            {/* Rating & Popularity */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {/* Rating */}
              <div>
                <label className="block mb-2 text-[#B3B3B3] font-medium">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-3xl transition-colors"
                    >
                      <FiStar
                        className={
                          star <= (hoverRating || formData.rating)
                            ? 'text-[#FFD369] fill-current'
                            : 'text-white/20'
                        }
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Popularity */}
              <div>
                <label className="block mb-2 text-[#B3B3B3] font-medium">
                  Popularity
                </label>
                <div className="flex items-center gap-4">
                  <motion.button
                    type="button"
                    onClick={handleHearts}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-3xl text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FiHeart />
                  </motion.button>
                  <input
                    type="number"
                    name="hearts"
                    value={formData.hearts}
                    onChange={handleInputChange}
                    className="input w-32"
                    placeholder="Likes"
                    min="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn-primary w-full"
            >
              Add To Menu
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />
    </motion.div>
  )
}

export default AddItems
