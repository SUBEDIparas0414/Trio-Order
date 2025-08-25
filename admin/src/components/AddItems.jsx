import React, { useState } from 'react'
import { styles } from '../assets/dummyadmin';
import { FiHeart, FiStar, FiUpload } from 'react-icons/fi';
import axios from 'axios'
import { FaRupeeSign } from 'react-icons/fa'

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

      await axios.post(//you should carefull here
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

    } catch (err) {
      console.log('Error uploading item', err.response || err.message)
    }
  };

  return (
    <div className={`${styles.formWrapper} bg-gradient-to-b from-[#1f1c2c] to-[#3a2b2b] min-h-screen flex items-center justify-center px-4`}>
      <div className="w-full max-w-2xl">
        <div className={`${styles.formCard} bg-[#2a2323] shadow-xl rounded-2xl p-6 sm:p-10`}>
          <h2 className={`${styles.formTitle} text-center text-2xl sm:text-3xl font-bold text-amber-400`}>
            Add New Menu Item
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Image Upload */}
            <div className={styles.uploadWrapper}>
              <label className={`${styles.uploadLabel} cursor-pointer border-2 border-dashed border-amber-400 rounded-xl p-6 flex justify-center items-center bg-[#3a2b2b]/30 hover:bg-[#3a2b2b]/60 transition`}>
                {formData.preview ? (
                  <img
                    src={formData.preview}
                    alt="Preview"
                    className={`${styles.previewImage} max-h-48 rounded-lg shadow-md object-cover`}
                  />
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <FiUpload className={`${styles.uploadIcon} text-4xl sm:text-5xl text-amber-400 mb-3`} />
                    <p className={`${styles.uploadText} text-amber-300 text-sm sm:text-base`}>
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
            </div>

            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block mb-2 text-base sm:text-lg text-amber-400">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-[#3a2b2b] border border-amber-400 text-amber-100 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter Product Name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-base sm:text-lg text-amber-400">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className="w-full px-4 py-2 rounded-lg bg-[#3a2b2b] border border-amber-400 text-amber-100 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 h-32 sm:h-40"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 text-base sm:text-lg text-amber-400">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-[#3a2b2b] border border-amber-400 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c} value={c} className="bg-[#3a2b2b]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block mb-2 text-base sm:text-lg text-amber-400">
                  Price (₹)
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 sm:pl-12 px-4 py-2 rounded-lg bg-[#3a2b2b] border border-amber-400 text-amber-100 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter Price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Rating & Popularity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Rating */}
                <div>
                  <label className="block mb-2 text-base sm:text-lg text-amber-400">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl sm:text-3xl transition-transform hover:scale-110"
                      >
                        <FiStar
                          className={
                            star <= (hoverRating || formData.rating)
                              ? 'text-amber-400 fill-current'
                              : 'text-amber-100/30'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popularity */}
                <div>
                  <label className="block mb-2 text-base sm:text-lg text-amber-400">
                    Popularity
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={handleHearts}
                      className="text-2xl sm:text-3xl text-amber-400 hover:text-amber-300 transition-colors animate-pulse"
                    >
                      <FiHeart />
                    </button>
                    <input
                      type="number"
                      name="hearts"
                      value={formData.hearts}
                      onChange={handleInputChange}
                      className="w-24 px-4 py-2 rounded-lg bg-[#3a2b2b] border border-amber-400 text-amber-100 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Likes"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="w-full py-3 text-lg font-semibold rounded-xl shadow-lg bg-amber-500 hover:bg-amber-400 text-black transition">
                Add To Menu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddItems
