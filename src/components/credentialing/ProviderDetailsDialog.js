import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Box,
    Chip,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Tabs,
    Tab,
    Paper,
    Stack,
    Avatar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    VerifiedUser as VerifiedUserIcon,
    LocalHospital as LocalHospitalIcon,
    Chat as ChatIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/UserContext';
import mockDatabase from '../../data/mockDatabase';

const ProviderDetailsDialog = ({ open, onClose, provider, onUpdate, userRole = 'analyst' }) => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [checklist, setChecklist] = useState(null);
    const [notes, setNotes] = useState('');
    const [assignedAnalyst, setAssignedAnalyst] = useState('');
    const [status, setStatus] = useState('');
    const [verificationResults, setVerificationResults] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (provider) {
            // Get the most up-to-date provider data from database
            const freshProviderData = mockDatabase.getProvider(provider.id);

            // Load checklist for provider using the fresh data
            const checklistData = mockDatabase.getChecklistByProviderId(provider.id);
            setChecklist(checklistData);

            // Use the fresh provider data for other fields too
            setNotes(freshProviderData?.notes || provider.notes || '');
            setAssignedAnalyst(freshProviderData?.assignedAnalyst || provider.assignedAnalyst || '');
            setStatus(freshProviderData?.status || provider.status || '');

            // Mock verification results (in real app, this would come from API)
            setVerificationResults({
                medicalLicense: { status: 'verified', lastChecked: '2024-01-15' },
                boardCertification: { status: 'pending', lastChecked: null },
                dEA: { status: 'verified', lastChecked: '2024-01-14' },
                backgroundScreening: { status: 'issues', lastChecked: '2024-01-13', issues: ['Contact unreachable'] }
            });
        }
    }, [provider]);

    const handleChecklistUpdate = (itemId, field, value) => {
        if (!checklist) return;

        const currentItem = checklist.items.find(item => item.id === itemId);
        const previousValue = currentItem ? currentItem[field] : '';

        const updatedItems = checklist.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        );

        const updatedChecklist = {
            ...checklist,
            items: updatedItems,
            completedItems: updatedItems.filter(item => item.status === 'approved').length,
            lastUpdated: new Date().toISOString()
        };

        setChecklist(updatedChecklist);

        // Update the provider's checklist data directly
        const updatedProvider = {
            ...provider,
            checklist: updatedItems,
            lastUpdated: new Date().toISOString()
        };

        // Save the updated provider data
        mockDatabase.updateProvider(provider.id, updatedProvider);

        // Create audit log for checklist item changes
        if (currentItem && previousValue !== value) {
            const actionMap = {
                'status': `${currentItem.name} status changed`,
                'comments': `${currentItem.name} comments updated`,
                'message': `${currentItem.name} message updated`
            };

            mockDatabase.addAuditLog({
                providerId: provider.id,
                providerName: provider.name,
                action: actionMap[field] || `${currentItem.name} ${field} updated`,
                user: user.name,
                details: {
                    checklistItem: currentItem.name,
                    field: field,
                    previousValue: previousValue,
                    newValue: value,
                    itemId: itemId
                }
            });
        }

        // Update the parent component's provider data
        if (onUpdate) {
            onUpdate(updatedProvider);
        }
    };

    const handleSave = () => {
        if (!provider) return;

        const updatedProvider = {
            ...provider,
            notes,
            assignedAnalyst,
            status,
            lastUpdated: new Date().toISOString()
        };

        // Update provider in database
        mockDatabase.updateProvider(provider.id, updatedProvider);

        // Create audit log entry
        mockDatabase.addAuditLog({
            providerId: provider.id,
            providerName: provider.name,
            action: `Provider updated by ${user.name}`,
            user: user.name,
            details: {
                changes: {
                    notes: notes !== provider.notes,
                    assignedAnalyst: assignedAnalyst !== provider.assignedAnalyst,
                    status: status !== provider.status
                },
                previousValues: {
                    notes: provider.notes,
                    assignedAnalyst: provider.assignedAnalyst,
                    status: provider.status
                },
                newValues: {
                    notes,
                    assignedAnalyst,
                    status
                }
            }
        });

        onUpdate(updatedProvider);
        onClose();
    };

    const handleSendToCommittee = () => {
        const updatedProvider = {
            ...provider,
            status: 'Committee Review',
            notes,
            assignedAnalyst,
            lastUpdated: new Date().toISOString(),
            flaggedForCommittee: true,
            flaggedBy: user.name,
            flaggedDate: new Date().toISOString()
        };

        // Update provider in database
        mockDatabase.updateProvider(provider.id, updatedProvider);

        mockDatabase.addAuditLog({
            providerId: provider.id,
            providerName: provider.name,
            action: 'Application flagged for committee review',
            user: user.name,
            details: { reason: 'Analyst review completed' }
        });

        onUpdate(updatedProvider);
        onClose();
    };

    const handleDownloadAuditLogs = () => {
        try {
            const filename = mockDatabase.downloadAuditLogs(provider.id);
            // You could show a success message here if needed
            console.log(`Audit logs downloaded as: ${filename}`);
        } catch (error) {
            console.error('Error downloading audit logs:', error);
            // You could show an error message here if needed
        }
    };

    const getVerificationStatusIcon = (status) => {
        switch (status) {
            case 'verified': return <CheckCircleIcon color="success" />;
            case 'pending': return <WarningIcon color="warning" />;
            case 'issues': return <ErrorIcon color="error" />;
            default: return <WarningIcon color="disabled" />;
        }
    };

    const getChecklistStatusColor = (status) => {
        switch (status) {
            case 'completed':
            case 'approved': return 'success';
            case 'in-progress': return 'warning';
            case 'pending': return 'default';
            case 'needs-attention':
            case 'flagged': return 'error';
            default: return 'default';
        }
    };

    if (!provider) return null;

    const completionPercentage = checklist ?
        Math.round((checklist.completedItems / checklist.totalItems) * 100) : 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { height: '90vh' } }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Box>
                    <Typography variant="h5" component="div">
                        {provider.name}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {provider.id} • {provider.specialty}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        label={provider.status}
                        color={provider.status === 'Approved' ? 'success' : provider.status === 'Denied' ? 'error' : 'warning'}
                        variant="outlined"
                    />
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab label="Overview" />
                        <Tab label="Documents" />
                        <Tab label="Checklist" />
                        <Tab label="Verification" />
                        <Tab label="History" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* Overview Tab */}
                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Provider Information
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Full Name
                                                </Typography>
                                                <Typography variant="body1">{provider.name}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Provider ID
                                                </Typography>
                                                <Typography variant="body1">{provider.id}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Specialty
                                                </Typography>
                                                <Typography variant="body1">{provider.specialty}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Market
                                                </Typography>
                                                <Typography variant="body1">{provider.market}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Work Experience
                                                </Typography>
                                                <Typography variant="body1">{provider.workExperience} years</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Network Impact
                                                </Typography>
                                                <Chip
                                                    label={provider.networkImpact}
                                                    color={
                                                        provider.networkImpact === 'High' ? 'error' :
                                                            provider.networkImpact === 'Medium' ? 'warning' : 'success'
                                                    }
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Case Management
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Assigned Analyst</InputLabel>
                                                    <Select
                                                        value={assignedAnalyst}
                                                        label="Assigned Analyst"
                                                        onChange={(e) => setAssignedAnalyst(e.target.value)}
                                                        disabled={userRole === 'committee'}
                                                    >
                                                        <MenuItem value="John Smith">John Smith</MenuItem>
                                                        <MenuItem value="Jane Doe">Jane Doe</MenuItem>
                                                        <MenuItem value="Mike Johnson">Mike Johnson</MenuItem>
                                                        <MenuItem value="Sarah Wilson">Sarah Wilson</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        value={status}
                                                        label="Status"
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        disabled={userRole === 'committee'}
                                                    >
                                                        <MenuItem value="Initiated">Initiated</MenuItem>
                                                        <MenuItem value="In Progress">In Progress</MenuItem>
                                                        <MenuItem value="Committee Review">Committee Review</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    label="Analyst Notes"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Add notes about this application..."
                                                    disabled={userRole === 'committee'}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Progress Overview
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />

                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Checklist Completion</Typography>
                                                <Typography variant="body2">{completionPercentage}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={completionPercentage}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Submission Date
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            {new Date(provider.submissionDate).toLocaleDateString()}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Last Updated
                                        </Typography>
                                        <Typography variant="body1">
                                            {provider.lastUpdated ?
                                                new Date(provider.lastUpdated).toLocaleDateString() :
                                                'Not updated'
                                            }
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Quick Actions
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Stack spacing={1}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<VerifiedUserIcon />}
                                                fullWidth
                                                onClick={() => setTabValue(3)}
                                            >
                                                Run Verification Checks
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<DownloadIcon />}
                                                fullWidth
                                            >
                                                Download Application
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<ChatIcon />}
                                                fullWidth
                                            >
                                                Contact Provider
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* Documents Tab */}
                    {tabValue === 1 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Submitted Documents
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { name: 'CV/Resume', type: 'PDF', size: '2.3 MB', status: 'complete' },
                                    { name: 'Medical License', type: 'PDF', size: '1.1 MB', status: 'complete' },
                                    { name: 'Board Certification', type: 'PDF', size: '890 KB', status: 'complete' },
                                    { name: 'Malpractice Insurance', type: 'PDF', size: '1.5 MB', status: 'complete' },
                                    { name: 'Education Transcripts', type: 'PDF', size: '3.2 MB', status: 'pending' },
                                    { name: 'Reference Letters', type: 'PDF', size: '1.8 MB', status: 'complete' }
                                ].map((doc, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Card variant="outlined">
                                            <CardContent sx={{ p: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                        <Box>
                                                            <Typography variant="subtitle2">
                                                                {doc.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {doc.type} • {doc.size}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            label={doc.status}
                                                            size="small"
                                                            color={doc.status === 'complete' ? 'success' : 'warning'}
                                                        />
                                                        <IconButton size="small">
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                        <IconButton size="small">
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Checklist Tab */}
                    {tabValue === 2 && checklist && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6">
                                    Application Checklist
                                </Typography>
                                <Chip
                                    label={`${checklist.completedItems}/${checklist.totalItems} Complete`}
                                    color={completionPercentage === 100 ? 'success' : 'warning'}
                                />
                            </Box>

                            {checklist.items.map((item) => {
                                return (
                                    <Accordion key={item.id} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        {item.title || item.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={item.status}
                                                    color={getChecklistStatusColor(item.status)}
                                                    size="small"
                                                    sx={{ ml: 2 }}
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={8}>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        label="Comments"
                                                        value={item.comments || ''}
                                                        onChange={(e) => handleChecklistUpdate(item.id, 'comments', e.target.value)}
                                                        placeholder="Add comments about this checklist item..."
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Status</InputLabel>
                                                        <Select
                                                            value={item.status}
                                                            label="Status"
                                                            onChange={(e) => handleChecklistUpdate(item.id, 'status', e.target.value)}
                                                        >
                                                            <MenuItem value="pending">Pending</MenuItem>
                                                            <MenuItem value="in-progress">In Progress</MenuItem>
                                                            <MenuItem value="completed">Completed</MenuItem>
                                                            <MenuItem value="approved">Approved</MenuItem>
                                                            <MenuItem value="needs-attention">Needs Attention</MenuItem>
                                                            <MenuItem value="flagged">Flagged</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                {item.message && (
                                                    <Grid item xs={12}>
                                                        <Alert severity="info">{item.message}</Alert>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </Box>
                    )}

                    {/* Verification Tab */}
                    {tabValue === 3 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Verification Results
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(verificationResults).map(([key, result]) => (
                                    <Grid item xs={12} md={6} key={key}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {getVerificationStatusIcon(result.status)}
                                                    <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Status: <strong>{result.status}</strong>
                                                </Typography>
                                                {result.lastChecked && (
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Last Checked: {new Date(result.lastChecked).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                                {result.issues && (
                                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                                        Issues: {result.issues.join(', ')}
                                                    </Alert>
                                                )}
                                                <Button
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                    variant="outlined"
                                                >
                                                    Re-verify
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* History Tab */}
                    {tabValue === 4 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Audit History
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownloadAuditLogs}
                                >
                                    Download Logs
                                </Button>
                            </Box>
                            <List>
                                {mockDatabase.getAuditLogs(provider.id).map((log, index) => (
                                    <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                {log.user.charAt(0)}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={log.action}
                                            secondary={
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        By {log.user} • {new Date(log.timestamp).toLocaleString()}
                                                    </Typography>
                                                    {log.details && Object.keys(log.details).length > 0 && (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Details: {JSON.stringify(log.details)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                                {mockDatabase.getAuditLogs(provider.id).length === 0 && (
                                    <Alert severity="info">
                                        No audit history available for this provider.
                                    </Alert>
                                )}
                            </List>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                {userRole === 'analyst' && (
                    <>
                        <Button
                            variant="outlined"
                            onClick={handleSave}
                            startIcon={<SaveIcon />}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSendToCommittee}
                            startIcon={<SendIcon />}
                            color="primary"
                        >
                            Send to Committee
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ProviderDetailsDialog;
