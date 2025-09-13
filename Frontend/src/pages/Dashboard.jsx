import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userStores, setUserStores] = useState([]);
  const [recentRatings, setRecentRatings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Different data fetching based on user role
        if (user?.role === 'admin') {
          // Admin dashboard data
          const [usersRes, storesRes] = await Promise.all([
            axios.get('/users'),
            axios.get('/stores')
          ]);
          
          setStats({
            totalUsers: usersRes.data.length,
            totalStores: storesRes.data.length,
            storeOwners: usersRes.data.filter(u => u.role === 'store_owner').length,
            normalUsers: usersRes.data.filter(u => u.role === 'user').length
          });
        } else if (user?.role === 'store_owner') {
          // Store owner dashboard data
          const storesRes = await axios.get('/stores');
          const ownedStores = storesRes.data.filter(store => store.owner._id === user._id);
          setUserStores(ownedStores);
          
          // Calculate average rating across all stores
          const avgRating = ownedStores.reduce((sum, store) => sum + store.averageRating, 0) / 
                          (ownedStores.length || 1);
          
          setStats({
            storeCount: ownedStores.length,
            averageRating: avgRating.toFixed(1),
            totalRatings: ownedStores.reduce((sum, store) => sum + store.totalRatings, 0)
          });
        } else {
          // Normal user dashboard data
          const ratingsRes = await axios.get('/ratings/user');
          setRecentRatings(ratingsRes.data);
          
          setStats({
            ratedStores: ratingsRes.data.length,
            averageRating: ratingsRes.data.reduce((sum, r) => sum + r.rating, 0) / 
                          (ratingsRes.data.length || 1)
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [user, isAuthenticated]);

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Total Users</p>
          <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Total Stores</p>
          <p className="text-2xl font-bold">{stats?.totalStores || 0}</p>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Store Owners</p>
          <p className="text-2xl font-bold">{stats?.storeOwners || 0}</p>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Normal Users</p>
          <p className="text-2xl font-bold">{stats?.normalUsers || 0}</p>
        </div>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-150 ease-in-out"
              onClick={() => navigate('/users')}
            >
              Manage Users
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-150 ease-in-out"
              onClick={() => navigate('/stores')}
            >
              Manage Stores
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStoreOwnerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Your Stores</p>
          <p className="text-2xl font-bold">{stats?.storeCount || 0}</p>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Average Rating</p>
          <p className="text-2xl font-bold">{stats?.averageRating || '0.0'} / 5</p>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Total Ratings</p>
          <p className="text-2xl font-bold">{stats?.totalRatings || 0}</p>
        </div>
      </div>
      <div className="col-span-1 md:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Stores</h2>
          {userStores.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {userStores.map(store => (
                <div key={store._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-gray-500">
                        Rating: {store.averageRating.toFixed(1)}/5 ({store.totalRatings} reviews)
                      </p>
                    </div>
                    <button 
                      className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-1 px-3 rounded transition duration-150 ease-in-out"
                      onClick={() => navigate(`/stores/${store._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You don't have any stores yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Stores Rated</p>
          <p className="text-2xl font-bold">{stats?.ratedStores || 0}</p>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Your Average Rating</p>
          <p className="text-2xl font-bold">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'} / 5</p>
        </div>
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Recent Ratings</h2>
          {recentRatings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentRatings.map(rating => (
                <div key={rating._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{rating.store.name}</p>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < rating.rating ? 'fill-current' : 'stroke-current fill-none'}`}
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-sm mt-1 text-gray-600">"{rating.comment}"</p>
                      )}
                    </div>
                    <button 
                      className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-1 px-3 rounded transition duration-150 ease-in-out"
                      onClick={() => navigate(`/stores/${rating.store._id}`)}
                    >
                      View Store
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't rated any stores yet.</p>
          )}
        </div>
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Explore Stores</h2>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-150 ease-in-out"
            onClick={() => navigate('/stores')}
          >
            Browse All Stores
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard
        </h1>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {user?.role === 'admin' && renderAdminDashboard()}
            {user?.role === 'store_owner' && renderStoreOwnerDashboard()}
            {user?.role === 'user' && renderUserDashboard()}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;