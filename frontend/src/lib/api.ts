import { Task } from '@/types';

const API_URL = 'http://localhost:5000/api';

interface TaskData {
  description?: string;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
}

const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof Response) {
    throw new Error(`API error: ${error.status} ${error.statusText}`);
  } else if (error instanceof Error) {
    throw error;
  } else {
    throw new Error('Unknown API error occurred');
  }
};

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw response;
    
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function addTask(title: string, data?: TaskData): Promise<Task> {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        ...data
      }),
    });
    
    if (!response.ok) throw response;
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw response;
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function toggleTaskCompletion(taskId: string, currentStatus: boolean): Promise<Task> {
  return updateTask(taskId, {
    completed: !currentStatus
  });
}