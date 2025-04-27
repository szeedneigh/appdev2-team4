import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addTask } from '@/lib/api';
import { Task } from '@/types';
import { Loader2 } from 'lucide-react';

interface AddTaskFormProps {
  onTaskAdded: (newTask: Task) => void;
}

export function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Task title cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const newTask = await addTask(trimmedTitle);
      onTaskAdded(newTask);
      setTitle('');
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm items-center space-x-2 mb-6"
    >
      <Input
        type="text"
        placeholder="Enter new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        aria-label="New task title"
      />
      <Button type="submit" disabled={isLoading || !title.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Task'
        )}
      </Button>
    </form>
  );
}
