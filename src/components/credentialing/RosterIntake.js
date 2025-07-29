import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    Chip,
    Alert,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/UserContext';
import mockDatabase from '../../data/mockDatabase';

const RosterIntake = () => {
    const { user } = useAuth();
    const [rosterFile, setRosterFile] = useState(null);
    const [rosterLoading, setRosterLoading] = useState(false);
    const [rosterSuccess, setRosterSuccess] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setRosterFile(file);
            setRosterSuccess(false);
        }
    };

    const processRosterFile = async () => {
        if (!rosterFile) return;

        setRosterLoading(true);
        setRosterSuccess(false);

        try {
            // Simulate file processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create 3 mock providers to be added to the system
            const mockProviders = [
                {
                    id: `dr_roster_${Date.now()}_001`,
                    name: 'Dr. Sarah Johnson',
                    specialty: 'Internal Medicine',
                    status: 'In Progress',
                    market: 'CA',
                    submissionDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    flaggedForCommittee: false,
                    networkImpact: 'Medium',
                    checklist: {
                        education: { status: 'complete', score: 100 },
                        licenses: { status: 'complete', score: 100 },
                        experience: { status: 'complete', score: 85 },
                        references: { status: 'pending', score: 0 },
                        background: { status: 'in_progress', score: 50 }
                    },
                    progress: 68,
                    source: 'Roster Automation'
                },
                {
                    id: `dr_roster_${Date.now()}_002`,
                    name: 'Dr. Michael Chen',
                    specialty: 'Cardiology',
                    status: 'In Progress',
                    market: 'CA',
                    submissionDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    flaggedForCommittee: false,
                    networkImpact: 'High',
                    checklist: {
                        education: { status: 'complete', score: 100 },
                        licenses: { status: 'complete', score: 100 },
                        experience: { status: 'complete', score: 95 },
                        references: { status: 'complete', score: 90 },
                        background: { status: 'pending', score: 0 }
                    },
                    progress: 77,
                    source: 'Roster Automation'
                },
                {
                    id: `dr_roster_${Date.now()}_003`,
                    name: 'Dr. Emily Rodriguez',
                    specialty: 'Pediatrics',
                    status: 'In Progress',
                    market: 'CA',
                    submissionDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    flaggedForCommittee: false,
                    networkImpact: 'Low',
                    checklist: {
                        education: { status: 'complete', score: 100 },
                        licenses: { status: 'complete', score: 100 },
                        experience: { status: 'complete', score: 80 },
                        references: { status: 'complete', score: 85 },
                        background: { status: 'complete', score: 95 }
                    },
                    progress: 92,
                    source: 'Roster Automation'
                }
            ];

            // Add the mock providers to the database
            mockProviders.forEach(provider => {
                mockDatabase.addProvider(provider);
            });

            // Create audit logs for the roster intake
            mockProviders.forEach(provider => {
                mockDatabase.addAuditLog({
                    providerId: provider.id,
                    action: 'Provider added via Roster Automation',
                    user: user.name,
                    details: {
                        fileName: rosterFile.name,
                        source: 'Roster Automation',
                        specialty: provider.specialty
                    }
                });
            });

            setRosterSuccess(true);
            setRosterFile(null);

            // Reset file input
            const fileInput = document.getElementById('roster-file-input');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error processing roster file:', error);
        } finally {
            setRosterLoading(false);
        }
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                            Roster Automation Intake
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                            Upload your roster automation Excel file to automatically process and add provider applications to the credentialing system.
                        </Typography>

                        {/* File Upload Section */}
                        <Box sx={{ mb: 4 }}>
                            <input
                                accept=".xlsx,.xls,.csv"
                                style={{ display: 'none' }}
                                id="roster-file-input"
                                type="file"
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="roster-file-input">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    size="large"
                                    startIcon={<UploadIcon />}
                                    sx={{ mr: 2, mb: 2 }}
                                >
                                    Choose Excel File
                                </Button>
                            </label>

                            {rosterFile && (
                                <Box sx={{ mt: 2, mb: 3 }}>
                                    <Chip
                                        icon={<FileIcon />}
                                        label={rosterFile.name}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ fontSize: '0.9rem', py: 2 }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Process Button */}
                        <Box sx={{ mb: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={processRosterFile}
                                disabled={!rosterFile || rosterLoading}
                                startIcon={rosterLoading ? <CircularProgress size={20} /> : <AssignmentIcon />}
                                sx={{ minWidth: 200 }}
                            >
                                {rosterLoading ? 'Processing...' : 'Process Roster File'}
                            </Button>
                        </Box>

                        {/* Loading Progress */}
                        {rosterLoading && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Processing roster file and creating provider applications...
                                </Typography>
                                <LinearProgress />
                            </Box>
                        )}

                        {/* Success Message */}
                        {rosterSuccess && (
                            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                                <Typography variant="h6" gutterBottom>
                                    Roster Processing Complete!
                                </Typography>
                                <Typography variant="body2">
                                    Successfully added 3 provider applications from the roster file:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                                    <Typography component="li" variant="body2">Dr. Sarah Johnson - Internal Medicine</Typography>
                                    <Typography component="li" variant="body2">Dr. Michael Chen - Cardiology</Typography>
                                    <Typography component="li" variant="body2">Dr. Emily Rodriguez - Pediatrics</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 2 }}>
                                    You can now view these applications in the Applications tab or Committee Review section.
                                </Typography>
                            </Alert>
                        )}

                        {/* Instructions */}
                        <Paper variant="outlined" sx={{ p: 3, mt: 4, textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom>
                                File Requirements
                            </Typography>
                            <Box component="ul" sx={{ mb: 2 }}>
                                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                    Supported formats: .xlsx, .xls, .csv
                                </Typography>
                                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                    File should contain provider information with standard roster columns
                                </Typography>
                                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                    Maximum file size: 10MB
                                </Typography>
                                <Typography component="li" variant="body2">
                                    Processing will create new provider applications automatically
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                            </Typography>
                        </Paper>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RosterIntake;
