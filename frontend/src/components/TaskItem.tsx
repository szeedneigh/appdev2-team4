import React, { useState } from "react";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, Edit, Save, XCircle, Loader2, 
  Clock, Tag, AlertTriangle, Calendar 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateTask, deleteTask, toggleTaskCompletion } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string, taskTitle: string) => void;
}

export function TaskItem({
  task,
  onTaskUpdated,
  onTaskDeleted,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [newPriority, setNewPriority] = useState<string>(task.priority || "Medium");
  const [isLoading, setIsLoading] = useState({
    complete: false,
    edit: false,
    delete: false,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const priorityColors = {
    Low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const handleToggleComplete = async () => {
    setIsLoading((prev) => ({ ...prev, complete: true }));
    try {
      const updatedTask = await toggleTaskCompletion(task._id, task.completed);
      onTaskUpdated(updatedTask);
      toast.success("Task status updated.");
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      toast.error("Failed to update task status.");
    } finally {
      setIsLoading((prev) => ({ ...prev, complete: false }));
    }
  };

  const handleDelete = async () => {
    setIsLoading((prev) => ({ ...prev, delete: true }));
    try {
      await deleteTask(task._id);
      onTaskDeleted(task._id, task.title);
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task.");
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setNewTitle(task.title);
    setNewDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setNewPriority(task.priority || "Medium");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast.error("Title cannot be empty.");
      return;
    }

    // Only update if something changed
    const hasChanges = 
      trimmedTitle !== task.title || 
      newPriority !== task.priority ||
      (newDueDate?.toISOString() !== (task.dueDate && new Date(task.dueDate).toISOString()));

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsLoading((prev) => ({ ...prev, edit: true }));
    try {
      const updatedTask = await updateTask(task._id, {
        title: trimmedTitle,
        priority: newPriority as "Low" | "Medium" | "High",
        dueDate: newDueDate?.toISOString(),
      });
      onTaskUpdated(updatedTask);
      setIsEditing(false);
      toast.success("Task updated.");
    } catch (error) {
      console.error("Failed to save task edit:", error);
      toast.error("Failed to save changes.");
    } finally {
      setIsLoading((prev) => ({ ...prev, edit: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handlePriorityChange = (priority: string) => {
    setNewPriority(priority);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setNewDueDate(date);
    setIsCalendarOpen(false);
  };

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Card className={cn(
      "mb-3 transition-all hover:shadow-md",
      task.completed ? "bg-gray-50 dark:bg-gray-900/50" : "",
      isPastDue ? "border-l-4 border-red-500" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-2">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <div>
              <Checkbox
                id={`task-${task._id}`}
                checked={task.completed}
                onCheckedChange={handleToggleComplete}
                disabled={isLoading.complete || isLoading.edit || isLoading.delete}
                aria-labelledby={`task-title-${task._id}`}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-1">
                  <Input
                    type="text"
                    value={newTitle}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="h-8 text-sm"
                    autoFocus
                    disabled={isLoading.edit}
                    aria-label="Edit task title"
                  />
                  
                  {/* Priority selector */}
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex space-x-1">
                      {["Low", "Medium", "High"].map((priority) => (
                        <Badge 
                          key={priority}
                          className={cn(
                            "cursor-pointer",
                            newPriority === priority 
                              ? priorityColors[priority as keyof typeof priorityColors]
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          )}
                          onClick={() => handlePriorityChange(priority)}
                        >
                          {priority}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Due date selector */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 text-xs"
                        >
                          {newDueDate ? format(newDueDate, 'PP') : 'Set due date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={newDueDate}
                          onSelect={handleDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {newDueDate && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-red-500"
                        onClick={() => setNewDueDate(undefined)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  <div className="flex items-center">
                    <label
                      htmlFor={`task-${task._id}`}
                      id={`task-title-${task._id}`}
                      className={cn(
                        "text-sm font-medium leading-tight cursor-pointer",
                        task.completed ? "line-through text-muted-foreground" : "",
                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      )}
                    >
                      {task.title}
                    </label>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1">
                    {task.priority && (
                      <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                    )}
                    
                    {task.dueDate && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "flex items-center text-xs",
                          isPastDue ? "text-red-500 border-red-300 dark:border-red-800" : ""
                        )}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(task.dueDate), 'PP')}
                        {isPastDue && " (overdue)"}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveEdit}
                  disabled={isLoading.edit || !newTitle.trim()}
                  className="h-7 w-7 text-green-600 hover:text-green-700"
                  aria-label="Save edit"
                >
                  {isLoading.edit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  disabled={isLoading.edit}
                  className="h-7 w-7 text-gray-500 hover:text-gray-600"
                  aria-label="Cancel edit"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  disabled={
                    isLoading.complete || isLoading.delete || task.completed
                  }
                  className={cn(
                    "h-7 w-7",
                    task.completed
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-700"
                  )}
                  aria-label="Edit task"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={
                        isLoading.delete || isLoading.complete || isLoading.edit
                      }
                      className="h-7 w-7 text-red-600 hover:text-red-700"
                      aria-label="Delete task"
                    >
                      {isLoading.delete ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{task.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading.delete ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
