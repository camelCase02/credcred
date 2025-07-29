import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useAuth = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useAuth must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for existing session
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            // Set default analyst user for demo
            const defaultUser = {
                id: 'USR-001',
                name: 'John Smith',
                email: 'john.smith@healthcred.com',
                role: 'analyst', // 'analyst' or 'committee'
                permissions: ['view_applications', 'review_checklist', 'approve_items', 'generate_reports']
            };
            setUser(defaultUser);
            localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    const switchRole = (newRole) => {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        login,
        logout,
        switchRole,
        loading,
        isAuthenticated: !!user,
        isAnalyst: user?.role === 'analyst',
        isCommittee: user?.role === 'committee'
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext };
