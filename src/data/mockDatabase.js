// Mock Database - File-based storage simulation
class MockDatabase {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize with mock data if not exists
        if (!localStorage.getItem('credentialing_providers')) {
            this.providers = [
                {
                    id: 'PROV-001',
                    name: 'Dr. Sarah Martinez',
                    specialty: 'Cardiology',
                    market: 'CA',
                    status: 'In Progress',
                    assignedAnalyst: 'John Smith',
                    submissionDate: '2024-01-15',
                    networkImpact: 'High',
                    workExperience: 12,
                    npiNumber: '1234567890',
                    licenseNumber: 'CA-MD-56789',
                    deaNumber: 'BM1234567',
                    email: 'sarah.martinez@email.com',
                    phone: '(555) 123-4567',
                    address: '123 Medical Plaza, Los Angeles, CA 90210',
                    medicalSchool: 'UCLA School of Medicine',
                    residency: 'Cedars-Sinai Medical Center',
                    fellowship: 'Stanford University Medical Center',
                    boardCertifications: ['American Board of Internal Medicine - Cardiology'],
                    malpracticeInsurance: {
                        carrier: 'Medical Protective',
                        policyNumber: 'MP-789123',
                        coverage: '$2,000,000',
                        expirationDate: '2024-12-31'
                    },
                    checklist: [
                        {
                            id: 1,
                            name: 'Medical License',
                            title: 'Medical License Verification',
                            description: 'Primary state medical license verification',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: true
                        },
                        {
                            id: 2,
                            name: 'Board Certification',
                            title: 'Board Certification Verification',
                            description: 'Specialty board certification verification',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: false
                        },
                        {
                            id: 3,
                            name: 'DEA License',
                            title: 'DEA Registration',
                            description: 'Drug Enforcement Administration registration',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: true
                        },
                        {
                            id: 4,
                            name: 'Malpractice Insurance',
                            title: 'Malpractice Insurance',
                            description: 'Professional liability insurance verification',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: false
                        },
                        {
                            id: 5,
                            name: 'Background Check',
                            title: 'Background Screening',
                            description: 'Criminal background and OIG exclusion check',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: false
                        }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-15', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-15', type: 'certification' },
                        { name: 'CV.pdf', uploadDate: '2024-01-15', type: 'resume' },
                        { name: 'Malpractice Insurance.pdf', uploadDate: '2024-01-15', type: 'insurance' }
                    ]
                },
                {
                    id: 'PROV-002',
                    name: 'Dr. Michael Chen',
                    specialty: 'Pediatrics',
                    market: 'TX',
                    status: 'Initiated',
                    assignedAnalyst: 'Jane Doe',
                    submissionDate: '2024-01-20',
                    networkImpact: 'Medium',
                    workExperience: 8,
                    npiNumber: '1234567891',
                    licenseNumber: 'TX-MD-45678',
                    deaNumber: 'BM2345678',
                    email: 'michael.chen@email.com',
                    phone: '(555) 234-5678',
                    address: '456 Children\'s Hospital Dr, Houston, TX 77030',
                    medicalSchool: 'Baylor College of Medicine',
                    residency: 'Texas Children\'s Hospital',
                    fellowship: '',
                    boardCertifications: ['American Board of Pediatrics'],
                    malpracticeInsurance: {
                        carrier: 'Coverys',
                        policyNumber: 'CV-456789',
                        coverage: '$1,500,000',
                        expirationDate: '2024-11-30'
                    },
                    checklist: [
                        {
                            id: 1,
                            name: 'Medical License',
                            title: 'Medical License Verification',
                            description: 'Primary state medical license verification',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: true
                        },
                        {
                            id: 2,
                            name: 'Board Certification',
                            title: 'Board Certification Verification',
                            description: 'Specialty board certification verification',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: false
                        },
                        {
                            id: 3,
                            name: 'Malpractice Insurance',
                            title: 'Malpractice Insurance',
                            description: 'Professional liability insurance verification',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: false
                        },
                        {
                            id: 4,
                            name: 'Background Check',
                            title: 'Background Screening',
                            description: 'Criminal background and OIG exclusion check',
                            status: 'pending',
                            message: '',
                            comments: '',
                            requiresVerification: false
                        }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-20', type: 'license' }
                    ]
                },
                {
                    id: 'PROV-003',
                    name: 'Dr. Emily Johnson',
                    specialty: 'Orthopedics',
                    market: 'NY',
                    status: 'Committee Review',
                    assignedAnalyst: 'John Smith',
                    submissionDate: '2024-01-10',
                    flaggedDate: '2024-01-18',
                    flaggedBy: 'John Smith',
                    flaggedForCommittee: true,
                    flaggedReason: 'Malpractice insurance coverage requires review',
                    networkImpact: 'High',
                    workExperience: 15,
                    npiNumber: '1234567892',
                    licenseNumber: 'NY-MD-34567',
                    deaNumber: 'BM3456789',
                    email: 'emily.johnson@email.com',
                    phone: '(555) 345-6789',
                    address: '789 Orthopedic Center, New York, NY 10001',
                    medicalSchool: 'Columbia University College of Physicians and Surgeons',
                    residency: 'Hospital for Special Surgery',
                    fellowship: 'Mayo Clinic',
                    boardCertifications: ['American Board of Orthopaedic Surgery'],
                    malpracticeInsurance: {
                        carrier: 'NORCAL Mutual',
                        policyNumber: 'NC-321654',
                        coverage: '$3,000,000',
                        expirationDate: '2024-09-30'
                    },
                    checklist: [
                        {
                            id: 1,
                            name: 'Medical License',
                            title: 'Medical License Verification',
                            description: 'Primary state medical license verification',
                            status: 'approved',
                            message: 'Valid until 2025',
                            comments: 'License verified through NY Department of Health',
                            requiresVerification: true
                        },
                        {
                            id: 2,
                            name: 'Board Certification',
                            title: 'Board Certification Verification',
                            description: 'Specialty board certification verification',
                            status: 'approved',
                            message: 'Current certification verified',
                            comments: 'ABOS certification current through 2026',
                            requiresVerification: false
                        },
                        {
                            id: 3,
                            name: 'Malpractice Insurance',
                            title: 'Malpractice Insurance',
                            description: 'Professional liability insurance verification',
                            status: 'flagged',
                            message: 'Coverage amount needs verification',
                            comments: 'Need to verify if $3M coverage meets network requirements',
                            requiresVerification: false
                        },
                        {
                            id: 4,
                            name: 'Background Check',
                            title: 'Background Screening',
                            description: 'Criminal background and OIG exclusion check',
                            status: 'approved',
                            message: 'Clean record confirmed',
                            comments: 'No exclusions found in OIG database',
                            requiresVerification: false
                        }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-10', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-10', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2024-01-10', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2024-01-10', type: 'resume' },
                        { name: 'Fellowship Certificate.pdf', uploadDate: '2024-01-10', type: 'certification' }
                    ]
                },
                {
                    id: 'PROV-004',
                    name: 'Dr. Robert Smith',
                    specialty: 'Cardiology',
                    market: 'CA',
                    status: 'Committee Review',
                    assignedAnalyst: 'Jane Doe',
                    submissionDate: '2024-01-25',
                    flaggedDate: '2024-01-28',
                    flaggedBy: 'Jane Doe',
                    flaggedForCommittee: true,
                    flaggedReason: 'Work history gap requires committee approval',
                    networkImpact: 'Medium',
                    workExperience: 20,
                    npiNumber: '1234567893',
                    licenseNumber: 'CA-MD-23456',
                    deaNumber: 'BM4567890',
                    email: 'robert.smith@email.com',
                    phone: '(555) 456-7890',
                    address: '321 Cardiac Center Blvd, San Francisco, CA 94102',
                    medicalSchool: 'UCSF School of Medicine',
                    residency: 'UCSF Medical Center',
                    fellowship: 'Cleveland Clinic',
                    boardCertifications: ['American Board of Internal Medicine - Cardiology', 'American Board of Internal Medicine - Interventional Cardiology'],
                    malpracticeInsurance: {
                        carrier: 'The Doctors Company',
                        policyNumber: 'TDC-654987',
                        coverage: '$2,500,000',
                        expirationDate: '2024-10-31'
                    },
                    checklist: [
                        {
                            id: 1,
                            name: 'Medical License',
                            title: 'Medical License Verification',
                            description: 'Primary state medical license verification',
                            status: 'approved',
                            message: 'Valid until 2026',
                            comments: 'CA medical board verification complete',
                            requiresVerification: true
                        },
                        {
                            id: 2,
                            name: 'Board Certification',
                            title: 'Board Certification Verification',
                            description: 'Specialty board certification verification',
                            status: 'approved',
                            message: 'Current certification verified',
                            comments: 'Dual board certification confirmed',
                            requiresVerification: false
                        },
                        {
                            id: 3,
                            name: 'Malpractice Insurance',
                            title: 'Malpractice Insurance',
                            description: 'Professional liability insurance verification',
                            status: 'approved',
                            message: 'Coverage confirmed',
                            comments: 'TDC policy active and adequate',
                            requiresVerification: false
                        },
                        {
                            id: 4,
                            name: 'Background Check',
                            title: 'Background Screening',
                            description: 'Criminal background and OIG exclusion check',
                            status: 'flagged',
                            message: 'Employment gap needs explanation',
                            comments: '18-month gap between 2019-2020 requires documentation',
                            requiresVerification: false
                        }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-25', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-25', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2024-01-25', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2024-01-25', type: 'resume' },
                        { name: 'Employment Gap Explanation.pdf', uploadDate: '2024-01-25', type: 'other' }
                    ]
                },
                // Additional providers to reach 35+ total
                {
                    id: 'PROV-005',
                    name: 'Dr. Maria Rodriguez',
                    specialty: 'Family Medicine',
                    market: 'FL',
                    status: 'Approved',
                    assignedAnalyst: 'Mike Wilson',
                    submissionDate: '2023-12-01',
                    approvedDate: '2024-01-05',
                    networkImpact: 'Low',
                    workExperience: 6,
                    npiNumber: '1234567894',
                    licenseNumber: 'FL-MD-12345',
                    deaNumber: 'BM5678901',
                    email: 'maria.rodriguez@email.com',
                    phone: '(555) 567-8901',
                    address: '555 Family Care Dr, Miami, FL 33101',
                    medicalSchool: 'University of Miami School of Medicine',
                    residency: 'Jackson Memorial Hospital',
                    fellowship: '',
                    boardCertifications: ['American Board of Family Medicine'],
                    malpracticeInsurance: {
                        carrier: 'State Volunteer Mutual',
                        policyNumber: 'SVM-789012',
                        coverage: '$1,000,000',
                        expirationDate: '2024-12-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2025', comments: 'FL license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'ABFM certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'approved', message: 'Adequate coverage', comments: 'SVM policy active', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: 'No issues found', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2023-12-01', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2023-12-01', type: 'certification' },
                        { name: 'CV.pdf', uploadDate: '2023-12-01', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-006',
                    name: 'Dr. James Wilson',
                    specialty: 'Emergency Medicine',
                    market: 'TX',
                    status: 'In Progress',
                    assignedAnalyst: 'Sarah Johnson',
                    submissionDate: '2024-01-30',
                    networkImpact: 'High',
                    workExperience: 10,
                    npiNumber: '1234567895',
                    licenseNumber: 'TX-MD-67890',
                    deaNumber: 'BM6789012',
                    email: 'james.wilson@email.com',
                    phone: '(555) 678-9012',
                    address: '777 Emergency Blvd, Dallas, TX 75201',
                    medicalSchool: 'UT Southwestern Medical School',
                    residency: 'Parkland Hospital',
                    fellowship: '',
                    boardCertifications: ['American Board of Emergency Medicine'],
                    malpracticeInsurance: {
                        carrier: 'ISMIE Mutual',
                        policyNumber: 'ISM-890123',
                        coverage: '$2,000,000',
                        expirationDate: '2024-08-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid', comments: 'TX license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: '', requiresVerification: false },
                        { id: 3, name: 'DEA License', title: 'DEA Registration', description: 'Drug Enforcement Administration registration', status: 'pending', message: '', comments: '', requiresVerification: true },
                        { id: 4, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-30', type: 'license' },
                        { name: 'CV.pdf', uploadDate: '2024-01-30', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-007',
                    name: 'Dr. Lisa Thompson',
                    specialty: 'Dermatology',
                    market: 'CA',
                    status: 'Denied',
                    assignedAnalyst: 'John Smith',
                    submissionDate: '2023-11-15',
                    deniedDate: '2024-01-10',
                    deniedReason: 'Malpractice history concerns',
                    networkImpact: 'Medium',
                    workExperience: 14,
                    npiNumber: '1234567896',
                    licenseNumber: 'CA-MD-78901',
                    deaNumber: 'BM7890123',
                    email: 'lisa.thompson@email.com',
                    phone: '(555) 789-0123',
                    address: '999 Skin Care Center, Beverly Hills, CA 90210',
                    medicalSchool: 'Stanford University School of Medicine',
                    residency: 'Stanford Hospital',
                    fellowship: 'UCSF Dermatology',
                    boardCertifications: ['American Board of Dermatology'],
                    malpracticeInsurance: {
                        carrier: 'Allied World',
                        policyNumber: 'AW-901234',
                        coverage: '$1,500,000',
                        expirationDate: '2024-06-30'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid', comments: '', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: '', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'flagged', message: 'Multiple claims history', comments: 'Review committee flagged multiple claims', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2023-11-15', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2023-11-15', type: 'certification' },
                        { name: 'CV.pdf', uploadDate: '2023-11-15', type: 'resume' }
                    ]
                },
                // Additional providers for better data variety
                {
                    id: 'PROV-008',
                    name: 'Dr. Kevin Park',
                    specialty: 'Psychiatry',
                    market: 'NY',
                    status: 'In Progress',
                    assignedAnalyst: 'Mike Wilson',
                    submissionDate: '2024-02-01',
                    networkImpact: 'Medium',
                    workExperience: 7,
                    npiNumber: '1234567897',
                    licenseNumber: 'NY-MD-89012',
                    deaNumber: 'BM8901234',
                    email: 'kevin.park@email.com',
                    phone: '(555) 890-1234',
                    address: '123 Mental Health Ave, Albany, NY 12207',
                    medicalSchool: 'NYU School of Medicine',
                    residency: 'Bellevue Hospital',
                    fellowship: 'Mount Sinai',
                    boardCertifications: ['American Board of Psychiatry and Neurology'],
                    malpracticeInsurance: {
                        carrier: 'Medical Mutual',
                        policyNumber: 'MM-012345',
                        coverage: '$1,200,000',
                        expirationDate: '2024-11-15'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid', comments: 'NY license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: 'Awaiting ABPN verification', requiresVerification: false },
                        { id: 3, name: 'DEA License', title: 'DEA Registration', description: 'Drug Enforcement Administration registration', status: 'approved', message: 'Valid through 2025', comments: 'DEA verified', requiresVerification: true },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-02-01', type: 'license' },
                        { name: 'DEA Certificate.pdf', uploadDate: '2024-02-01', type: 'license' },
                        { name: 'CV.pdf', uploadDate: '2024-02-01', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-009',
                    name: 'Dr. Amanda Foster',
                    specialty: 'Anesthesiology',
                    market: 'CA',
                    status: 'Committee Review',
                    assignedAnalyst: 'Sarah Johnson',
                    submissionDate: '2024-01-20',
                    flaggedDate: '2024-01-25',
                    flaggedBy: 'Sarah Johnson',
                    flaggedForCommittee: true,
                    flaggedReason: 'Previous malpractice claim requires review',
                    networkImpact: 'High',
                    workExperience: 11,
                    npiNumber: '1234567898',
                    licenseNumber: 'CA-MD-90123',
                    deaNumber: 'BF9012345',
                    email: 'amanda.foster@email.com',
                    phone: '(555) 901-2345',
                    address: '456 Surgery Center, Los Angeles, CA 90028',
                    medicalSchool: 'USC Keck School of Medicine',
                    residency: 'LAC+USC Medical Center',
                    fellowship: 'UCLA Medical Center',
                    boardCertifications: ['American Board of Anesthesiology'],
                    malpracticeInsurance: {
                        carrier: 'Zurich North America',
                        policyNumber: 'ZNA-123456',
                        coverage: '$3,500,000',
                        expirationDate: '2024-07-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2025', comments: 'CA license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'ABA certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'flagged', message: 'Previous claim history', comments: 'One claim in 2022 - requires committee review', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: 'No exclusions found', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-20', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-20', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2024-01-20', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2024-01-20', type: 'resume' },
                        { name: 'Malpractice Claim Details.pdf', uploadDate: '2024-01-20', type: 'other' }
                    ]
                },
                {
                    id: 'PROV-010',
                    name: 'Dr. David Kumar',
                    specialty: 'Radiology',
                    market: 'TX',
                    status: 'Approved',
                    assignedAnalyst: 'Jane Doe',
                    submissionDate: '2023-12-15',
                    approvedDate: '2024-01-20',
                    networkImpact: 'Medium',
                    workExperience: 13,
                    npiNumber: '1234567899',
                    licenseNumber: 'TX-MD-01234',
                    deaNumber: 'BK0123456',
                    email: 'david.kumar@email.com',
                    phone: '(555) 012-3456',
                    address: '789 Imaging Center, Houston, TX 77054',
                    medicalSchool: 'UT Health Science Center',
                    residency: 'MD Anderson Cancer Center',
                    fellowship: 'Johns Hopkins',
                    boardCertifications: ['American Board of Radiology - Diagnostic Radiology'],
                    malpracticeInsurance: {
                        carrier: 'ProAssurance',
                        policyNumber: 'PA-234567',
                        coverage: '$1,800,000',
                        expirationDate: '2024-12-15'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2026', comments: 'TX license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'ABR certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'approved', message: 'Adequate coverage', comments: 'ProAssurance policy active', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: 'Background verified', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2023-12-15', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2023-12-15', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2023-12-15', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2023-12-15', type: 'resume' },
                        { name: 'Fellowship Certificate.pdf', uploadDate: '2023-12-15', type: 'certification' }
                    ]
                },
                {
                    id: 'PROV-011',
                    name: 'Dr. Jennifer Adams',
                    specialty: 'Neurology',
                    market: 'NY',
                    status: 'Initiated',
                    assignedAnalyst: 'Sarah Johnson',
                    submissionDate: '2024-02-05',
                    networkImpact: 'High',
                    workExperience: 18,
                    npiNumber: '1234567900',
                    licenseNumber: 'NY-MD-11111',
                    deaNumber: 'BN1111111',
                    email: 'jennifer.adams@email.com',
                    phone: '(555) 111-1111',
                    address: '111 Neuro Center, New York, NY 10001',
                    medicalSchool: 'Mount Sinai School of Medicine',
                    residency: 'NYU Langone Medical Center',
                    fellowship: 'Mayo Clinic',
                    boardCertifications: ['American Board of Neurology'],
                    malpracticeInsurance: {
                        carrier: 'Physicians Insurance',
                        policyNumber: 'PI-111111',
                        coverage: '$2,500,000',
                        expirationDate: '2024-11-30'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'pending', message: '', comments: '', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: '', requiresVerification: false },
                        { id: 3, name: 'DEA License', title: 'DEA Registration', description: 'Drug Enforcement Administration registration', status: 'pending', message: '', comments: '', requiresVerification: true },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-02-05', type: 'license' },
                        { name: 'CV.pdf', uploadDate: '2024-02-05', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-012',
                    name: 'Dr. Robert Taylor',
                    specialty: 'Oncology',
                    market: 'TX',
                    status: 'In Progress',
                    assignedAnalyst: 'Mike Wilson',
                    submissionDate: '2024-01-28',
                    networkImpact: 'High',
                    workExperience: 22,
                    npiNumber: '1234567911',
                    licenseNumber: 'TX-MD-22222',
                    deaNumber: 'BT2222222',
                    email: 'robert.taylor@email.com',
                    phone: '(555) 222-2222',
                    address: '222 Cancer Center, Houston, TX 77030',
                    medicalSchool: 'MD Anderson Cancer Center',
                    residency: 'Memorial Sloan Kettering',
                    fellowship: 'Johns Hopkins',
                    boardCertifications: ['American Board of Internal Medicine - Oncology'],
                    malpracticeInsurance: {
                        carrier: 'NORCAL Mutual',
                        policyNumber: 'NC-222222',
                        coverage: '$3,000,000',
                        expirationDate: '2024-10-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2026', comments: 'TX license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'Oncology certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'pending', message: '', comments: '', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-28', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-28', type: 'certification' },
                        { name: 'CV.pdf', uploadDate: '2024-01-28', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-013',
                    name: 'Dr. Michelle Brown',
                    specialty: 'Gastroenterology',
                    market: 'FL',
                    status: 'Committee Review',
                    assignedAnalyst: 'Jane Doe',
                    submissionDate: '2024-01-12',
                    flaggedDate: '2024-01-20',
                    flaggedBy: 'Jane Doe',
                    flaggedForCommittee: true,
                    flaggedReason: 'Foreign medical graduate requires additional review',
                    networkImpact: 'Medium',
                    workExperience: 9,
                    npiNumber: '1234567922',
                    licenseNumber: 'FL-MD-33333',
                    deaNumber: 'BM3333333',
                    email: 'michelle.brown@email.com',
                    phone: '(555) 333-3333',
                    address: '333 Digestive Health Center, Miami, FL 33101',
                    medicalSchool: 'University of Toronto Faculty of Medicine',
                    residency: 'Jackson Memorial Hospital',
                    fellowship: 'Cleveland Clinic',
                    boardCertifications: ['American Board of Internal Medicine - Gastroenterology'],
                    malpracticeInsurance: {
                        carrier: 'The Doctors Company',
                        policyNumber: 'TDC-333333',
                        coverage: '$2,000,000',
                        expirationDate: '2024-09-30'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid', comments: 'FL license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: '', requiresVerification: false },
                        { id: 3, name: 'Education Verification', title: 'Medical Education Verification', description: 'Foreign medical graduate education verification', status: 'flagged', message: 'ECFMG certification required', comments: 'Need ECFMG certificate verification', requiresVerification: true },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-12', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-12', type: 'certification' },
                        { name: 'ECFMG Certificate.pdf', uploadDate: '2024-01-12', type: 'education' },
                        { name: 'CV.pdf', uploadDate: '2024-01-12', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-014',
                    name: 'Dr. William Davis',
                    specialty: 'Orthopedic Surgery',
                    market: 'CA',
                    status: 'Approved',
                    assignedAnalyst: 'John Smith',
                    submissionDate: '2023-12-20',
                    approvedDate: '2024-01-25',
                    networkImpact: 'High',
                    workExperience: 16,
                    npiNumber: '1234567933',
                    licenseNumber: 'CA-MD-44444',
                    deaNumber: 'BW4444444',
                    email: 'william.davis@email.com',
                    phone: '(555) 444-4444',
                    address: '444 Orthopedic Institute, San Diego, CA 92101',
                    medicalSchool: 'UCSF School of Medicine',
                    residency: 'UCSF Medical Center',
                    fellowship: 'Hospital for Special Surgery',
                    boardCertifications: ['American Board of Orthopaedic Surgery'],
                    malpracticeInsurance: {
                        carrier: 'Medical Mutual',
                        policyNumber: 'MM-444444',
                        coverage: '$2,500,000',
                        expirationDate: '2024-12-20'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2025', comments: 'CA license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'ABOS certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'approved', message: 'Adequate coverage', comments: 'Policy active and adequate', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: 'No issues found', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2023-12-20', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2023-12-20', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2023-12-20', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2023-12-20', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-015',
                    name: 'Dr. Patricia Wilson',
                    specialty: 'Radiology',
                    market: 'NY',
                    status: 'In Progress',
                    assignedAnalyst: 'Sarah Johnson',
                    submissionDate: '2024-02-01',
                    networkImpact: 'Medium',
                    workExperience: 11,
                    npiNumber: '1234567944',
                    licenseNumber: 'NY-MD-55555',
                    deaNumber: 'BP5555555',
                    email: 'patricia.wilson@email.com',
                    phone: '(555) 555-5555',
                    address: '555 Imaging Center, Rochester, NY 14604',
                    medicalSchool: 'University of Rochester School of Medicine',
                    residency: 'Strong Memorial Hospital',
                    fellowship: 'Massachusetts General Hospital',
                    boardCertifications: ['American Board of Radiology'],
                    malpracticeInsurance: {
                        carrier: 'Coverys',
                        policyNumber: 'CV-555555',
                        coverage: '$1,800,000',
                        expirationDate: '2024-08-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid', comments: 'NY license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: 'Awaiting ABR verification', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'pending', message: '', comments: '', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-02-01', type: 'license' },
                        { name: 'CV.pdf', uploadDate: '2024-02-01', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-016',
                    name: 'Dr. Christopher Miller',
                    specialty: 'Pulmonology',
                    market: 'TX',
                    status: 'Denied',
                    assignedAnalyst: 'Mike Wilson',
                    submissionDate: '2024-01-05',
                    deniedDate: '2024-01-30',
                    deniedReason: 'Incomplete documentation and licensing issues',
                    networkImpact: 'Low',
                    workExperience: 5,
                    npiNumber: '1234567955',
                    licenseNumber: 'TX-MD-66666',
                    deaNumber: 'BC6666666',
                    email: 'christopher.miller@email.com',
                    phone: '(555) 666-6666',
                    address: '666 Respiratory Care Center, Dallas, TX 75201',
                    medicalSchool: 'UT Southwestern Medical School',
                    residency: 'Parkland Hospital',
                    fellowship: '',
                    boardCertifications: ['American Board of Internal Medicine - Pulmonary Disease'],
                    malpracticeInsurance: {
                        carrier: 'State Volunteer Mutual',
                        policyNumber: 'SVM-666666',
                        coverage: '$1,200,000',
                        expirationDate: '2024-06-30'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'flagged', message: 'License suspension history', comments: 'Previous 30-day suspension in 2022', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: 'Incomplete application', requiresVerification: false },
                        { id: 3, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'flagged', message: 'Multiple issues found', comments: 'Licensing board actions and malpractice claims', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-05', type: 'license' },
                        { name: 'CV.pdf', uploadDate: '2024-01-05', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-017',
                    name: 'Dr. Emily Williams',
                    specialty: 'Pediatric Emergency Medicine',
                    market: 'FL',
                    status: 'Initiated',
                    assignedAnalyst: 'Jane Doe',
                    submissionDate: '2024-02-10',
                    networkImpact: 'Medium',
                    workExperience: 14,
                    npiNumber: '1234567966',
                    licenseNumber: 'FL-MD-77777',
                    deaNumber: 'BG7777777',
                    email: 'barbara.garcia@email.com',
                    phone: '(555) 777-7777',
                    address: '777 Diabetes Center, Tampa, FL 33602',
                    medicalSchool: 'University of Florida College of Medicine',
                    residency: 'Shands Hospital',
                    fellowship: 'Joslin Diabetes Center',
                    boardCertifications: ['American Board of Internal Medicine - Endocrinology'],
                    malpracticeInsurance: {
                        carrier: 'ISMIE Mutual',
                        policyNumber: 'ISM-777777',
                        coverage: '$2,000,000',
                        expirationDate: '2024-12-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'pending', message: '', comments: '', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: '', requiresVerification: false },
                        { id: 3, name: 'DEA License', title: 'DEA Registration', description: 'Drug Enforcement Administration registration', status: 'pending', message: '', comments: '', requiresVerification: true },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-02-10', type: 'license' }
                    ]
                },
                {
                    id: 'PROV-018',
                    name: 'Dr. Steven Martinez',
                    specialty: 'Urology',
                    market: 'CA',
                    status: 'Committee Review',
                    assignedAnalyst: 'John Smith',
                    submissionDate: '2024-01-18',
                    flaggedDate: '2024-01-26',
                    flaggedBy: 'John Smith',
                    flaggedForCommittee: true,
                    flaggedReason: 'High-risk specialty requires committee approval',
                    networkImpact: 'High',
                    workExperience: 19,
                    npiNumber: '1234567977',
                    licenseNumber: 'CA-MD-88888',
                    deaNumber: 'BS8888888',
                    email: 'steven.martinez@email.com',
                    phone: '(555) 888-8888',
                    address: '888 Urology Associates, Los Angeles, CA 90210',
                    medicalSchool: 'UCLA School of Medicine',
                    residency: 'UCLA Medical Center',
                    fellowship: 'MD Anderson Cancer Center',
                    boardCertifications: ['American Board of Urology'],
                    malpracticeInsurance: {
                        carrier: 'Allied World',
                        policyNumber: 'AW-888888',
                        coverage: '$3,500,000',
                        expirationDate: '2024-07-31'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2025', comments: 'CA license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'AUB certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'flagged', message: 'High-risk specialty coverage review', comments: 'Requires committee review for high-risk procedures', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: 'No issues found', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-01-18', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2024-01-18', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2024-01-18', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2024-01-18', type: 'resume' },
                        { name: 'Procedure Volume Report.pdf', uploadDate: '2024-01-18', type: 'other' }
                    ]
                },
                {
                    id: 'PROV-019',
                    name: 'Dr. Nancy Anderson',
                    specialty: 'Pathology',
                    market: 'NY',
                    status: 'Approved',
                    assignedAnalyst: 'Sarah Johnson',
                    submissionDate: '2023-12-28',
                    approvedDate: '2024-02-02',
                    networkImpact: 'Low',
                    workExperience: 25,
                    npiNumber: '1234567988',
                    licenseNumber: 'NY-MD-99999',
                    deaNumber: 'BN9999999',
                    email: 'nancy.anderson@email.com',
                    phone: '(555) 999-9999',
                    address: '999 Pathology Lab, Buffalo, NY 14201',
                    medicalSchool: 'SUNY Buffalo School of Medicine',
                    residency: 'Erie County Medical Center',
                    fellowship: 'Roswell Park Cancer Institute',
                    boardCertifications: ['American Board of Pathology - Anatomic Pathology'],
                    malpracticeInsurance: {
                        carrier: 'ProAssurance',
                        policyNumber: 'PA-999999',
                        coverage: '$1,500,000',
                        expirationDate: '2024-12-28'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid through 2026', comments: 'NY license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'approved', message: 'Current', comments: 'Pathology certification current', requiresVerification: false },
                        { id: 3, name: 'Malpractice Insurance', title: 'Malpractice Insurance', description: 'Professional liability insurance verification', status: 'approved', message: 'Adequate coverage', comments: 'ProAssurance policy active', requiresVerification: false },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'approved', message: 'Clear', comments: 'Background verified', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2023-12-28', type: 'license' },
                        { name: 'Board Certification.pdf', uploadDate: '2023-12-28', type: 'certification' },
                        { name: 'Insurance Policy.pdf', uploadDate: '2023-12-28', type: 'insurance' },
                        { name: 'CV.pdf', uploadDate: '2023-12-28', type: 'resume' }
                    ]
                },
                {
                    id: 'PROV-020',
                    name: 'Dr. Daniel Thompson',
                    specialty: 'Emergency Medicine',
                    market: 'TX',
                    status: 'In Progress',
                    assignedAnalyst: 'Mike Wilson',
                    submissionDate: '2024-02-03',
                    networkImpact: 'High',
                    workExperience: 8,
                    npiNumber: '1234567999',
                    licenseNumber: 'TX-MD-00000',
                    deaNumber: 'BD0000000',
                    email: 'daniel.thompson@email.com',
                    phone: '(555) 000-0000',
                    address: '1000 Emergency Department, Austin, TX 78701',
                    medicalSchool: 'UT Health Science Center',
                    residency: 'Dell Seton Medical Center',
                    fellowship: '',
                    boardCertifications: ['American Board of Emergency Medicine'],
                    malpracticeInsurance: {
                        carrier: 'Zurich North America',
                        policyNumber: 'ZNA-000000',
                        coverage: '$2,000,000',
                        expirationDate: '2024-11-30'
                    },
                    checklist: [
                        { id: 1, name: 'Medical License', title: 'Medical License Verification', description: 'Primary state medical license verification', status: 'approved', message: 'Valid', comments: 'TX license verified', requiresVerification: true },
                        { id: 2, name: 'Board Certification', title: 'Board Certification Verification', description: 'Specialty board certification verification', status: 'pending', message: '', comments: 'Awaiting ABEM verification', requiresVerification: false },
                        { id: 3, name: 'DEA License', title: 'DEA Registration', description: 'Drug Enforcement Administration registration', status: 'approved', message: 'Valid through 2025', comments: 'DEA verified', requiresVerification: true },
                        { id: 4, name: 'Background Check', title: 'Background Screening', description: 'Criminal background and OIG exclusion check', status: 'pending', message: '', comments: '', requiresVerification: false }
                    ],
                    documents: [
                        { name: 'Medical License.pdf', uploadDate: '2024-02-03', type: 'license' },
                        { name: 'DEA Certificate.pdf', uploadDate: '2024-02-03', type: 'license' },
                        { name: 'CV.pdf', uploadDate: '2024-02-03', type: 'resume' }
                    ]
                }
            ];

            this.checklists = [

            ];

            this.auditLogs = [
                {
                    id: 'audit-001',
                    providerId: 'PROV-001',
                    providerName: 'Dr. Sarah Martinez',
                    action: 'Application submitted',
                    user: 'Dr. Sarah Martinez',
                    timestamp: '2024-01-15T10:00:00Z',
                    details: { source: 'Provider Portal', status: 'Initiated' }
                },
                {
                    id: 'audit-002',
                    providerId: 'PROV-001',
                    providerName: 'Dr. Sarah Martinez',
                    action: 'Application assigned to analyst',
                    user: 'System',
                    timestamp: '2024-01-15T10:05:00Z',
                    details: { assignedTo: 'John Smith' }
                },
                {
                    id: 'audit-003',
                    providerId: 'PROV-002',
                    providerName: 'Dr. Michael Chen',
                    action: 'Application submitted',
                    user: 'Dr. Michael Chen',
                    timestamp: '2024-01-20T09:30:00Z',
                    details: { source: 'Provider Portal', status: 'Initiated' }
                },
                {
                    id: 'audit-004',
                    providerId: 'PROV-003',
                    providerName: 'Dr. Emily Johnson',
                    action: 'Medical License approved',
                    user: 'John Smith',
                    timestamp: '2024-01-12T14:20:00Z',
                    details: { checklistItem: 'Medical License', previousStatus: 'pending', newStatus: 'approved' }
                },
                {
                    id: 'audit-005',
                    providerId: 'PROV-003',
                    providerName: 'Dr. Emily Johnson',
                    action: 'Application flagged for committee review',
                    user: 'John Smith',
                    timestamp: '2024-01-18T16:45:00Z',
                    details: { reason: 'Malpractice insurance coverage requires review' }
                },
                {
                    id: 'audit-006',
                    providerId: 'PROV-005',
                    providerName: 'Dr. Maria Rodriguez',
                    action: 'Application approved by committee',
                    user: 'Committee Chair',
                    timestamp: '2024-01-05T11:30:00Z',
                    details: { decision: 'approved', finalStatus: 'Approved' }
                },
                {
                    id: 'audit-007',
                    providerId: 'PROV-007',
                    providerName: 'Dr. Lisa Thompson',
                    action: 'Application denied by committee',
                    user: 'Committee Chair',
                    timestamp: '2024-01-10T15:20:00Z',
                    details: { decision: 'denied', reason: 'Malpractice history concerns', finalStatus: 'Denied' }
                },
                {
                    id: 'audit-008',
                    providerId: 'PROV-009',
                    providerName: 'Dr. Amanda Foster',
                    action: 'Malpractice Insurance flagged',
                    user: 'Sarah Johnson',
                    timestamp: '2024-01-22T13:15:00Z',
                    details: { checklistItem: 'Malpractice Insurance', previousStatus: 'pending', newStatus: 'flagged', reason: 'Previous claim history' }
                },
                {
                    id: 'audit-009',
                    providerId: 'PROV-010',
                    providerName: 'Dr. David Kumar',
                    action: 'All checklist items completed',
                    user: 'Jane Doe',
                    timestamp: '2024-01-18T10:45:00Z',
                    details: { completedItems: 4, totalItems: 4 }
                },
                {
                    id: 'audit-010',
                    providerId: 'PROV-006',
                    providerName: 'Dr. James Wilson',
                    action: 'Medical License verified',
                    user: 'Sarah Johnson',
                    timestamp: '2024-01-31T09:20:00Z',
                    details: { checklistItem: 'Medical License', previousStatus: 'pending', newStatus: 'approved' }
                }
            ];

            this.saveToStorage();
        } else {
            this.loadFromStorage();
        }
    }

    saveToStorage() {
        localStorage.setItem('credentialing_providers', JSON.stringify(this.providers));
        localStorage.setItem('credentialing_checklists', JSON.stringify(this.checklists));
        localStorage.setItem('credentialing_auditlogs', JSON.stringify(this.auditLogs));
    }

    loadFromStorage() {
        this.providers = JSON.parse(localStorage.getItem('credentialing_providers') || '[]');
        this.checklists = JSON.parse(localStorage.getItem('credentialing_checklists') || '[]');
        this.auditLogs = JSON.parse(localStorage.getItem('credentialing_auditlogs') || '[]');

        // Validate and fix provider checklists
        this.validateProviderChecklists();
    }

    // Validate and fix provider checklists to ensure they're always arrays
    validateProviderChecklists() {
        const defaultChecklist = [
            {
                id: 1,
                name: 'Medical License',
                title: 'Medical License Verification',
                description: 'Primary state medical license verification',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: true
            },
            {
                id: 2,
                name: 'Board Certification',
                title: 'Board Certification Verification',
                description: 'Specialty board certification verification',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: false
            },
            {
                id: 3,
                name: 'DEA License',
                title: 'DEA Registration',
                description: 'Drug Enforcement Administration registration',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: true
            },
            {
                id: 4,
                name: 'Malpractice Insurance',
                title: 'Malpractice Insurance',
                description: 'Professional liability insurance verification',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: false
            },
            {
                id: 5,
                name: 'Background Check',
                title: 'Background Screening',
                description: 'Criminal background and OIG exclusion check',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: false
            }
        ];

        let needsSave = false;
        this.providers.forEach(provider => {
            if (!provider.checklist || !Array.isArray(provider.checklist)) {
                provider.checklist = [...defaultChecklist];
                needsSave = true;
            }
        });

        if (needsSave) {
            this.saveToStorage();
        }
    }

    // Provider CRUD operations
    getProviders(filters = {}) {
        let filtered = [...this.providers];

        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }
        if (filters.specialty) {
            filtered = filtered.filter(p => p.specialty === filters.specialty);
        }
        if (filters.market) {
            filtered = filtered.filter(p => p.market === filters.market);
        }
        if (filters.assignedToMe && filters.currentAnalyst) {
            filtered = filtered.filter(p => p.assignedAnalyst === filters.currentAnalyst);
        }
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                if (filters.sortBy === 'networkImpact') {
                    const order = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return order[b.networkImpact] - order[a.networkImpact];
                }
                if (filters.sortBy === 'workExperience') {
                    return b.workExperience - a.workExperience;
                }
                if (filters.sortBy === 'submissionDate') {
                    return new Date(b.submissionDate) - new Date(a.submissionDate);
                }
                return a[filters.sortBy]?.localeCompare(b[filters.sortBy]);
            });
        }

        return filtered;
    }

    getProvider(id) {
        return this.providers.find(p => p.id === id);
    }

    updateProvider(id, updates) {
        const index = this.providers.findIndex(p => p.id === id);
        if (index !== -1) {
            this.providers[index] = { ...this.providers[index], ...updates };
            this.saveToStorage();
            return this.providers[index];
        }
        return null;
    }

    updateProviderChecklist(providerId, checklistItem) {
        const provider = this.getProvider(providerId);
        if (provider && provider.checklist && Array.isArray(provider.checklist)) {
            const itemIndex = provider.checklist.findIndex(item => item.id === checklistItem.id);
            if (itemIndex !== -1) {
                provider.checklist[itemIndex] = checklistItem;
                this.saveToStorage();
                return provider;
            }
        }
        return null;
    }

    // Add a new provider
    addProvider(providerData) {
        // Generate a unique ID
        const newId = `PROV-${String(this.providers.length + 1).padStart(3, '0')}`;

        // Create default checklist items
        const defaultChecklist = [
            {
                id: 1,
                name: 'Medical License',
                title: 'Medical License Verification',
                description: 'Primary state medical license verification',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: true
            },
            {
                id: 2,
                name: 'Board Certification',
                title: 'Board Certification Verification',
                description: 'Specialty board certification verification',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: false
            },
            {
                id: 3,
                name: 'DEA License',
                title: 'DEA Registration',
                description: 'Drug Enforcement Administration registration',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: true
            },
            {
                id: 4,
                name: 'Malpractice Insurance',
                title: 'Malpractice Insurance',
                description: 'Professional liability insurance verification',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: false
            },
            {
                id: 5,
                name: 'Background Check',
                title: 'Background Screening',
                description: 'Criminal background and OIG exclusion check',
                status: 'pending',
                message: '',
                comments: '',
                requiresVerification: false
            }
        ];

        // Create the new provider with default values
        const newProvider = {
            id: newId,
            name: providerData.name || '',
            specialty: providerData.specialty || '',
            market: providerData.market || '',
            status: 'In Progress',
            assignedAnalyst: providerData.assignedAnalyst || 'Unassigned',
            submissionDate: new Date().toISOString().split('T')[0],
            networkImpact: providerData.networkImpact || 'Medium',
            workExperience: providerData.workExperience || 0,
            npiNumber: providerData.npiNumber || '',
            licenseNumber: providerData.licenseNumber || '',
            deaNumber: providerData.deaNumber || '',
            email: providerData.email || '',
            phone: providerData.phone || '',
            address: providerData.address || '',
            medicalSchool: providerData.medicalSchool || '',
            residency: providerData.residency || '',
            fellowship: providerData.fellowship || '',
            boardCertifications: providerData.boardCertifications || [],
            malpracticeInsurance: providerData.malpracticeInsurance || {
                carrier: '',
                policyNumber: '',
                coverage: '',
                expirationDate: ''
            },
            checklist: defaultChecklist,
            documents: providerData.documents || [],
            ...providerData // Allow override of any default values
        };

        // Add to providers array
        this.providers.push(newProvider);

        // Save to storage
        this.saveToStorage();

        return newProvider;
    }

    // Checklist CRUD operations
    getChecklists(filters = {}) {
        let filtered = [...this.checklists];

        if (filters.state) {
            filtered = filtered.filter(c => c.state === filters.state);
        }
        if (filters.specialty) {
            filtered = filtered.filter(c => c.specialty === filters.specialty);
        }

        return filtered;
    }

    getChecklist(id) {
        return this.checklists.find(c => c.id === id);
    }

    getChecklistByProviderId(providerId) {
        // For this mock implementation, we'll return the provider's embedded checklist
        // In a real application, this would query a separate checklist table
        const provider = this.getProvider(providerId);
        if (provider && provider.checklist && Array.isArray(provider.checklist)) {
            return {
                id: `checklist-${providerId}`,
                providerId: providerId,
                items: provider.checklist,
                totalItems: provider.checklist.length,
                completedItems: provider.checklist.filter(item => item.status === 'approved').length,
                pendingItems: provider.checklist.filter(item => item.status === 'pending').length,
                flaggedItems: provider.checklist.filter(item => item.status === 'flagged').length,
                lastUpdated: new Date().toISOString()
            };
        }
        return null;
    }

    addChecklist(checklist) {
        const newChecklist = {
            ...checklist,
            id: `CL-${String(this.checklists.length + 1).padStart(3, '0')}`,
            createdDate: new Date().toISOString().split('T')[0]
        };
        this.checklists.push(newChecklist);
        this.saveToStorage();
        return newChecklist;
    }

    updateChecklist(id, updates) {
        const index = this.checklists.findIndex(c => c.id === id);
        if (index !== -1) {
            this.checklists[index] = { ...this.checklists[index], ...updates };
            this.saveToStorage();
            return this.checklists[index];
        }
        return null;
    }

    // Add audit log entry
    addAuditLog(logEntry) {
        const newLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...logEntry
        };
        this.auditLogs.push(newLog);
        this.saveToStorage();
        return newLog;
    }

    // Get audit logs for dashboard
    getAuditLogs(providerId = null) {
        // Start with stored audit logs
        let allLogs = [...this.auditLogs];

        // Filter by provider ID if specified
        if (providerId) {
            allLogs = allLogs.filter(log => log.providerId === providerId);
        }

        // Add some dynamic logs from current state
        this.providers.forEach(provider => {
            // Skip if filtering by provider ID and this isn't the one
            if (providerId && provider.id !== providerId) return;

            // Add recent checklist updates - check if checklist exists and is an array
            if (provider.checklist && Array.isArray(provider.checklist)) {
                provider.checklist.forEach(item => {
                    if (item.status === 'approved' || item.status === 'flagged') {
                        allLogs.push({
                            id: `dynamic-${provider.id}-${item.id}`,
                            providerId: provider.id,
                            providerName: provider.name,
                            action: `${item.name} ${item.status}`,
                            user: provider.assignedAnalyst,
                            timestamp: new Date().toISOString(),
                            details: { checklistItem: item.name, status: item.status, message: item.message }
                        });
                    }
                });
            }
        });

        // Sort by timestamp (most recent first) and return
        return allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Export audit logs to CSV
    exportAuditLogs(providerId = null) {
        const logs = providerId ?
            this.getAuditLogs().filter(log => log.providerId === providerId) :
            this.getAuditLogs();

        const csvHeaders = ['ID', 'Date/Time', 'Provider ID', 'Provider Name', 'Action', 'User', 'Details'];
        const csvRows = logs.map(log => [
            log.id,
            new Date(log.timestamp).toLocaleString(),
            log.providerId || '',
            log.providerName || '',
            log.action,
            log.user,
            JSON.stringify(log.details || {})
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // Download audit logs as CSV file
    downloadAuditLogs(providerId = null) {
        const csvContent = this.exportAuditLogs(providerId);
        const filename = providerId ?
            `audit_logs_${providerId}_${new Date().toISOString().split('T')[0]}.csv` :
            `audit_logs_all_${new Date().toISOString().split('T')[0]}.csv`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        return filename;
    }

    // Generate audit logs
    generateAuditLog(providerId) {
        const provider = this.getProvider(providerId);
        if (!provider) return null;

        return {
            providerId: provider.id,
            providerName: provider.name,
            generatedDate: new Date().toISOString(),
            status: provider.status,
            checklist: provider.checklist,
            timeline: [
                { date: provider.submissionDate, action: 'Application Submitted', user: 'System' },
                { date: '2024-01-16', action: 'Assigned to Analyst', user: provider.assignedAnalyst },
                { date: '2024-01-18', action: 'Initial Review Completed', user: provider.assignedAnalyst },
                { date: new Date().toISOString().split('T')[0], action: 'Audit Log Generated', user: 'Current User' }
            ]
        };
    }
}

export default new MockDatabase();
