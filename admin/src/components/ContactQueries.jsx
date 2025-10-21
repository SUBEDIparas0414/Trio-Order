import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import axios from 'axios';

const ContactQueries = () => {
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 4000);
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:4000/api/contact/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setQueries(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      showToast('Failed to fetch contact queries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQueryStatus = async (id, status, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:4000/api/contact/${id}/status`, {
        status,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showToast('Query status updated successfully', 'success');
        fetchQueries();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating query:', error);
      showToast('Failed to update query status', 'error');
    }
  };

  const deleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:4000/api/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showToast('Query deleted successfully', 'success');
        fetchQueries();
      }
    } catch (error) {
      console.error('Error deleting query:', error);
      showToast('Failed to delete query', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/20';
      case 'in_progress': return 'text-blue-500 bg-blue-500/20';
      case 'resolved': return 'text-green-500 bg-green-500/20';
      case 'closed': return 'text-gray-500 bg-gray-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const filteredQueries = queries.filter(query => {
    if (filter === 'all') return true;
    return query.status === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FF4C29] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-[#121212] to-[#1A1A1A] min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-6 right-6 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
              toast.type === 'success' 
                ? 'bg-green-600/90 text-white border-green-400' 
                : 'bg-red-600/90 text-white border-red-400'
            }`}>
              {toast.type === 'success' ? (
                <FiCheckCircle className="text-xl flex-shrink-0" />
              ) : (
                <FiAlertCircle className="text-xl flex-shrink-0" />
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Contact Queries</h1>
        <p className="text-gray-400">Manage customer queries and complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Queries</p>
              <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
            </div>
            <FiEye className="text-2xl text-[#FF4C29]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending || 0}</p>
            </div>
            <FiClock className="text-2xl text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-500">{stats.resolved || 0}</p>
            </div>
            <FiCheckCircle className="text-2xl text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Urgent</p>
              <p className="text-2xl font-bold text-red-500">{stats.urgent || 0}</p>
            </div>
            <FiStar className="text-2xl text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? 'bg-[#FF4C29] text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Queries Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Query</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query, index) => (
                <motion.tr
                  key={query._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{query.fullName}</p>
                      <p className="text-gray-400 text-sm">{query.email}</p>
                      <p className="text-gray-500 text-xs">{query.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-white text-sm truncate">{query.query}</p>
                      {query.dishName && (
                        <p className="text-gray-400 text-xs">Dish: {query.dishName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {query.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}>
                      {query.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {formatDate(query.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuery(query);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => deleteQuery(query._id)}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Details Modal */}
      <AnimatePresence>
        {showModal && selectedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Query Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">Customer Information</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-2">
                    <p className="text-white"><strong>Name:</strong> {selectedQuery.fullName}</p>
                    <p className="text-white"><strong>Email:</strong> {selectedQuery.email}</p>
                    <p className="text-white"><strong>Phone:</strong> {selectedQuery.phoneNumber}</p>
                    <p className="text-white"><strong>Address:</strong> {selectedQuery.address}</p>
                    {selectedQuery.dishName && (
                      <p className="text-white"><strong>Dish:</strong> {selectedQuery.dishName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Query</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white">{selectedQuery.query}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Status & Priority</h3>
                  <div className="flex gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuery.status)}`}>
                      {selectedQuery.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedQuery.priority)}`}>
                      {selectedQuery.priority}
                    </span>
                  </div>
                </div>

                {selectedQuery.adminNotes && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Admin Notes</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white">{selectedQuery.adminNotes}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => updateQueryStatus(selectedQuery._id, 'in_progress')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => updateQueryStatus(selectedQuery._id, 'resolved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => updateQueryStatus(selectedQuery._id, 'closed')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close Query
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactQueries;
