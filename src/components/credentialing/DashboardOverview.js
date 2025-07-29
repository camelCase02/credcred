import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    LinearProgress,
    Alert,
    Button
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Assignment as AssignmentIcon,
    Groups as GroupsIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import mockDatabase from '../../data/mockDatabase';

const DashboardOverview = ({ stats, userRole }) => {
    const recentActivity = mockDatabase.getAuditLogs().slice(0, 5);
    const providers = mockDatabase.getProviders();

    const myAssignedTasks = userRole === 'analyst' ?
        providers.filter(p => p.assignedAnalyst === 'John Smith' && ['Initiated', 'In Progress'].includes(p.status)) :
        providers.filter(p => p.status === 'Committee Review');

    const highPriorityApps = providers.filter(p => p.networkImpact === 'High' && p.status !== 'Approved' && p.status !== 'Denied');

    // Calculate stats if not provided
    const calculateStats = () => {
        return {
            totalApplications: providers.length,
            inProgress: providers.filter(p => ['Initiated', 'In Progress'].includes(p.status)).length,
            pendingReview: providers.filter(p => p.status === 'Committee Review').length,
            approved: providers.filter(p => p.status === 'Approved').length
        };
    };

    const currentStats = stats || calculateStats();

    const handleDownloadAllAuditLogs = () => {
        try {
            const filename = mockDatabase.downloadAuditLogs();
            console.log(`All audit logs downloaded as: ${filename}`);
        } catch (error) {
            console.error('Error downloading audit logs:', error);
        }
    };

    const getAnalystStats = () => [
        {
            title: 'Total Applications',
            value: currentStats.totalApplications,
            icon: <AssignmentIcon />,
            color: 'primary',
            description: 'All credentialing applications'
        },
        {
            title: 'In Progress',
            value: currentStats.inProgress,
            icon: <ScheduleIcon />,
            color: 'warning',
            description: 'Currently under review'
        },
        {
            title: 'My Assignments',
            value: myAssignedTasks.length,
            icon: <PersonIcon />,
            color: 'info',
            description: 'Assigned to me'
        },
        {
            title: 'High Priority',
            value: highPriorityApps.length,
            icon: <WarningIcon />,
            color: 'error',
            description: 'High network impact'
        }
    ];

    const getCommitteeStats = () => [
        {
            title: 'Pending Review',
            value: currentStats.pendingReview,
            icon: <GroupsIcon />,
            color: 'warning',
            description: 'Awaiting committee decision'
        },
        {
            title: 'Approved',
            value: currentStats.approved,
            icon: <CheckCircleIcon />,
            color: 'success',
            description: 'Approved this month'
        },
        {
            title: 'High Priority',
            value: highPriorityApps.length,
            icon: <WarningIcon />,
            color: 'error',
            description: 'High network impact'
        },
        {
            title: 'Overdue Reviews',
            value: providers.filter(p => {
                if (p.status !== 'Committee Review') return false;
                const daysSinceFlag = Math.floor(
                    (new Date() - new Date(p.flaggedDate || p.submissionDate)) / (1000 * 60 * 60 * 24)
                );
                return daysSinceFlag > 7;
            }).length,
            icon: <AssessmentIcon />,
            color: 'error',
            description: 'Over 7 days pending'
        }
    ];

    const statsToDisplay = userRole === 'analyst' ? getAnalystStats() : getCommitteeStats();

    return (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statsToDisplay.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${stat.color}.main`,
                                            mr: 2,
                                            width: 48,
                                            height: 48
                                        }}
                                    >
                                        {stat.icon}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${stat.color}.main` }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.title}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {stat.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* My Tasks / Priority Items */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>
                            {userRole === 'analyst' ? 'My Current Assignments' : 'Priority Committee Reviews'}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {myAssignedTasks.length === 0 ? (
                            <Alert severity="info">
                                {userRole === 'analyst' ?
                                    'No applications currently assigned to you.' :
                                    'No applications pending committee review.'
                                }
                            </Alert>
                        ) : (
                            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {myAssignedTasks.slice(0, 5).map((provider) => (
                                    <ListItem key={provider.id} sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {provider.name.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2">
                                                        {provider.name}
                                                    </Typography>
                                                    <Chip
                                                        label={provider.networkImpact}
                                                        size="small"
                                                        color={
                                                            provider.networkImpact === 'High' ? 'error' :
                                                                provider.networkImpact === 'Medium' ? 'warning' : 'success'
                                                        }
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {provider.specialty} • {provider.market}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Submitted: {new Date(provider.submissionDate).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Recent Activity
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleDownloadAllAuditLogs}
                                sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
                            >
                                Download All Logs
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {recentActivity.map((activity, index) => (
                                <ListItem key={index} sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                            {activity.user.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2">
                                                {activity.action}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    By {activity.user}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Enhanced Analytics Charts */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom>
                            Status Distribution
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
                            {['Initiated', 'In Progress', 'Committee Review', 'Approved', 'Denied'].map((status) => {
                                const count = providers.filter(p => p.status === status).length;
                                const percentage = providers.length > 0 ? (count / providers.length) * 100 : 0;
                                const colors = {
                                    'Initiated': '#2196f3',
                                    'In Progress': '#ff9800',
                                    'Committee Review': '#9c27b0',
                                    'Approved': '#4caf50',
                                    'Denied': '#f44336'
                                };

                                return (
                                    <Box key={status} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {status}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {count} ({percentage.toFixed(1)}%)
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            height: 20,
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            <Box sx={{
                                                height: '100%',
                                                width: `${percentage}%`,
                                                backgroundColor: colors[status],
                                                transition: 'width 0.5s ease-in-out',
                                                borderRadius: 10
                                            }} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* Specialty Breakdown Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom>
                            Top Specialties
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
                            {Object.entries(
                                providers.reduce((acc, provider) => {
                                    acc[provider.specialty] = (acc[provider.specialty] || 0) + 1;
                                    return acc;
                                }, {})
                            )
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 6)
                                .map(([specialty, count]) => {
                                    const percentage = providers.length > 0 ? (count / providers.length) * 100 : 0;
                                    const colors = [
                                        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'
                                    ];
                                    const colorIndex = Object.keys(providers.reduce((acc, provider) => {
                                        acc[provider.specialty] = (acc[provider.specialty] || 0) + 1;
                                        return acc;
                                    }, {})).sort().indexOf(specialty) % colors.length;

                                    return (
                                        <Box key={specialty} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {specialty}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {count} ({percentage.toFixed(1)}%)
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                height: 16,
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: 8,
                                                overflow: 'hidden'
                                            }}>
                                                <Box sx={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    backgroundColor: colors[colorIndex],
                                                    transition: 'width 0.5s ease-in-out',
                                                    borderRadius: 8
                                                }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                        </Box>
                    </Paper>
                </Grid>

                {/* Market Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '300px' }}>
                        <Typography variant="h6" gutterBottom>
                            Market Distribution
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={2}>
                            {Object.entries(
                                providers.reduce((acc, provider) => {
                                    acc[provider.market] = (acc[provider.market] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([market, count]) => {
                                const percentage = providers.length > 0 ? (count / providers.length) * 100 : 0;
                                const colors = {
                                    'CA': '#e3f2fd',
                                    'TX': '#fff3e0',
                                    'NY': '#f3e5f5',
                                    'FL': '#e8f5e8',
                                    'IL': '#fff8e1'
                                };

                                return (
                                    <Grid item xs={6} key={market}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: colors[market] || '#f5f5f5',
                                            borderRadius: 2,
                                            textAlign: 'center',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {count}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {market}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {percentage.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Network Impact Analysis */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '300px' }}>
                        <Typography variant="h6" gutterBottom>
                            Network Impact Analysis
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '200px' }}>
                            {['High', 'Medium', 'Low'].map((impact) => {
                                const count = providers.filter(p => p.networkImpact === impact).length;
                                const percentage = providers.length > 0 ? (count / providers.length) * 100 : 0;
                                const colors = {
                                    'High': '#f44336',
                                    'Medium': '#ff9800',
                                    'Low': '#4caf50'
                                };

                                return (
                                    <Box key={impact} sx={{ textAlign: 'center' }}>
                                        <Box sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            backgroundColor: colors[impact],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 2,
                                            position: 'relative',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                background: `conic-gradient(${colors[impact]} ${percentage * 3.6}deg, #f5f5f5 ${percentage * 3.6}deg)`,
                                                padding: 4
                                            }
                                        }}>
                                            <Typography variant="h6" sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {impact} Impact
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {percentage.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardOverview;
