import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Tab,
    Tabs,
    Alert,
    Badge,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack
} from '@mui/material';
import {
    Logout,
    Dashboard,
    Assignment,
    CheckCircle,
    Schedule,
    Warning,
    Business,
    Person,
    LocationOn,
    TrendingUp,
    Groups,
    Settings,
    Help,
    ExpandMore,
    Star,
    PersonAdd,
    Analytics,
    NetworkCheck,
    Security,
    Visibility,
    Notifications
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/api';
import NetworkAdequacyAnalyzer from '../../components/payer/NetworkAdequacyAnalyzer';
import NetworkAnalytics from '../../components/payer/NetworkAnalytics';
import NotificationCenter from '../../components/common/NotificationCenter';
import StatCard from '../../components/common/StatCard';
import PayerCredentialingManager from '../../components/payer/PayerCredentialingManager';

const PayerDashboard = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [providerDialogOpen, setProviderDialogOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const { user, logout } = useAuth();

    // Fetch data using React Query
    const { data: payerProfile } = useQuery({
        queryKey: ['payerProfile'],
        queryFn: () => api.getPayerProfile()
    });

    const { data: enrolledProviders } = useQuery({
        queryKey: ['enrolledProviders'],
        queryFn: () => api.getEnrolledProviders()
    });

    const { data: networks } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.getNetworks()
    });

    const { data: providerSuggestions } = useQuery({
        queryKey: ['providerSuggestions', selectedNetwork],
        queryFn: () => api.getProviderSuggestions(selectedNetwork),
        enabled: !!selectedNetwork
    });

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleInitiateCredentialing = async (providerId) => {
        try {
            await api.initiateProviderCredentialing(providerId);
            // Refresh data and show success message
        } catch (error) {
            console.error('Failed to initiate credentialing:', error);
        }
    };

    const renderDashboardOverview = () => (
        <Grid container spacing={3}>
            {/* KPI Cards */}
            <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                                <Groups />
                            </Avatar>
                            <Typography variant="h6">Active Providers</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold">
                            {payerProfile?.data?.profile?.activeProviders || 1250}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            +12% from last month
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                <Schedule />
                            </Avatar>
                            <Typography variant="h6">Pending Applications</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {payerProfile?.data?.profile?.pendingApplications || 35}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Awaiting review
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                                <NetworkCheck />
                            </Avatar>
                            <Typography variant="h6">Network Adequacy</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                            87%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Above CMS requirement
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                <TrendingUp />
                            </Avatar>
                            <Typography variant="h6">Processing Time</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                            42 days
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Average credentialing time
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Network Overview */}
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Network Overview
                        </Typography>
                        {networks?.data?.map((network) => (
                            <Accordion key={network.id} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                            {network.name}
                                        </Typography>
                                        <Chip
                                            label={network.type}
                                            size="small"
                                            color="primary"
                                            sx={{ mr: 2 }}
                                        />
                                        <Chip
                                            label={`${network.adequacyScore}% Adequate`}
                                            size="small"
                                            color={network.adequacyScore > 85 ? 'success' : network.adequacyScore > 70 ? 'warning' : 'error'}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Providers: {network.totalProviders}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                CMS Compliance: {network.cmsCompliance}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Network Gaps:
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                {network.gaps.map((gap) => (
                                                    <Chip key={gap} label={gap} size="small" color="error" variant="outlined" />
                                                ))}
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Stack spacing={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PersonAdd />}
                                onClick={() => setActiveTab(2)}
                            >
                                Add New Provider
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Analytics />}
                                onClick={() => setActiveTab(3)}
                            >
                                View Network Analysis
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Assignment />}
                                onClick={() => setActiveTab(1)}
                            >
                                Review Applications
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Settings />}
                            >
                                Network Settings
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderProvidersTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Enrolled Providers
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Provider Name</TableCell>
                                        <TableCell>Specialty</TableCell>
                                        <TableCell>Location</TableCell>
                                        <TableCell>Quality Score</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {enrolledProviders?.data?.map((provider) => (
                                        <TableRow key={provider.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                        {provider.name.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="subtitle2">{provider.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{provider.specialty}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                                                    {provider.location}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Star sx={{ mr: 1, fontSize: 16, color: 'gold' }} />
                                                    {provider.qualityScore}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={provider.acceptingNewPatients ? 'Active' : 'Inactive'}
                                                    color={provider.acceptingNewPatients ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedProvider(provider);
                                                        setProviderDialogOpen(true);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSuggestionsTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <NetworkAdequacyAnalyzer
                    networks={networks?.data || []}
                    providers={providerSuggestions?.data || []}
                    onInitiateCredentialing={handleInitiateCredentialing}
                />
            </Grid>
        </Grid>
    );

    const renderAnalyticsTab = () => (
        <NetworkAnalytics />
    );

    const renderSettingsTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Payer Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Payer organization settings and preferences would be displayed here.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary' }} elevation={1}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
                        HealthCred Payer Portal
                    </Typography>
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenuClick}
                        color="inherit"
                    >
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {user?.name?.charAt(0) || 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleMenuClose}>
                            <Settings sx={{ mr: 1 }} />
                            Settings
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <Help sx={{ mr: 1 }} />
                            Help
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={logout}>
                            <Logout sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Welcome Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome back, {user?.name || 'Payer'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your provider network and ensure CMS compliance
                    </Typography>
                </Box>

                {/* Navigation Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="payer dashboard tabs">
                        <Tab icon={<Dashboard />} label="Dashboard" />
                        <Tab icon={<Groups />} label="Providers" />
                        <Tab icon={<PersonAdd />} label="Suggestions" />
                        <Tab icon={<Assignment />} label="Credentialing" />
                        <Tab icon={<Analytics />} label="Analytics" />
                        <Tab icon={<Badge badgeContent={5} color="error"><Notifications /></Badge>} label="Notifications" />
                        <Tab icon={<Settings />} label="Settings" />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                <Box>
                    {activeTab === 0 && renderDashboardOverview()}
                    {activeTab === 1 && renderProvidersTab()}
                    {activeTab === 2 && renderSuggestionsTab()}
                    {activeTab === 3 && (
                        <PayerCredentialingManager />
                    )}
                    {activeTab === 4 && renderAnalyticsTab()}
                    {activeTab === 5 && (
                        <NotificationCenter />
                    )}
                    {activeTab === 6 && renderSettingsTab()}
                </Box>
            </Container>

            {/* Provider Details Dialog */}
            <Dialog open={providerDialogOpen} onClose={() => setProviderDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Provider Details</DialogTitle>
                <DialogContent>
                    {selectedProvider && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Provider Name"
                                    value={selectedProvider.name}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Specialty"
                                    value={selectedProvider.specialty}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={selectedProvider.location}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Quality Score"
                                    value={selectedProvider.qualityScore}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Patient Capacity"
                                    value={selectedProvider.patientCapacity}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Current Patients"
                                    value={selectedProvider.currentPatients}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Network Impact"
                                    value={selectedProvider.networkImpact}
                                    disabled
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProviderDialogOpen(false)}>Close</Button>
                    <Button variant="contained" color="primary">
                        Initiate Credentialing
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PayerDashboard;