import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Alert,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Divider,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon,
    Psychology as PsychologyIcon,
    Settings as SettingsIcon,
    Preview as PreviewIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Assignment as AssignmentIcon,
    SmartToy as SmartToyIcon,
    Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/UserContext';
import mockDatabase from '../../data/mockDatabase';

const ChecklistEngine = () => {
    const { user } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [generatedChecklist, setGeneratedChecklist] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        specialty: '',
        experience: '',
        facilityType: '',
        riskLevel: '',
        complianceRequirements: [],
        customRequirements: ''
    });

    const steps = [
        {
            label: 'Provider Profile',
            description: 'Define the provider characteristics'
        },
        {
            label: 'Risk Assessment',
            description: 'Analyze risk factors and compliance needs'
        },
        {
            label: 'AI Generation',
            description: 'Generate customized checklist using AI'
        },
        {
            label: 'Review & Customize',
            description: 'Review and modify the generated checklist'
        }
    ];

    const specialties = [
        'Cardiology',
        'Emergency Medicine',
        'Family Medicine',
        'Internal Medicine',
        'Pediatrics',
        'Surgery',
        'Orthopedics',
        'Radiology',
        'Anesthesiology',
        'Psychiatry'
    ];

    const facilityTypes = [
        'Hospital',
        'Clinic',
        'Surgery Center',
        'Urgent Care',
        'Telehealth',
        'Home Health'
    ];

    const complianceOptions = [
        'DEA Registration',
        'State Licensing',
        'Board Certification',
        'CME Requirements',
        'Malpractice Insurance',
        'Background Check',
        'Hospital Privileges',
        'Quality Metrics'
    ];

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleComplianceChange = (requirement) => {
        const updated = formData.complianceRequirements.includes(requirement)
            ? formData.complianceRequirements.filter(r => r !== requirement)
            : [...formData.complianceRequirements, requirement];

        setFormData(prev => ({ ...prev, complianceRequirements: updated }));
    };

    const generateChecklist = async () => {
        setIsGenerating(true);

        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock AI-generated checklist based on form data
        const aiGeneratedItems = [
            {
                id: 'ai-1',
                title: 'Current Medical License Verification',
                description: `Verify active ${formData.specialty} license in all practice states`,
                category: 'Licensing',
                required: true,
                priority: 'High',
                estimatedTime: '2-3 business days'
            },
            {
                id: 'ai-2',
                title: 'Board Certification Validation',
                description: `Confirm current board certification in ${formData.specialty}`,
                category: 'Certification',
                required: true,
                priority: 'High',
                estimatedTime: '1-2 business days'
            },
            {
                id: 'ai-3',
                title: 'Malpractice Insurance Coverage',
                description: `Minimum $1M per occurrence for ${formData.facilityType} practice`,
                category: 'Insurance',
                required: true,
                priority: 'High',
                estimatedTime: '1 business day'
            },
            {
                id: 'ai-4',
                title: 'Hospital Privileges Verification',
                description: 'Confirm active privileges at primary hospital',
                category: 'Privileges',
                required: formData.facilityType === 'Hospital',
                priority: 'Medium',
                estimatedTime: '3-5 business days'
            },
            {
                id: 'ai-5',
                title: 'Peer References',
                description: `Obtain 3 peer references from ${formData.specialty} colleagues`,
                category: 'References',
                required: true,
                priority: 'Medium',
                estimatedTime: '5-7 business days'
            },
            {
                id: 'ai-6',
                title: 'Background Check',
                description: 'Comprehensive criminal and professional background check',
                category: 'Verification',
                required: true,
                priority: 'High',
                estimatedTime: '3-5 business days'
            },
            {
                id: 'ai-7',
                title: 'Quality Metrics Review',
                description: 'Review of patient outcomes and quality indicators',
                category: 'Quality',
                required: formData.riskLevel === 'High',
                priority: 'Medium',
                estimatedTime: '2-3 business days'
            },
            {
                id: 'ai-8',
                title: 'CME Compliance Verification',
                description: 'Verify completion of required continuing medical education',
                category: 'Education',
                required: true,
                priority: 'Low',
                estimatedTime: '1 business day'
            }
        ];

        // Add custom requirements if specified
        if (formData.customRequirements) {
            aiGeneratedItems.push({
                id: 'ai-custom',
                title: 'Custom Requirement',
                description: formData.customRequirements,
                category: 'Custom',
                required: true,
                priority: 'Medium',
                estimatedTime: 'Variable'
            });
        }

        const checklist = {
            id: `ai-checklist-${Date.now()}`,
            name: `AI Generated - ${formData.specialty} Checklist`,
            specialty: formData.specialty,
            type: 'AI Generated',
            description: `Customized checklist for ${formData.specialty} provider with ${formData.experience} experience at ${formData.facilityType}`,
            items: aiGeneratedItems,
            totalItems: aiGeneratedItems.length,
            requiredItems: aiGeneratedItems.filter(item => item.required).length,
            estimatedCompletionTime: '10-15 business days',
            riskLevel: formData.riskLevel,
            facilityType: formData.facilityType,
            generatedBy: 'AI Engine',
            generatedAt: new Date().toISOString(),
            createdBy: user.name,
            status: 'Draft'
        };

        setGeneratedChecklist(checklist);
        setIsGenerating(false);
        handleNext();
    };

    const saveChecklist = () => {
        if (generatedChecklist) {
            const finalChecklist = {
                ...generatedChecklist,
                status: 'Active',
                createdAt: new Date().toISOString()
            };

            mockDatabase.addChecklist(finalChecklist);

            // Reset form
            setFormData({
                specialty: '',
                experience: '',
                facilityType: '',
                riskLevel: '',
                complianceRequirements: [],
                customRequirements: ''
            });
            setGeneratedChecklist(null);
            setActiveStep(0);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Medical Specialty</InputLabel>
                                    <Select
                                        value={formData.specialty}
                                        label="Medical Specialty"
                                        onChange={(e) => handleFormChange('specialty', e.target.value)}
                                    >
                                        {specialties.map(specialty => (
                                            <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Experience Level</InputLabel>
                                    <Select
                                        value={formData.experience}
                                        label="Experience Level"
                                        onChange={(e) => handleFormChange('experience', e.target.value)}
                                    >
                                        <MenuItem value="New Graduate">New Graduate (0-2 years)</MenuItem>
                                        <MenuItem value="Mid-Level">Mid-Level (3-10 years)</MenuItem>
                                        <MenuItem value="Senior">Senior (10+ years)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Facility Type</InputLabel>
                                    <Select
                                        value={formData.facilityType}
                                        label="Facility Type"
                                        onChange={(e) => handleFormChange('facilityType', e.target.value)}
                                    >
                                        {facilityTypes.map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Risk Level</InputLabel>
                                    <Select
                                        value={formData.riskLevel}
                                        label="Risk Level"
                                        onChange={(e) => handleFormChange('riskLevel', e.target.value)}
                                    >
                                        <MenuItem value="Low">Low Risk</MenuItem>
                                        <MenuItem value="Medium">Medium Risk</MenuItem>
                                        <MenuItem value="High">High Risk</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Compliance Requirements
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select the compliance requirements that apply to this provider
                        </Typography>

                        <Grid container spacing={2}>
                            {complianceOptions.map((requirement) => (
                                <Grid item xs={12} sm={6} md={4} key={requirement}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            cursor: 'pointer',
                                            border: formData.complianceRequirements.includes(requirement) ?
                                                '2px solid' : '1px solid',
                                            borderColor: formData.complianceRequirements.includes(requirement) ?
                                                'primary.main' : 'divider'
                                        }}
                                        onClick={() => handleComplianceChange(requirement)}
                                    >
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={formData.complianceRequirements.includes(requirement)}
                                                    onChange={() => handleComplianceChange(requirement)}
                                                />
                                                <Typography variant="body2">
                                                    {requirement}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Custom Requirements"
                                placeholder="Enter any additional specific requirements..."
                                value={formData.customRequirements}
                                onChange={(e) => handleFormChange('customRequirements', e.target.value)}
                            />
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        {isGenerating ? (
                            <Box>
                                <SmartToyIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom>
                                    Generating your checklist...
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Analyzing requirements and creating a customized credentialing checklist
                                </Typography>
                                <LinearProgress sx={{ mb: 2 }} />
                                <Typography variant="caption" color="text.secondary">
                                    This may take a few moments
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                <PsychologyIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom>
                                    Ready to Generate Checklist
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Click the button below to generate a customized checklist based on your inputs
                                </Typography>

                                <Paper sx={{ p: 3, mb: 3, textAlign: 'left' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Configuration Summary
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Specialty:</Typography>
                                            <Typography variant="body1">{formData.specialty}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Experience:</Typography>
                                            <Typography variant="body1">{formData.experience}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Facility Type:</Typography>
                                            <Typography variant="body1">{formData.facilityType}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Risk Level:</Typography>
                                            <Typography variant="body1">{formData.riskLevel}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Compliance Requirements:</Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {formData.complianceRequirements.map(req => (
                                                    <Chip key={req} label={req} size="small" sx={{ mr: 1, mb: 1 }} />
                                                ))}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AutoAwesomeIcon />}
                                    onClick={generateChecklist}
                                    sx={{ px: 4 }}
                                >
                                    Generate AI Checklist
                                </Button>
                            </Box>
                        )}
                    </Box>
                );

            case 3:
                return generatedChecklist && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                ✨ AI-Generated Checklist Ready!
                            </Typography>
                            <Typography variant="body2">
                                Your customized checklist has been generated with {generatedChecklist.totalItems} items
                                ({generatedChecklist.requiredItems} required). Estimated completion time: {generatedChecklist.estimatedCompletionTime}
                            </Typography>
                        </Alert>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                {generatedChecklist.name}
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<PreviewIcon />}
                                onClick={() => setPreviewDialogOpen(true)}
                            >
                                Full Preview
                            </Button>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                        <Typography variant="h4">{generatedChecklist.totalItems}</Typography>
                                        <Typography variant="body2" color="text.secondary">Total Items</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <CheckCircleIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                        <Typography variant="h4">{generatedChecklist.requiredItems}</Typography>
                                        <Typography variant="body2" color="text.secondary">Required</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <LightbulbIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                        <Typography variant="h4">{generatedChecklist.totalItems - generatedChecklist.requiredItems}</Typography>
                                        <Typography variant="body2" color="text.secondary">Optional</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <SettingsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                        <Typography variant="h4">
                                            {[...new Set(generatedChecklist.items.map(item => item.category))].length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Categories</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Typography variant="h6" gutterBottom>
                            Checklist Items Preview
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {generatedChecklist.items.slice(0, 5).map((item) => (
                                <Accordion key={item.id} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1">
                                                    {item.title}
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    label={item.category}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    label={item.priority}
                                                    size="small"
                                                    color={
                                                        item.priority === 'High' ? 'error' :
                                                            item.priority === 'Medium' ? 'warning' : 'default'
                                                    }
                                                />
                                                {item.required && (
                                                    <Chip
                                                        label="Required"
                                                        size="small"
                                                        color="error"
                                                    />
                                                )}
                                            </Stack>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {item.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Estimated Time: {item.estimatedTime}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                            {generatedChecklist.items.length > 5 && (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                                    ... and {generatedChecklist.items.length - 5} more items
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    AI Checklist Engine
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Generate customized credentialing checklists using artificial intelligence based on provider characteristics and risk factors
                </Typography>
            </Box>

            {/* Stepper */}
            <Paper sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>
                                <Typography variant="h6">{step.label}</Typography>
                            </StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {step.description}
                                </Typography>
                                {renderStepContent(index)}
                                <Box sx={{ mb: 2, mt: 3 }}>
                                    <div>
                                        {index === 2 ? (
                                            // Special handling for AI generation step
                                            generatedChecklist ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleNext}
                                                    sx={{ mt: 1, mr: 1 }}
                                                >
                                                    Continue to Review
                                                </Button>
                                            ) : null
                                        ) : index === 3 ? (
                                            // Final step - save checklist
                                            <Button
                                                variant="contained"
                                                onClick={saveChecklist}
                                                startIcon={<SaveIcon />}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Save Checklist
                                            </Button>
                                        ) : (
                                            // Regular next button
                                            <Button
                                                variant="contained"
                                                onClick={index === 1 ? generateChecklist : handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                disabled={
                                                    (index === 0 && (!formData.specialty || !formData.experience || !formData.facilityType || !formData.riskLevel)) ||
                                                    (index === 1 && formData.complianceRequirements.length === 0)
                                                }
                                            >
                                                {index === 1 ? 'Generate Checklist' : 'Continue'}
                                            </Button>
                                        )}
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Full Preview Dialog */}
            <Dialog
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Complete Checklist Preview
                    {generatedChecklist && (
                        <Typography variant="subtitle2" color="text.secondary">
                            {generatedChecklist.name}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    {generatedChecklist && (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {generatedChecklist.description}
                            </Typography>

                            <List>
                                {generatedChecklist.items.map((item, index) => (
                                    <ListItem key={item.id} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Typography variant="body2" color="text.secondary">
                                                {index + 1}.
                                            </Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2">
                                                        {item.title}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1}>
                                                        <Chip
                                                            label={item.category}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={item.priority}
                                                            size="small"
                                                            color={
                                                                item.priority === 'High' ? 'error' :
                                                                    item.priority === 'Medium' ? 'warning' : 'default'
                                                            }
                                                        />
                                                        {item.required && (
                                                            <Chip
                                                                label="Required"
                                                                size="small"
                                                                color="error"
                                                            />
                                                        )}
                                                    </Stack>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Estimated Time: {item.estimatedTime}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                    <Button variant="contained" onClick={() => setPreviewDialogOpen(false)}>
                        Continue Editing
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChecklistEngine;
