import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Tooltip,
    Tab,
    Tabs,
    Alert,
    Stepper,
    Step,
    StepLabel,
    StepContent
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    Description as DescriptionIcon,
    Schedule as ScheduleIcon,
    Analytics as AnalyticsIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    PendingActions as PendingActionsIcon,
    CloudUpload as CloudUploadIcon,
    Send as SendIcon,
    Storage as StorageIcon,
    RuleFolder as RuleFolderIcon
} from '@mui/icons-material';

const PayerCredentialingManager = () => {
    const [processingQueue, setProcessingQueue] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [reviewDialog, setReviewDialog] = useState(false);
    const [analytics, setAnalytics] = useState(null);

    // Document Upload States
    const [activeTab, setActiveTab] = useState(0);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [documentType] = useState('credentialing_rules'); // Fixed to credentialing rules only
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [ocrResults, setOcrResults] = useState([]);
    const [processingStep, setProcessingStep] = useState(0);
    const fileInputRef = useRef(null);    // Mock data for credentialing applications
    useEffect(() => {
        const mockApplications = [
            {
                id: 'CRED-2024-001',
                providerName: 'Dr. Sarah Johnson',
                specialty: 'Internal Medicine',
                npi: '1234567890',
                submissionDate: '2024-01-15',
                status: 'under_review',
                priority: 'high',
                documentsProcessed: 12,
                totalDocuments: 15,
                complianceScore: 92,
                hardRulesCompliant: 24,
                totalHardRules: 25,
                softRulesScore: 68,
                maxSoftRulesScore: 100,
                estimatedCompletionDate: '2024-02-01',
                assignedReviewer: 'Mary Rodriguez',
                lastActivity: '2024-01-18',
                ocrProcessingComplete: true,
                manualReviewRequired: true,
                flags: ['license_expiring_soon'],
                documents: [
                    { type: 'Medical License', status: 'verified', ocrConfidence: 95 },
                    { type: 'DEA Certificate', status: 'verified', ocrConfidence: 88 },
                    { type: 'Malpractice Insurance', status: 'pending_verification', ocrConfidence: 76 },
                    { type: 'Board Certification', status: 'verified', ocrConfidence: 94 }
                ]
            },
            {
                id: 'CRED-2024-002',
                providerName: 'Dr. Michael Chen',
                specialty: 'Cardiology',
                npi: '2345678901',
                submissionDate: '2024-01-10',
                status: 'approved',
                priority: 'medium',
                documentsProcessed: 18,
                totalDocuments: 18,
                complianceScore: 87,
                hardRulesCompliant: 25,
                totalHardRules: 25,
                softRulesScore: 45,
                maxSoftRulesScore: 100,
                estimatedCompletionDate: '2024-01-25',
                assignedReviewer: 'David Kim',
                lastActivity: '2024-01-17',
                ocrProcessingComplete: true,
                manualReviewRequired: false,
                flags: [],
                approvalDate: '2024-01-17'
            },
            {
                id: 'CRED-2024-003',
                providerName: 'Dr. Emily Williams',
                specialty: 'Emergency Medicine',
                npi: '3456789012',
                submissionDate: '2024-01-20',
                status: 'processing',
                priority: 'urgent',
                documentsProcessed: 8,
                totalDocuments: 16,
                complianceScore: null,
                hardRulesCompliant: null,
                totalHardRules: 25,
                softRulesScore: null,
                maxSoftRulesScore: 100,
                estimatedCompletionDate: '2024-02-05',
                assignedReviewer: 'Jennifer Adams',
                lastActivity: '2024-01-20',
                ocrProcessingComplete: false,
                manualReviewRequired: false,
                flags: ['urgent_specialty_need']
            },
            {
                id: 'CRED-2024-004',
                providerName: 'Dr. Robert Davis',
                specialty: 'Psychiatry',
                npi: '4567890123',
                submissionDate: '2024-01-12',
                status: 'rejected',
                priority: 'medium',
                documentsProcessed: 10,
                totalDocuments: 12,
                complianceScore: 45,
                hardRulesCompliant: 18,
                totalHardRules: 25,
                softRulesScore: 20,
                maxSoftRulesScore: 100,
                estimatedCompletionDate: null,
                assignedReviewer: 'Lisa Thompson',
                lastActivity: '2024-01-16',
                ocrProcessingComplete: true,
                manualReviewRequired: true,
                flags: ['license_issues', 'malpractice_concerns'],
                rejectionReason: 'Failed mandatory licensing requirements'
            }
        ];

        setProcessingQueue(mockApplications);

        // Generate analytics
        const totalApplications = mockApplications.length;
        const approved = mockApplications.filter(app => app.status === 'approved').length;
        const rejected = mockApplications.filter(app => app.status === 'rejected').length;
        const avgProcessingTime = 12; // days
        const ocrAccuracy = 89; // percentage

        setAnalytics({
            totalApplications,
            approved,
            rejected,
            pending: totalApplications - approved - rejected,
            avgProcessingTime,
            ocrAccuracy,
            approvalRate: Math.round((approved / totalApplications) * 100)
        });
    }, []);

    // Filter applications based on status and search
    const filteredApplications = processingQueue.filter(app => {
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchesSearch = app.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'under_review': return 'warning';
            case 'processing': return 'info';
            default: return 'default';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircleIcon />;
            case 'rejected': return <ErrorIcon />;
            case 'under_review': return <WarningIcon />;
            case 'processing': return <PendingActionsIcon />;
            default: return <AssignmentIcon />;
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    // Handle application review
    const handleReview = (application, decision, comments) => {
        setProcessingQueue(prev =>
            prev.map(app =>
                app.id === application.id
                    ? {
                        ...app,
                        status: decision,
                        reviewComments: comments,
                        reviewDate: new Date().toISOString(),
                        lastActivity: new Date().toISOString().split('T')[0]
                    }
                    : app
            )
        );
        setReviewDialog(false);
        setSelectedApplication(null);
    };

    // Export processing report
    const exportReport = () => {
        const reportData = {
            generatedAt: new Date().toISOString(),
            analytics,
            applications: filteredApplications,
            summary: {
                totalProcessed: filteredApplications.length,
                avgComplianceScore: Math.round(
                    filteredApplications
                        .filter(app => app.complianceScore)
                        .reduce((sum, app) => sum + app.complianceScore, 0) /
                    filteredApplications.filter(app => app.complianceScore).length
                )
            }
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credentialing-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Document Upload Functions
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setProcessingStep(1);
    };

    const handleUploadStart = async () => {
        if (!selectedFiles.length) {
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setProcessingStep(2);

        try {
            // Simulate OCR processing
            const results = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                // Update progress
                setUploadProgress(((i + 1) / selectedFiles.length) * 50);

                // Simulate file upload to backend
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Simulate OCR processing
                setUploadProgress(50 + ((i + 1) / selectedFiles.length) * 30);
                const ocrResult = await simulateBackendOCR(file, documentType);

                // Simulate rule processing and storage
                setUploadProgress(80 + ((i + 1) / selectedFiles.length) * 20);
                const ruleProcessingResult = await simulateRuleProcessing(ocrResult);

                results.push({
                    fileName: file.name,
                    fileSize: file.size,
                    documentType,
                    ocrResult,
                    ruleProcessingResult,
                    uploadTime: new Date().toISOString(),
                    status: 'processed'
                });
            }

            setOcrResults(results);
            setProcessingStep(3);
            setUploadProgress(100);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Error processing documents. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const simulateBackendOCR = async (file, docType) => {
        // Simulate backend OCR processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockOcrText = generateMockOCRText(file.name, docType);
        return {
            confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
            extractedText: mockOcrText,
            extractedFields: extractFieldsFromText(mockOcrText),
            processingTime: Math.random() * 3 + 1 // 1-4 seconds
        };
    };

    const generateMockOCRText = (fileName, docType) => {
        const genericProviderName = "Healthcare Provider";

        switch (docType) {
            case 'credentialing_rules':
                return `CREDENTIALING RULES DOCUMENT
                Document Type: Credentialing Requirements
                Effective Date: ${new Date().toLocaleDateString()}
                
                HARD RULES:
                1. Valid medical license required
                2. Board certification in specialty
                3. Current malpractice insurance
                4. Clean background check
                5. Hospital privileges verification
                
                SOFT RULES:
                1. Minimum 5 years experience preferred
                2. Quality scores above 80th percentile
                3. Patient satisfaction scores >4.0
                4. Continuing education requirements
                
                SPECIALTY REQUIREMENTS:
                - Internal Medicine: ABIM certification
                - Cardiology: ACC fellowship training
                - Emergency Medicine: ABEM certification
                
                Status: Active Document for Processing`;

            case 'medical_license':
                return `STATE MEDICAL BOARD LICENSE
                License Number: ML${Math.floor(Math.random() * 1000000)}
                License Type: Physician and Surgeon
                Issue Date: ${new Date(2020, 0, 15).toLocaleDateString()}
                Expiration Date: ${new Date(2025, 11, 31).toLocaleDateString()}
                Status: Active - Good Standing
                Licensee: ${genericProviderName}
                Specialty: Internal Medicine
                Address: 123 Medical Center Dr, Healthcare City, HC 12345`;

            case 'dea_certificate':
                return `DRUG ENFORCEMENT ADMINISTRATION CERTIFICATE
                Registration Number: BS${Math.floor(Math.random() * 10000000)}
                Registration Type: Practitioner
                Registrant: ${genericProviderName}
                Business Activity: Practitioner (Hospital/Clinic)
                Expiration Date: ${new Date(2025, 7, 31).toLocaleDateString()}
                Schedule: II, III, IV, V`;

            case 'malpractice_insurance':
                return `PROFESSIONAL LIABILITY INSURANCE CERTIFICATE
                Policy Number: PL2024-${Math.floor(Math.random() * 1000000)}
                Insured: ${genericProviderName}
                Coverage Limits: $2,000,000 per occurrence / $6,000,000 aggregate
                Policy Period: 01/01/2024 to 01/01/2025
                Insurance Company: Medical Protective Insurance
                A.M. Best Rating: A++`;

            default:
                return `CREDENTIALING RULES DOCUMENT
                Document Type: ${docType}
                Date Processed: ${new Date().toLocaleDateString()}
                Status: Processed via OCR
                
                Contains credentialing requirements and compliance rules for healthcare provider qualification and approval processes.`;
        }
    };

    const extractFieldsFromText = (text) => {
        const fields = {};

        // Extract license number
        const licenseMatch = text.match(/(?:license|registration)\s*number:?\s*([a-zA-Z0-9]+)/i);
        if (licenseMatch) fields.licenseNumber = licenseMatch[1];

        // Extract expiration date
        const expirationMatch = text.match(/expiration\s*date:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
        if (expirationMatch) fields.expirationDate = expirationMatch[1];

        // Extract policy number
        const policyMatch = text.match(/policy\s*number:?\s*([a-zA-Z0-9-]+)/i);
        if (policyMatch) fields.policyNumber = policyMatch[1];

        return fields;
    };

    const simulateRuleProcessing = async (ocrResult) => {
        // Simulate rule processing and storage
        await new Promise(resolve => setTimeout(resolve, 1000));

        const rulesProcessed = Math.floor(Math.random() * 15) + 10; // 10-25 rules
        const rulesCompliant = Math.floor(rulesProcessed * (Math.random() * 0.3 + 0.7)); // 70-100% compliance

        return {
            totalRulesProcessed: rulesProcessed,
            rulesCompliant,
            compliancePercentage: Math.round((rulesCompliant / rulesProcessed) * 100),
            rulesStored: true,
            databaseId: `rule_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            processingStatus: 'completed'
        };
    };

    const handleCloseUpload = () => {
        setUploadDialog(false);
        setSelectedFiles([]);
        setUploadProgress(0);
        setProcessingStep(0);
        setOcrResults([]);
        setUploading(false);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Credentialing Applications Manager
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage and review healthcare provider credentialing applications processed through OCR and rule-based compliance checking.
                </Typography>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab icon={<AssignmentIcon />} label="Applications Manager" />
                    <Tab icon={<CloudUploadIcon />} label="Document Upload & Processing" />
                </Tabs>
            </Paper>

            {activeTab === 0 && (
                <Box>

                    {/* Analytics Dashboard */}
                    {analytics && (
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" alignItems="center">
                                            <AssignmentIcon color="primary" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="h4">{analytics.totalApplications}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Applications
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" alignItems="center">
                                            <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="h4">{analytics.approved}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Approved ({analytics.approvalRate}%)
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" alignItems="center">
                                            <ScheduleIcon color="info" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="h4">{analytics.avgProcessingTime}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Avg Days to Process
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" alignItems="center">
                                            <AnalyticsIcon color="warning" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="h4">{analytics.ocrAccuracy}%</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    OCR Accuracy
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* Filters and Search */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search applications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Filter by Status</InputLabel>
                                    <Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        label="Filter by Status"
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="processing">Processing</MenuItem>
                                        <MenuItem value="under_review">Under Review</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh
                                </Button>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={exportReport}
                                >
                                    Export Report
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Applications Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Application ID</TableCell>
                                    <TableCell>Provider</TableCell>
                                    <TableCell>Specialty</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Progress</TableCell>
                                    <TableCell>Compliance Score</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredApplications.map((application) => (
                                    <TableRow key={application.id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{application.id}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {application.submissionDate}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                    {application.providerName.split(' ').map(n => n[0]).join('')}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">{application.providerName}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        NPI: {application.npi}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>{application.specialty}</TableCell>

                                        <TableCell>
                                            <Chip
                                                icon={getStatusIcon(application.status)}
                                                label={application.status.replace('_', ' ').toUpperCase()}
                                                color={getStatusColor(application.status)}
                                                size="small"
                                            />
                                            {application.flags.length > 0 && (
                                                <Box sx={{ mt: 1 }}>
                                                    {application.flags.map((flag, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={flag.replace('_', ' ')}
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                            sx={{ mr: 0.5, fontSize: '0.7rem' }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={application.priority.toUpperCase()}
                                                color={getPriorityColor(application.priority)}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{ minWidth: 120 }}>
                                                <Typography variant="body2" gutterBottom>
                                                    {application.documentsProcessed}/{application.totalDocuments} docs
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(application.documentsProcessed / application.totalDocuments) * 100}
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            {application.complianceScore ? (
                                                <Box>
                                                    <Typography variant="h6" color={
                                                        application.complianceScore >= 80 ? 'success.main' :
                                                            application.complianceScore >= 60 ? 'warning.main' : 'error.main'
                                                    }>
                                                        {application.complianceScore}%
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {application.hardRulesCompliant}/{application.totalHardRules} hard rules
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Processing...
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{application.assignedReviewer}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Last: {application.lastActivity}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedApplication(application);
                                                            setDetailsDialog(true);
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {application.manualReviewRequired && application.status === 'under_review' && (
                                                    <Tooltip title="Review Application">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => {
                                                                setSelectedApplication(application);
                                                                setReviewDialog(true);
                                                            }}
                                                        >
                                                            <AssignmentIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Details Dialog */}
                    <Dialog
                        open={detailsDialog}
                        onClose={() => setDetailsDialog(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>
                            Application Details - {selectedApplication?.id}
                        </DialogTitle>
                        <DialogContent>
                            {selectedApplication && (
                                <Box>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Provider Name</Typography>
                                            <Typography variant="body1">{selectedApplication.providerName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Specialty</Typography>
                                            <Typography variant="body1">{selectedApplication.specialty}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">NPI Number</Typography>
                                            <Typography variant="body1">{selectedApplication.npi}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Submission Date</Typography>
                                            <Typography variant="body1">{selectedApplication.submissionDate}</Typography>
                                        </Grid>
                                    </Grid>

                                    {selectedApplication.documents && (
                                        <Accordion defaultExpanded>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography variant="h6">Processed Documents</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <List>
                                                    {selectedApplication.documents.map((doc, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>
                                                                <DescriptionIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={doc.type}
                                                                secondary={
                                                                    <Box>
                                                                        <Chip
                                                                            size="small"
                                                                            label={doc.status}
                                                                            color={doc.status === 'verified' ? 'success' : 'warning'}
                                                                            sx={{ mr: 1 }}
                                                                        />
                                                                        <Typography variant="caption">
                                                                            OCR Confidence: {doc.ocrConfidence}%
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailsDialog(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Review Dialog */}
                    <Dialog
                        open={reviewDialog}
                        onClose={() => setReviewDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>
                            Review Application - {selectedApplication?.id}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    Make a decision on this credentialing application:
                                </Typography>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Review Comments"
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<ThumbDownIcon />}
                                onClick={() => handleReview(selectedApplication, 'rejected', 'Rejected after review')}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ThumbUpIcon />}
                                onClick={() => handleReview(selectedApplication, 'approved', 'Approved after review')}
                            >
                                Approve
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    {/* Document Upload Section */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Upload Credentialing Rules Documents
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Upload credentialing rules documents for OCR processing and automatic rule extraction and storage in the system.
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        border: '2px dashed #ccc',
                                        borderRadius: 2,
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'grey.50' },
                                        mb: 3
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Drop credentialing rules files here or click to browse
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Supported formats: PDF, JPG, PNG, TIFF
                                    </Typography>
                                </Box>                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />

                                {selectedFiles.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Selected Files ({selectedFiles.length}):
                                        </Typography>
                                        {selectedFiles.map((file, index) => (
                                            <Chip
                                                key={index}
                                                label={`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`}
                                                onDelete={() => {
                                                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                                                    setSelectedFiles(newFiles);
                                                }}
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        ))}
                                    </Box>
                                )}

                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<SendIcon />}
                                        onClick={handleUploadStart}
                                        disabled={selectedFiles.length === 0 || uploading}
                                        fullWidth
                                        size="large"
                                    >
                                        {uploading ? 'Processing...' : 'Upload & Process Credentialing Rules'}
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Credentialing Rules Processing Overview
                                    </Typography>

                                    <Box sx={{ mb: 3 }}>
                                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                            <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="subtitle2">1. Document Upload</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                            Securely upload your credentialing rules documents
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                            <AnalyticsIcon sx={{ mr: 1, color: 'info.main' }} />
                                            <Typography variant="subtitle2">2. OCR Processing</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                            Extract text and rule definitions using advanced OCR technology
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                            <RuleFolderIcon sx={{ mr: 1, color: 'warning.main' }} />
                                            <Typography variant="subtitle2">3. Rule Extraction</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                            Automatically identify and extract credentialing rules and requirements
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                            <StorageIcon sx={{ mr: 1, color: 'success.main' }} />
                                            <Typography variant="subtitle2">4. Rule Storage</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                            Store extracted rules in the system for future credentialing processes
                                        </Typography>
                                    </Box>
                                </Paper>                                {ocrResults.length > 0 && (
                                    <Paper sx={{ p: 2, mt: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Processing Results
                                        </Typography>
                                        {ocrResults.map((result, index) => (
                                            <Accordion key={index} sx={{ mb: 1 }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Typography variant="subtitle2">
                                                        {result.fileName} - {result.confidence}% confidence
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                                        <strong>Extracted Fields:</strong>
                                                    </Typography>
                                                    {Object.entries(result.extractedFields).map(([key, value]) => (
                                                        <Box key={key} sx={{ mb: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ ml: 1 }}>
                                                                {value}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Paper>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}

            {/* Upload Processing Dialog */}
            <Dialog
                open={uploadDialog}
                onClose={uploading ? undefined : handleCloseUpload}
                maxWidth="sm"
                fullWidth
                disableEscapeKeyDown={uploading}
            >
                <DialogTitle>
                    Processing Credentialing Rules Documents
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={processingStep} orientation="vertical">
                        <Step>
                            <StepLabel>Uploading Files</StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    Securely transferring your documents to the processing server...
                                </Typography>
                                {processingStep === 0 && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={uploadProgress}
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </StepContent>
                        </Step>

                        <Step>
                            <StepLabel>OCR Processing</StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    Extracting text and data from your documents using advanced OCR technology...
                                </Typography>
                                {processingStep === 1 && (
                                    <Box sx={{ mt: 2 }}>
                                        <LinearProgress />
                                        <Typography variant="caption" sx={{ mt: 1 }}>
                                            This may take a few minutes for large documents
                                        </Typography>
                                    </Box>
                                )}
                            </StepContent>
                        </Step>

                        <Step>
                            <StepLabel>Rule Extraction</StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    Analyzing extracted text to identify credentialing rules and requirements...
                                </Typography>
                                {processingStep === 2 && (
                                    <LinearProgress sx={{ mt: 2 }} />
                                )}
                            </StepContent>
                        </Step>

                        <Step>
                            <StepLabel>Storing Rules</StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    Saving extracted rules to the credentialing database...
                                </Typography>
                                {processingStep === 3 && (
                                    <LinearProgress sx={{ mt: 2 }} />
                                )}
                            </StepContent>
                        </Step>
                    </Stepper>

                    {processingStep === 4 && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body1">
                                <strong>Processing Complete!</strong>
                            </Typography>
                            <Typography variant="body2">
                                All documents have been processed successfully. {ocrResults.length} files were analyzed
                                and credentialing rules have been extracted and stored in the database.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {!uploading && (
                        <Button onClick={handleCloseUpload}>
                            {processingStep === 4 ? 'Close' : 'Cancel'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PayerCredentialingManager;
