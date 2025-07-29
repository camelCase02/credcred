import React, { useState, useEffect, useRef } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Paper,
    Divider,
    Button,
    CircularProgress,
    Alert,
    Chip,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Chat as ChatIcon,
    Person as PersonIcon,
    SmartToy as BotIcon,
    AttachFile as AttachIcon,
    MoreVert as MoreIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/UserContext';
import ChatAPIService from '../../services/ChatAPIService';

const ProviderChatSidebar = ({ open, onClose, provider }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (provider) {
            loadChatHistory();
        }
    }, [provider]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = () => {
        // Load existing chat history for this provider
        const chatHistory = [
            {
                id: 1,
                sender: 'AI Assistant',
                message: `Hello! I'm your AI compliance assistant for ${provider?.name}'s credentialing application. I can help you check compliance status, review regulations, and track application progress. What would you like to know?`,
                timestamp: new Date().toISOString(),
                type: 'ai'
            }
        ];
        setMessages(chatHistory);
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            sender: user?.name || 'User',
            message: inputMessage,
            timestamp: new Date().toISOString(),
            type: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        const questionText = inputMessage;
        setInputMessage('');
        setLoading(true);
        setError(null);

        try {
            // Call the backend API with the specified format
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider_id: "dr_williams_003",
                    question: questionText
                })
            });

            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Create AI response message with the API response
            const aiMessage = {
                id: Date.now() + 1,
                sender: 'AI Assistant',
                message: data.answer || 'I apologize, but I encountered an issue processing your request.',
                timestamp: new Date().toISOString(),
                type: 'ai',
                confidence: data.confidence,
                sources: data.sources,
                sessionId: data.session_id
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            console.warn('Backend API error:', err.message);
            console.log('Falling back to mock service...');

            try {
                // Fallback to mock service if backend is not available
                const mockData = await ChatAPIService.sendMessage(
                    questionText,
                    provider?.id,
                    {
                        providerName: provider?.name,
                        specialty: provider?.specialty,
                        status: provider?.status,
                        checklist: provider?.checklist
                    }
                );

                const aiMessage = {
                    id: Date.now() + 1,
                    sender: 'AI Assistant (Mock)',
                    message: mockData.response || 'I apologize, but I encountered an issue processing your request.',
                    timestamp: new Date().toISOString(),
                    type: 'ai',
                    confidence: mockData.confidence
                };

                setMessages(prev => [...prev, aiMessage]);
            } catch (fallbackErr) {
                console.error('Fallback service error:', fallbackErr);
                setError('Unable to connect to AI service. Please check if the backend is running on localhost:8000.');

                // Final fallback response
                const fallbackMessage = {
                    id: Date.now() + 1,
                    sender: 'AI Assistant',
                    message: 'I apologize, but I\'m currently unable to process your request. Please ensure the backend service is running on localhost:8000, or try again later.',
                    timestamp: new Date().toISOString(),
                    type: 'ai'
                };
                setMessages(prev => [...prev, fallbackMessage]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getQuickActions = () => [
        'What is the compliance status for this provider?',
        'What documents are still pending?',
        'What are the next steps required?',
        'Show credentialing checklist completion',
        'Are there any regulation violations?',
        'What is the expected approval timeline?',
        'Review hard regulation compliance',
        'Check soft regulation scores'
    ];

    const handleQuickAction = (action) => {
        setInputMessage(action);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 400,
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid #e0e0e0',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChatIcon sx={{ mr: 2 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Provider Chat
                            </Typography>
                            {provider && (
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {provider.name} • {provider.specialty}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Provider Info */}
            {provider && (
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {provider.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {provider.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {provider.id} • {provider.specialty}
                            </Typography>
                        </Box>
                        <Chip
                            label={provider.status}
                            size="small"
                            color={
                                provider.status === 'Approved' ? 'success' :
                                    provider.status === 'In Progress' ? 'warning' :
                                        provider.status === 'Denied' ? 'error' : 'default'
                            }
                        />
                    </Box>
                </Box>
            )}

            {/* Quick Actions */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Quick Questions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getQuickActions().slice(0, 3).map((action, index) => (
                        <Chip
                            key={index}
                            label={action}
                            size="small"
                            onClick={() => handleQuickAction(action)}
                            sx={{
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                '&:hover': {
                                    backgroundColor: 'primary.light',
                                    color: 'white'
                                }
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ m: 1 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <List sx={{ p: 0 }}>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                flexDirection: 'column',
                                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                                px: 1,
                                py: 0.5
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                maxWidth: '85%',
                                flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                            }}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        mx: 1,
                                        bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main'
                                    }}
                                >
                                    {message.type === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                                </Avatar>
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                                        color: message.type === 'user' ? 'white' : 'text.primary',
                                        borderRadius: 2,
                                        maxWidth: '100%',
                                        wordBreak: 'break-word',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Render message content with markdown support */}
                                    {message.type === 'ai' ? (
                                        <Box sx={{
                                            fontSize: '0.9rem',
                                            color: 'inherit',
                                            '& p': {
                                                margin: '0.5em 0',
                                                fontSize: '0.9rem',
                                                color: 'inherit',
                                                lineHeight: 1.4
                                            },
                                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                margin: '0.5em 0 0.3em 0',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                color: 'inherit'
                                            },
                                            '& ul, & ol': {
                                                margin: '0.5em 0',
                                                paddingLeft: '1.5em',
                                                fontSize: '0.9rem'
                                            },
                                            '& li': {
                                                margin: '0.2em 0',
                                                fontSize: '0.9rem',
                                                color: 'inherit'
                                            },
                                            '& code': {
                                                backgroundColor: message.type === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                                padding: '0.1em 0.3em',
                                                borderRadius: '3px',
                                                fontSize: '0.85rem',
                                                fontFamily: 'monospace',
                                                color: 'inherit'
                                            },
                                            '& pre': {
                                                backgroundColor: message.type === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                                padding: '0.5em',
                                                borderRadius: '4px',
                                                overflow: 'auto',
                                                fontSize: '0.8rem',
                                                maxWidth: '100%'
                                            },
                                            '& pre code': {
                                                backgroundColor: 'transparent',
                                                padding: 0
                                            },
                                            '& blockquote': {
                                                borderLeft: `3px solid ${message.type === 'user' ? 'rgba(255,255,255,0.5)' : '#ccc'}`,
                                                paddingLeft: '1em',
                                                margin: '0.5em 0',
                                                fontStyle: 'italic',
                                                color: 'inherit'
                                            },
                                            '& table': {
                                                borderCollapse: 'collapse',
                                                width: '100%',
                                                fontSize: '0.85rem',
                                                maxWidth: '100%',
                                                overflow: 'auto',
                                                display: 'block',
                                                whiteSpace: 'nowrap'
                                            },
                                            '& th, & td': {
                                                border: `1px solid ${message.type === 'user' ? 'rgba(255,255,255,0.3)' : '#ddd'}`,
                                                padding: '0.3em',
                                                textAlign: 'left',
                                                color: 'inherit'
                                            },
                                            '& th': {
                                                backgroundColor: message.type === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                                fontWeight: 'bold'
                                            },
                                            '& strong': {
                                                fontWeight: 'bold',
                                                color: 'inherit'
                                            },
                                            '& em': {
                                                fontStyle: 'italic',
                                                color: 'inherit'
                                            },
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxWidth: '100%'
                                        }}>
                                            <ReactMarkdown>{message.message}</ReactMarkdown>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ fontSize: '0.9rem', wordWrap: 'break-word' }}>
                                            {message.message}
                                        </Typography>
                                    )}

                                    {/* Display confidence score and sources for AI messages */}
                                    {message.type === 'ai' && message.confidence && (
                                        <Box sx={{ mt: 1 }}>
                                            <Chip
                                                label={`Confidence: ${Math.round(message.confidence * 100)}%`}
                                                size="small"
                                                color={message.confidence > 0.8 ? 'success' : message.confidence > 0.6 ? 'warning' : 'error'}
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        </Box>
                                    )}

                                    {/* Display sources if available */}
                                    {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                                Sources:
                                            </Typography>
                                            {message.sources.slice(0, 2).map((source, index) => (
                                                <Chip
                                                    key={index}
                                                    label={source.name || source.type}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        height: 18,
                                                        mx: 0.5,
                                                        mt: 0.5,
                                                        opacity: 0.8
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            opacity: 0.7,
                                            fontSize: '0.75rem',
                                            mt: 0.5,
                                            display: 'block'
                                        }}
                                    >
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                        {message.sessionId && (
                                            <span style={{ marginLeft: 8, fontSize: '0.65rem' }}>
                                                • Session: {message.sessionId.slice(-8)}
                                            </span>
                                        )}
                                    </Typography>
                                </Paper>
                            </Box>
                        </ListItem>
                    ))}
                    {loading && (
                        <ListItem sx={{ justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                Generating response...
                            </Typography>
                        </ListItem>
                    )}
                </List>
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about this provider's application..."
                    disabled={loading}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title="Send message">
                                    <IconButton
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim() || loading}
                                        color="primary"
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        )
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Press Enter to send, Shift+Enter for new line
                </Typography>
            </Box>
        </Drawer>
    );
};

export default ProviderChatSidebar;
