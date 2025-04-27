import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { fetchTasks } from '@/lib/api';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { ModeToggle } from "@/components/theme/mode-toggle";
import { toast } from 'sonner';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletedTaskTitle, setDeletedTaskTitle] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      console.error(errorMessage, err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    toast.success(`Task "${newTask.title}" added successfully.`);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    toast.info(`Task "${updatedTask.title}" updated.`);
  };

  const handleTaskDeleted = (taskId: string, taskTitle: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    
    toast.success(`Task "${taskTitle}" deleted successfully.`, {
      description: 'Task has been permanently removed.',
      duration: 6000,
      action: {
        label: "Dismiss",
        onClick: () => setDeletedTaskTitle(null),
      },
      position: "bottom-center",
      className: "border-l-4 border-green-500 pl-4",
    });
    
    setTimeout(() => setDeletedTaskTitle(null), 6000);
  };

  return (
    <div className="container mx-auto p-4 pt-6 md:pt-12 min-h-screen flex flex-col items-center">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Quest</h1>

      <AddTaskForm onTaskAdded={handleTaskAdded} />

      <TaskList
        tasks={tasks}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={(taskId) => handleTaskDeleted(taskId, tasks.find(task => task._id === taskId)?.title || '')}
        isLoading={isLoading}
        error={error}
      />
      
      {deletedTaskTitle && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg text-sm text-green-800 dark:text-green-300 animate-in fade-in slide-in-from-bottom duration-300 z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-medium">Task "<span className="font-semibold">{deletedTaskTitle}</span>" has been deleted</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;