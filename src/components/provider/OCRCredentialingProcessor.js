import React, { useState, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    ExpandMore as ExpandMoreIcon,
    Assignment as AssignmentIcon,
    PendingActions as PendingActionsIcon
} from '@mui/icons-material';

// Import the credentialing rules
import credentialingRules from '../../data/credentialing_rules.json';

const OCRCredentialingProcessor = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [complianceResults, setComplianceResults] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewDialog, setPreviewDialog] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const fileInputRef = useRef(null);    // Simulate OCR text extraction from documents
    const simulateOCRExtraction = (file) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate extracted text based on file type
                const mockExtractedText = generateMockExtractedText(file.name);
                resolve({
                    fileName: file.name,
                    confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
                    extractedText: mockExtractedText,
                    pageCount: Math.floor(Math.random() * 5) + 1
                });
            }, 1500 + Math.random() * 1000);
        });
    };

    // Generate mock extracted text based on document type
    const generateMockExtractedText = (fileName) => {
        const fileType = fileName.toLowerCase();

        if (fileType.includes('license') || fileType.includes('medical')) {
            return `
        STATE MEDICAL BOARD LICENSE
        License Number: MD123456789
        License Type: Physician and Surgeon
        Issue Date: January 15, 2020
        Expiration Date: December 31, 2025
        Status: Active - Good Standing
        Licensee: Dr. John Smith
        Address: 123 Medical Center Dr, Healthcare City, HC 12345
        
        BOARD CERTIFICATION
        American Board of Internal Medicine
        Certification Date: June 15, 2018
        Certificate Number: IM987654321
        Status: Current - Maintenance of Certification Complete
        
        DISCIPLINARY ACTIONS: None
        RESTRICTIONS: None
        
        Verified by State Medical Board
        Verification Date: ${new Date().toLocaleDateString()}
      `;
        }

        if (fileType.includes('dea') || fileType.includes('controlled')) {
            return `
        DRUG ENFORCEMENT ADMINISTRATION
        CERTIFICATE OF REGISTRATION
        
        Registration Number: BS1234567
        Registration Type: Practitioner
        Scheduled Substances: II, III, IV, V
        
        Registrant Information:
        Name: John Smith, MD
        Address: 123 Medical Center Dr
               Healthcare City, HC 12345
        
        Business Activity: Practitioner (Hospital/Clinic)
        
        Expiration Date: 08/31/2025
        Issue Date: 09/01/2022
        
        This registration is issued under the provisions of the
        Controlled Substances Act and regulations thereunder.
        
        VALID ONLY FOR THE PERSON, ADDRESS AND SCHEDULES SHOWN
      `;
        }

        if (fileType.includes('insurance') || fileType.includes('malpractice')) {
            return `
        PROFESSIONAL LIABILITY INSURANCE CERTIFICATE
        
        Policy Number: PL2024-789456123
        
        INSURED:
        John Smith, MD
        Healthcare Medical Group
        123 Medical Center Dr
        Healthcare City, HC 12345
        
        INSURANCE COMPANY:
        Medical Protective Insurance Company
        A.M. Best Rating: A++
        
        POLICY PERIOD:
        From: 01/01/2024  To: 01/01/2025
        
        COVERAGE LIMITS:
        Each Occurrence: $2,000,000
        General Aggregate: $6,000,000
        
        DESCRIPTION OF OPERATIONS:
        Professional medical services
        Internal Medicine Practice
        
        This certificate is issued as a matter of information only.
      `;
        }

        if (fileType.includes('background') || fileType.includes('criminal')) {
            return `
        FBI CRIMINAL BACKGROUND CHECK
        IDENTITY HISTORY SUMMARY
        
        Subject: John Smith
        DOB: 01/15/1980
        SSN: XXX-XX-1234
        
        Date of Search: ${new Date().toLocaleDateString()}
        
        SEARCH RESULTS:
        No criminal history record information found.
        
        This response is based upon fingerprint submissions.
        
        CJIS DIVISION - FEDERAL BUREAU OF INVESTIGATION
        
        NOTE: The absence of criminal history record information
        does not mean the individual has no criminal history.
      `;
        }

        // Default extracted text
        return `
      MEDICAL CREDENTIALING DOCUMENT
      
      Provider Name: Dr. John Smith
      NPI Number: 1234567890
      Specialty: Internal Medicine
      
      Education:
      Medical School: Harvard Medical School (2010)
      Residency: Massachusetts General Hospital (2013)
      Fellowship: Cardiology Fellowship, Mayo Clinic (2015)
      
      Current Positions:
      Attending Physician - General Hospital
      Clinical Instructor - Medical University
      
      Professional Memberships:
      American Medical Association
      American College of Physicians
      
      Hospital Privileges:
      General Hospital - Active Staff
      University Medical Center - Courtesy Staff
      
      Last Updated: ${new Date().toLocaleDateString()}
    `;
    };

    // Process extracted text against credentialing rules
    const processCredentialingRules = (extractedData) => {
        const { credentialing_rules } = credentialingRules;
        const results = {
            hardRules: [],
            softRules: [],
            overallScore: 0,
            complianceStatus: 'pending',
            extractedFields: {},
            validationIssues: []
        };

        let hardRuleScore = 0;
        let softRuleScore = 0;
        let totalHardRules = credentialing_rules.hard_rules.length;
        let maxSoftScore = credentialing_rules.soft_rules.reduce((sum, rule) => sum + rule.scoring_weight, 0);

        // Process hard rules
        credentialing_rules.hard_rules.forEach(rule => {
            const evaluation = evaluateRule(rule, extractedData.extractedText);
            results.hardRules.push({
                ...rule,
                evaluation
            });
            if (evaluation.compliant) {
                hardRuleScore++;
            }
        });

        // Process soft rules
        credentialing_rules.soft_rules.forEach(rule => {
            const evaluation = evaluateRule(rule, extractedData.extractedText);
            results.softRules.push({
                ...rule,
                evaluation
            });
            if (evaluation.compliant) {
                softRuleScore += rule.scoring_weight;
            }
        });

        // Calculate overall score
        const hardRulePercentage = (hardRuleScore / totalHardRules) * credentialing_rules.compliance_scoring.hard_rules_weight;
        const softRulePercentage = (softRuleScore / maxSoftScore) * credentialing_rules.compliance_scoring.soft_rules_weight;
        results.overallScore = hardRulePercentage + softRulePercentage;

        // Determine compliance status
        if (results.overallScore >= credentialing_rules.compliance_scoring.minimum_passing_score) {
            results.complianceStatus = 'compliant';
        } else if (results.overallScore >= 60) {
            results.complianceStatus = 'conditional';
        } else {
            results.complianceStatus = 'non_compliant';
        }

        // Extract specific fields
        results.extractedFields = extractKeyFields(extractedData.extractedText);

        return results;
    };

    // Evaluate individual rule against extracted text
    const evaluateRule = (rule, extractedText) => {
        const text = extractedText.toLowerCase();
        let matchCount = 0;
        let foundKeywords = [];

        // Check for OCR keywords in the text
        rule.ocr_keywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                matchCount++;
                foundKeywords.push(keyword);
            }
        });

        // Simple compliance logic based on keyword matches
        const keywordMatchRatio = matchCount / rule.ocr_keywords.length;
        let compliant = false;
        let confidence = 0;

        if (rule.mandatory) {
            // For hard rules, require higher keyword match ratio
            compliant = keywordMatchRatio >= 0.3;
            confidence = Math.min(keywordMatchRatio * 2, 1.0);
        } else {
            // For soft rules, more lenient matching
            compliant = keywordMatchRatio >= 0.2;
            confidence = keywordMatchRatio;
        }

        return {
            compliant,
            confidence,
            matchedKeywords: foundKeywords,
            keywordMatchRatio,
            evidence: extractEvidence(rule, extractedText)
        };
    };

    // Extract evidence text for rule evaluation
    const extractEvidence = (rule, extractedText) => {
        const lines = extractedText.split('\n');
        const evidence = [];

        rule.ocr_keywords.forEach(keyword => {
            lines.forEach(line => {
                if (line.toLowerCase().includes(keyword.toLowerCase())) {
                    evidence.push(line.trim());
                }
            });
        });

        return evidence.slice(0, 3); // Return top 3 evidence lines
    };

    // Extract key fields from text
    const extractKeyFields = (extractedText) => {
        const fields = {};

        // Extract license number
        const licenseMatch = extractedText.match(/license\s*(?:number|#)?:?\s*([a-zA-Z0-9]+)/i);
        if (licenseMatch) fields.licenseNumber = licenseMatch[1];        // Extract expiration date
        const expirationMatch = extractedText.match(/expiration\s*date:?\s*(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
        if (expirationMatch) fields.expirationDate = expirationMatch[1];

        // Extract DEA number
        const deaMatch = extractedText.match(/(?:dea|registration)\s*(?:number|#)?:?\s*([a-zA-Z]{2}\d{7})/i);
        if (deaMatch) fields.deaNumber = deaMatch[1];

        // Extract NPI number
        const npiMatch = extractedText.match(/npi\s*(?:number|#)?:?\s*(\d{10})/i);
        if (npiMatch) fields.npiNumber = npiMatch[1];

        // Extract provider name
        const nameMatch = extractedText.match(/(?:name|licensee):?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*(?:,?\s*(?:MD|DO|DDS|DVM))?)/i);
        if (nameMatch) fields.providerName = nameMatch[1];

        return fields;
    };

    // Handle file upload
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        setProcessing(true);
        setProcessingProgress(0);

        const newFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProcessingProgress(((i + 1) / files.length) * 50);

            try {
                const ocrResult = await simulateOCRExtraction(file);
                newFiles.push({
                    id: Date.now() + i,
                    file,
                    ocrResult,
                    status: 'extracted',
                    uploadTime: new Date()
                });
            } catch (error) {
                newFiles.push({
                    id: Date.now() + i,
                    file,
                    error: error.message,
                    status: 'error',
                    uploadTime: new Date()
                });
            }
        }

        setUploadedFiles(prev => [...prev, ...newFiles]);
        setProcessing(false);
        setProcessingProgress(0);
    };

    // Process credentialing for selected file
    const processCredentialing = async (fileData) => {
        setProcessing(true);
        setProcessingProgress(0);

        try {
            // Simulate processing time
            for (let i = 0; i <= 100; i += 10) {
                setProcessingProgress(i);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const results = processCredentialingRules(fileData.ocrResult);
            setExtractedData(fileData.ocrResult);
            setComplianceResults(results);

            // Update file status
            setUploadedFiles(prev =>
                prev.map(f =>
                    f.id === fileData.id
                        ? { ...f, status: 'processed', complianceResults: results }
                        : f
                )
            );
        } catch (error) {
            console.error('Processing error:', error);
        } finally {
            setProcessing(false);
            setProcessingProgress(0);
        }
    };

    // Get compliance status color
    const getComplianceStatusColor = (status) => {
        switch (status) {
            case 'compliant': return 'success';
            case 'conditional': return 'warning';
            case 'non_compliant': return 'error';
            default: return 'info';
        }
    };

    // Get compliance status icon
    const getComplianceStatusIcon = (status) => {
        switch (status) {
            case 'compliant': return <CheckCircleIcon />;
            case 'conditional': return <WarningIcon />;
            case 'non_compliant': return <ErrorIcon />;
            default: return <PendingActionsIcon />;
        }
    };

    // Export results as JSON
    const exportResults = () => {
        if (!complianceResults) return;

        const exportData = {
            timestamp: new Date().toISOString(),
            extractedData,
            complianceResults,
            summary: {
                overallScore: complianceResults.overallScore,
                status: complianceResults.complianceStatus,
                hardRulesCompliant: complianceResults.hardRules.filter(r => r.evaluation.compliant).length,
                totalHardRules: complianceResults.hardRules.length,
                softRulesPoints: complianceResults.softRules
                    .filter(r => r.evaluation.compliant)
                    .reduce((sum, r) => sum + r.scoring_weight, 0)
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credentialing-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Healthcare Credentialing OCR Processor
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Upload credentialing documents for automated OCR extraction and rule-based compliance verification.
                    Process medical licenses, DEA certificates, malpractice insurance, and other credentialing documents.
                </Typography>
            </Paper>

            {/* File Upload Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Document Upload
                    </Typography>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.tiff"
                        style={{ display: 'none' }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processing}
                        size="large"
                        sx={{ mb: 2 }}
                    >
                        Upload Credentialing Documents
                    </Button>

                    {processing && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                Processing documents... {Math.round(processingProgress)}%
                            </Typography>
                            <LinearProgress variant="determinate" value={processingProgress} />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Uploaded Documents ({uploadedFiles.length})
                        </Typography>

                        <Grid container spacing={2}>
                            {uploadedFiles.map(fileData => (
                                <Grid item xs={12} md={6} lg={4} key={fileData.id}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            border: fileData.status === 'processed' ? '2px solid #4caf50' : '1px solid #e0e0e0'
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <DescriptionIcon sx={{ mr: 1 }} />
                                            <Typography variant="subtitle2" noWrap>
                                                {fileData.file.name}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Size: {(fileData.file.size / 1024).toFixed(1)} KB
                                        </Typography>

                                        {fileData.ocrResult && (
                                            <>
                                                <Chip
                                                    size="small"
                                                    label={`${Math.round(fileData.ocrResult.confidence * 100)}% OCR Confidence`}
                                                    color={fileData.ocrResult.confidence > 0.8 ? 'success' : 'warning'}
                                                    sx={{ mb: 1 }}
                                                />

                                                <Box display="flex" gap={1} flexWrap="wrap">
                                                    <Button
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => {
                                                            setSelectedFile(fileData);
                                                            setPreviewDialog(true);
                                                        }}
                                                    >
                                                        Preview
                                                    </Button>

                                                    {fileData.status !== 'processed' && (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<AssignmentIcon />}
                                                            onClick={() => processCredentialing(fileData)}
                                                            disabled={processing}
                                                        >
                                                            Process Rules
                                                        </Button>
                                                    )}

                                                    {fileData.complianceResults && (
                                                        <Chip
                                                            size="small"
                                                            icon={getComplianceStatusIcon(fileData.complianceResults.complianceStatus)}
                                                            label={`${Math.round(fileData.complianceResults.overallScore)}% Compliant`}
                                                            color={getComplianceStatusColor(fileData.complianceResults.complianceStatus)}
                                                        />
                                                    )}
                                                </Box>
                                            </>
                                        )}

                                        {fileData.error && (
                                            <Alert severity="error" size="small">
                                                {fileData.error}
                                            </Alert>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Compliance Results */}
            {complianceResults && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Compliance Analysis Results
                            </Typography>
                            <Box display="flex" gap={1}>
                                <Button
                                    startIcon={<DownloadIcon />}
                                    onClick={exportResults}
                                    variant="outlined"
                                >
                                    Export JSON
                                </Button>
                            </Box>
                        </Box>

                        {/* Overall Score */}
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Overall Compliance Score
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={complianceResults.overallScore}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: complianceResults.overallScore >= 80 ? '#4caf50' :
                                                    complianceResults.overallScore >= 60 ? '#ff9800' : '#f44336'
                                            }
                                        }}
                                    />
                                </Box>
                                <Chip
                                    icon={getComplianceStatusIcon(complianceResults.complianceStatus)}
                                    label={`${Math.round(complianceResults.overallScore)}%`}
                                    color={getComplianceStatusColor(complianceResults.complianceStatus)}
                                    size="large"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Status: {complianceResults.complianceStatus.replace('_', ' ').toUpperCase()}
                            </Typography>
                        </Paper>

                        {/* Hard Rules Results */}
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    Hard Rules (Mandatory) - {complianceResults.hardRules.filter(r => r.evaluation.compliant).length}/{complianceResults.hardRules.length} Compliant
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Rule ID</TableCell>
                                                <TableCell>Rule Name</TableCell>
                                                <TableCell>Category</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Confidence</TableCell>
                                                <TableCell>Evidence</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {complianceResults.hardRules.map(rule => (
                                                <TableRow key={rule.rule_id}>
                                                    <TableCell>{rule.rule_id}</TableCell>
                                                    <TableCell>{rule.rule_name}</TableCell>
                                                    <TableCell>{rule.category}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            icon={rule.evaluation.compliant ? <CheckCircleIcon /> : <ErrorIcon />}
                                                            label={rule.evaluation.compliant ? 'Compliant' : 'Non-Compliant'}
                                                            color={rule.evaluation.compliant ? 'success' : 'error'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {Math.round(rule.evaluation.confidence * 100)}%
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={rule.evaluation.evidence.join('; ')}>
                                                            <Chip
                                                                size="small"
                                                                label={`${rule.evaluation.matchedKeywords.length} matches`}
                                                                variant="outlined"
                                                            />
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>

                        {/* Soft Rules Results */}
                        <Accordion sx={{ mt: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    Soft Rules (Preferred) - {complianceResults.softRules.filter(r => r.evaluation.compliant).length}/{complianceResults.softRules.length} Met
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Rule ID</TableCell>
                                                <TableCell>Rule Name</TableCell>
                                                <TableCell>Category</TableCell>
                                                <TableCell>Points</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Evidence</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {complianceResults.softRules.map(rule => (
                                                <TableRow key={rule.rule_id}>
                                                    <TableCell>{rule.rule_id}</TableCell>
                                                    <TableCell>{rule.rule_name}</TableCell>
                                                    <TableCell>{rule.category}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={`${rule.scoring_weight} pts`}
                                                            color={rule.evaluation.compliant ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={rule.evaluation.compliant ? 'Met' : 'Not Met'}
                                                            color={rule.evaluation.compliant ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={`${rule.evaluation.matchedKeywords.length} matches`}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>

                        {/* Extracted Fields */}
                        <Accordion sx={{ mt: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    Extracted Key Fields
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {Object.entries(complianceResults.extractedFields).map(([key, value]) => (
                                        <Grid item xs={6} md={4} key={key}>
                                            <Paper sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {value || 'Not extracted'}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                </Card>
            )}

            {/* Document Preview Dialog */}
            <Dialog
                open={previewDialog}
                onClose={() => setPreviewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Document Preview - {selectedFile?.file.name}
                </DialogTitle>
                <DialogContent>
                    {selectedFile?.ocrResult && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Extracted Text (Confidence: {Math.round(selectedFile.ocrResult.confidence * 100)}%)
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedFile.ocrResult.extractedText}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OCRCredentialingProcessor;
