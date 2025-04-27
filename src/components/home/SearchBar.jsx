import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import locationService from '../../services/locationService';
import { TextField, FormControl, InputLabel, Select, MenuItem, Button, InputAdornment, Box, Paper, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await locationService.getAll();
        if (response && response.data && response.data.items) {
          setLocations(response.data.items);
        }
      } catch (error) {
        console.error('Lokasyonlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('q', searchTerm);
    }
    
    if (selectedLocation) {
      params.append('locationId', selectedLocation);
    }
    
    navigate(`/ads?${params.toString()}`);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSearch} sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2,
        alignItems: 'center' 
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ne aramıştınız?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: { xs: '100%', md: 240 } }}>
          <InputLabel id="location-select-label" sx={{ color: 'primary.main' }}>Konum</InputLabel>
          <Select
            labelId="location-select-label"
            id="location-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            label="Konum"
            sx={{ 
              color: 'text.primary',
              '& .MuiSelect-select': { 
                color: 'text.primary',
                fontWeight: 'medium',
                backgroundColor: 'white' 
              },
              '& .MuiMenuItem-root': {
                color: 'text.primary'
              }
            }}
            startAdornment={
              <InputAdornment position="start">
                <LocationOnIcon color="primary" />
              </InputAdornment>
            }
          >
            <MenuItem value="" sx={{ color: 'text.primary' }}>Tüm Türkiye</MenuItem>
            {loading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Yükleniyor...
                </Box>
              </MenuItem>
            ) : (
              locations.map((location) => (
                <MenuItem key={location.id} value={location.id} sx={{ color: 'text.primary', fontWeight: 'normal' }}>
                  {location.city}, {location.country}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<SearchIcon />}
          sx={{ 
            minWidth: { xs: '100%', md: 'auto' },
            py: 1.5,
            px: 3
          }}
        >
          Ara
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchBar; 