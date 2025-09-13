import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const UserList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };
  
  const clearRoleFilter = () => {
    setRoleFilter('');
  };
  
  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4">
            Users
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/users/new')}
          >
            Add New User
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name, email or address"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="role-filter-label">Filter by Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Filter by Role"
                endAdornment={
                  roleFilter && (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={clearRoleFilter} 
                        edge="end"
                        sx={{ mr: 2 }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
                <MenuItem value="user">Normal User</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length > 0 ? (
          <Grid container spacing={3}>
            {filteredUsers.map(user => (
              <Grid item xs={12} sm={6} md={4} key={user._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div" noWrap>
                        {user.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getRoleLabel(user.role)} 
                      color={getRoleColor(user.role)} 
                      size="small" 
                      sx={{ mb: 2 }}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {user.email}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {user.address}
                    </Typography>
                    {user.storeRating !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        Store Rating: {user.storeRating.toFixed(1)}/5
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleUserClick(user._id)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || roleFilter ? 'Try different search criteria' : 'There are no users available'}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default UserList;