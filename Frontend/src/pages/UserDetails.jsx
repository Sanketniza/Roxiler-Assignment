import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // If id is 'new', we're creating a new user, so no need to fetch
    if (id === 'new') {
      setEditMode(true);
      setLoading(false);
      return;
    }
    
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/users/${id}`);
        setUser(response.data);
        
        // Set form data for editing
        setFormData({
          name: response.data.name,
          email: response.data.email,
          address: response.data.address,
          role: response.data.role
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
        // Redirect to users list if user not found
        if (error.response && error.response.status === 404) {
          toast.error('User not found');
          navigate('/users');
        }
      }
    };
    
    fetchUserDetails();
  }, [id, navigate]);
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    // Reset form data when entering edit mode
    if (!editMode && user) {
      setFormData({
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      });
      setFormErrors({});
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 20) {
      errors.name = 'Name must be at least 20 characters';
    } else if (formData.name.length > 60) {
      errors.name = 'Name cannot exceed 60 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.address) {
      errors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (id === 'new' && !formData.password) {
      errors.password = 'Password is required';
    } else if (id === 'new' && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (id === 'new' && formData.password.length > 16) {
      errors.password = 'Password cannot exceed 16 characters';
    } else if (id === 'new' && !/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (id === 'new' && !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        let response;
        
        if (id === 'new') {
          // For new user, password is included in formData
          response = await axios.post('/users', formData);
          toast.success('User created successfully');
          navigate('/users');
        } else {
          // For existing user
          response = await axios.put(`/users/${id}`, formData);
          setUser(response.data);
          setEditMode(false);
          toast.success('User updated successfully');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  };
  
  const handleDeleteConfirm = () => {
    setOpenDialog(true);
  };
  
  const handleDeleteCancel = () => {
    setOpenDialog(false);
  };
  
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setOpenDialog(false);
    }
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'store_owner':
        return 'success';
      default:
        return 'primary';
    }
  };
  
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'store_owner':
        return 'Store Owner';
      default:
        return 'User';
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, fontSize: 30 }} />
            <Typography component="h1" variant="h4">
              {id === 'new' ? 'Create New User' : (editMode ? 'Edit User' : 'User Details')}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/users')}
              sx={{ mr: 1 }}
            >
              Back to Users
            </Button>
            {id !== 'new' && (
              <>
                <Button 
                  variant="contained" 
                  color={editMode ? 'secondary' : 'primary'}
                  onClick={toggleEditMode}
                  sx={{ mr: 1 }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
                {!editMode && (
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={handleDeleteConfirm}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
        
        {editMode || id === 'new' ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Min 20 characters, Max 60 characters'}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            {id === 'new' && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password || 'Min 8 characters, Max 16 characters, at least one uppercase letter and one special character'}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="address"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!formErrors.address}
              helperText={formErrors.address || 'Max 400 characters'}
              multiline
              rows={3}
            />
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!formErrors.role}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
                <MenuItem value="user">Normal User</MenuItem>
              </Select>
              {formErrors.role && (
                <Typography variant="caption" color="error">
                  {formErrors.role}
                </Typography>
              )}
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {id === 'new' ? 'Create User' : 'Save Changes'}
            </Button>
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {user?.name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOnIcon sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {user?.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <BadgeIcon sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Role
                      </Typography>
                      <Box>
                        <Chip 
                          label={user ? getRoleLabel(user.role) : ''} 
                          color={user ? getRoleColor(user.role) : 'primary'} 
                          size="small" 
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <CalendarTodayIcon sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Joined
                      </Typography>
                      <Typography variant="body1">
                        {user?.createdAt ? formatDate(user.createdAt) : ''}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {user.storeRating !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Store Rating
                      </Typography>
                      <Typography variant="body1">
                        {user.storeRating.toFixed(1)}/5
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
            {user && user.role === 'store_owner' && (
              <Box sx={{ mt: 2, color: 'error.main' }}>
                Warning: This user is a store owner. Deleting this user may affect associated stores.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDetails;