import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { fetchTasks } from '@/lib/api';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { ModeToggle } from "@/components/theme/mode-toggle";
import { toast, Toaster } from 'sonner';
import { Button } from "@/components/ui/button";
import { RefreshCcw, CheckCircle2 } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      toast.error("Failed to load tasks", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    toast.success(`Task added`, {
      description: `"${newTask.title}" has been added to your tasks.`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    toast.info(`Task updated`, {
      description: `Changes to "${updatedTask.title}" have been saved.`,
    });
  };

  const handleTaskDeleted = (taskId: string, taskTitle: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    toast.success(`Task deleted`, {
      description: `"${taskTitle}" has been removed from your tasks.`,
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          // This would require implementing an undelete functionality in your API
          toast("Restore functionality would go here", {
            description: "This is just a placeholder for the undo feature.",
          });
        },
      },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const activeTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Quest</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              title="Refresh tasks"
              className="h-8 w-8"
              aria-label="Refresh tasks"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <ModeToggle />
          </div>
        </header>

        <main className="space-y-4 items-center">
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <AddTaskForm onTaskAdded={handleTaskAdded} />
          </div>

          {tasks.length > 0 && !isLoading && !error && (
            <div className="flex justify-between items-center px-1">
              <div className="text-sm text-muted-foreground">
                {activeTasks} active, {completedTasks} completed
              </div>
            </div>
          )}

          <TaskList
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            isLoading={isLoading}
            error={error}
          />
        </main>

        <footer className="mt-8 mb-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Quest </p>
        </footer>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;
