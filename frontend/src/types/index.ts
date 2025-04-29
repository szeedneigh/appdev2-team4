export interface Task {
    _id: '';
    title: string;
    description?: string;
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    tags?: string[];
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}