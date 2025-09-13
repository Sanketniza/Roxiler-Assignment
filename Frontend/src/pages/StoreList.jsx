import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaSearch, FaTimes } from 'react-icons/fa';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const StoreList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/stores');
        setStores(response.data);
        setFilteredStores(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setLoading(false);
      }
    };
    
    fetchStores();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStores(stores);
      return;
    }
    
    const filtered = stores.filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredStores(filtered);
  }, [searchTerm, stores]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleStoreClick = (storeId) => {
    navigate(`/stores/${storeId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Stores
          </h1>
          {user?.role === 'admin' && (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
              onClick={() => navigate('/stores/new')}
            >
              Add New Store
            </button>
          )}
        </div>
        
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by store name or address"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <FaTimes className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <div key={store._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition duration-150 ease-in-out">
                <div className="p-4 flex-grow">
                  <div className="flex items-center mb-2">
                    <FaStore className="text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      {store.name}
                    </h2>
                  </div>
                  <div className="border-t border-gray-100 my-2"></div>
                  <p className="text-gray-600 text-sm mb-2">
                    {store.address}
                  </p>
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(store.averageRating) ? (
                            <AiFillStar />
                          ) : i < Math.ceil(store.averageRating) && store.averageRating % 1 !== 0 ? (
                            <AiFillStar className="text-yellow-400" />
                          ) : (
                            <AiOutlineStar className="text-yellow-400" />
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({store.averageRating.toFixed(1)})
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'}
                  </p>
                  {user?.role === 'admin' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Owner: {store.owner.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => handleStoreClick(store._id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No stores found
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term' : 'There are no stores available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreList;