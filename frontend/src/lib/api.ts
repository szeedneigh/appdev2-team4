import { Task } from '@/types'; 

const API_BASE_URL = 'http://localhost:5000/api/tasks';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(API_BASE_URL);
  return handleResponse<Task[]>(response);
};

export const addTask = async (title: string): Promise<Task> => {
    if (!title.trim()) {
        throw new Error("Task title cannot be empty.");
    }
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    });
    return handleResponse<Task>(response);
};


export const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'completed'>>): Promise<Task> => {

    if (updates.title !== undefined && !updates.title.trim()) {
         throw new Error("Task title cannot be empty.");
    }
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });
    return handleResponse<Task>(response);
};


export const deleteTask = async (id: string): Promise<{ message: string; taskId: string }> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
   if (response.status === 204) {
     return { message: 'Task deleted successfully', taskId: id };
   }
  return handleResponse<{ message: string; taskId: string }>(response);
};

export const toggleTaskCompletion = async (id: string, currentStatus: boolean): Promise<Task> => {
    return updateTask(id, { completed: !currentStatus });
};