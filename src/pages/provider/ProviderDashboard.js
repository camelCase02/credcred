import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Alert,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Dashboard,
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  CloudUpload,
  Verified,
  Person,
  School,
  Business,
  Description,
  Timeline,
  Notifications,
  Settings,
  Help,
  Scanner
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/api';
import DocumentManager from '../../components/provider/DocumentManager';
import CAQHIntegration from '../../components/provider/CAQHIntegration';
import StatusTracker from '../../components/provider/StatusTracker';
import NotificationCenter from '../../components/common/NotificationCenter';
import StatCard from '../../components/common/StatCard';
import OCRCredentialingProcessor from '../../components/provider/OCRCredentialingProcessor';

const ProviderDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [caqhDialogOpen, setCaqhDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const { user, logout } = useAuth();

  // Fetch data using React Query
  const { data: providerProfile } = useQuery({
    queryKey: ['providerProfile'],
    queryFn: () => api.getProviderProfile()
  });

  const { data: credentialingStatus } = useQuery({
    queryKey: ['credentialingStatus'],
    queryFn: () => api.getCredentialingStatus()
  });

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFileUpload = async () => {
    if (selectedFile && documentType) {
      try {
        await api.uploadDocument(selectedFile, documentType);
        setSelectedFile(null);
        setDocumentType('');
        // Refresh data
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleCAQHImport = async (credentials) => {
    try {
      await api.importFromCAQH(credentials);
      setCaqhDialogOpen(false);
      // Refresh data
    } catch (error) {
      console.error('CAQH import failed:', error);
    }
  };

  const renderDashboardOverview = () => (
    <Grid container spacing={3}>
      {/* Status Cards */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                <Assignment />
              </Avatar>
              <Typography variant="h6">Credentialing Status</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {credentialingStatus?.data?.status || 'Not Started'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {credentialingStatus?.data?.progress || 0}% Complete
            </Typography>
            <LinearProgress
              variant="determinate"
              value={credentialingStatus?.data?.progress || 0}
              sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Person />
              </Avatar>
              <Typography variant="h6">Profile Completion</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              85%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Almost there! Complete your profile
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h6">Documents Uploaded</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              12/15
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3 documents pending
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => setProfileDialogOpen(true)}
                >
                  Update Profile
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  component="label"
                >
                  Upload Documents
                  <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => setCaqhDialogOpen(true)}
                >
                  Import from CAQH
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Assignment />}
                  disabled={!credentialingStatus?.data}
                >
                  Start Credentialing
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {credentialingStatus?.data?.logs?.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemIcon>
                      {log.status === 'completed' ? (
                        <CheckCircle color="success" />
                      ) : log.status === 'in_progress' ? (
                        <Schedule color="warning" />
                      ) : (
                        <Warning color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.action}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {log.details}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < credentialingStatus.data.logs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Notifications */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Badge badgeContent={1} color="error">
                    <Warning color="warning" />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary="Document Expiring"
                  secondary="Medical license expires in 30 days"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Verification Complete"
                  secondary="DEA certificate verified"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Schedule color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Pending Review"
                  secondary="Board certification under review"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={providerProfile?.data?.name || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialty"
                  value={providerProfile?.data?.profile?.specialty || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={providerProfile?.data?.profile?.licenseNumber || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NPI Number"
                  value={providerProfile?.data?.profile?.npi || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={providerProfile?.data?.profile?.address || ''}
                  disabled
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Education & Training
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Medical School</Typography>
              <Typography variant="body2" color="text.secondary">
                {providerProfile?.data?.profile?.medicalSchool || 'Not specified'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Residency</Typography>
              <Typography variant="body2" color="text.secondary">
                {providerProfile?.data?.profile?.residency || 'Not specified'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Fellowship</Typography>
              <Typography variant="body2" color="text.secondary">
                {providerProfile?.data?.profile?.fellowship || 'Not specified'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderStatusTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Credentialing Status Timeline
            </Typography>
            {credentialingStatus?.data ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" color="primary">
                    {credentialingStatus.data.status}
                  </Typography>
                  <Chip
                    label={`${credentialingStatus.data.progress}% Complete`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Step: {credentialingStatus.data.currentStep}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Started: {new Date(credentialingStatus.data.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estimated Completion: {new Date(credentialingStatus.data.estimatedCompletion).toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Detailed Log
                  </Typography>
                  <List>
                    {credentialingStatus.data.logs.map((log, index) => (
                      <React.Fragment key={log.id}>
                        <ListItem>
                          <ListItemIcon>
                            {log.status === 'completed' ? (
                              <CheckCircle color="success" />
                            ) : log.status === 'in_progress' ? (
                              <Schedule color="warning" />
                            ) : (
                              <Warning color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={log.action}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {log.details}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(log.timestamp).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < credentialingStatus.data.logs.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </Box>
            ) : (
              <Alert severity="info">
                No credentialing process initiated yet. Click "Start Credentialing" to begin.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDocumentsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DocumentManager />
      </Grid>
      <Grid item xs={12}>
        <CAQHIntegration />
      </Grid>
    </Grid>
  );

  const renderSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Account settings and preferences would be displayed here.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary' }} elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            HealthCred Provider Portal
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Help sx={{ mr: 1 }} />
              Help
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name || 'Doctor'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your credentialing process and profile information
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="provider dashboard tabs">
            <Tab icon={<Dashboard />} label="Dashboard" />
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Timeline />} label="Status" />
            <Tab icon={<Description />} label="Documents" />
            <Tab icon={<Scanner />} label="OCR Processor" />
            <Tab icon={<Badge badgeContent={3} color="error"><Notifications /></Badge>} label="Notifications" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box>
          {activeTab === 0 && renderDashboardOverview()}
          {activeTab === 1 && renderProfileTab()}
          {activeTab === 2 && renderStatusTab()}
          {activeTab === 3 && renderDocumentsTab()}
          {activeTab === 4 && (
            <OCRCredentialingProcessor />
          )}
          {activeTab === 5 && (
            <NotificationCenter />
          )}
          {activeTab === 6 && renderSettingsTab()}
        </Box>
      </Container>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Specialty" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="License Number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="NPI Number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* CAQH Dialog */}
      <Dialog open={caqhDialogOpen} onClose={() => setCaqhDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import from CAQH</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter your CAQH credentials to import your professional information
          </Typography>
          <TextField
            fullWidth
            label="CAQH Username"
            margin="normal"
          />
          <TextField
            fullWidth
            label="CAQH Password"
            type="password"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaqhDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Import Data</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderDashboard;