export type Worker = {
    id: string;
    name: string;
    location: string;
    skills: string[];
    rating: number;
    avatar: string;
    verified: boolean;
};
  
export type Job = {
    id: string;
    title: string;
    customer: string;
    location: string;
    budget: number;
    status: 'Open' | 'In Progress' | 'Completed';
    skills: string[];
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'worker' | 'customer' | 'admin';
    status: 'active' | 'pending_verification' | 'rejected';
}
  
export const workers: Worker[] = [
    { id: '1', name: 'John Doe', location: 'New York, NY', skills: ['Plumbing', 'Electrical'], rating: 4.8, avatar: 'https://picsum.photos/seed/avatar1/200/200', verified: true },
    { id: '2', name: 'Jane Smith', location: 'Los Angeles, CA', skills: ['Carpentry', 'Painting'], rating: 4.9, avatar: 'https://picsum.photos/seed/avatar2/200/200', verified: true },
    { id: '3', name: 'Mike Johnson', location: 'Chicago, IL', skills: ['Gardening', 'Landscaping'], rating: 4.7, avatar: 'https://picsum.photos/seed/avatar3/200/200', verified: true },
    { id: '4', name: 'Emily Brown', location: 'Houston, TX', skills: ['Cleaning', 'Housekeeping'], rating: 5.0, avatar: 'https://picsum.photos/seed/avatar4/200/200', verified: true },
];

export const jobs: Job[] = [
    { id: 'j1', title: 'Fix Leaky Faucet', customer: 'Alice Williams', location: 'New York, NY', budget: 150, status: 'Open', skills: ['Plumbing'] },
    { id: 'j2', title: 'Paint Living Room', customer: 'Bob Miller', location: 'Los Angeles, CA', budget: 800, status: 'In Progress', skills: ['Painting'] },
    { id: 'j3', title: 'Garden Maintenance', customer: 'Charlie Davis', location: 'Chicago, IL', budget: 250, status: 'Completed', skills: ['Gardening'] },
];

export const users: User[] = [
    { id: 'u1', name: 'Pending Worker', email: 'worker@pending.com', role: 'worker', status: 'pending_verification' },
    { id: 'u2', name: 'Pending Customer', email: 'customer@pending.com', role: 'customer', status: 'pending_verification' },
    { id: 'u3', name: 'Active Admin', email: 'admin@workbee.com', role: 'admin', status: 'active' },
];
