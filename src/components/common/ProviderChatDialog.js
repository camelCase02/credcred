import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    Chat as ChatIcon,
    Send as SendIcon,
    Close as CloseIcon,
    SmartToy as BotIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import credentialingApi from '../../services/api/credentialingApi';

// Simple markdown renderer
const renderMarkdown = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let currentListItems = [];
    let inList = false;

    const pushCurrentList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <List key={`list-${elements.length}`} dense sx={{ pl: 2 }}>
                    {currentListItems.map((item, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemText
                                primary={item}
                                sx={{
                                    '& .MuiTypography-root': {
                                        fontSize: '0.875rem',
                                        lineHeight: 1.4
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            );
            currentListItems = [];
            inList = false;
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            if (inList) {
                pushCurrentList();
            }
            return;
        }

        // Handle numbered lists (1. 2. 3. etc.)
        const numberedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
        if (numberedListMatch) {
            if (!inList) {
                inList = true;
            }
            currentListItems.push(`${numberedListMatch[1]}. ${numberedListMatch[2]}`);
            return;
        }

        // Handle bullet points
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            if (!inList) {
                inList = true;
            }
            currentListItems.push(trimmedLine.substring(2));
            return;
        }

        // If we were in a list but this line isn't a list item, push the current list
        if (inList) {
            pushCurrentList();
        }

        // Handle headers
        if (trimmedLine.startsWith('### ')) {
            elements.push(
                <Typography key={index} variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    {trimmedLine.substring(4)}
                </Typography>
            );
        } else if (trimmedLine.startsWith('## ')) {
            elements.push(
                <Typography key={index} variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    {trimmedLine.substring(3)}
                </Typography>
            );
        } else if (trimmedLine.startsWith('# ')) {
            elements.push(
                <Typography key={index} variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    {trimmedLine.substring(2)}
                </Typography>
            );
        } else {
            // Regular paragraph
            elements.push(
                <Typography key={index} variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                    {trimmedLine}
                </Typography>
            );
        }
    });

    // Push any remaining list items
    pushCurrentList();

    return <Box>{elements}</Box>;
};

const ProviderChatDialog = ({ open, onClose, provider, sessionId = null }) => {
    const [messages, setMessages] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (open && provider) {
            // Add welcome message when dialog opens
            setMessages([{
                id: Date.now(),
                type: 'bot',
                content: `Hello! I can help you with information about ${provider.providerName || provider.name}. You can ask about their compliance status, score details, regulations, processing history, and more.`,
                timestamp: new Date(),
                confidence: null
            }]);
        }
    }, [open, provider]);

    const handleSendMessage = async () => {
        if (!currentQuestion.trim() || loading || !provider) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: currentQuestion,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            const providerId = provider.id || provider.provider_id || provider.providerName?.toLowerCase().replace(/\s+/g, '_');
            const response = await credentialingApi.chat(providerId, currentQuestion, sessionId);

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.answer,
                timestamp: new Date(),
                confidence: response.confidence,
                sources: response.sources || [],
                sessionId: response.session_id
            };

            setMessages(prev => [...prev, botMessage]);
            setCurrentQuestion('');

        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message || 'Failed to get response. Please try again.');

            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: err.message || 'Failed to get response. Please try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleClose = () => {
        setMessages([]);
        setCurrentQuestion('');
        setError(null);
        onClose();
    };

    const suggestedQuestions = [
        "What is the compliance status for this provider?",
        "Why did this provider receive their score?",
        "Which hard regulations did this provider pass?",
        "What was the reasoning for the final compliance decision?",
        "How many LLM interactions were used in the credentialing process?"
    ];

    const handleSuggestedQuestion = (question) => {
        setCurrentQuestion(question);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { height: '70vh', display: 'flex', flexDirection: 'column' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChatIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h6">
                            Chat about {provider?.providerName || provider?.name || 'Provider'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ask questions about credentialing details
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                {/* Messages Area */}
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 3,
                    pt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            <Paper
                                sx={{
                                    p: 2,
                                    maxWidth: '75%',
                                    bgcolor: message.type === 'user' ? 'primary.main' :
                                        message.type === 'error' ? 'error.light' : 'grey.100',
                                    color: message.type === 'user' ? 'white' : 'text.primary'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                    {message.type === 'bot' && <BotIcon sx={{ mr: 1, fontSize: 18, mt: 0.5 }} />}
                                    {message.type === 'user' && <PersonIcon sx={{ mr: 1, fontSize: 18, mt: 0.5 }} />}
                                    <Box sx={{ flex: 1 }}>
                                        {message.type === 'bot' ? renderMarkdown(message.content) : (
                                            <Typography variant="body2">
                                                {message.content}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {message.confidence && (
                                    <Chip
                                        label={`Confidence: ${Math.round(message.confidence * 100)}%`}
                                        size="small"
                                        sx={{ mt: 1 }}
                                        color={message.confidence > 0.9 ? 'success' : message.confidence > 0.7 ? 'warning' : 'error'}
                                    />
                                )}

                                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                                    {message.timestamp.toLocaleTimeString()}
                                </Typography>
                            </Paper>
                        </Box>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BotIcon sx={{ mr: 1, fontSize: 18 }} />
                                    <CircularProgress size={16} sx={{ mr: 1 }} />
                                    <Typography variant="body2">Thinking...</Typography>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                {/* Suggested Questions */}
                {messages.length <= 1 && (
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            Suggested questions:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {suggestedQuestions.map((question, index) => (
                                <Chip
                                    key={index}
                                    label={question}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleSuggestedQuestion(question)}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Divider />

                {/* Input Area */}
                <Box sx={{ p: 3, pt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={3}
                            placeholder="Ask about this provider's credentialing details..."
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            variant="outlined"
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={handleSendMessage}
                            disabled={!currentQuestion.trim() || loading}
                            sx={{ minWidth: 'auto', px: 3 }}
                        >
                            <SendIcon />
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProviderChatDialog;
