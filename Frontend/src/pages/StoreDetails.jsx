import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStore, FaEnvelope, FaMapMarkerAlt, FaUser, FaStar } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const StoreDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
    ownerPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [comment, setComment] = useState('');
  
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // If id is 'new', we're creating a new store, so no need to fetch store data
    // but we need to fetch users for owner selection
    if (id === 'new') {
      setEditMode(true);
      
      // Fetch users to populate owner dropdown
      const fetchUsers = async () => {
        try {
          const response = await axios.get('/users');
          // Filter users that are not already store owners
          const availableUsers = response.data.filter(user => user.role !== 'store_owner');
          setUsers(availableUsers);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('Error fetching users');
          setLoading(false);
        }
      };
      
      fetchUsers();
      return;
    }
    
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const storeRes = await axios.get(`/stores/${id}`);
        setStore(storeRes.data);
        
        // Set form data for editing
        setFormData({
          name: storeRes.data.name,
          email: storeRes.data.email,
          address: storeRes.data.address
        });
        
        // If user is logged in, check if they've already rated this store
        if (user) {
          try {
            const ratingRes = await axios.get(`/ratings/store/${id}`);
            if (ratingRes.data) {
              setUserRating(ratingRes.data.rating);
              setComment(ratingRes.data.comment || '');
              setRatingSubmitted(true);
            }
          } catch (error) {
            // User hasn't rated this store yet
            if (error.response && error.response.status === 404) {
              setUserRating(0);
              setRatingSubmitted(false);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching store details:', error);
        setLoading(false);
        // Redirect to stores list if store not found
        if (error.response && error.response.status === 404) {
          toast.error('Store not found');
          navigate('/stores');
        }
      }
    };
    
    fetchStoreDetails();
  }, [id, user, navigate]);
  
  const handleRatingChange = (newValue) => {
    setUserRating(newValue);
  };
  
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const handleSubmitRating = async () => {
    try {
      if (userRating === 0) {
        toast.error('Please select a rating');
        return;
      }
      
      const ratingData = {
        rating: userRating,
        comment: comment
      };
      
      if (ratingSubmitted) {
        // Update existing rating
        await axios.put(`/ratings/store/${id}`, ratingData);
        toast.success('Rating updated successfully');
      } else {
        // Submit new rating
        await axios.post(`/ratings/store/${id}`, ratingData);
        setRatingSubmitted(true);
        toast.success('Rating submitted successfully');
      }
      
      // Refresh store data to update average rating
      const storeRes = await axios.get(`/stores/${id}`);
      setStore(storeRes.data);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Error submitting rating');
    }
  };
  
  const handleDeleteRating = async () => {
    try {
      await axios.delete(`/ratings/store/${id}`);
      setUserRating(0);
      setComment('');
      setRatingSubmitted(false);
      toast.success('Rating deleted successfully');
      
      // Refresh store data to update average rating
      const storeRes = await axios.get(`/stores/${id}`);
      setStore(storeRes.data);
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error(error.response?.data?.message || 'Error deleting rating');
    }
  };
  
  const handleDeleteDialogOpen = () => {
    setOpenDialog(true);
  };
  
  const handleDeleteDialogClose = () => {
    setOpenDialog(false);
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
  };
  
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (id === 'new') {
      if (!formData.ownerId) {
        errors.ownerId = 'Owner is required';
      }
      
      if (!formData.ownerPassword) {
        errors.ownerPassword = 'Password is required for the store owner';
      } else if (formData.ownerPassword.length < 8 || formData.ownerPassword.length > 16) {
        errors.ownerPassword = 'Password must be between 8 and 16 characters';
      } else if (!/[A-Z]/.test(formData.ownerPassword)) {
        errors.ownerPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.ownerPassword)) {
        errors.ownerPassword = 'Password must contain at least one special character';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleUpdateStore = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      let response;
      
      if (id === 'new') {
        // For new store, we include the owner ID and password
        const storeData = {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          ownerId: formData.ownerId,
          ownerPassword: formData.ownerPassword
        };
        response = await axios.post('/stores', storeData);
        toast.success('Store created successfully');
        navigate('/stores');
      } else {
        // For existing store
        const updateData = {
          name: formData.name,
          email: formData.email,
          address: formData.address
        };
        response = await axios.put(`/stores/${id}`, updateData);
        
        // Refresh store data
        const storeRes = await axios.get(`/stores/${id}`);
        setStore(storeRes.data);
        
        setEditMode(false);
        toast.success('Store updated successfully');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error(error.response?.data?.message || 'Error updating store');
    }
  };
  
  const handleDeleteStore = async () => {
    try {
      await axios.delete(`/stores/${id}`);
      toast.success('Store deleted successfully');
      navigate('/stores');
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error(error.response?.data?.message || 'Error deleting store');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Store Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {id === 'new' ? 'Create New Store' : editMode ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
              ) : (
                store?.name
              )}
            </h1>
            
            {id === 'new' && editMode && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Owner</label>
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${formErrors.ownerId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an owner</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                  {formErrors.ownerId && <p className="mt-1 text-sm text-red-500">{formErrors.ownerId}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Password</label>
                  <input
                    type="password"
                    name="ownerPassword"
                    value={formData.ownerPassword}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${formErrors.ownerPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Create password for store owner"
                  />
                  {formErrors.ownerPassword && <p className="mt-1 text-sm text-red-500">{formErrors.ownerPassword}</p>}
                </div>
              </>
            )}
            

            <div className="flex items-center text-gray-600 mb-1">
              <FaMapMarkerAlt className="mr-2" />
              {editMode ? (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                </div>
              ) : (
                store?.address
              )}
            </div>
            <div className="flex items-center text-gray-600 mb-1">
              <FaEnvelope className="mr-2" />
              {editMode ? (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
              ) : (
                store?.email
              )}
            </div>
            <div className="flex items-center text-gray-600">
              <FaUser className="mr-2" />
              Owner: {store?.owner?.name}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="flex items-center mb-2">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={`w-5 h-5 ${i < store?.averageRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">
                {store?.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                ({store?.totalRatings} {store?.totalRatings === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            {/* Admin/Owner Actions */}
            {(user?.role === 'admin' || (user?.role === 'store_owner' && store?.owner?._id === user?._id)) && (
              <div className="flex space-x-2">
                {editMode ? (
                  <>
                    <button 
                      onClick={handleUpdateStore}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleEditToggle}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleEditToggle}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    {id !== 'new' && (
                      <button 
                        onClick={handleDeleteStore}
                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Rating Section */}
        {user && user.role !== 'admin' && user?._id !== store?.owner?._id && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Your Rating</h2>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <p className="mr-2">Rate this store:</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRatingChange(i + 1)}
                      className="focus:outline-none"
                    >
                      <FaStar 
                        className={`w-6 h-6 ${i < userRating ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer hover:text-yellow-400 transition-colors duration-150`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={handleCommentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this store..."
                ></textarea>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleSubmitRating}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  {ratingSubmitted ? 'Update Rating' : 'Submit Rating'}
                </button>
                
                {ratingSubmitted && (
                  <button 
                    onClick={handleDeleteDialogOpen}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
                  >
                    Delete Rating
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          
          {store?.ratings && store.ratings.length > 0 ? (
            <div className="space-y-4">
              {store.ratings.map(rating => (
                <div key={rating._id} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-medium">{rating.user.name}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                      {rating.comment && (
                        <p className="text-gray-700">{rating.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
          )}
        </div>
      </div>
      
      {/* Delete Rating Confirmation Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Rating</h2>
            <p className="mb-6">Are you sure you want to delete your rating for this store?</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleDeleteDialogClose}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRating}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <button 
          onClick={() => navigate('/stores')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          &larr; Back to Stores
        </button>
      </div>
    </div>
  );
};

export default StoreDetails;