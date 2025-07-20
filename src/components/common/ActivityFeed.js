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
    Avatar,
    Chip,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Divider,
    Alert,
    Badge,
    Tooltip,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    CheckCircle,
    Warning,
    Info,
    Error,
    Assignment,
    Person,
    Description,
    Schedule,
    Group,
    Notifications,
    FilterList,
    MoreVert,
    Refresh,
    Schedule as TimelineIcon,
    TrendingUp,
    Business,
    Star,
    Security,
    School,
    LocalHospital,
    Verified,
    CloudUpload,
    Comment,
    Share,
    Bookmark
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api/api';
import { useAuth } from '../../contexts/AuthContext';

const ActivityFeed = ({ compact = false, maxItems = 10 }) => {
    const [filterType, setFilterType] = useState('all');
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuActivity, setMenuActivity] = useState(null);

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: activityData, isLoading, refetch } = useQuery({
        queryKey: ['activityFeed', user?.id, filterType],
        queryFn: () => api.getActivityFeed(user?.id, filterType),
        refetchInterval: 15000 // Refresh every 15 seconds
    });

    // Mock activity data
    const mockActivities = [
        {
            id: 1,
            type: 'credentialing_update',
            title: 'Credentialing Status Updated',
            description: 'Dr. John Smith\'s application moved to Primary Source Verification',
            timestamp: '2024-02-15T10:30:00Z',
            priority: 'high',
            category: 'status',
            icon: 'assignment',
            user: 'System',
            entityId: 'provider-123',
            entityType: 'provider',
            metadata: {
                previousStatus: 'Document Review',
                newStatus: 'Primary Source Verification',
                estimatedCompletion: '2024-02-20'
            }
        },
        {
            id: 2,
            type: 'document_uploaded',
            title: 'Document Uploaded',
            description: 'Dr. Sarah Johnson uploaded malpractice insurance certificate',
            timestamp: '2024-02-15T09:15:00Z',
            priority: 'medium',
            category: 'document',
            icon: 'upload',
            user: 'Dr. Sarah Johnson',
            entityId: 'doc-456',
            entityType: 'document',
            metadata: {
                documentType: 'Malpractice Insurance',
                fileSize: '2.1 MB',
                format: 'PDF'
            }
        },
        {
            id: 3,
            type: 'provider_suggestion',
            title: 'New Provider Suggestion',
            description: 'AI identified Dr. Michael Chen as high-impact addition to network',
            timestamp: '2024-02-15T08:45:00Z',
            priority: 'high',
            category: 'suggestion',
            icon: 'person_add',
            user: 'AI System',
            entityId: 'provider-789',
            entityType: 'provider',
            metadata: {
                specialty: 'Cardiology',
                networkScore: 94,
                estimatedImpact: '+12% adequacy'
            }
        },
        {
            id: 4,
            type: 'committee_meeting',
            title: 'Committee Meeting Scheduled',
            description: 'Credentialing committee meeting scheduled for February 20th',
            timestamp: '2024-02-14T16:00:00Z',
            priority: 'medium',
            category: 'meeting',
            icon: 'schedule',
            user: 'Committee Secretary',
            entityId: 'meeting-101',
            entityType: 'meeting',
            metadata: {
                meetingDate: '2024-02-20',
                agenda: 'Review 15 pending applications',
                attendees: 8
            }
        },
        {
            id: 5,
            type: 'verification_complete',
            title: 'Verification Complete',
            description: 'License verification completed for Dr. Emily Rodriguez',
            timestamp: '2024-02-14T14:30:00Z',
            priority: 'low',
            category: 'verification',
            icon: 'verified',
            user: 'Verification Team',
            entityId: 'verification-202',
            entityType: 'verification',
            metadata: {
                verificationType: 'Medical License',
                verificationSource: 'State Medical Board',
                status: 'Valid'
            }
        },
        {
            id: 6,
            type: 'network_alert',
            title: 'Network Gap Identified',
            description: 'Critical gap detected in pediatric coverage downtown area',
            timestamp: '2024-02-14T11:00:00Z',
            priority: 'high',
            category: 'alert',
            icon: 'warning',
            user: 'Analytics Engine',
            entityId: 'gap-303',
            entityType: 'network_gap',
            metadata: {
                specialty: 'Pediatrics',
                location: 'Downtown District',
                severity: 'Critical',
                affectedMembers: 1200
            }
        },
        {
            id: 7,
            type: 'compliance_check',
            title: 'CMS Compliance Check',
            description: 'Monthly CMS compliance audit completed - 92% score',
            timestamp: '2024-02-14T09:30:00Z',
            priority: 'medium',
            category: 'compliance',
            icon: 'security',
            user: 'Compliance Team',
            entityId: 'audit-404',
            entityType: 'audit',
            metadata: {
                score: 92,
                previousScore: 89,
                improvement: 3
            }
        },
        {
            id: 8,
            type: 'provider_onboarding',
            title: 'Provider Onboarding Started',
            description: 'Dr. Robert Kim began onboarding process',
            timestamp: '2024-02-13T15:20:00Z',
            priority: 'low',
            category: 'onboarding',
            icon: 'person',
            user: 'Onboarding Team',
            entityId: 'onboard-505',
            entityType: 'onboarding',
            metadata: {
                specialty: 'Orthopedics',
                expectedDuration: '30 days',
                progress: 5
            }
        }
    ];

    const getActivityIcon = (iconType) => {
        const iconMap = {
            assignment: <Assignment />,
            upload: <CloudUpload />,
            person_add: <Person />,
            schedule: <Schedule />,
            verified: <Verified />,
            warning: <Warning />,
            security: <Security />,
            person: <Person />,
            info: <Info />,
            success: <CheckCircle />,
            error: <Error />
        };
        return iconMap[iconType] || <Info />;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'status': return 'primary';
            case 'document': return 'secondary';
            case 'suggestion': return 'info';
            case 'meeting': return 'warning';
            case 'verification': return 'success';
            case 'alert': return 'error';
            default: return 'default';
        }
    };

    const filteredActivities = mockActivities
        .filter(activity => filterType === 'all' || activity.category === filterType)
        .slice(0, maxItems);

    const handleMenuOpen = (event, activity) => {
        setAnchorEl(event.currentTarget);
        setMenuActivity(activity);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuActivity(null);
    };

    const handleComment = (activity) => {
        setSelectedActivity(activity);
        setCommentDialogOpen(true);
        handleMenuClose();
    };

    const handleAddComment = () => {
        // Add comment logic here
        console.log('Adding comment:', newComment, 'to activity:', selectedActivity);
        setNewComment('');
        setCommentDialogOpen(false);
        setSelectedActivity(null);
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography>Loading activity feed...</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Activity Feed
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {!compact && (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="all">All Activity</MenuItem>
                                    <MenuItem value="status">Status Updates</MenuItem>
                                    <MenuItem value="document">Documents</MenuItem>
                                    <MenuItem value="suggestion">Suggestions</MenuItem>
                                    <MenuItem value="meeting">Meetings</MenuItem>
                                    <MenuItem value="verification">Verifications</MenuItem>
                                    <MenuItem value="alert">Alerts</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                        <Tooltip title="Refresh Activity">
                            <IconButton size="small" onClick={refetch}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <List dense>
                    {filteredActivities.map((activity, index) => (
                        <React.Fragment key={activity.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemIcon>
                                    <Badge
                                        variant="dot"
                                        color={getPriorityColor(activity.priority)}
                                        sx={{ '& .MuiBadge-badge': { top: 8, right: 8 } }}
                                    >
                                        <Avatar sx={{
                                            bgcolor: `${getCategoryColor(activity.category)}.main`,
                                            width: 32,
                                            height: 32
                                        }}>
                                            {getActivityIcon(activity.icon)}
                                        </Avatar>
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {activity.title}
                                            </Typography>
                                            <Chip
                                                label={activity.category}
                                                size="small"
                                                color={getCategoryColor(activity.category)}
                                                sx={{ height: 20 }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {activity.description}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {activity.user} • {formatTimestamp(activity.timestamp)}
                                            </Typography>
                                            {!compact && activity.metadata && (
                                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                                                        <Chip
                                                            key={key}
                                                            label={`${key}: ${value}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.75rem', height: 20 }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, activity)}
                                    >
                                        <MoreVert />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            {index < filteredActivities.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>

                {filteredActivities.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No activities found for the selected filter.
                    </Alert>
                )}

                {!compact && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button variant="outlined" size="small">
                            View All Activity
                        </Button>
                    </Box>
                )}

                {/* Activity Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleComment(menuActivity)}>
                        <Comment sx={{ mr: 1 }} />
                        Add Comment
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <Share sx={{ mr: 1 }} />
                        Share
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <Bookmark sx={{ mr: 1 }} />
                        Bookmark
                    </MenuItem>
                </Menu>

                {/* Comment Dialog */}
                <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Comment</DialogTitle>
                    <DialogContent>
                        {selectedActivity && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Commenting on: {selectedActivity.title}
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Your comment"
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
            </CardContent>
        </Card>
    );
};

export default ActivityFeed;
