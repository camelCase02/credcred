import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Divider,
    Grid,
    Card,
    CardContent,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    Groups,
    Security,
    Speed
} from '@mui/icons-material';
import { useAuth } from '../../contexts/UserContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Simple demo login - in real app this would validate against backend
            if (email && password) {
                const userData = {
                    id: 'USR-001',
                    name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    email: email,
                    role: 'analyst', // Default to analyst role
                    permissions: ['view_applications', 'review_checklist', 'approve_items', 'generate_reports']
                };

                login(userData);
                navigate('/dashboard');
            } else {
                throw new Error('Please enter email and password');
            }
        } catch (error) {
            setError('Invalid credentials. Please try again.');
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role) => {
        setError('');
        setLoading(true);

        try {
            const demoUsers = {
                analyst: {
                    id: 'USR-001',
                    name: 'John Smith',
                    email: 'john.smith@healthcred.com',
                    role: 'analyst',
                    permissions: ['view_applications', 'review_checklist', 'approve_items', 'generate_reports']
                },
                committee: {
                    id: 'USR-002',
                    name: 'Dr. Sarah Wilson',
                    email: 'sarah.wilson@healthcred.com',
                    role: 'committee',
                    permissions: ['view_applications', 'approve_applications', 'deny_applications', 'committee_review']
                }
            };

            const userData = demoUsers[role];
            login(userData);
            navigate('/dashboard');
        } catch (error) {
            setError('Demo login failed. Please try again.');
            console.error('Demo login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 4,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    {/* Left Side - Branding */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ color: 'white', mb: 4 }}>
                            <Typography variant="h1" component="h1" gutterBottom
                                sx={{
                                    fontWeight: 900,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                MCheck-Cred
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
                                Advanced Healthcare Credentialing Intelligence Platform
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            bgcolor: 'rgba(255,255,255,0.2)'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Security sx={{ color: '#64b5f6', mr: 2, fontSize: 28 }} />
                                                <Typography variant="h6" color="white" fontWeight="600">Secure & Compliant</Typography>
                                            </Box>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                                                HIPAA-compliant credentialing workflows with enterprise-grade security
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            bgcolor: 'rgba(255,255,255,0.2)'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Speed sx={{ color: '#81c784', mr: 2, fontSize: 28 }} />
                                                <Typography variant="h6" color="white" fontWeight="600">AI-Powered</Typography>
                                            </Box>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                                                Intelligent automation for streamlined credentialing processes
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Right Side - Login Form */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={24}
                            sx={{
                                p: 5,
                                borderRadius: 4,
                                background: 'rgba(255,255,255,0.98)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                maxWidth: 450,
                                mx: 'auto',
                                position: 'relative',
                                zIndex: 1,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" component="h2" gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Welcome Back
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                                    Access your credentialing dashboard
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleLogin} sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        py: 2,
                                        mb: 3,
                                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
                                        borderRadius: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1a3460 0%, #26507a 50%, #5a67d8 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                </Button>

                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="body2">
                                        Don't have an account?{' '}
                                        <Link to="/register" style={{ color: '#667eea', textDecoration: 'none' }}>
                                            Sign up
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Or try demo access
                                </Typography>
                            </Divider>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleDemoLogin('analyst')}
                                        disabled={loading}
                                        startIcon={<Person />}
                                        sx={{
                                            py: 1.5,
                                            borderColor: '#2a5298',
                                            color: '#2a5298',
                                            borderWidth: 2,
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: '#1e3c72',
                                                backgroundColor: 'rgba(42, 82, 152, 0.08)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 15px rgba(42, 82, 152, 0.2)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Analyst
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleDemoLogin('committee')}
                                        disabled={loading}
                                        startIcon={<Groups />}
                                        sx={{
                                            py: 1.5,
                                            borderColor: '#2a5298',
                                            color: '#2a5298',
                                            borderWidth: 2,
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: '#1e3c72',
                                                backgroundColor: 'rgba(42, 82, 152, 0.08)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 15px rgba(42, 82, 152, 0.2)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Committee
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Login;