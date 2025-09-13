import React , { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Paper, Container, Alert } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { register, loading, error } = useContext(AuthContext);
  
  const { name, email, password, address } = formData;
  
  const validateForm = () => {
    const errors = {};
    
    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 20) {
      errors.name = 'Name must be at least 20 characters';
    } else if (name.length > 60) {
      errors.name = 'Name cannot exceed 60 characters';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    if (!address) {
      errors.address = 'Address is required';
    } else if (address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await register(formData);
      } catch (error) {
        // Error is handled in the AuthContext
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
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
            autoComplete="email"
            value={email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password || '8-16 characters, at least one uppercase letter and one special character'}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="address"
            label="Address"
            id="address"
            autoComplete="address"
            value={address}
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
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;