import React, { useState, useContext } from 'react';
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
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updatePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    // Reset form data when entering edit mode
    if (!editMode) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        address: user?.address || ''
      });
      setFormErrors({});
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };
  
  const validateProfileForm = () => {
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 16) {
      errors.newPassword = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one special character';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      try {
        // This would typically call an API to update the user profile
        // For now, just show a success message
        toast.success('Profile updated successfully');
        setEditMode(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      }
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      try {
        await updatePassword(passwordData.currentPassword, passwordData.newPassword);
        
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        toast.success('Password updated successfully');
      } catch (error) {
        console.error('Error updating password:', error);
      }
    }
  };
  
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'store_owner':
        return 'Store Owner';
      default:
        return 'Normal User';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Profile Information" />
            <Tab label="Change Password" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography component="h1" variant="h4">
                My Profile
              </Typography>
              <Button 
                variant="contained" 
                color={editMode ? 'secondary' : 'primary'}
                onClick={toggleEditMode}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
            
            {editMode ? (
              <Box component="form" onSubmit={handleProfileSubmit} sx={{ mt: 1 }}>
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Save Changes
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
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <BadgeIcon sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Role
                          </Typography>
                          <Typography variant="body1">
                            {getRoleLabel(user?.role)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </>
        )}
        
        {activeTab === 1 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography component="h1" variant="h4" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update your password to keep your account secure
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Password must be 8-16 characters long, contain at least one uppercase letter and one special character.
              </Alert>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Update Password
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;