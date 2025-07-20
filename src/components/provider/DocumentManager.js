import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
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
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Alert,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    Visibility,
    CheckCircle,
    Schedule,
    Warning
} from '@mui/icons-material';
import api from '../../services/api/api';

const DocumentManager = ({ documents = [], onDocumentUploaded }) => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const documentTypes = [
        { value: 'medical_license', label: 'Medical License' },
        { value: 'board_certification', label: 'Board Certification' },
        { value: 'dea_certificate', label: 'DEA Certificate' },
        { value: 'malpractice_insurance', label: 'Malpractice Insurance' },
        { value: 'cv', label: 'Curriculum Vitae' },
        { value: 'diploma', label: 'Medical Diploma' },
        { value: 'residency_certificate', label: 'Residency Certificate' },
        { value: 'fellowship_certificate', label: 'Fellowship Certificate' },
        { value: 'hospital_privileges', label: 'Hospital Privileges' },
        { value: 'references', label: 'Professional References' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'info';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified': return <CheckCircle color="success" />;
            case 'pending': return <Schedule color="warning" />;
            case 'rejected': return <Warning color="error" />;
            default: return <Schedule color="info" />;
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setUploadError('Only PDF, JPEG, PNG files are allowed');
                return;
            }

            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !documentType) return;

        setUploading(true);
        setUploadError('');

        try {
            const response = await api.uploadDocument(selectedFile, documentType);

            // Call parent callback if provided
            if (onDocumentUploaded) {
                onDocumentUploaded(response.data);
            }

            // Reset form
            setSelectedFile(null);
            setDocumentType('');
            setUploadDialogOpen(false);
        } catch (error) {
            setUploadError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const mockDocuments = [
        {
            id: 1,
            name: 'Medical License',
            type: 'medical_license',
            status: 'verified',
            uploadedAt: '2024-01-15T10:00:00Z',
            verifiedAt: '2024-01-16T14:30:00Z'
        },
        {
            id: 2,
            name: 'Board Certification',
            type: 'board_certification',
            status: 'pending',
            uploadedAt: '2024-01-20T09:15:00Z'
        },
        {
            id: 3,
            name: 'DEA Certificate',
            type: 'dea_certificate',
            status: 'verified',
            uploadedAt: '2024-01-18T11:45:00Z',
            verifiedAt: '2024-01-19T16:20:00Z'
        },
        {
            id: 4,
            name: 'Malpractice Insurance',
            type: 'malpractice_insurance',
            status: 'pending',
            uploadedAt: '2024-01-22T08:30:00Z'
        }
    ];

    const displayDocuments = documents.length > 0 ? documents : mockDocuments;

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Document Management</Typography>
                    <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        Upload Document
                    </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Upload and manage your credentialing documents. All documents are securely stored and encrypted.
                    </Typography>
                </Box>

                <List>
                    {displayDocuments.map((doc) => (
                        <ListItem key={doc.id} divider>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1">{doc.name}</Typography>
                                        <Chip
                                            label={doc.status}
                                            color={getStatusColor(doc.status)}
                                            size="small"
                                            icon={getStatusIcon(doc.status)}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </Typography>
                                        {doc.verifiedAt && (
                                            <Typography variant="body2" color="success.main">
                                                Verified: {new Date(doc.verifiedAt).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="view">
                                    <Visibility />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" sx={{ ml: 1 }}>
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>

                {/* Upload Dialog */}
                <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Document Type</InputLabel>
                                <Select
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    label="Document Type"
                                >
                                    {documentTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                {selectedFile ? selectedFile.name : 'Choose File'}
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileSelect}
                                />
                            </Button>

                            {uploadError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {uploadError}
                                </Alert>
                            )}

                            {uploading && (
                                <LinearProgress sx={{ mb: 2 }} />
                            )}

                            <Typography variant="body2" color="text.secondary">
                                Supported formats: PDF, JPEG, PNG. Maximum file size: 10MB.
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            variant="contained"
                            disabled={!selectedFile || !documentType || uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default DocumentManager;
