import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    Grid,
    Avatar,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    LocationOn,
    Star,
    TrendingUp,
    PersonAdd,
    Visibility,
    CheckCircle,
    Warning
} from '@mui/icons-material';

const NetworkAdequacyAnalyzer = ({ networks = [], providers = [], onInitiateCredentialing }) => {
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [credentialingDialogOpen, setCredentialingDialogOpen] = useState(false);

    // Mock data for demonstration
    const mockNetworks = [
        {
            id: 1,
            name: 'Primary Care Network',
            type: 'HMO',
            adequacyScore: 87,
            totalProviders: 450,
            gaps: ['Endocrinology', 'Rheumatology'],
            cmsCompliance: 'Compliant',
            coverageAreas: ['Manhattan', 'Brooklyn', 'Queens']
        },
        {
            id: 2,
            name: 'Specialty Care Network',
            type: 'PPO',
            adequacyScore: 72,
            totalProviders: 280,
            gaps: ['Neurology', 'Oncology', 'Cardiology'],
            cmsCompliance: 'Needs Improvement',
            coverageAreas: ['Bronx', 'Staten Island', 'Manhattan']
        }
    ];

    const mockProviders = [
        {
            id: 1,
            name: 'Dr. John Smith',
            specialty: 'Cardiology',
            location: 'Manhattan, NY',
            networkAdequacyScore: 85,
            distanceFromGap: '2.5 miles',
            patientCapacity: 500,
            currentPatients: 320,
            acceptingNewPatients: true,
            qualityScore: 4.8,
            networkImpact: 'High - Fills critical gap in cardiology coverage in downtown area',
            gapAnalysis: {
                fillsGap: true,
                gapType: 'Geographic',
                impactScore: 9.2,
                projectedImprovement: '12% increase in network adequacy'
            }
        },
        {
            id: 2,
            name: 'Dr. Sarah Johnson',
            specialty: 'Pediatrics',
            location: 'Brooklyn, NY',
            networkAdequacyScore: 92,
            distanceFromGap: '1.2 miles',
            patientCapacity: 400,
            currentPatients: 380,
            acceptingNewPatients: true,
            qualityScore: 4.9,
            networkImpact: 'Medium - Enhances pediatric coverage in underserved area',
            gapAnalysis: {
                fillsGap: true,
                gapType: 'Specialty',
                impactScore: 7.8,
                projectedImprovement: '8% increase in network adequacy'
            }
        }
    ];

    const displayNetworks = networks.length > 0 ? networks : mockNetworks;
    const displayProviders = providers.length > 0 ? providers : mockProviders;

    const filteredProviders = selectedNetwork
        ? displayProviders.filter(p => p.networkAdequacyScore < 90 || p.networkImpact.includes('High'))
        : displayProviders;

    const getAdequacyColor = (score) => {
        if (score >= 85) return 'success';
        if (score >= 70) return 'warning';
        return 'error';
    };

    const getImpactColor = (impact) => {
        if (impact.includes('High')) return 'error';
        if (impact.includes('Medium')) return 'warning';
        return 'success';
    };

    const handleProviderDetails = (provider) => {
        setSelectedProvider(provider);
        setDetailsDialogOpen(true);
    };

    const handleInitiateCredentialing = (provider) => {
        setSelectedProvider(provider);
        setCredentialingDialogOpen(true);
    };

    const confirmCredentialing = () => {
        if (onInitiateCredentialing) {
            onInitiateCredentialing(selectedProvider.id);
        }
        setCredentialingDialogOpen(false);
        setSelectedProvider(null);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Network Adequacy Analyzer
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Analyze your network adequacy and discover providers that can improve CMS compliance
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Network</InputLabel>
                    <Select
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        label="Select Network"
                    >
                        <MenuItem value="">All Networks</MenuItem>
                        {displayNetworks.map((network) => (
                            <MenuItem key={network.id} value={network.id}>
                                {network.name} - {network.type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedNetwork && (
                    <Box sx={{ mb: 3 }}>
                        {displayNetworks
                            .filter(n => n.id === parseInt(selectedNetwork))
                            .map(network => (
                                <Alert
                                    key={network.id}
                                    severity={network.adequacyScore >= 85 ? 'success' : 'warning'}
                                    sx={{ mb: 2 }}
                                >
                                    <Typography variant="subtitle2">
                                        {network.name} - Adequacy Score: {network.adequacyScore}%
                                    </Typography>
                                    <Typography variant="body2">
                                        Current Gaps: {network.gaps.join(', ')}
                                    </Typography>
                                    <Typography variant="body2">
                                        CMS Compliance: {network.cmsCompliance}
                                    </Typography>
                                </Alert>
                            ))}
                    </Box>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Provider</TableCell>
                                <TableCell>Specialty</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Network Impact</TableCell>
                                <TableCell>Gap Analysis</TableCell>
                                <TableCell>Quality Score</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProviders.map((provider) => (
                                <TableRow key={provider.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {provider.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">{provider.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {provider.patientCapacity - provider.currentPatients} slots available
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={provider.specialty}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                                            <Typography variant="body2">{provider.location}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Chip
                                                label={provider.networkImpact.split(' - ')[0]}
                                                size="small"
                                                color={getImpactColor(provider.networkImpact)}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                {provider.distanceFromGap} from gap
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <TrendingUp sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
                                            <Typography variant="body2">
                                                {provider.gapAnalysis?.projectedImprovement || 'TBD'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Star sx={{ mr: 1, fontSize: 16, color: 'gold' }} />
                                            <Typography variant="body2">{provider.qualityScore}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleProviderDetails(provider)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Initiate Credentialing">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleInitiateCredentialing(provider)}
                                                >
                                                    <PersonAdd />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Provider Details Dialog */}
                <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Provider Details & Impact Analysis</DialogTitle>
                    <DialogContent>
                        {selectedProvider && (
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>Provider Information</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2"><strong>Name:</strong> {selectedProvider.name}</Typography>
                                        <Typography variant="body2"><strong>Specialty:</strong> {selectedProvider.specialty}</Typography>
                                        <Typography variant="body2"><strong>Location:</strong> {selectedProvider.location}</Typography>
                                        <Typography variant="body2"><strong>Quality Score:</strong> {selectedProvider.qualityScore}/5</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>Capacity Analysis</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2"><strong>Total Capacity:</strong> {selectedProvider.patientCapacity} patients</Typography>
                                        <Typography variant="body2"><strong>Current Patients:</strong> {selectedProvider.currentPatients}</Typography>
                                        <Typography variant="body2"><strong>Available Slots:</strong> {selectedProvider.patientCapacity - selectedProvider.currentPatients}</Typography>
                                        <Typography variant="body2">
                                            <strong>Status:</strong>
                                            <Chip
                                                label={selectedProvider.acceptingNewPatients ? 'Accepting New Patients' : 'Not Accepting'}
                                                size="small"
                                                color={selectedProvider.acceptingNewPatients ? 'success' : 'error'}
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>Network Impact Analysis</Typography>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        <Typography variant="body2">
                                            <strong>Network Impact:</strong> {selectedProvider.networkImpact}
                                        </Typography>
                                    </Alert>

                                    {selectedProvider.gapAnalysis && (
                                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                            <Typography variant="subtitle2" gutterBottom>Gap Analysis</Typography>
                                            <Typography variant="body2">
                                                <strong>Fills Gap:</strong> {selectedProvider.gapAnalysis.fillsGap ? 'Yes' : 'No'}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Gap Type:</strong> {selectedProvider.gapAnalysis.gapType}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Impact Score:</strong> {selectedProvider.gapAnalysis.impactScore}/10
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Projected Improvement:</strong> {selectedProvider.gapAnalysis.projectedImprovement}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDetailsDialogOpen(false);
                                handleInitiateCredentialing(selectedProvider);
                            }}
                        >
                            Initiate Credentialing
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Credentialing Confirmation Dialog */}
                <Dialog open={credentialingDialogOpen} onClose={() => setCredentialingDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Initiate Credentialing Process</DialogTitle>
                    <DialogContent>
                        {selectedProvider && (
                            <Box sx={{ mt: 2 }}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    You are about to initiate the credentialing process for {selectedProvider.name}.
                                </Alert>

                                <Typography variant="body2" gutterBottom>
                                    <strong>Provider:</strong> {selectedProvider.name}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Specialty:</strong> {selectedProvider.specialty}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Expected Impact:</strong> {selectedProvider.gapAnalysis?.projectedImprovement || 'TBD'}
                                </Typography>

                                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                    <Typography variant="body2" color="warning.dark">
                                        <strong>Note:</strong> The credentialing process typically takes 90-120 days to complete.
                                        The provider will be notified and asked to submit required documentation.
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCredentialingDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={confirmCredentialing}>
                            Confirm & Initiate
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default NetworkAdequacyAnalyzer;
