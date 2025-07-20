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
    Grid,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Divider
} from '@mui/material';
import {
    Business,
    CheckCircle,
    CloudDownload
} from '@mui/icons-material';
import api from '../../services/api/api';

const CAQHIntegration = ({ onDataImported }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            label: 'Enter CAQH Credentials',
            description: 'Provide your CAQH ProView username and password'
        },
        {
            label: 'Verify Connection',
            description: 'We\'ll securely connect to your CAQH profile'
        },
        {
            label: 'Import Data',
            description: 'Your professional information will be imported'
        },
        {
            label: 'Review & Confirm',
            description: 'Review imported data and confirm accuracy'
        }
    ];

    const handleInputChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleImport = async () => {
        if (!credentials.username || !credentials.password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Enter credentials
            setActiveStep(0);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 2: Verify connection
            setActiveStep(1);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 3: Import data
            setActiveStep(2);
            const response = await api.importFromCAQH(credentials);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 4: Review
            setActiveStep(3);

            if (response.data.success) {
                setSuccess(true);
                if (onDataImported) {
                    onDataImported(response.data.data);
                }
            } else {
                setError('Failed to import data from CAQH');
            }
        } catch (error) {
            setError('Failed to connect to CAQH. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
        setCredentials({ username: '', password: '' });
        setError('');
        setSuccess(false);
        setActiveStep(0);
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Business sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h6">CAQH Integration</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Import your professional data from CAQH ProView
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Connect your CAQH ProView account to automatically import your professional information,
                        including education, training, work history, and certifications. This saves time and
                        ensures accuracy in your credentialing application.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<CloudDownload />}
                            onClick={() => setDialogOpen(true)}
                            sx={{ flexGrow: 1 }}
                        >
                            Import from CAQH
                        </Button>
                        <Button
                            variant="outlined"
                            href="https://www.caqh.org/proview"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit CAQH ProView
                        </Button>
                    </Box>

                    <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="info.dark" gutterBottom>
                            What gets imported:
                        </Typography>
                        <Typography variant="body2" color="info.dark">
                            • Personal and contact information
                            <br />
                            • Education and training history
                            <br />
                            • Work history and professional experience
                            <br />
                            • Board certifications and licenses
                            <br />
                            • Hospital affiliations and privileges
                            <br />
                            • Professional references
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Import Dialog */}
            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Import from CAQH ProView</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {!loading && !success && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Your CAQH credentials are used only for this import and are not stored.
                                        All data transmission is encrypted and secure.
                                    </Alert>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="CAQH Username"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter your CAQH ProView username"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="CAQH Password"
                                        name="password"
                                        type="password"
                                        value={credentials.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your CAQH ProView password"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {loading && (
                            <Box sx={{ mt: 2 }}>
                                <Stepper activeStep={activeStep} orientation="vertical">
                                    {steps.map((step, index) => (
                                        <Step key={step.label}>
                                            <StepLabel>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {index < activeStep ? (
                                                        <CheckCircle color="success" sx={{ mr: 1 }} />
                                                    ) : index === activeStep ? (
                                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                                    ) : null}
                                                    {step.label}
                                                </Box>
                                            </StepLabel>
                                            <StepContent>
                                                <Typography variant="body2" color="text.secondary">
                                                    {step.description}
                                                </Typography>
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        )}

                        {success && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Data Successfully Imported!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your professional information has been imported from CAQH ProView.
                                    Please review the imported data and make any necessary updates.
                                </Typography>
                            </Box>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {success ? 'Close' : 'Cancel'}
                    </Button>
                    {!loading && !success && (
                        <Button
                            onClick={handleImport}
                            variant="contained"
                            disabled={!credentials.username || !credentials.password}
                        >
                            Import Data
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CAQHIntegration;
