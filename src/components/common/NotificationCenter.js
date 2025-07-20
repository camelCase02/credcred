import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Badge,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Stack,
    Paper,
    Grid,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Notifications,
    Email,
    Sms,
    CheckCircle,
    Warning,
    Error,
    Info,
    Schedule,
    Delete,
    MarkEmailRead,
    Settings,
    Send,
    Close,
    ExpandMore,
    FilterList,
    Search,
    NotificationsActive,
    NotificationsOff,
    VolumeUp,
    VolumeOff,
    Refresh
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api/api';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [newNotificationOpen, setNewNotificationOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        sms: false,
        push: true,
        sound: true,
        credentialingUpdates: true,
        documentReminders: true,
        committeeMeetings: true,
        systemAlerts: true
    });

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notifications, isLoading, refetch } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => api.getNotifications(user?.id),
        refetchInterval: 10000 // Refresh every 10 seconds
    });

    const markAsReadMutation = useMutation({
        mutationFn: (notificationIds) => api.markNotificationsAsRead(notificationIds),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            setSelectedNotifications([]);
        }
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: (notificationIds) => api.deleteNotifications(notificationIds),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            setSelectedNotifications([]);
        }
    });

    const sendNotificationMutation = useMutation({
        mutationFn: (notificationData) => api.sendNotification(notificationData),
        onSuccess: () => {
            setNewNotificationOpen(false);
            refetch();
        }
    });

    // Mock notification data
    const mockNotifications = [
        {
            id: 1,
            type: 'credentialing_update',
            title: 'Credentialing Status Update',
            message: 'Your credentialing application has moved to Primary Source Verification stage.',
            timestamp: '2024-02-15T10:30:00Z',
            read: false,
            priority: 'high',
            category: 'status_update',
            sender: 'Credentialing Team',
            actions: [
                { label: 'View Details', action: 'view_status' },
                { label: 'Contact Support', action: 'contact_support' }
            ]
        },
        {
            id: 2,
            type: 'document_reminder',
            title: 'Document Expiration Warning',
            message: 'Your malpractice insurance document expires in 30 days. Please upload a renewed version.',
            timestamp: '2024-02-14T15:45:00Z',
            read: false,
            priority: 'medium',
            category: 'document',
            sender: 'Document Management System',
            actions: [
                { label: 'Upload Document', action: 'upload_document' },
                { label: 'Set Reminder', action: 'set_reminder' }
            ]
        },
        {
            id: 3,
            type: 'committee_meeting',
            title: 'Committee Meeting Scheduled',
            message: 'Your application is scheduled for review at the next credentialing committee meeting on February 20th.',
            timestamp: '2024-02-13T09:00:00Z',
            read: true,
            priority: 'high',
            category: 'meeting',
            sender: 'Committee Secretary',
            actions: [
                { label: 'View Agenda', action: 'view_agenda' },
                { label: 'Prepare Documents', action: 'prepare_docs' }
            ]
        },
        {
            id: 4,
            type: 'system_alert',
            title: 'System Maintenance Notice',
            message: 'The system will be under maintenance on February 18th from 2:00 AM to 4:00 AM EST.',
            timestamp: '2024-02-12T18:00:00Z',
            read: true,
            priority: 'low',
            category: 'system',
            sender: 'System Administrator',
            actions: []
        },
        {
            id: 5,
            type: 'provider_suggestion',
            title: 'New Provider Suggestions Available',
            message: 'We have identified 5 new providers that could improve your network adequacy score.',
            timestamp: '2024-02-11T12:30:00Z',
            read: false,
            priority: 'medium',
            category: 'suggestion',
            sender: 'Network Analytics System',
            actions: [
                { label: 'View Suggestions', action: 'view_suggestions' },
                { label: 'Schedule Review', action: 'schedule_review' }
            ]
        }
    ];

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'credentialing_update': return <CheckCircle />;
            case 'document_reminder': return <Warning />;
            case 'committee_meeting': return <Schedule />;
            case 'system_alert': return <Info />;
            case 'provider_suggestion': return <NotificationsActive />;
            default: return <Notifications />;
        }
    };

    const getNotificationColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const handleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const handleMarkAsRead = () => {
        if (selectedNotifications.length > 0) {
            markAsReadMutation.mutate(selectedNotifications);
        }
    };

    const handleDeleteNotifications = () => {
        if (selectedNotifications.length > 0) {
            deleteNotificationMutation.mutate(selectedNotifications);
        }
    };

    const handleNotificationAction = (action) => {
        // Handle different notification actions
        switch (action) {
            case 'view_status':
                // Navigate to status page
                break;
            case 'upload_document':
                // Navigate to document upload
                break;
            case 'view_suggestions':
                // Navigate to suggestions page
                break;
            default:
                console.log('Action not implemented:', action);
        }
    };

    const filteredNotifications = mockNotifications.filter(notification => {
        const matchesFilter = filterType === 'all' ||
            (filterType === 'unread' && !notification.read) ||
            (filterType === 'read' && notification.read) ||
            notification.category === filterType;

        const matchesSearch = searchTerm === '' ||
            notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const unreadCount = mockNotifications.filter(n => !n.read).length;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    <Badge badgeContent={unreadCount} color="error">
                        <Notifications sx={{ mr: 1 }} />
                    </Badge>
                    Notification Center
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
                        startIcon={<Settings />}
                        onClick={() => setSettingsOpen(true)}
                    >
                        Settings
                    </Button>
                    {user?.role === 'payer' && (
                        <Button
                            variant="contained"
                            startIcon={<Send />}
                            onClick={() => setNewNotificationOpen(true)}
                        >
                            Send Notification
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="primary">{unreadCount}</Typography>
                            <Typography variant="body2" color="textSecondary">Unread</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="secondary">{mockNotifications.length}</Typography>
                            <Typography variant="body2" color="textSecondary">Total</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="warning.main">
                                {mockNotifications.filter(n => n.priority === 'high').length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">High Priority</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="success.main">
                                {mockNotifications.filter(n => n.type === 'credentialing_update').length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">Status Updates</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    label="Filter"
                                >
                                    <MenuItem value="all">All Notifications</MenuItem>
                                    <MenuItem value="unread">Unread</MenuItem>
                                    <MenuItem value="read">Read</MenuItem>
                                    <MenuItem value="status_update">Status Updates</MenuItem>
                                    <MenuItem value="document">Documents</MenuItem>
                                    <MenuItem value="meeting">Meetings</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleMarkAsRead}
                                    disabled={selectedNotifications.length === 0}
                                    startIcon={<MarkEmailRead />}
                                >
                                    Mark Read
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={handleDeleteNotifications}
                                    disabled={selectedNotifications.length === 0}
                                    startIcon={<Delete />}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardContent>
                    <List>
                        {filteredNotifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    button
                                    onClick={() => handleSelectNotification(notification.id)}
                                    sx={{
                                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                                        borderLeft: notification.read ? 'none' : '4px solid',
                                        borderLeftColor: `${getNotificationColor(notification.priority)}.main`
                                    }}
                                >
                                    <ListItemIcon>
                                        <Badge
                                            variant="dot"
                                            invisible={notification.read}
                                            color={getNotificationColor(notification.priority)}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </Badge>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={notification.priority}
                                                    size="small"
                                                    color={getNotificationColor(notification.priority)}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.sender} • {new Date(notification.timestamp).toLocaleString()}
                                                </Typography>
                                                {notification.actions.length > 0 && (
                                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                        {notification.actions.map((action, idx) => (
                                                            <Button
                                                                key={idx}
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNotificationAction(action.action);
                                                                }}
                                                            >
                                                                {action.label}
                                                            </Button>
                                                        ))}
                                                    </Stack>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotificationMutation.mutate([notification.id]);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < filteredNotifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>

                    {filteredNotifications.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No notifications found.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Typography variant="h6">Notification Channels</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.email}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, email: e.target.checked }))}
                                />
                            }
                            label="Email Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.sms}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, sms: e.target.checked }))}
                                />
                            }
                            label="SMS Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.push}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, push: e.target.checked }))}
                                />
                            }
                            label="Push Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.sound}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, sound: e.target.checked }))}
                                />
                            }
                            label="Sound Notifications"
                        />

                        <Divider />

                        <Typography variant="h6">Notification Types</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.credentialingUpdates}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, credentialingUpdates: e.target.checked }))}
                                />
                            }
                            label="Credentialing Updates"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.documentReminders}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, documentReminders: e.target.checked }))}
                                />
                            }
                            label="Document Reminders"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.committeeMeetings}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, committeeMeetings: e.target.checked }))}
                                />
                            }
                            label="Committee Meetings"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationSettings.systemAlerts}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                                />
                            }
                            label="System Alerts"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => setSettingsOpen(false)}>Save Settings</Button>
                </DialogActions>
            </Dialog>

            {/* Send Notification Dialog */}
            <Dialog open={newNotificationOpen} onClose={() => setNewNotificationOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Message"
                            variant="outlined"
                            multiline
                            rows={4}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select label="Priority" defaultValue="medium">
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Recipients</InputLabel>
                            <Select label="Recipients" defaultValue="all">
                                <MenuItem value="all">All Providers</MenuItem>
                                <MenuItem value="pending">Pending Applications</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="specific">Specific Providers</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewNotificationOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => setNewNotificationOpen(false)}>Send Notification</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationCenter;
