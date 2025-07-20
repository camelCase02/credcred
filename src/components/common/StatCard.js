import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, LinearProgress } from '@mui/material';

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'primary',
    gradient = false,
    progress = null,
    sx = {}
}) => {
    const cardStyle = gradient
        ? {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            ...sx
        }
        : { ...sx };

    return (
        <Card sx={{ height: '100%', ...cardStyle }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {Icon && (
                        <Avatar
                            sx={{
                                bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color}.main`,
                                mr: 2
                            }}
                        >
                            <Icon />
                        </Avatar>
                    )}
                    <Typography variant="h6">{title}</Typography>
                </Box>

                <Typography variant="h4" fontWeight="bold" color={gradient ? 'inherit' : `${color}.main`}>
                    {value}
                </Typography>

                {subtitle && (
                    <Typography
                        variant="body2"
                        color={gradient ? 'inherit' : 'text.secondary'}
                        sx={{ opacity: gradient ? 0.8 : 1 }}
                    >
                        {subtitle}
                    </Typography>
                )}

                {progress !== null && (
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            mt: 2,
                            bgcolor: gradient ? 'rgba(255,255,255,0.2)' : 'grey.300',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: gradient ? 'rgba(255,255,255,0.8)' : `${color}.main`
                            }
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
