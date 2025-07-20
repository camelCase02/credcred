import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    Avatar,
    Stack,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    PersonAdd,
    Assignment,
    CheckCircle,
    Schedule,
    Warning,
    Groups,
    Analytics,
    Speed,
    Star,
    Info,
    Refresh
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/api';
import StatCard from '../common/StatCard';
import { useAuth } from '../../contexts/AuthContext';

const DashboardStats = () => {
    const { user } = useAuth();

    const { data: dashboardData, isLoading, refetch } = useQuery({
        queryKey: ['dashboardStats', user?.role],
        queryFn: () => api.getDashboardStats(user?.role),
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    // Mock data for demonstration
    const mockProviderStats = {
        credentialingProgress: 75,
        documentsUploaded: 8,
        documentsTotal: 12,
        statusUpdates: 3,
        pendingActions: 2,
        averageProcessingTime: 45,
        completionRate: 87,
        recentActivity: [
            { id: 1, action: 'Document verified', timestamp: '2024-02-15T10:30:00Z', type: 'success' },
            { id: 2, action: 'Status updated', timestamp: '2024-02-14T15:45:00Z', type: 'info' },
            { id: 3, action: 'Committee review scheduled', timestamp: '2024-02-13T09:00:00Z', type: 'warning' }
        ]
    };

    const mockPayerStats = {
        totalProviders: 1250,
        activeProviders: 1180,
        pendingApplications: 35,
        networkAdequacyScore: 87,
        cmsComplianceScore: 92,
        monthlyGrowth: 5.2,
        suggestionAcceptanceRate: 78,
        recentSuggestions: [
            { id: 1, provider: 'Dr. Sarah Johnson', specialty: 'Cardiology', impact: 'High', score: 94 },
            { id: 2, provider: 'Dr. Michael Chen', specialty: 'Orthopedics', impact: 'Medium', score: 89 },
            { id: 3, provider: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', impact: 'High', score: 91 }
        ]
    };

    const stats = user?.role === 'provider' ? mockProviderStats : mockPayerStats;

    const getActivityIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle color="success" />;
            case 'warning': return <Warning color="warning" />;
            case 'info': return <Info color="info" />;
            default: return <Assignment />;
        }
    };

    const getImpactColor = (impact) => {
        switch (impact) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading dashboard statistics...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Overview
                </Typography>
                <Tooltip title="Refresh Data">
                    <IconButton onClick={refetch}>
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Provider Dashboard Stats */}
            {user?.role === 'provider' && (
                <>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Credentialing Progress"
                                value={`${stats.credentialingProgress}%`}
                                icon={<Assignment />}
                                color="primary"
                                trend={stats.credentialingProgress > 70 ? "On track" : "Needs attention"}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Documents Uploaded"
                                value={`${stats.documentsUploaded}/${stats.documentsTotal}`}
                                icon={<CheckCircle />}
                                color="success"
                                trend={`${Math.round((stats.documentsUploaded / stats.documentsTotal) * 100)}% complete`}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Pending Actions"
                                value={stats.pendingActions}
                                icon={<Schedule />}
                                color="warning"
                                trend={stats.pendingActions > 5 ? "High priority" : "Manageable"}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Processing Time"
                                value={`${stats.averageProcessingTime} days`}
                                icon={<Speed />}
                                color="info"
                                trend={stats.averageProcessingTime < 60 ? "Below average" : "Above average"}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Credentialing Progress
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats.credentialingProgress}
                                            sx={{ height: 12, borderRadius: 6 }}
                                        />
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {stats.credentialingProgress}% Complete
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Current completion rate: {stats.completionRate}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Recent Activity
                                    </Typography>
                                    <List dense>
                                        {stats.recentActivity.map((activity) => (
                                            <ListItem key={activity.id} disablePadding>
                                                <ListItemIcon>
                                                    {getActivityIcon(activity.type)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={activity.action}
                                                    secondary={new Date(activity.timestamp).toLocaleDateString()}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Payer Dashboard Stats */}
            {user?.role === 'payer' && (
                <>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Total Providers"
                                value={stats.totalProviders}
                                icon={<Groups />}
                                color="primary"
                                trend={`+${stats.monthlyGrowth}% this month`}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Active Providers"
                                value={stats.activeProviders}
                                icon={<CheckCircle />}
                                color="success"
                                trend={`${Math.round((stats.activeProviders / stats.totalProviders) * 100)}% active`}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Pending Applications"
                                value={stats.pendingApplications}
                                icon={<Schedule />}
                                color="warning"
                                trend={stats.pendingApplications > 50 ? "High volume" : "Normal"}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard
                                title="Network Adequacy"
                                value={`${stats.networkAdequacyScore}%`}
                                icon={<Analytics />}
                                color="info"
                                trend={stats.networkAdequacyScore > 85 ? "Excellent" : "Good"}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Network Performance
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Network Adequacy Score
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stats.networkAdequacyScore}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {stats.networkAdequacyScore}%
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                CMS Compliance Score
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stats.cmsComplianceScore}
                                                color="success"
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {stats.cmsComplianceScore}%
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Suggestion Acceptance Rate
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stats.suggestionAcceptanceRate}
                                                color="secondary"
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {stats.suggestionAcceptanceRate}%
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Top Provider Suggestions
                                    </Typography>
                                    <List dense>
                                        {stats.recentSuggestions.map((suggestion) => (
                                            <ListItem key={suggestion.id} disablePadding>
                                                <ListItemIcon>
                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                        <Star />
                                                    </Avatar>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={suggestion.provider}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {suggestion.specialty}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                                <Chip
                                                                    label={suggestion.impact}
                                                                    size="small"
                                                                    color={getImpactColor(suggestion.impact)}
                                                                />
                                                                <Chip
                                                                    label={`${suggestion.score}%`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default DashboardStats;
