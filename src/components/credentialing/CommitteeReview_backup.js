import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    IconButton,
    Menu,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon,
    Send as SendIcon,
    Assessment as AssessmentIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import mockDatabase from '../../data/mockDatabase';
import ProviderDetailsDialog from './ProviderDetailsDialog';
import ChecklistManager from './ChecklistManager';
import ProviderChatSidebar from '../common/ProviderChatSidebar';

const CommitteeReview = () => {
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuProvider, setMenuProvider] = useState(null);
    const [approvalData, setApprovalData] = useState({
        decision: 'approve',
        comments: ''
    });
    const [chatOpen, setChatOpen] = useState(false);
    const [chatProvider, setChatProvider] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = () => {
        const allProviders = mockDatabase.getProviders();
        // Filter for committee review (assuming 'Under Review' status)
        const reviewProviders = allProviders.filter(p =>
            p.status === 'Under Review' || p.status === 'Committee Review' || p.status === 'In Progress'
        );
        setProviders(reviewProviders);
    };

    const handleMenuOpen = (event, provider) => {
        setAnchorEl(event.currentTarget);
        setMenuProvider(provider);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuProvider(null);
    };

    const handleViewDetails = (provider) => {
        setSelectedProvider(provider);
        setDetailsDialogOpen(true);
        handleMenuClose();
    };

    const handleViewChecklist = (provider) => {
        setSelectedProvider(provider);
        setChecklistDialogOpen(true);
        handleMenuClose();
    };

    const handleStartApproval = (provider) => {
        setSelectedProvider(provider);
        setApprovalDialogOpen(true);
        setApprovalData({
            decision: 'approve',
            comments: ''
        });
        handleMenuClose();
    };

    const handleGenerateReport = async (provider) => {
        setSelectedProvider(provider);
        setReportDialogOpen(true);
        setReportLoading(true);
        setReportError(null);
        setReportData(null);

        try {
            const response = await fetch('http://localhost:8000/get-report/dr_williams_003', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider_id: provider.id || 'dr_williams_003',
                    provider_name: provider.name || 'Unknown Provider'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error('Error generating report:', error);
            setReportError('Failed to generate credentialing report. Please try again.');
        } finally {
            setReportLoading(false);
        }

        handleMenuClose();
    };

    const handleOpenChat = (provider) => {
        setChatProvider(provider);
        setChatOpen(true);
        handleMenuClose();
    };

    const handleChatClose = () => {
        setChatOpen(false);
        setChatProvider(null);
    };

    const handleApprovalSubmit = () => {
        if (selectedProvider && approvalData.comments.trim()) {
            // Update provider status
            const updatedStatus = approvalData.decision === 'approve' ? 'Approved' : 'Denied';
            mockDatabase.updateProvider(selectedProvider.id, {
                status: updatedStatus,
                approvalComments: approvalData.comments,
                approvalDate: new Date().toISOString().split('T')[0],
                approvedBy: 'Current User' // In real app, get from auth context
            });

            // Add audit log
            mockDatabase.addAuditLog({
                providerId: selectedProvider.id,
                providerName: selectedProvider.name,
                action: `Application ${approvalData.decision === 'approve' ? 'Approved' : 'Denied'}`,
                user: 'Current User',
                details: {
                    decision: approvalData.decision,
                    comments: approvalData.comments
                }
            });

            setApprovalDialogOpen(false);
            loadProviders(); // Refresh the list
        }
    };

    const handleReportClose = () => {
        setReportDialogOpen(false);
        setReportData(null);
        setReportError(null);
    };

    const downloadReport = () => {
        if (reportData) {
            const reportContent = JSON.stringify(reportData, null, 2);
            const blob = new Blob([reportContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `credentialing_report_${selectedProvider?.id || 'unknown'}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'success';
            case 'denied': return 'error';
            case 'under review':
            case 'committee review': return 'warning';
            case 'in progress': return 'info';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Committee Review
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review and approve provider credentialing applications
                </Typography>
            </Box>

            {/* Providers Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Provider</TableCell>
                                <TableCell>Specialty</TableCell>
                                <TableCell>Market</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assigned Analyst</TableCell>
                                <TableCell>Submission Date</TableCell>
                                <TableCell>Network Impact</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {providers.map((provider) => (
                                <TableRow key={provider.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                                    {provider.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {provider.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{provider.specialty}</TableCell>
                                    <TableCell>{provider.market}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={provider.status}
                                            color={getStatusColor(provider.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{provider.assignedAnalyst}</TableCell>
                                    <TableCell>{provider.submissionDate}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={provider.networkImpact}
                                            color={
                                                provider.networkImpact === 'High' ? 'error' :
                                                    provider.networkImpact === 'Medium' ? 'warning' : 'success'
                                            }
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, provider)}
                                            size="small"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleViewDetails(menuProvider)}>
                    <VisibilityIcon sx={{ mr: 1 }} />
                    View Details
                </MenuItem>
                <MenuItem onClick={() => handleViewChecklist(menuProvider)}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    View Checklist
                </MenuItem>
                <MenuItem onClick={() => handleGenerateReport(menuProvider)}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    Generate Report
                </MenuItem>
                <MenuItem onClick={() => handleOpenChat(menuProvider)}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Chat with AI
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleStartApproval(menuProvider)}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    Approve/Deny
                </MenuItem>
            </Menu>

            {/* Provider Details Dialog */}
            <ProviderDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                provider={selectedProvider}
            />

            {/* Checklist Manager Dialog */}
            <Dialog
                open={checklistDialogOpen}
                onClose={() => setChecklistDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Provider Checklist - {selectedProvider?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedProvider && (
                        <ChecklistManager
                            provider={selectedProvider}
                            onUpdate={() => {
                                loadProviders();
                                setChecklistDialogOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChecklistDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approval Dialog */}
            <Dialog
                open={approvalDialogOpen}
                onClose={() => setApprovalDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Review Application - {selectedProvider?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Decision</InputLabel>
                            <Select
                                value={approvalData.decision}
                                onChange={(e) => setApprovalData({
                                    ...approvalData,
                                    decision: e.target.value
                                })}
                                label="Decision"
                            >
                                <MenuItem value="approve">Approve</MenuItem>
                                <MenuItem value="deny">Deny</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Comments"
                            value={approvalData.comments}
                            onChange={(e) => setApprovalData({
                                ...approvalData,
                                comments: e.target.value
                            })}
                            required
                            helperText="Please provide reasoning for your decision"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApprovalDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApprovalSubmit}
                        color={approvalData.decision === 'approve' ? 'success' : 'error'}
                        startIcon={<SendIcon />}
                        disabled={!approvalData.comments.trim()}
                    >
                        {approvalData.decision === 'approve' ? 'Approve' : 'Deny'} Application
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Credentialing Report Dialog */}
            <Dialog
                open={reportDialogOpen}
                onClose={handleReportClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '80vh' }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6">Credentialing Report</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Provider ID: dr_williams_003
                            </Typography>
                        </Box>
                        {reportData && (
                            <Button
                                startIcon={<DownloadIcon />}
                                onClick={downloadReport}
                                variant="outlined"
                                size="small"
                            >
                                Download Report
                            </Button>
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {reportLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Generating credentialing report...</Typography>
                        </Box>
                    )}

                    {reportError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {reportError}
                        </Alert>
                    )}

                    {reportData && (
                        <Box sx={{ pt: 2 }}>
                            {/* Executive Summary */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Executive Summary
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Compliance Status
                                            </Typography>
                                            <Chip
                                                label={reportData.result?.compliance_status || 'UNKNOWN'}
                                                color={reportData.result?.compliance_status === 'COMPLIANT' ? 'success' : 'error'}
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Overall Score
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                {reportData.result?.overall_score || reportData.result?.score || 'N/A'}/5
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Compliance
                                            </Typography>
                                            <Chip
                                                label={reportData.result?.is_compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                                                color={reportData.result?.is_compliant ? 'success' : 'error'}
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Processing Details
                                        </Typography>
                                        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                                Processing Time: {reportData.report?.technical_details?.processing_time_seconds || 'N/A'}s
                                            </Typography>
                                            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                                Errors: {reportData.report?.technical_details?.errors_encountered || 'None'}
                                            </Typography>
                                            <Typography component="li" variant="body2">
                                                Model: Claude 3 Sonnet
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Report Summary - if available */}
                            {reportData.executive_summary && (
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Report Summary
                                    </Typography>
                                    <Typography variant="body1">
                                        {reportData.executive_summary}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReportClose}>Close</Button>
                    {reportData && (
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadReport}
                        >
                            Download Report
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Provider Chat Sidebar */}
            <ProviderChatSidebar
                open={chatOpen}
                onClose={handleChatClose}
                provider={chatProvider}
            />
        </Box>
    );
};

export default CommitteeReview;
