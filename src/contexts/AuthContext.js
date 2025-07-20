import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
                // Set auth header for API calls if axios defaults exist
                if (api.apiClient && api.apiClient.defaults) {
                    api.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await api.login(credentials);

            // Handle both mock and real API responses
            const responseData = response.data || response;
            const { token, user: userData } = responseData;

            if (!token || !userData) {
                throw new Error('Invalid response format');
            }

            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Set auth header
            if (api.apiClient && api.apiClient.defaults) {
                api.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            setUser(userData);
            setIsAuthenticated(true);

            return responseData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);

            // Handle both mock and real API responses
            const responseData = response.data || response;
            const { token, user: newUser } = responseData;

            if (!token || !newUser) {
                throw new Error('Invalid response format');
            }

            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));

            // Set auth header
            if (api.apiClient && api.apiClient.defaults) {
                api.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            setUser(newUser);
            setIsAuthenticated(true);

            return responseData;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear auth header
        if (api.apiClient && api.apiClient.defaults && api.apiClient.defaults.headers.common) {
            delete api.apiClient.defaults.headers.common['Authorization'];
        }

        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
