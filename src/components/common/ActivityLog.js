import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Box,
    Chip
} from '@mui/material';
import {
    CheckCircle,
    Schedule,
    Warning,
    Error,
    Info
} from '@mui/icons-material';

const ActivityLog = ({ activities = [], title = "Activity Log" }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle color="success" />;
            case 'in_progress':
                return <Schedule color="warning" />;
            case 'failed':
                return <Error color="error" />;
            case 'pending':
                return <Warning color="warning" />;
            default:
                return <Info color="info" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'warning';
            case 'failed':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'info';
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>

                {activities.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No activities to display
                    </Typography>
                ) : (
                    <List>
                        {activities.map((activity, index) => (
                            <React.Fragment key={activity.id || index}>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        {getStatusIcon(activity.status)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle2">
                                                    {activity.action}
                                                </Typography>
                                                <Chip
                                                    label={activity.status}
                                                    size="small"
                                                    color={getStatusColor(activity.status)}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {activity.details}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < activities.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityLog;
