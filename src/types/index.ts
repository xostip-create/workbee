export interface UserAccount {
    id: string;
    email: string;
    role: 'worker' | 'customer' | 'admin';
    createdAt: string; // ISO date string
    userProfileId: string;
}

export interface UserProfile {
    id: string;
    fullName: string;
    profilePhoto?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    address?: string;
    userAccountId: string;
}

export interface WorkerProfile {
    id: string;
    governmentIdUrl?: string;
    cvUrl?: string;
    certificatesUrl?: string;
    videoUrl?: string;
    availability: string;
    status: 'Pending Approval' | 'Approved' | 'Suspended' | 'Blocked';
    skillCategoryIds: string[];
    userProfileId: string;
    userAccountId: string; // Denormalized for rules
}

export interface CustomerProfile {
    id:string;
    isVerified: boolean;
    userProfileId: string;
    userAccountId: string; // Denormalized for rules
}

export interface SkillCategory {
    id: string;
    name: string;
}

export type DisplayWorker = {
    id: string; // user id
    name: string;
    location?: string;
    skills: string[];
    rating: number; // Placeholder for now
    avatar?: string;
    verified: boolean; // Should always be true here
    distance: number | null;
};
