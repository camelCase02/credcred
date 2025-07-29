const API_BASE_URL = process.env.REACT_APP_CREDENTIALING_API_URL || 'http://localhost:8000';

const credentialingApi = {
    // Health Check
    healthCheck: async () => {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new Error('Health check failed');
        }
        return response.json();
    },

    // Credential a Provider
    credentialProvider: async (providerId) => {
        const response = await fetch(`${API_BASE_URL}/credential/${providerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to credential provider: ${response.statusText}`);
        }
        return response.json();
    },

    // Get Processed Doctors List
    getProcessedDoctors: async () => {
        const response = await fetch(`${API_BASE_URL}/processed-doctors`);
        if (!response.ok) {
            throw new Error('Failed to fetch processed doctors');
        }
        return response.json();
    },

    // Chat Endpoint
    chat: async (providerId, question, sessionId = null) => {
        const body = { provider_id: providerId, question };
        if (sessionId) {
            body.session_id = sessionId;
        }

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Chat request failed');
        }
        return response.json();
    },

    // Get All Providers
    getProviders: async () => {
        const response = await fetch(`${API_BASE_URL}/providers`);
        if (!response.ok) {
            throw new Error('Failed to fetch providers');
        }
        return response.json();
    },

    // Get Credentialing Results
    getResults: async (providerId) => {
        const response = await fetch(`${API_BASE_URL}/results/${providerId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch results for provider ${providerId}`);
        }
        return response.json();
    },

    // Search Providers
    searchProviders: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.specialty) queryParams.append('specialty', params.specialty);
        if (params.min_experience) queryParams.append('min_experience', params.min_experience);
        if (params.location) queryParams.append('location', params.location);

        const response = await fetch(`${API_BASE_URL}/providers/search?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to search providers');
        }
        return response.json();
    },

    // Batch Credentialing
    batchCredential: async (providerIds) => {
        const response = await fetch(`${API_BASE_URL}/batch-credential`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(providerIds),
        });
        if (!response.ok) {
            throw new Error('Batch credentialing failed');
        }
        return response.json();
    },

    // Statistics Endpoints
    getCredentialingStats: async () => {
        const response = await fetch(`${API_BASE_URL}/stats/credentialing`);
        if (!response.ok) {
            throw new Error('Failed to fetch credentialing stats');
        }
        return response.json();
    },

    getLLMUsageStats: async () => {
        const response = await fetch(`${API_BASE_URL}/stats/llm-usage`);
        if (!response.ok) {
            throw new Error('Failed to fetch LLM usage stats');
        }
        return response.json();
    },

    // Logging Endpoints
    getSessions: async (providerId = null) => {
        const queryParams = providerId ? `?provider_id=${providerId}` : '';
        const response = await fetch(`${API_BASE_URL}/logs/sessions${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch sessions');
        }
        return response.json();
    },

    getSessionLog: async (sessionId) => {
        const response = await fetch(`${API_BASE_URL}/logs/session/${sessionId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch session log for ${sessionId}`);
        }
        return response.json();
    },

    getCredentialingHistory: async (providerId) => {
        const response = await fetch(`${API_BASE_URL}/logs/credentialing-history?provider_id=${providerId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch credentialing history for ${providerId}`);
        }
        return response.json();
    },

    getLLMReasoning: async (providerId) => {
        const response = await fetch(`${API_BASE_URL}/logs/llm-reasoning/${providerId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch LLM reasoning for ${providerId}`);
        }
        return response.json();
    },

    getDecisionReasoning: async (providerId, decisionType = null) => {
        const queryParams = decisionType ? `?decision_type=${decisionType}` : '';
        const response = await fetch(`${API_BASE_URL}/logs/decision-reasoning/${providerId}${queryParams}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch decision reasoning for ${providerId}`);
        }
        return response.json();
    },

    getAuditTrail: async () => {
        const response = await fetch(`${API_BASE_URL}/logs/audit-trail`);
        if (!response.ok) {
            throw new Error('Failed to fetch audit trail');
        }
        return response.json();
    },

    getChatbotTrainingData: async () => {
        const response = await fetch(`${API_BASE_URL}/logs/chatbot-training-data`);
        if (!response.ok) {
            throw new Error('Failed to fetch chatbot training data');
        }
        return response.json();
    },
};

export default credentialingApi;
