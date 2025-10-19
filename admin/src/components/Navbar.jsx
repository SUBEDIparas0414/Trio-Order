import React, { useState } from 'react'
import {navLinks, styles} from '../assets/dummyadmin'
import { GiChefToque } from "react-icons/gi";
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';

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
    <nav className={styles.navWrapper}>
        <div className={styles.navContainer}>
        <div className={styles.logoSection}>
            <GiChefToque className={styles.logoIcon} />
            <span className={styles.logoText}>Admin Panel</span>
        </div>
        <button onClick={()=> setMenuOpen(!menuOpen)}
            className={styles.menuButton}>
                {menuOpen ? <FiX /> : <FiMenu />}
            </button>
            <div className={styles.desktopMenu}>
                {navLinks.map(link =>(
                    <NavLink key ={link.name} to={link.href} className={({isActive})=>
                    `${styles.navLinkBase} ${isActive ? styles.navLinkActive: styles.navLinkInactive}`}>
                        {link.icon}
                        <span >{link.name}</span>
                    </NavLink>
                ))}
                
                {/* Admin Info and Logout */}
                <div className="flex items-center gap-4 ml-4">
                    <div className="text-sm text-amber-300">
                        {adminInfo.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-500/30 text-red-300 hover:border-red-400 hover:bg-red-900/20 transition-all"
                    >
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
      </div>
      {/* mobile view */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
           {navLinks.map(link =>(
                    <NavLink key ={link.name} to={link.href}
                    onClick={()=> setMenuOpen(false)}
                    className={({isActive})=>
                    `${styles.navLinkBase} ${isActive ? styles.navLinkActive: styles.navLinkInactive}`}>
                        {link.icon}
                        <span >{link.name}</span>
                    </NavLink>
                ))}
                
                {/* Mobile Admin Info and Logout */}
                <div className="pt-4 border-t border-amber-500/20">
                    <div className="text-sm text-amber-300 mb-2 px-4">
                        {adminInfo.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-500/30 text-red-300 hover:border-red-400 hover:bg-red-900/20 transition-all w-full"
                    >
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
