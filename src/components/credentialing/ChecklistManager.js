import React, { useState, useEffect } from 'react';
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
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Checkbox,
    Divider,
    Alert,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Assignment as AssignmentIcon,
    ExpandMore as ExpandMoreIcon,
    ContentCopy as ContentCopyIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Refresh as RefreshIcon,
    AttachFile as AttachFileIcon,
    Close as CloseIcon,
    SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/UserContext';
import mockDatabase from '../../data/mockDatabase';

const ChecklistManager = () => {
    const { user } = useAuth();
    const [checklists, setChecklists] = useState([]);
    const [filteredChecklists, setFilteredChecklists] = useState([]);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        specialty: '',
        type: '',
        status: ''
    });
    const [newChecklist, setNewChecklist] = useState({
        name: '',
        specialty: '',
        type: 'Standard',
        description: '',
        items: []
    });
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        verificationType: '',
        required: true
    });

    const [editingChecklist, setEditingChecklist] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [aiChecklistDialogOpen, setAiChecklistDialogOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);

    useEffect(() => {
        loadChecklists();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [checklists, filters]);

    const loadChecklists = () => {
        const allChecklists = mockDatabase.getChecklists();
        setChecklists(allChecklists);
    };

    const applyFilters = () => {
        let filtered = [...checklists];

        if (filters.search) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.description.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.specialty) {
            filtered = filtered.filter(c => c.specialty === filters.specialty);
        }

        if (filters.type) {
            filtered = filtered.filter(c => c.type === filters.type);
        }

        if (filters.status) {
            filtered = filtered.filter(c => c.status === filters.status);
        }

        setFilteredChecklists(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleViewChecklist = (checklist) => {
        setSelectedChecklist(checklist);
        setDialogOpen(true);
    };

    const handleCreateChecklist = () => {
        const checklist = {
            ...newChecklist,
            id: `checklist-${Date.now()}`,
            createdBy: user.name,
            createdAt: new Date().toISOString(),
            status: 'Active',
            totalItems: newChecklist.items.length,
            version: '1.0'
        };

        mockDatabase.addChecklist(checklist);
        loadChecklists();
        setCreateDialogOpen(false);
        setNewChecklist({
            name: '',
            specialty: '',
            type: 'Standard',
            description: '',
            items: []
        });
    };

    const handleDuplicateChecklist = (checklist) => {
        const duplicatedChecklist = {
            ...checklist,
            id: `checklist-${Date.now()}`,
            name: `${checklist.name} (Copy)`,
            createdBy: user.name,
            createdAt: new Date().toISOString(),
            version: '1.0'
        };

        mockDatabase.addChecklist(duplicatedChecklist);
        loadChecklists();
    };

    const handleEditChecklist = (checklist) => {
        setEditingChecklist({ ...checklist });
        setEditDialogOpen(true);
    };

    const handleUpdateChecklist = () => {
        mockDatabase.updateChecklist(editingChecklist.id, editingChecklist);
        loadChecklists();
        setEditDialogOpen(false);
        setEditingChecklist(null);
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const removeUploadedFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const generateAIChecklist = async () => {
        if (uploadedFiles.length === 0) return;

        setIsGeneratingChecklist(true);

        // Simulate AI processing delay
        setTimeout(() => {
            // Generate a dummy checklist based on uploaded documents
            const aiGeneratedChecklist = {
                name: `AI Generated - ${uploadedFiles[0].name.split('.')[0]} Checklist`,
                specialty: 'General Medicine',
                type: 'AI Generated',
                description: `This checklist was automatically generated based on the uploaded document: ${uploadedFiles[0].name}. It includes comprehensive verification items extracted from the document content.`,
                items: [
                    {
                        id: `item-${Date.now()}-1`,
                        title: 'License Verification',
                        description: 'Verify medical license status and expiration date',
                        verificationType: 'Verification by API',
                        required: true,
                        status: 'pending',
                        category: 'Licensing'
                    },
                    {
                        id: `item-${Date.now()}-2`,
                        title: 'Board Certification Check',
                        description: 'Confirm board certification status and specialty',
                        verificationType: 'Database Cross-Check',
                        required: true,
                        status: 'pending',
                        category: 'Certification'
                    },
                    {
                        id: `item-${Date.now()}-3`,
                        title: 'Malpractice Insurance Review',
                        description: 'Review current malpractice insurance coverage',
                        verificationType: 'Verification by Document',
                        required: true,
                        status: 'pending',
                        category: 'Insurance'
                    },
                    {
                        id: `item-${Date.now()}-4`,
                        title: 'Hospital Privileges Verification',
                        description: 'Verify current hospital privileges and affiliations',
                        verificationType: 'Phone Verification',
                        required: false,
                        status: 'pending',
                        category: 'Privileges'
                    },
                    {
                        id: `item-${Date.now()}-5`,
                        title: 'Education Verification',
                        description: 'Verify medical school and residency training',
                        verificationType: 'Third-Party Verification',
                        required: true,
                        status: 'pending',
                        category: 'Education'
                    }
                ],
                createdBy: `${user.name} (AI Assistant)`,
                createdAt: new Date().toISOString(),
                status: 'Draft',
                totalItems: 5,
                version: '1.0',
                aiGenerated: true,
                sourceDocuments: uploadedFiles.map(f => f.name)
            };

            mockDatabase.addChecklist(aiGeneratedChecklist);
            loadChecklists();
            setIsGeneratingChecklist(false);
            setAiChecklistDialogOpen(false);
            setUploadedFiles([]);
        }, 3000); // 3 second delay to simulate AI processing
    };

    const addItemToEditingChecklist = () => {
        if (!newItem.title.trim()) return;

        const item = {
            id: `item-${Date.now()}`,
            ...newItem,
            status: 'pending'
        };

        setEditingChecklist(prev => ({
            ...prev,
            items: [...prev.items, item]
        }));

        setNewItem({
            title: '',
            description: '',
            verificationType: '',
            required: true
        });
    };

    const removeItemFromEditingChecklist = (itemId) => {
        setEditingChecklist(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    const addItemToNewChecklist = () => {
        if (!newItem.title.trim()) return;

        const item = {
            id: `item-${Date.now()}`,
            ...newItem,
            status: 'pending'
        };

        setNewChecklist(prev => ({
            ...prev,
            items: [...prev.items, item]
        }));

        setNewItem({
            title: '',
            description: '',
            verificationType: '',
            required: true
        });
    };

    const removeItemFromNewChecklist = (itemId) => {
        setNewChecklist(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Draft': return 'warning';
            case 'Archived': return 'default';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Standard': return 'primary';
            case 'Expedited': return 'warning';
            case 'Specialty': return 'secondary';
            case 'AI Generated': return 'info';
            default: return 'default';
        }
    };

    const specialties = [...new Set(checklists.map(c => c.specialty))];
    const types = [...new Set(checklists.map(c => c.type))];
    const statuses = [...new Set(checklists.map(c => c.status))];

    const verificationTypes = [
        'Verification by API',
        'Verification by Document',
        'Manual Verification',
        'Third-Party Verification',
        'Database Cross-Check',
        'Phone Verification',
        'Email Verification',
        'Site Visit Verification'
    ];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Checklist Management
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => setAiChecklistDialogOpen(true)}
                    >
                        Create Checklist by AI
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Checklist
                    </Button>
                </Stack>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssignmentIcon sx={{ fontSize: 40, color: 'white', mr: 2, opacity: 0.9 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                        {checklists.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Total Checklists
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(42, 82, 152, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(42, 82, 152, 0.4)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ fontSize: 40, color: 'white', mr: 2, opacity: 0.9 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                        {checklists.filter(c => c.status === 'Active').length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Active Templates
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #4651b7 0%, #2a5298 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(70, 81, 183, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(70, 81, 183, 0.4)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <WarningIcon sx={{ fontSize: 40, color: 'white', mr: 2, opacity: 0.9 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                        {checklists.filter(c => c.status === 'Draft').length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Draft Templates
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #8fa5ff 0%, #667eea 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(143, 165, 255, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(143, 165, 255, 0.4)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ContentCopyIcon sx={{ fontSize: 40, color: 'white', mr: 2, opacity: 0.9 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                        {specialties.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Specialties Covered
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filter Checklists
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            placeholder="Checklist name or description..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Specialty</InputLabel>
                            <Select
                                value={filters.specialty}
                                label="Specialty"
                                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                            >
                                <MenuItem value="">All Specialties</MenuItem>
                                {specialties.map(specialty => (
                                    <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.type}
                                label="Type"
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <MenuItem value="">All Types</MenuItem>
                                {types.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                {statuses.map(status => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <IconButton onClick={loadChecklists}>
                            <RefreshIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </Paper>

            {/* Checklists Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Specialty</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Created By</TableCell>
                                <TableCell>Last Modified</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredChecklists.map((checklist) => (
                                <TableRow key={checklist.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {checklist.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                v{checklist.version}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{checklist.specialty}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={checklist.type}
                                            color={getTypeColor(checklist.type)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={checklist.status}
                                            color={getStatusColor(checklist.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{checklist.totalItems} items</TableCell>
                                    <TableCell>{checklist.createdBy}</TableCell>
                                    <TableCell>
                                        {new Date(checklist.lastModified || checklist.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewChecklist(checklist)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Duplicate">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDuplicateChecklist(checklist)}
                                                >
                                                    <ContentCopyIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Download">
                                                <IconButton size="small">
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredChecklists.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Alert severity="info">
                            No checklists found matching your current filters.
                        </Alert>
                    </Box>
                )}
            </Paper>

            {/* View Checklist Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Checklist Details
                    {selectedChecklist && (
                        <Typography variant="subtitle2" color="text.secondary">
                            {selectedChecklist.name} - {selectedChecklist.specialty}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    {selectedChecklist && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Description</Typography>
                                    <Typography variant="body1">{selectedChecklist.description}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Total Items</Typography>
                                    <Typography variant="body1">{selectedChecklist.totalItems}</Typography>
                                </Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom>
                                Checklist Items
                            </Typography>
                            <List>
                                {selectedChecklist.items?.map((item, index) => (
                                    <ListItem key={item.id || index} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Checkbox disabled checked={item.status === 'completed'} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.title}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                    <Chip
                                                        label={item.category}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mt: 1 }}
                                                    />
                                                    {item.required && (
                                                        <Chip
                                                            label="Required"
                                                            size="small"
                                                            color="error"
                                                            sx={{ mt: 1, ml: 1 }}
                                                        />
                                                    )}
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
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setDialogOpen(false);
                            handleEditChecklist(selectedChecklist);
                        }}
                    >
                        Edit Checklist
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Checklist Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Create New Checklist</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Checklist Name"
                                    value={newChecklist.name}
                                    onChange={(e) => setNewChecklist(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Specialty</InputLabel>
                                    <Select
                                        value={newChecklist.specialty}
                                        label="Specialty"
                                        onChange={(e) => setNewChecklist(prev => ({ ...prev, specialty: e.target.value }))}
                                    >
                                        {['Cardiology', 'Emergency Medicine', 'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Surgery'].map(spec => (
                                            <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={newChecklist.type}
                                        label="Type"
                                        onChange={(e) => setNewChecklist(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <MenuItem value="Standard">Standard</MenuItem>
                                        <MenuItem value="Expedited">Expedited</MenuItem>
                                        <MenuItem value="Specialty">Specialty</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description"
                                    value={newChecklist.description}
                                    onChange={(e) => setNewChecklist(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Add Checklist Items
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Item Title"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Verification Type</InputLabel>
                                    <Select
                                        value={newItem.verificationType}
                                        label="Verification Type"
                                        onChange={(e) => setNewItem(prev => ({ ...prev, verificationType: e.target.value }))}
                                    >
                                        {verificationTypes.map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Required</InputLabel>
                                    <Select
                                        value={newItem.required}
                                        label="Required"
                                        onChange={(e) => setNewItem(prev => ({ ...prev, required: e.target.value }))}
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={addItemToNewChecklist}
                                    sx={{ height: 56 }}
                                >
                                    Add Item
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Item Description"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </Grid>
                        </Grid>

                        {newChecklist.items.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    Checklist Items ({newChecklist.items.length})
                                </Typography>
                                <List>
                                    {newChecklist.items.map((item) => (
                                        <ListItem key={item.id} sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={item.title}
                                                secondary={`${item.verificationType} • ${item.required ? 'Required' : 'Optional'}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => removeItemFromNewChecklist(item.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateChecklist}
                        disabled={!newChecklist.name.trim() || !newChecklist.specialty || newChecklist.items.length === 0}
                    >
                        Create Checklist
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Checklist Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Checklist</DialogTitle>
                <DialogContent>
                    {editingChecklist && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Checklist Name"
                                        value={editingChecklist.name}
                                        onChange={(e) => setEditingChecklist(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Specialty</InputLabel>
                                        <Select
                                            value={editingChecklist.specialty}
                                            label="Specialty"
                                            onChange={(e) => setEditingChecklist(prev => ({ ...prev, specialty: e.target.value }))}
                                        >
                                            {['Cardiology', 'Emergency Medicine', 'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Surgery'].map(spec => (
                                                <MenuItem defaultValue='Cardiology' key={spec} value={spec}>{spec}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={editingChecklist.type}
                                            label="Type"
                                            onChange={(e) => setEditingChecklist(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            <MenuItem value="Standard">Standard</MenuItem>
                                            <MenuItem value="Expedited">Expedited</MenuItem>
                                            <MenuItem value="Specialty">Specialty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Description"
                                        value={editingChecklist.description}
                                        onChange={(e) => setEditingChecklist(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom>
                                Edit Checklist Items
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Item Title"
                                        value={newItem.title}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Verification Type</InputLabel>
                                        <Select
                                            value={newItem.verificationType}
                                            label="Verification Type"
                                            onChange={(e) => setNewItem(prev => ({ ...prev, verificationType: e.target.value }))}
                                        >
                                            {verificationTypes.map(type => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Required</InputLabel>
                                        <Select
                                            value={newItem.required}
                                            label="Required"
                                            onChange={(e) => setNewItem(prev => ({ ...prev, required: e.target.value }))}
                                        >
                                            <MenuItem value={true}>Yes</MenuItem>
                                            <MenuItem value={false}>No</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={addItemToEditingChecklist}
                                        sx={{ height: 56 }}
                                    >
                                        Add Item
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Item Description"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </Grid>
                            </Grid>

                            {editingChecklist.items && editingChecklist.items.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Checklist Items ({editingChecklist.items.length})
                                    </Typography>
                                    <List>
                                        {editingChecklist.items.map((item) => (
                                            <ListItem key={item.id} sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={item.title}
                                                    secondary={`${item.verificationType || item.category} • ${item.required ? 'Required' : 'Optional'}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => removeItemFromEditingChecklist(item.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateChecklist}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* AI Checklist Creation Dialog */}
            <Dialog
                open={aiChecklistDialogOpen}
                onClose={() => !isGeneratingChecklist && setAiChecklistDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon color="primary" />
                        Create Checklist by AI
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {!isGeneratingChecklist ? (
                            <>
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    Upload documents related to credentialing requirements, and our AI will automatically generate a comprehensive checklist based on the content.
                                </Alert>

                                <Typography variant="h6" gutterBottom>
                                    Upload Documents
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB per file)
                                </Typography>

                                <Box sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    mb: 3,
                                    backgroundColor: 'action.hover'
                                }}>
                                    <input
                                        accept=".pdf,.doc,.docx,.txt"
                                        style={{ display: 'none' }}
                                        id="ai-file-upload"
                                        multiple
                                        type="file"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="ai-file-upload">
                                        <Button
                                            variant="contained"
                                            component="span"
                                            startIcon={<AttachFileIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Choose Files
                                        </Button>
                                    </label>
                                    <Typography variant="body2" color="text.secondary">
                                        Drag and drop files here or click to browse
                                    </Typography>
                                </Box>

                                {uploadedFiles.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            Uploaded Files ({uploadedFiles.length})
                                        </Typography>
                                        <List>
                                            {uploadedFiles.map((file, index) => (
                                                <ListItem key={index} sx={{ px: 0 }}>
                                                    <ListItemIcon>
                                                        <AttachFileIcon />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={file.name}
                                                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => removeUploadedFile(index)}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress size={60} sx={{ mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Analyzing your documents...
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    This may take a few moments. Please wait while we generate your checklist.
                                </Typography>
                                <LinearProgress sx={{ mb: 2 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Processing document content and generating checklist items...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setAiChecklistDialogOpen(false)}
                        disabled={isGeneratingChecklist}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={generateAIChecklist}
                        disabled={uploadedFiles.length === 0 || isGeneratingChecklist}
                        startIcon={<SmartToyIcon />}
                    >
                        {isGeneratingChecklist ? 'Generating...' : 'Generate Checklist'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default ChecklistManager;
