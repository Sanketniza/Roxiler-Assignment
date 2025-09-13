import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStore, FaUserCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';


import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <FaStore className="text-2xl" />
              <span className="text-xl font-semibold">Store Rating System</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition duration-150 ease-in-out">
                  Dashboard
                </Link>
                <Link to="/stores" className="hover:text-blue-200 transition duration-150 ease-in-out">
                  Stores
                </Link>
                
                {user?.role === 'admin' && (
                  <Link to="/users" className="hover:text-blue-200 transition duration-150 ease-in-out">
                    Users
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={toggleMenu}
                    className="flex items-center space-x-1 hover:text-blue-200 transition duration-150 ease-in-out"
                  >
                    <FaUserCircle className="text-xl" />
                    <span>{user?.name?.split(' ')[0] || 'User'}</span>
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button 
                        onClick={handleProfile}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <FaUser className="text-gray-600" />
                          <span>Profile</span>
                        </div>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <FaSignOutAlt className="text-gray-600" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition duration-150 ease-in-out">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition duration-150 ease-in-out">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3">
                <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link to="/stores" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Stores
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/users" className="hover:bg-blue-700 px-3 py-2 rounded">
                    Users
                  </Link>
                )}
                <Link to="/profile" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-left hover:bg-blue-700 px-3 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-blue-600 px-3 py-2 rounded">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;