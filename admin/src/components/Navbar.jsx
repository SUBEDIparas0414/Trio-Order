import React, { useState } from 'react'
import {navLinks, styles} from '../assets/dummyadmin'
import { GiChefToque } from "react-icons/gi";
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('adminLoginData');
        navigate('/admin-login');
    };

    const adminInfo = JSON.parse(localStorage.getItem('admin') || '{}');

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-elevated border-b border-white/10 sticky top-0 z-50"
    >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-[#FF4C29] to-[#FF6B35] rounded-xl shadow-lg">
                <GiChefToque className="text-2xl text-white" />
              </div>
              <span className="text-h3 font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent">
                Admin Panel
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                >
                  <NavLink 
                    to={link.href} 
                    className={({isActive}) =>
                      `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white shadow-lg shadow-[#FF4C29]/25' 
                          : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-medium">{link.name}</span>
                  </NavLink>
                </motion.div>
              ))}
              
              {/* Admin Info and Logout */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center gap-4 ml-6 pl-6 border-l border-white/10"
              >
                <div className="text-body-sm text-[#B3B3B3] font-medium">
                  {adminInfo.email}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <FiLogOut className="text-lg" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all duration-300"
            >
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <NavLink 
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={({isActive}) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white' 
                            : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium">{link.name}</span>
                    </NavLink>
                  </motion.div>
                ))}
                
                {/* Mobile Admin Info and Logout */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="pt-4 mt-4 border-t border-white/10"
                >
                  <div className="text-body-sm text-[#B3B3B3] mb-3 px-4 font-medium">
                    {adminInfo.email}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-all duration-300 w-full"
                  >
                    <FiLogOut className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
