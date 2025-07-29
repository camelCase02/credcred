import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Avatar,
    Tooltip,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    Assignment,
    Person,
    Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/UserContext';
import ProviderDetailsDialog from './ProviderDetailsDialog';
import ProviderChatSidebar from '../common/ProviderChatSidebar';
import mockDatabase from '../../data/mockDatabase';

const CAppTracker = () => {
    const { user } = useAuth();
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatProvider, setChatProvider] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        specialty: '',
        status: '',
        market: '',
        assignedToMe: false,
        sortBy: 'submissionDate'
    });

    const loadProviders = () => {
        // Show all providers for applications tab
        const allProviders = mockDatabase.getProviders();
        setProviders(allProviders);
    };

    const applyFilters = useCallback(() => {
        let filtered = [...providers];

        // Search filter
        if (filters.search) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.id.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Specialty filter
        if (filters.specialty) {
            filtered = filtered.filter(p => p.specialty === filters.specialty);
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        // Market filter
        if (filters.market) {
            filtered = filtered.filter(p => p.market === filters.market);
        }

        // Assigned to me filter
        if (filters.assignedToMe) {
            filtered = filtered.filter(p => p.assignedAnalyst === user?.name);
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'networkImpact':
                    const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return impactOrder[b.networkImpact] - impactOrder[a.networkImpact];
                case 'workExperience':
                    return b.workExperience - a.workExperience;
                case 'submissionDate':
                    return new Date(b.submissionDate) - new Date(a.submissionDate);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'specialty':
                    return a.specialty.localeCompare(b.specialty);
                default:
                    return 0;
            }
        });

        setFilteredProviders(filtered);
    }, [providers, filters, user?.name]);

    useEffect(() => {
        loadProviders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [providers, filters, applyFilters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleProviderClick = (provider) => {
        // Get the most up-to-date provider data from database
        const freshProvider = mockDatabase.getProvider(provider.id);
        setSelectedProvider(freshProvider || provider);
        setDialogOpen(true);
    };

    const handleProviderUpdate = (updatedProvider) => {
        // Update the provider in the mock database
        mockDatabase.updateProvider(updatedProvider.id, updatedProvider);

        // If status changed to Committee Review, remove from current view
        if (updatedProvider.status === 'Committee Review') {
            loadProviders(); // Reload to remove the provider from analyst view
        } else {
            // Update local state
            setProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
        }
    };

    const handleChatOpen = (provider, e) => {
        e.stopPropagation();
        setChatProvider(provider);
        setChatOpen(true);
    };

    const handleChatClose = () => {
        setChatOpen(false);
        setChatProvider(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Initiated': return 'info';
            case 'In Progress': return 'warning';
            case 'Committee Review': return 'secondary';
            case 'Approved': return 'success';
            case 'Denied': return 'error';
            default: return 'default';
        }
    };

    const getNetworkImpactColor = (impact) => {
        switch (impact) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'default';
        }
    };

    const specialties = [...new Set(providers.map(p => p.specialty))];
    const markets = [...new Set(providers.map(p => p.market))];
    const statuses = [...new Set(providers.map(p => p.status))];

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Modern Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment sx={{ fontSize: 32, color: '#1e3c72', mr: 2 }} />
                    <Typography variant="h4" sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Credentialing Application Tracker
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    Monitor and manage healthcare provider credentialing applications
                </Typography>
            </Box>

            {/* Enhanced Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 100,
                            height: 100,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            transform: 'translate(30px, -30px)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                                        {filteredProviders.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Applications
                                    </Typography>
                                </Box>
                                <Assignment sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 100,
                            height: 100,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            transform: 'translate(30px, -30px)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                                        {filteredProviders.filter(p => p.assignedAnalyst === user?.name).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Assigned to Me
                                    </Typography>
                                </Box>
                                <Person sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        color: '#1e3c72',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 100,
                            height: 100,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                            transform: 'translate(30px, -30px)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                                        {filteredProviders.filter(p => p.networkImpact === 'High').length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        High Impact
                                    </Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                        color: '#1e3c72',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 100,
                            height: 100,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                            transform: 'translate(30px, -30px)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                                        {filteredProviders.filter(p => p.status === 'Committee Review').length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        In Review
                                    </Typography>
                                </Box>
                                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Enhanced Filters */}
            <Paper sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FilterIcon sx={{ fontSize: 28, color: '#1e3c72', mr: 2 }} />
                    <Typography variant="h6" sx={{
                        fontWeight: 700,
                        color: '#1e3c72'
                    }}>
                        Application Filters
                    </Typography>
                </Box>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            placeholder="Provider name or ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Specialty</InputLabel>
                            <Select
                                value={filters.specialty}
                                label="Specialty"
                                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                            >
                                <MenuItem value="">All Specialties</MenuItem>
                                {specialties.map(specialty => (
                                    <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                {statuses.map(status => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Market</InputLabel>
                            <Select
                                value={filters.market}
                                label="Market"
                                onChange={(e) => handleFilterChange('market', e.target.value)}
                            >
                                <MenuItem value="">All Markets</MenuItem>
                                {markets.map(market => (
                                    <MenuItem key={market} value={market}>{market}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={filters.sortBy}
                                label="Sort By"
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <MenuItem value="submissionDate">Submission Date</MenuItem>
                                <MenuItem value="name">Provider Name</MenuItem>
                                <MenuItem value="specialty">Specialty</MenuItem>
                                <MenuItem value="networkImpact">Network Impact</MenuItem>
                                <MenuItem value="workExperience">Experience</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant={filters.assignedToMe ? "contained" : "outlined"}
                                onClick={() => handleFilterChange('assignedToMe', !filters.assignedToMe)}
                                size="small"
                            >
                                My Tasks
                            </Button>
                            <IconButton onClick={loadProviders}>
                                <RefreshIcon />
                            </IconButton>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Providers Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Provider</TableCell>
                                <TableCell>Specialty</TableCell>
                                <TableCell>Market</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Network Impact</TableCell>
                                <TableCell>Experience</TableCell>
                                <TableCell>Submission Date</TableCell>
                                <TableCell>Assigned Analyst</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProviders.map((provider) => (
                                <TableRow
                                    key={provider.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleProviderClick(provider)}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {provider.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {provider.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {provider.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{provider.specialty}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={provider.market}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={provider.status}
                                            color={getStatusColor(provider.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={provider.networkImpact}
                                            color={getNetworkImpactColor(provider.networkImpact)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{provider.workExperience} years</TableCell>
                                    <TableCell>{new Date(provider.submissionDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color={provider.assignedAnalyst === user?.name ? 'primary' : 'text.secondary'}
                                            sx={{ fontWeight: provider.assignedAnalyst === user?.name ? 'bold' : 'normal' }}
                                        >
                                            {provider.assignedAnalyst}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProviderClick(provider);
                                                    }}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Chat with AI">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleChatOpen(provider, e)}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <ChatIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredProviders.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Alert severity="info">
                            No applications found matching your current filters.
                        </Alert>
                    </Box>
                )}
            </Paper>

            {/* Provider Details Dialog */}
            <ProviderDetailsDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                provider={selectedProvider}
                onUpdate={handleProviderUpdate}
                userRole="analyst"
            />

            {/* Provider Chat Sidebar */}
            <ProviderChatSidebar
                open={chatOpen}
                onClose={handleChatClose}
                provider={chatProvider}
            />
        </Box>
    );
};

export default CAppTracker;
