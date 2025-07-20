import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Avatar,
    Stack,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Tooltip,
    Tabs,
    Tab,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@mui/material';
import {
    CheckCircle,
    Schedule,
    Warning,
    Error,
    Info,
    AccessTime,
    Comment,
    Refresh,
    Print,
    NotificationsActive,
    Email,
    Sms,
    Search,
    FilterList
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/api';
import LoadingSpinner from '../common/LoadingSpinner';

const StatusTracker = ({ providerId }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [selectedLogItem, setSelectedLogItem] = useState(null);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: credentialingStatus, isLoading, refetch } = useQuery({
        queryKey: ['credentialingStatus', providerId],
        queryFn: () => api.getCredentialingStatus(providerId),
        refetchInterval: 30000 // Auto-refresh every 30 seconds
    });

    const { data: statusHistory } = useQuery({
        queryKey: ['statusHistory', providerId],
        queryFn: () => api.getStatusHistory(providerId)
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            case 'on_hold': return 'secondary';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle />;
            case 'in_progress': return <Schedule />;
            case 'pending': return <AccessTime />;
            case 'rejected': return <Error />;
            case 'on_hold': return <Warning />;
            default: return <Info />;
        }
    };

    const handleExpandItem = (itemId) => {
        // Removed for simplicity
    };

    const handleAddComment = async () => {
        if (newComment.trim() && selectedLogItem) {
            try {
                await api.addStatusComment(selectedLogItem.id, newComment);
                setNewComment('');
                setCommentDialogOpen(false);
                refetch();
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    };

    const handleSendNotification = async (type, message) => {
        try {
            await api.sendNotification(providerId, type, message);
            setNotificationDialogOpen(false);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const credentialingSteps = [
        { label: 'Application Submitted', description: 'Provider submitted initial application' },
        { label: 'Initial Review', description: 'Application completeness check' },
        { label: 'Document Verification', description: 'Verify all required documents' },
        { label: 'Primary Source Verification', description: 'Verify credentials with primary sources' },
        { label: 'Committee Review', description: 'Credentialing committee evaluation' },
        { label: 'Final Decision', description: 'Approval or rejection decision' },
        { label: 'Notification', description: 'Provider notification and setup' }
    ];

    const mockStatusData = {
        currentStatus: 'in_progress',
        progress: 65,
        currentStep: 3,
        startDate: '2024-01-15',
        estimatedCompletion: '2024-03-15',
        actualCompletion: null,
        priority: 'high',
        assignedTo: 'Sarah Johnson',
        logs: [
            {
                id: 1,
                timestamp: '2024-01-15T10:00:00Z',
                action: 'Application Submitted',
                details: 'Provider submitted credentialing application with all required documents',
                status: 'completed',
                user: 'Dr. John Smith',
                duration: '2 hours',
                documents: ['Medical License', 'CV', 'Malpractice Insurance'],
                comments: [
                    { id: 1, user: 'Admin', text: 'Application looks complete', timestamp: '2024-01-15T10:30:00Z' }
                ]
            },
            {
                id: 2,
                timestamp: '2024-01-20T14:30:00Z',
                action: 'Initial Review',
                details: 'Application passed initial completeness check. All required documents present.',
                status: 'completed',
                user: 'Review Team',
                duration: '3 days',
                documents: ['Application Form', 'Supporting Documents'],
                comments: [
                    { id: 2, user: 'Reviewer', text: 'All documents verified', timestamp: '2024-01-20T15:00:00Z' }
                ]
            },
            {
                id: 3,
                timestamp: '2024-02-01T09:15:00Z',
                action: 'Document Verification',
                details: 'Medical license verified with state board. Board certifications confirmed.',
                status: 'completed',
                user: 'Verification Team',
                duration: '5 days',
                documents: ['License Verification', 'Board Certification'],
                comments: []
            },
            {
                id: 4,
                timestamp: '2024-02-10T11:45:00Z',
                action: 'Primary Source Verification',
                details: 'Currently verifying medical school and residency credentials. Hospital affiliations being confirmed.',
                status: 'in_progress',
                user: 'PSV Team',
                duration: 'Ongoing',
                documents: ['Education Verification', 'Hospital Privileges'],
                comments: [
                    { id: 3, user: 'PSV Team', text: 'Contacted medical school for verification', timestamp: '2024-02-10T12:00:00Z' },
                    { id: 4, user: 'PSV Team', text: 'Awaiting response from residency program', timestamp: '2024-02-12T14:00:00Z' }
                ]
            },
            {
                id: 5,
                timestamp: '2024-02-15T16:00:00Z',
                action: 'Committee Review',
                details: 'Scheduled for credentialing committee review meeting',
                status: 'pending',
                user: 'Committee Secretary',
                duration: 'Pending',
                documents: ['Complete Application Package'],
                comments: []
            }
        ]
    };

    const filteredLogs = mockStatusData.logs.filter(log => {
        const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
        const matchesSearch = searchTerm === '' ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return <LoadingSpinner message="Loading status information..." />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Credentialing Status Tracker
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={refetch}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Print />}
                    >
                        Print Report
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<NotificationsActive />}
                        onClick={() => setNotificationDialogOpen(true)}
                    >
                        Send Notification
                    </Button>
                </Stack>
            </Box>

            {/* Status Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Current Status Overview
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                                            {getStatusIcon(mockStatusData.currentStatus)}
                                        </Avatar>
                                        <Typography variant="h6" color="primary">
                                            In Progress
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Step {mockStatusData.currentStep} of {credentialingSteps.length}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Progress: {mockStatusData.progress}%
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={mockStatusData.progress}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2">
                                                <strong>Started:</strong> {new Date(mockStatusData.startDate).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Estimated Completion:</strong> {new Date(mockStatusData.estimatedCompletion).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Assigned To:</strong> {mockStatusData.assignedTo}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Priority & Alerts
                            </Typography>
                            <Stack spacing={2}>
                                <Chip
                                    label={`${mockStatusData.priority.toUpperCase()} PRIORITY`}
                                    color={mockStatusData.priority === 'high' ? 'error' : 'warning'}
                                    variant="filled"
                                />
                                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                                    PSV in progress - Expected completion in 5 days
                                </Alert>
                                <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                                    Committee meeting scheduled for next week
                                </Alert>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Stepper Progress */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Credentialing Process Steps
                    </Typography>
                    <Stepper activeStep={mockStatusData.currentStep} orientation="horizontal">
                        {credentialingSteps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    <Typography variant="body2">{step.label}</Typography>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="Activity Timeline" />
                    <Tab label="Detailed Log" />
                    <Tab label="Documents" />
                    <Tab label="Communications" />
                </Tabs>
            </Box>

            {/* Activity Timeline */}
            {selectedTab === 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Activity Timeline
                        </Typography>
                        <Stack spacing={2}>
                            {mockStatusData.logs.map((log, index) => (
                                <Paper key={log.id} elevation={3} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: `${getStatusColor(log.status)}.main` }}>
                                            {getStatusIcon(log.status)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="h6" component="span">
                                                        {log.action}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                        {log.details}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Chip size="small" label={log.user} />
                                                <Chip size="small" label={log.duration} variant="outlined" />
                                                <Chip size="small" label={log.status} color={getStatusColor(log.status)} />
                                            </Box>
                                            {log.comments.length > 0 && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Comments ({log.comments.length})
                                                    </Typography>
                                                    {log.comments.map((comment) => (
                                                        <Box key={comment.id} sx={{ ml: 2, mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                            <Typography variant="body2">
                                                                <strong>{comment.user}:</strong> {comment.text}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(comment.timestamp).toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Detailed Log */}
            {selectedTab === 1 && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                size="small"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search />
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setFilterStatus(filterStatus === 'all' ? 'in_progress' : 'all')}
                            >
                                Filter: {filterStatus}
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date/Time</TableCell>
                                        <TableCell>Action</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Duration</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {log.action}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {log.details}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.status}
                                                    color={getStatusColor(log.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{log.user}</TableCell>
                                            <TableCell>{log.duration}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedLogItem(log);
                                                        setCommentDialogOpen(true);
                                                    }}
                                                >
                                                    <Comment />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Documents Tab */}
            {selectedTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Document Status
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Document tracking and verification status would be displayed here.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Communications Tab */}
            {selectedTab === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Communication History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email, SMS, and other communication logs would be displayed here.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Comment Dialog */}
            <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddComment} variant="contained">Add Comment</Button>
                </DialogActions>
            </Dialog>

            {/* Notification Dialog */}
            <Dialog open={notificationDialogOpen} onClose={() => setNotificationDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Email />}
                            onClick={() => handleSendNotification('email', 'Status update notification')}
                        >
                            Send Email Update
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Sms />}
                            onClick={() => handleSendNotification('sms', 'Status update notification')}
                        >
                            Send SMS Update
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotificationDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StatusTracker;
