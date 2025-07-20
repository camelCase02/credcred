import axios from 'axios';

class ApiService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        this.useMockData = process.env.REACT_APP_USE_MOCK === 'true' || true; // Default to mock for development

        this.apiClient = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Mock data
        this.mockData = {
            users: [
                {
                    id: 1,
                    email: 'provider@example.com',
                    password: 'password123',
                    role: 'provider',
                    name: 'Dr. John Smith',
                    profile: {
                        specialty: 'Cardiology',
                        licenseNumber: 'MD123456',
                        npi: '1234567890',
                        phone: '555-0123',
                        address: '123 Medical Center Dr, City, State 12345',
                        yearsOfExperience: 15,
                        boardCertifications: ['American Board of Internal Medicine', 'American Board of Cardiovascular Disease'],
                        medicalSchool: 'Harvard Medical School',
                        residency: 'Massachusetts General Hospital',
                        fellowship: 'Cleveland Clinic'
                    }
                },
                {
                    id: 2,
                    email: 'payer@example.com',
                    password: 'password123',
                    role: 'payer',
                    name: 'Blue Cross Blue Shield',
                    profile: {
                        organizationName: 'Blue Cross Blue Shield',
                        contactPerson: 'Jane Doe',
                        phone: '555-0456',
                        address: '456 Insurance Ave, City, State 12345',
                        networkTypes: ['HMO', 'PPO', 'EPO'],
                        activeProviders: 1250,
                        pendingApplications: 35
                    }
                }
            ],
            credentialingStatuses: [
                {
                    id: 1,
                    providerId: 1,
                    status: 'In Progress',
                    progress: 65,
                    startDate: '2024-01-15',
                    estimatedCompletion: '2024-03-15',
                    currentStep: 'Primary Source Verification',
                    logs: [
                        {
                            id: 1,
                            timestamp: '2024-01-15T10:00:00Z',
                            action: 'Application Submitted',
                            details: 'Provider submitted credentialing application',
                            status: 'completed'
                        },
                        {
                            id: 2,
                            timestamp: '2024-01-20T14:30:00Z',
                            action: 'Initial Review',
                            details: 'Application passed initial completeness check',
                            status: 'completed'
                        },
                        {
                            id: 3,
                            timestamp: '2024-02-01T09:15:00Z',
                            action: 'Document Verification',
                            details: 'Medical license verified with state board',
                            status: 'completed'
                        },
                        {
                            id: 4,
                            timestamp: '2024-02-10T11:45:00Z',
                            action: 'Primary Source Verification',
                            details: 'Currently verifying medical school and residency credentials',
                            status: 'in_progress'
                        }
                    ]
                }
            ],
            providers: [
                {
                    id: 1,
                    name: 'Dr. John Smith',
                    specialty: 'Cardiology',
                    location: 'New York, NY',
                    networkAdequacyScore: 85,
                    distanceFromGap: '2.5 miles',
                    patientCapacity: 500,
                    currentPatients: 320,
                    acceptingNewPatients: true,
                    qualityScore: 4.8,
                    networkImpact: 'High - Fills critical gap in cardiology coverage in downtown area'
                },
                {
                    id: 2,
                    name: 'Dr. Sarah Johnson',
                    specialty: 'Pediatrics',
                    location: 'Brooklyn, NY',
                    networkAdequacyScore: 92,
                    distanceFromGap: '1.2 miles',
                    patientCapacity: 400,
                    currentPatients: 380,
                    acceptingNewPatients: true,
                    qualityScore: 4.9,
                    networkImpact: 'Medium - Enhances pediatric coverage in underserved area'
                },
                {
                    id: 3,
                    name: 'Dr. Michael Chen',
                    specialty: 'Orthopedics',
                    location: 'Queens, NY',
                    networkAdequacyScore: 78,
                    distanceFromGap: '3.8 miles',
                    patientCapacity: 300,
                    currentPatients: 250,
                    acceptingNewPatients: true,
                    qualityScore: 4.7,
                    networkImpact: 'High - Only orthopedic surgeon in 10-mile radius'
                }
            ],
            networks: [
                {
                    id: 1,
                    name: 'Primary Care Network',
                    type: 'HMO',
                    adequacyScore: 87,
                    totalProviders: 450,
                    gaps: ['Endocrinology', 'Rheumatology'],
                    cmsCompliance: 'Compliant'
                },
                {
                    id: 2,
                    name: 'Specialty Care Network',
                    type: 'PPO',
                    adequacyScore: 72,
                    totalProviders: 280,
                    gaps: ['Neurology', 'Oncology', 'Cardiology'],
                    cmsCompliance: 'Needs Improvement'
                }
            ]
        };
    }

    // Mock response helper
    mockResponse(data, delay = 500) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ data });
            }, delay);
        });
    }

    // Authentication
    async login(credentials) {
        if (this.useMockData) {
            const user = this.mockData.users.find(u =>
                u.email === credentials.email && u.password === credentials.password
            );

            if (user) {
                const { password, ...userWithoutPassword } = user;
                return this.mockResponse({
                    token: 'mock-jwt-token-' + user.id,
                    user: userWithoutPassword
                });
            } else {
                throw new Error('Invalid credentials');
            }
        }
        return this.apiClient.post('/auth/login', credentials);
    }

    async register(userData) {
        if (this.useMockData) {
            const newUser = {
                id: this.mockData.users.length + 1,
                ...userData,
                profile: userData.role === 'provider' ? {
                    specialty: '',
                    licenseNumber: '',
                    npi: '',
                    phone: '',
                    address: '',
                    yearsOfExperience: 0,
                    boardCertifications: [],
                    medicalSchool: '',
                    residency: '',
                    fellowship: ''
                } : {
                    organizationName: '',
                    contactPerson: '',
                    phone: '',
                    address: '',
                    networkTypes: [],
                    activeProviders: 0,
                    pendingApplications: 0
                }
            };

            this.mockData.users.push(newUser);
            const { password, ...userWithoutPassword } = newUser;

            return this.mockResponse({
                token: 'mock-jwt-token-' + newUser.id,
                user: userWithoutPassword
            });
        }
        return this.apiClient.post('/auth/register', userData);
    }

    // Provider APIs
    async getProviderProfile() {
        if (this.useMockData) {
            const provider = this.mockData.users.find(u => u.role === 'provider');
            return this.mockResponse(provider);
        }
        return this.apiClient.get('/provider/profile');
    }

    async updateProviderProfile(profileData) {
        if (this.useMockData) {
            const provider = this.mockData.users.find(u => u.role === 'provider');
            if (provider) {
                provider.profile = { ...provider.profile, ...profileData };
                return this.mockResponse(provider);
            }
        }
        return this.apiClient.put('/provider/profile', profileData);
    }

    async getCredentialingStatus() {
        if (this.useMockData) {
            return this.mockResponse(this.mockData.credentialingStatuses[0]);
        }
        return this.apiClient.get('/provider/credentialing/status');
    }

    async initiateCredentialing(applicationData) {
        if (this.useMockData) {
            const newStatus = {
                id: this.mockData.credentialingStatuses.length + 1,
                providerId: 1,
                status: 'Submitted',
                progress: 0,
                startDate: new Date().toISOString().split('T')[0],
                estimatedCompletion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                currentStep: 'Initial Review',
                logs: [
                    {
                        id: 1,
                        timestamp: new Date().toISOString(),
                        action: 'Application Submitted',
                        details: 'Provider submitted credentialing application',
                        status: 'completed'
                    }
                ]
            };

            this.mockData.credentialingStatuses.push(newStatus);
            return this.mockResponse(newStatus);
        }
        return this.apiClient.post('/provider/credentialing', applicationData);
    }

    // Payer APIs
    async getPayerProfile() {
        if (this.useMockData) {
            const payer = this.mockData.users.find(u => u.role === 'payer');
            return this.mockResponse(payer);
        }
        return this.apiClient.get('/payer/profile');
    }

    async getEnrolledProviders() {
        if (this.useMockData) {
            return this.mockResponse(this.mockData.providers);
        }
        return this.apiClient.get('/payer/providers');
    }

    async getNetworks() {
        if (this.useMockData) {
            return this.mockResponse(this.mockData.networks);
        }
        return this.apiClient.get('/payer/networks');
    }

    async getProviderSuggestions(networkId) {
        if (this.useMockData) {
            // Filter providers based on network adequacy
            const suggestions = this.mockData.providers.filter(p =>
                p.networkAdequacyScore < 90 || p.networkImpact.includes('High')
            );
            return this.mockResponse(suggestions);
        }
        return this.apiClient.get(`/payer/networks/${networkId}/suggestions`);
    }

    async initiateProviderCredentialing(providerId) {
        if (this.useMockData) {
            const provider = this.mockData.providers.find(p => p.id === providerId);
            if (provider) {
                return this.mockResponse({
                    message: `Credentialing initiated for ${provider.name}`,
                    success: true
                });
            }
        }
        return this.apiClient.post(`/payer/providers/${providerId}/credentialing`);
    }

    // File upload
    async uploadDocument(file, documentType) {
        if (this.useMockData) {
            return this.mockResponse({
                fileName: file.name,
                fileUrl: `mock-url/${file.name}`,
                uploadedAt: new Date().toISOString(),
                documentType
            });
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        return this.apiClient.post('/upload/document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // CAQH Integration
    async importFromCAQH(credentials) {
        if (this.useMockData) {
            return this.mockResponse({
                success: true,
                data: {
                    name: 'Dr. John Smith',
                    specialty: 'Cardiology',
                    licenseNumber: 'MD123456',
                    npi: '1234567890',
                    medicalSchool: 'Harvard Medical School',
                    residency: 'Massachusetts General Hospital',
                    boardCertifications: ['American Board of Internal Medicine'],
                    // ... other CAQH data
                }
            });
        }
        return this.apiClient.post('/integration/caqh/import', credentials);
    }

    // Network Analytics
    async getNetworkAnalytics(networkId, region) {
        if (this.useMockData) {
            return this.mockResponse({
                networkId,
                region,
                adequacyScore: 85,
                totalProviders: 450,
                activeProviders: 432,
                pendingProviders: 18,
                complianceStatus: 'Compliant',
                geoDistribution: {
                    urban: 65,
                    suburban: 25,
                    rural: 10
                },
                specialtyGaps: [
                    { specialty: 'Endocrinology', gapSize: 23, priority: 'High' },
                    { specialty: 'Rheumatology', gapSize: 15, priority: 'Medium' },
                    { specialty: 'Infectious Disease', gapSize: 8, priority: 'Low' }
                ]
            });
        }
        return this.apiClient.get(`/analytics/network/${networkId}`, { params: { region } });
    }

    async getCMSCompliance() {
        if (this.useMockData) {
            return this.mockResponse({
                overallScore: 87,
                status: 'Compliant',
                requirements: [
                    { name: 'Network Adequacy', status: 'Compliant', score: 85 },
                    { name: 'Access Standards', status: 'Compliant', score: 92 },
                    { name: 'Provider Directory', status: 'Warning', score: 78 }
                ]
            });
        }
        return this.apiClient.get('/compliance/cms');
    }

    // Notifications
    async getNotifications(userId) {
        if (this.useMockData) {
            const notifications = [
                {
                    id: 1,
                    type: 'credentialing_update',
                    title: 'Credentialing Status Update',
                    message: 'Your credentialing application has moved to Primary Source Verification stage.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'high'
                },
                {
                    id: 2,
                    type: 'document_reminder',
                    title: 'Document Expiration Warning',
                    message: 'Your malpractice insurance document expires in 30 days.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'medium'
                }
            ];
            return this.mockResponse(notifications);
        }
        return this.apiClient.get(`/notifications/${userId}`);
    }

    async markNotificationsAsRead(notificationIds) {
        if (this.useMockData) {
            return this.mockResponse({ success: true });
        }
        return this.apiClient.put('/notifications/read', { notificationIds });
    }

    async deleteNotifications(notificationIds) {
        if (this.useMockData) {
            return this.mockResponse({ success: true });
        }
        return this.apiClient.delete('/notifications', { data: { notificationIds } });
    }

    async sendNotification(notificationData) {
        if (this.useMockData) {
            return this.mockResponse({ success: true, id: Date.now() });
        }
        return this.apiClient.post('/notifications/send', notificationData);
    }

    // Status Tracking
    async getStatusHistory(providerId) {
        if (this.useMockData) {
            return this.mockResponse({
                providerId,
                history: [
                    {
                        date: '2024-01-15',
                        status: 'submitted',
                        details: 'Application submitted'
                    },
                    {
                        date: '2024-01-20',
                        status: 'in_review',
                        details: 'Initial review started'
                    }
                ]
            });
        }
        return this.apiClient.get(`/status/history/${providerId}`);
    }

    async addStatusComment(logId, comment) {
        if (this.useMockData) {
            return this.mockResponse({ success: true });
        }
        return this.apiClient.post(`/status/comment/${logId}`, { comment });
    }

    // Document Management
    async getDocuments(providerId) {
        if (this.useMockData) {
            return this.mockResponse([
                {
                    id: 1,
                    name: 'Medical License',
                    type: 'license',
                    status: 'verified',
                    uploadDate: '2024-01-15',
                    expiryDate: '2025-01-15'
                },
                {
                    id: 2,
                    name: 'Malpractice Insurance',
                    type: 'insurance',
                    status: 'pending',
                    uploadDate: '2024-01-20',
                    expiryDate: '2024-12-31'
                }
            ]);
        }
        return this.apiClient.get(`/documents/${providerId}`);
    }

    async deleteDocument(documentId) {
        if (this.useMockData) {
            return this.mockResponse({ success: true });
        }
        return this.apiClient.delete(`/documents/${documentId}`);
    }

    async updateDocumentStatus(documentId, status) {
        if (this.useMockData) {
            return this.mockResponse({ success: true });
        }
        return this.apiClient.put(`/documents/${documentId}/status`, { status });
    }

    // Provider Suggestions with AI
    async getAIProviderSuggestions(networkId, filters = {}) {
        if (this.useMockData) {
            const suggestions = [
                {
                    id: 101,
                    name: 'Dr. Emily Chen',
                    specialty: 'Endocrinology',
                    location: 'Manhattan, NY',
                    networkAdequacyScore: 94,
                    distanceFromGap: '0.8 miles',
                    qualityScore: 4.9,
                    estimatedImpact: '+15% adequacy score',
                    reason: 'Fills critical endocrinology gap in high-demand area',
                    aiConfidence: 0.92
                },
                {
                    id: 102,
                    name: 'Dr. Robert Kim',
                    specialty: 'Rheumatology',
                    location: 'Brooklyn, NY',
                    networkAdequacyScore: 89,
                    distanceFromGap: '1.2 miles',
                    qualityScore: 4.7,
                    estimatedImpact: '+8% adequacy score',
                    reason: 'Excellent patient outcomes and high availability',
                    aiConfidence: 0.87
                }
            ];
            return this.mockResponse(suggestions);
        }
        return this.apiClient.get(`/ai/provider-suggestions/${networkId}`, { params: filters });
    }

    // Dashboard Stats
    async getDashboardStats(userRole) {
        if (this.useMockData) {
            return this.mockResponse({
                role: userRole,
                stats: userRole === 'provider' ? {
                    credentialingProgress: 75,
                    documentsUploaded: 8,
                    documentsTotal: 12,
                    statusUpdates: 3,
                    pendingActions: 2
                } : {
                    totalProviders: 1250,
                    activeProviders: 1180,
                    pendingApplications: 35,
                    networkAdequacyScore: 87
                }
            });
        }
        return this.apiClient.get(`/dashboard/stats/${userRole}`);
    }

    // Activity Feed
    async getActivityFeed(userId, filterType = 'all') {
        if (this.useMockData) {
            return this.mockResponse([
                {
                    id: 1,
                    type: 'credentialing_update',
                    title: 'Credentialing Status Updated',
                    description: 'Application moved to next stage',
                    timestamp: new Date().toISOString(),
                    priority: 'high',
                    category: 'status'
                }
            ]);
        }
        return this.apiClient.get(`/activity/${userId}`, { params: { filter: filterType } });
    }

    // Reports and Analytics
    async generateReport(reportType, filters = {}) {
        if (this.useMockData) {
            return this.mockResponse({
                reportId: Date.now(),
                type: reportType,
                status: 'generated',
                downloadUrl: `mock-url/report-${Date.now()}.pdf`
            });
        }
        return this.apiClient.post('/reports/generate', { type: reportType, filters });
    }

    async getReportStatus(reportId) {
        if (this.useMockData) {
            return this.mockResponse({
                reportId,
                status: 'completed',
                progress: 100
            });
        }
        return this.apiClient.get(`/reports/${reportId}/status`);
    }
}

const api = new ApiService();
export default api;