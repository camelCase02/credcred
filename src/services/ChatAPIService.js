// Mock Chat API Service
class ChatAPIService {
    static async sendMessage(message, providerId, context) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Generate contextual responses based on the message content
        const responses = this.generateContextualResponse(message, context);

        return {
            response: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
            confidence: 0.85 + Math.random() * 0.15
        };
    }

    static generateContextualResponse(message, context) {
        const lowerMessage = message.toLowerCase();

        // Status-related questions
        if (lowerMessage.includes('status')) {
            return [
                `${context.providerName} is currently in "${context.status}" status. This means the application is ${this.getStatusDescription(context.status)}.`,
                `The current status for this application is "${context.status}". ${this.getNextSteps(context.status)}`,
                `Based on the records, ${context.providerName}'s application status is "${context.status}". ${this.getStatusTimeline(context.status)}`
            ];
        }

        // Document-related questions
        if (lowerMessage.includes('document') || lowerMessage.includes('pending')) {
            const pendingItems = context.checklist?.filter(item => item.status === 'pending') || [];
            if (pendingItems.length > 0) {
                return [
                    `There are ${pendingItems.length} pending document(s): ${pendingItems.map(item => item.name).join(', ')}.`,
                    `The following documents still need attention: ${pendingItems.slice(0, 3).map(item => item.name).join(', ')}${pendingItems.length > 3 ? ' and others' : ''}.`,
                    `Currently waiting for ${pendingItems.length} items to be completed: ${pendingItems.map(item => item.name).join(', ')}.`
                ];
            } else {
                return [
                    "All required documents have been submitted and verified.",
                    "No pending documents at this time. All checklist items are complete.",
                    "All documentation requirements have been satisfied."
                ];
            }
        }

        // Next steps questions
        if (lowerMessage.includes('next step') || lowerMessage.includes('what to do')) {
            return [
                this.getNextSteps(context.status),
                `For ${context.providerName}, the next step would be: ${this.getNextSteps(context.status)}`,
                `Based on the current status, here's what needs to happen next: ${this.getNextSteps(context.status)}`
            ];
        }

        // Checklist questions
        if (lowerMessage.includes('checklist') || lowerMessage.includes('completion')) {
            const total = context.checklist?.length || 0;
            const completed = context.checklist?.filter(item => item.status === 'completed')?.length || 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            return [
                `The checklist is ${percentage}% complete (${completed} of ${total} items finished).`,
                `Progress: ${completed} out of ${total} checklist items have been completed (${percentage}%).`,
                `Checklist completion status: ${percentage}% done. ${total - completed} items remaining.`
            ];
        }

        // Timeline questions
        if (lowerMessage.includes('timeline') || lowerMessage.includes('when') || lowerMessage.includes('expect')) {
            return [
                `Based on the current status and specialty (${context.specialty}), typical processing time is ${this.getEstimatedTimeline(context.status, context.specialty)}.`,
                `For ${context.specialty} providers in "${context.status}" status, the expected timeline is ${this.getEstimatedTimeline(context.status, context.specialty)}.`,
                `Estimated completion timeframe: ${this.getEstimatedTimeline(context.status, context.specialty)}, depending on document completeness and committee availability.`
            ];
        }

        // Blocker/issue questions
        if (lowerMessage.includes('blocker') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
            const issues = this.identifyPotentialIssues(context);
            if (issues.length > 0) {
                return [
                    `Potential issues identified: ${issues.join(', ')}.`,
                    `There may be some concerns with: ${issues.join(', ')}. I recommend reviewing these areas.`,
                    `Current challenges: ${issues.join(', ')}. These should be addressed to expedite the process.`
                ];
            } else {
                return [
                    "No significant blockers detected at this time.",
                    "The application appears to be progressing normally without major issues.",
                    "No critical issues identified. The process is moving forward as expected."
                ];
            }
        }

        // Specialty-specific questions
        if (lowerMessage.includes(context.specialty?.toLowerCase())) {
            return [
                `For ${context.specialty} providers, we typically focus on ${this.getSpecialtyRequirements(context.specialty)}.`,
                `${context.specialty} credentialing usually requires ${this.getSpecialtyRequirements(context.specialty)}.`,
                `Specific to ${context.specialty}, the key requirements include ${this.getSpecialtyRequirements(context.specialty)}.`
            ];
        }

        // General questions
        return [
            `I can help you with information about ${context.providerName}'s credentialing application. What specific aspect would you like to know more about?`,
            `This application for ${context.providerName} (${context.specialty}) is currently being processed. How can I assist you further?`,
            `I have access to ${context.providerName}'s application details. Please let me know what specific information you need.`,
            `For more detailed analysis of ${context.providerName}'s application, please specify what you'd like to review.`,
            `I can provide insights on the credentialing process for ${context.providerName}. What would you like to explore?`
        ];
    }

    static getStatusDescription(status) {
        const descriptions = {
            'Initiated': 'in the initial submission phase',
            'In Progress': 'being actively reviewed and verified',
            'Committee Review': 'awaiting committee decision',
            'Approved': 'successfully approved for network participation',
            'Denied': 'not approved for network participation'
        };
        return descriptions[status] || 'being processed';
    }

    static getNextSteps(status) {
        const steps = {
            'Initiated': 'Complete all required documentation and submit for primary verification.',
            'In Progress': 'Await completion of verification processes and document reviews.',
            'Committee Review': 'Committee will review and make a decision on network participation.',
            'Approved': 'Complete final onboarding steps and begin seeing patients.',
            'Denied': 'Review denial reasons and consider appeal process if applicable.'
        };
        return steps[status] || 'Continue with standard processing procedures.';
    }

    static getStatusTimeline(status) {
        const timelines = {
            'Initiated': 'Initial review typically takes 5-7 business days.',
            'In Progress': 'Verification process usually takes 2-4 weeks.',
            'Committee Review': 'Committee decisions are typically made within 1-2 weeks.',
            'Approved': 'Onboarding can begin immediately.',
            'Denied': 'Appeal process, if pursued, takes 2-3 weeks.'
        };
        return timelines[status] || 'Processing times vary by complexity.';
    }

    static getEstimatedTimeline(status, specialty) {
        const baseTimelines = {
            'Initiated': '1-2 weeks',
            'In Progress': '2-4 weeks',
            'Committee Review': '1-2 weeks',
            'Approved': 'Complete',
            'Denied': 'Complete'
        };

        const specialtyModifiers = {
            'Cardiology': ' (may require additional subspecialty verification)',
            'Emergency Medicine': ' (expedited for critical need)',
            'Surgery': ' (requires additional procedure privileges review)',
            'Radiology': ' (includes equipment and facility verification)'
        };

        const baseTime = baseTimelines[status] || '2-4 weeks';
        const modifier = specialtyModifiers[specialty] || '';

        return baseTime + modifier;
    }

    static identifyPotentialIssues(context) {
        const issues = [];

        // Check for common issues
        if (context.checklist) {
            const pendingCount = context.checklist.filter(item => item.status === 'pending').length;
            if (pendingCount > 5) {
                issues.push('multiple pending documents');
            }

            const hasExpiredDocs = context.checklist.some(item =>
                item.name.toLowerCase().includes('license') && item.status === 'pending'
            );
            if (hasExpiredDocs) {
                issues.push('license verification delays');
            }
        }

        // Status-based issues
        if (context.status === 'In Progress') {
            const daysSinceSubmission = Math.floor(Math.random() * 30); // Simulate days
            if (daysSinceSubmission > 21) {
                issues.push('extended processing time');
            }
        }

        return issues;
    }

    static getSpecialtyRequirements(specialty) {
        const requirements = {
            'Cardiology': 'board certification, hospital privileges, and subspecialty training verification',
            'Emergency Medicine': 'board certification, ACLS/ATLS certifications, and trauma experience',
            'Surgery': 'board certification, operative experience, and hospital privilege verification',
            'Family Medicine': 'board certification and primary care experience verification',
            'Internal Medicine': 'board certification and hospital affiliations',
            'Pediatrics': 'board certification and pediatric hospital privileges',
            'Radiology': 'board certification, equipment training, and facility accreditation'
        };
        return requirements[specialty] || 'standard board certification and experience verification';
    }
}

export default ChatAPIService;
