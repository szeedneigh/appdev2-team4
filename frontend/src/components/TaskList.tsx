import { Task } from '@/types';
import { TaskItem } from './TaskItem'; 

interface TaskListProps {
    tasks: Task[];
    onTaskUpdated: (updatedTask: Task) => void;
    onTaskDeleted: (taskId: string) => void;
    isLoading: boolean;
    error: string | null;
}

export function TaskList({ tasks, onTaskUpdated, onTaskDeleted, isLoading, error }: TaskListProps) {

    if (isLoading) {
        return <p className="text-center text-muted-foreground">Loading tasks...</p>;
    }

    if (error) {
         return <p className="text-center text-red-500">Error loading tasks: {error}</p>;
    }

    if (tasks.length === 0) {
        return <p className="text-center text-muted-foreground">No tasks yet. Add one above!</p>;
    }

    return (
        <div className="w-full max-w-md">
            {tasks.map((task) => (
                <TaskItem
                    key={task._id}
                    task={task}
                    onTaskUpdated={onTaskUpdated}
                    onTaskDeleted={onTaskDeleted}
                />
            ))}
        </div>
    );
}