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
    LocalHospital,
    Business,
    Security,
    Speed
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

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
            await login({ email, password });
            navigate('/dashboard');
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
            const demoCredentials = {
                provider: { email: 'provider@example.com', password: 'password123' },
                payer: { email: 'payer@example.com', password: 'password123' }
            };

            await login(demoCredentials[role]);
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 4
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    {/* Left Side - Branding */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ color: 'white', mb: 4 }}>
                            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                                HealthCred
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                                Streamline Healthcare Provider Credentialing
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Security sx={{ color: 'white', mr: 1 }} />
                                                <Typography variant="h6" color="white">Secure</Typography>
                                            </Box>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                                                HIPAA compliant and secure credentialing process
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Speed sx={{ color: 'white', mr: 1 }} />
                                                <Typography variant="h6" color="white">Fast</Typography>
                                            </Box>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                                                Reduce credentialing time by up to 60%
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
                            elevation={10}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                maxWidth: 400,
                                mx: 'auto'
                            }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                                    Welcome Back
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Sign in to your account
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
                                        py: 1.5,
                                        mb: 2,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                        }
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

                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Or try demo
                                </Typography>
                            </Divider>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleDemoLogin('provider')}
                                        disabled={loading}
                                        startIcon={<LocalHospital />}
                                        sx={{
                                            py: 1,
                                            borderColor: '#667eea',
                                            color: '#667eea',
                                            '&:hover': {
                                                borderColor: '#5a67d8',
                                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                            }
                                        }}
                                    >
                                        Provider
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleDemoLogin('payer')}
                                        disabled={loading}
                                        startIcon={<Business />}
                                        sx={{
                                            py: 1,
                                            borderColor: '#667eea',
                                            color: '#667eea',
                                            '&:hover': {
                                                borderColor: '#5a67d8',
                                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                            }
                                        }}
                                    >
                                        Payer
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