// This file is now primarily for type definitions, as data will come from Firestore.
  
export type User = {
    id: string;
    name: string;
    email: string;
    role: 'worker' | 'customer' | 'admin';
    status: 'active' | 'pending_verification' | 'rejected';
}

export const users: User[] = [
    { id: 'u1', name: 'Pending Worker', email: 'worker@pending.com', role: 'worker', 'status': 'pending_verification' },
    { id: 'u2', name: 'Pending Customer', email: 'customer@pending.com', role: 'customer', 'status': 'pending_verification' },
    { id: 'u3', name: 'Active Admin', email: 'admin@workbee.com', role: 'admin', 'status': 'active' },
];

    