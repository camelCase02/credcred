import React, { useState, useContext } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Paper,
    Container,
    useTheme,
    alpha
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    VerifiedUser as VerifiedUserIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    AccountCircle,
    Notifications,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

// Import existing credentialing components
import DashboardOverview from '../components/credentialing/DashboardOverview';
import CAppTracker from '../components/credentialing/CAppTracker';
import ChecklistManager from '../components/credentialing/ChecklistManager';
import CommitteeReview from '../components/credentialing/CommitteeReview';
import RosterIntake from '../components/credentialing/RosterIntake';

const drawerWidth = 280;

const CredentialingDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user, logout } = useContext(UserContext);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, component: DashboardOverview },
        { id: 'applications', label: 'Applications', icon: <AssignmentIcon />, component: CAppTracker },
        { id: 'checklist', label: 'Checklist Manager', icon: <VerifiedUserIcon />, component: ChecklistManager },
        { id: 'committee', label: 'Committee Review', icon: <PersonIcon />, component: CommitteeReview },
        { id: 'roster', label: 'Roster Intake', icon: <UploadIcon />, component: RosterIntake }
    ];

    const drawer = (
        <Box
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.1)} 0%,
                    ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                backdropFilter: 'blur(10px)',
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
        >
            {/* Logo Section */}
            <Box
                sx={{
                    p: 3,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.15)} 0%,
                        ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        background: `linear-gradient(135deg, 
                            ${theme.palette.primary.main} 0%,
                            ${theme.palette.secondary.main} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    MCheck-Cred
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        textAlign: 'center',
                        color: theme.palette.text.secondary,
                        mt: 0.5
                    }}
                >
                    Credentialing Platform
                </Typography>
            </Box>

            {/* Navigation Items */}
            <List sx={{ px: 2, py: 1 }}>
                {navigationItems.map((item) => (
                    <ListItem
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: activeTab === item.id
                                ? `linear-gradient(135deg, 
                                    ${alpha(theme.palette.primary.main, 0.15)} 0%,
                                    ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                                : 'transparent',
                            '&:hover': {
                                background: `linear-gradient(135deg, 
                                    ${alpha(theme.palette.primary.main, 0.08)} 0%,
                                    ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                                transform: 'translateX(4px)'
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: activeTab === item.id
                                    ? theme.palette.primary.main
                                    : theme.palette.text.secondary,
                                minWidth: 40
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            sx={{
                                '& .MuiListItemText-primary': {
                                    fontWeight: activeTab === item.id ? 600 : 400,
                                    color: activeTab === item.id
                                        ? theme.palette.primary.main
                                        : theme.palette.text.primary
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            {/* User Info at Bottom */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.05)} 0%,
                        ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            background: `linear-gradient(135deg, 
                                ${theme.palette.primary.main} 0%,
                                ${theme.palette.secondary.main} 100%)`
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user?.username || 'User'}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                textTransform: 'capitalize'
                            }}
                        >
                            {user?.role || 'analyst'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    const renderActiveComponent = () => {
        const activeItem = navigationItems.find(item => item.id === activeTab);
        if (!activeItem) return null;

        const ComponentToRender = activeItem.component;

        // Pass appropriate props based on component
        const commonProps = {
            userRole: user?.role || 'analyst'
        };

        return <ComponentToRender {...commonProps} />;
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.95)} 0%,
                        ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton color="inherit">
                            <Notifications />
                        </IconButton>

                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>

                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    background: `linear-gradient(135deg, 
                                        ${alpha(theme.palette.background.paper, 0.95)} 0%,
                                        ${alpha(theme.palette.background.default, 0.9)} 100%)`,
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`
                                }
                            }}
                        >
                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <SettingsIcon fontSize="small" />
                                </ListItemIcon>
                                Profile Settings
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none'
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    height: '100vh',
                    overflow: 'auto',
                    background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.default, 0.8)} 0%,
                        ${alpha(theme.palette.grey[50], 0.5)} 100%)`
                }}
            >
                <Toolbar />
                <Container maxWidth="xl" sx={{ py: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.background.paper, 0.9)} 0%,
                                ${alpha(theme.palette.common.white, 0.95)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            minHeight: 'calc(100vh - 150px)',
                            p: 3
                        }}
                    >
                        {renderActiveComponent()}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default CredentialingDashboard;
