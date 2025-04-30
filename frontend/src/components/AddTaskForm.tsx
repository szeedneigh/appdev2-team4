import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addTask } from '@/lib/api';
import { Task } from '@/types';
import { Loader2, Plus, Calendar, AlertTriangle, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AddTaskFormProps {
  onTaskAdded: (newTask: Task) => void;
}

export function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Advanced task fields
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority('Medium');
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
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

  const handleAdvancedAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Task title cannot be empty.");
      return;
    }
    
    setIsLoading(true);
    try {
      const newTask = await addTask(trimmedTitle, {
        description: description.trim() || undefined,
        dueDate: dueDate?.toISOString(),
        priority
      });
      onTaskAdded(newTask);
      resetForm();
      setIsDialogOpen(false);
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

  const priorityColors = {
    Low: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
    Medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800",
    High: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800",
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <>
      {/* Quick Add Form */}
      <div className="w-full max-w-md mb-8">
        <form
          onSubmit={handleQuickAdd}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                type="button"
                disabled={isLoading}
                title="Advanced options"
              >
                ...
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
                <DialogDescription>
                  Create a task with additional details and options.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdvancedAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about your task"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    className="min-h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex space-x-2">
                      {(['Low', 'Medium', 'High'] as const).map((p) => (
                        <Badge 
                          key={p}
                          className={cn(
                            "cursor-pointer flex-1 justify-center",
                            priority === p 
                              ? priorityColors[p]
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          )}
                          onClick={() => setPriority(p)}
                        >
                          {p === 'High' && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date (optional)</Label>
                    <div className="flex items-center space-x-2">
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full justify-start text-left font-normal"
                            disabled={isLoading}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {dueDate ? format(dueDate, 'PP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dueDate}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {dueDate && (
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setDueDate(undefined)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !title.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </>
  );
}
