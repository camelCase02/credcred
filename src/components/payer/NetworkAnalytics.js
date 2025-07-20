import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Warning,
    Error,
    LocationOn,
    Groups,
    Analytics,
    ExpandMore,
    Map,
    Assessment,
    Timeline,
    Insights
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/api';
import StatCard from '../common/StatCard';

const NetworkAnalytics = () => {
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);

    const { data: networks } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.getNetworks()
    });

    const { data: networkAnalytics } = useQuery({
        queryKey: ['networkAnalytics', selectedNetwork, selectedRegion],
        queryFn: () => api.getNetworkAnalytics(selectedNetwork, selectedRegion),
        enabled: !!selectedNetwork
    });

    const { data: cmsCompliance } = useQuery({
        queryKey: ['cmsCompliance'],
        queryFn: () => api.getCMSCompliance()
    });

    const getComplianceColor = (status) => {
        switch (status) {
            case 'Compliant': return 'success';
            case 'Warning': return 'warning';
            case 'Non-Compliant': return 'error';
            default: return 'default';
        }
    };

    const handleMetricClick = (metric) => {
        setSelectedMetric(metric);
        setAnalyticsDialogOpen(true);
    };

    const mockAnalytics = {
        networkId: selectedNetwork,
        region: selectedRegion,
        adequacyScore: 85,
        totalProviders: 450,
        activeProviders: 432,
        pendingProviders: 18,
        complianceStatus: 'Compliant',
        geoDistribution: {
            urban: 65,
            suburban: 25,
            rural: 10
        },
        specialtyGaps: [
            { specialty: 'Endocrinology', gapSize: 23, priority: 'High' },
            { specialty: 'Rheumatology', gapSize: 15, priority: 'Medium' },
            { specialty: 'Infectious Disease', gapSize: 8, priority: 'Low' }
        ],
        accessMetrics: {
            averageDistance: 12.5,
            averageWaitTime: 14,
            appointmentAvailability: 78
        },
        performanceMetrics: {
            networkUtilization: 82,
            memberSatisfaction: 4.2,
            costEfficiency: 87
        },
        riskFactors: [
            { factor: 'Provider Aging', risk: 'Medium', description: '35% of providers are over 60' },
            { factor: 'Geographic Gaps', risk: 'High', description: 'Limited coverage in rural areas' },
            { factor: 'Specialty Shortages', risk: 'High', description: 'Critical gaps in key specialties' }
        ],
        recommendations: [
            {
                type: 'Provider Recruitment',
                priority: 'High',
                description: 'Recruit 3-5 endocrinologists in metro area',
                estimatedImpact: '+12% adequacy score',
                timeline: '3-6 months'
            },
            {
                type: 'Telehealth Expansion',
                priority: 'Medium',
                description: 'Expand telehealth services to rural areas',
                estimatedImpact: '+8% adequacy score',
                timeline: '2-4 months'
            }
        ]
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Network Analytics & Compliance
            </Typography>

            {/* Network Selection */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Select Network</InputLabel>
                        <Select
                            value={selectedNetwork}
                            onChange={(e) => setSelectedNetwork(e.target.value)}
                            label="Select Network"
                        >
                            {networks?.data?.map((network) => (
                                <MenuItem key={network.id} value={network.id}>
                                    {network.name} ({network.type})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Region</InputLabel>
                        <Select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            label="Region"
                        >
                            <MenuItem value="all">All Regions</MenuItem>
                            <MenuItem value="urban">Urban</MenuItem>
                            <MenuItem value="suburban">Suburban</MenuItem>
                            <MenuItem value="rural">Rural</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {selectedNetwork && (
                <>
                    {/* Key Metrics */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Network Adequacy Score"
                                value={`${mockAnalytics.adequacyScore}%`}
                                icon={<Analytics />}
                                color="primary"
                                trend={"+5% from last month"}
                                onClick={() => handleMetricClick('adequacy')}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Total Providers"
                                value={mockAnalytics.totalProviders}
                                icon={<Groups />}
                                color="secondary"
                                trend={"+12 new this month"}
                                onClick={() => handleMetricClick('providers')}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="CMS Compliance"
                                value={mockAnalytics.complianceStatus}
                                icon={<CheckCircle />}
                                color="success"
                                trend="Maintained for 6 months"
                                onClick={() => handleMetricClick('compliance')}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Network Utilization"
                                value={`${mockAnalytics.performanceMetrics.networkUtilization}%`}
                                icon={<TrendingUp />}
                                color="warning"
                                trend="+3% from last quarter"
                                onClick={() => handleMetricClick('utilization')}
                            />
                        </Grid>
                    </Grid>

                    {/* Detailed Analytics */}
                    <Grid container spacing={3}>
                        {/* Geographic Distribution */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Geographic Distribution
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="primary">
                                                    {mockAnalytics.geoDistribution.urban}%
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Urban
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="secondary">
                                                    {mockAnalytics.geoDistribution.suburban}%
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Suburban
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="warning.main">
                                                    {mockAnalytics.geoDistribution.rural}%
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Rural
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Access Metrics */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Access Metrics
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Average Distance to Provider
                                            </Typography>
                                            <Typography variant="h6">
                                                {mockAnalytics.accessMetrics.averageDistance} miles
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Average Wait Time
                                            </Typography>
                                            <Typography variant="h6">
                                                {mockAnalytics.accessMetrics.averageWaitTime} days
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Appointment Availability
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={mockAnalytics.accessMetrics.appointmentAvailability}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {mockAnalytics.accessMetrics.appointmentAvailability}%
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Specialty Gaps */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Specialty Gaps
                                    </Typography>
                                    <List>
                                        {mockAnalytics.specialtyGaps.map((gap, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <Warning color={
                                                        gap.priority === 'High' ? 'error' :
                                                            gap.priority === 'Medium' ? 'warning' : 'success'
                                                    } />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={gap.specialty}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2">
                                                                Gap Size: {gap.gapSize} providers needed
                                                            </Typography>
                                                            <Chip
                                                                label={gap.priority}
                                                                size="small"
                                                                color={
                                                                    gap.priority === 'High' ? 'error' :
                                                                        gap.priority === 'Medium' ? 'warning' : 'success'
                                                                }
                                                            />
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Risk Factors */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Risk Factors
                                    </Typography>
                                    <List>
                                        {mockAnalytics.riskFactors.map((risk, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <Error color={
                                                        risk.risk === 'High' ? 'error' :
                                                            risk.risk === 'Medium' ? 'warning' : 'success'
                                                    } />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={risk.factor}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {risk.description}
                                                            </Typography>
                                                            <Chip
                                                                label={`${risk.risk} Risk`}
                                                                size="small"
                                                                color={
                                                                    risk.risk === 'High' ? 'error' :
                                                                        risk.risk === 'Medium' ? 'warning' : 'success'
                                                                }
                                                            />
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Recommendations */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        AI-Powered Recommendations
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {mockAnalytics.recommendations.map((rec, index) => (
                                            <Grid item xs={12} md={6} key={index}>
                                                <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="h6">{rec.type}</Typography>
                                                            <Chip
                                                                label={rec.priority}
                                                                size="small"
                                                                color={rec.priority === 'High' ? 'error' : 'warning'}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2">
                                                            {rec.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">
                                                                <strong>Impact:</strong> {rec.estimatedImpact}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                <strong>Timeline:</strong> {rec.timeline}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Analytics Detail Dialog */}
            <Dialog open={analyticsDialogOpen} onClose={() => setAnalyticsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Detailed Analytics: {selectedMetric}</DialogTitle>
                <DialogContent>
                    <Typography>
                        Detailed analytics for {selectedMetric} would be displayed here with charts, trends, and historical data.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NetworkAnalytics;
