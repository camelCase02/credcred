import { createTheme } from '@mui/material/styles';

// Blue color palette based on login page design
const blueTheme = createTheme({
    palette: {
        primary: {
            main: '#2a5298',
            light: '#667eea',
            dark: '#1e3c72',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#667eea',
            light: '#8fa5ff',
            dark: '#4651b7',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 900,
            fontSize: '3.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.3,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.4,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    padding: '10px 24px',
                    transition: 'all 0.3s ease',
                },
                contained: {
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1a3460 0%, #26507a 50%, #5a67d8 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    borderColor: '#2a5298',
                    color: '#2a5298',
                    '&:hover': {
                        borderColor: '#1e3c72',
                        backgroundColor: 'rgba(42, 82, 152, 0.08)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 15px rgba(42, 82, 152, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                },
                elevation2: {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                },
                elevation3: {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2a5298',
                            borderWidth: 2,
                        },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2a5298',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
                filled: {
                    '&.MuiChip-colorPrimary': {
                        background: 'linear-gradient(135deg, #2a5298 0%, #667eea 100%)',
                        color: 'white',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                    borderRight: '1px solid rgba(42, 82, 152, 0.1)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #2a5298 0%, #667eea 100%)',
                        color: 'white',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #26507a 0%, #5a67d8 100%)',
                        },
                        '& .MuiListItemIcon-root': {
                            color: 'white',
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(42, 82, 152, 0.08)',
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                        fontWeight: 600,
                        color: '#1e293b',
                        borderBottom: '2px solid rgba(42, 82, 152, 0.1)',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(42, 82, 152, 0.04)',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#64748b',
                        '&.Mui-selected': {
                            color: '#2a5298',
                        },
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#2a5298',
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&.MuiAlert-standardInfo': {
                        backgroundColor: 'rgba(42, 82, 152, 0.1)',
                        color: '#1e3c72',
                        '& .MuiAlert-icon': {
                            color: '#2a5298',
                        },
                    },
                },
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows: [
        'none',
        '0 2px 8px rgba(0, 0, 0, 0.06)',
        '0 4px 16px rgba(0, 0, 0, 0.08)',
        '0 8px 24px rgba(0, 0, 0, 0.12)',
        '0 12px 32px rgba(0, 0, 0, 0.16)',
        '0 16px 40px rgba(0, 0, 0, 0.20)',
        '0 20px 48px rgba(0, 0, 0, 0.24)',
        '0 24px 56px rgba(0, 0, 0, 0.28)',
        '0 28px 64px rgba(0, 0, 0, 0.32)',
        '0 32px 72px rgba(0, 0, 0, 0.36)',
        '0 36px 80px rgba(0, 0, 0, 0.40)',
        '0 40px 88px rgba(0, 0, 0, 0.44)',
        '0 44px 96px rgba(0, 0, 0, 0.48)',
        '0 48px 104px rgba(0, 0, 0, 0.52)',
        '0 52px 112px rgba(0, 0, 0, 0.56)',
        '0 56px 120px rgba(0, 0, 0, 0.60)',
        '0 60px 128px rgba(0, 0, 0, 0.64)',
        '0 64px 136px rgba(0, 0, 0, 0.68)',
        '0 68px 144px rgba(0, 0, 0, 0.72)',
        '0 72px 152px rgba(0, 0, 0, 0.76)',
        '0 76px 160px rgba(0, 0, 0, 0.80)',
        '0 80px 168px rgba(0, 0, 0, 0.84)',
        '0 84px 176px rgba(0, 0, 0, 0.88)',
        '0 88px 184px rgba(0, 0, 0, 0.92)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ],
});

export default blueTheme;
