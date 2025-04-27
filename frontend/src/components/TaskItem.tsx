import React, { useState } from "react";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, XCircle, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState({
    complete: false,
    edit: false,
    delete: false,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || trimmedTitle === task.title) {
      setIsEditing(false);
      if (!trimmedTitle) {
        toast.error("Title cannot be empty.");
      }
      return;
    }

    setIsLoading((prev) => ({ ...prev, edit: true }));
    try {
      const updatedTask = await updateTask(task._id, { title: trimmedTitle });
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

  return (
    <Card className="mb-3 transition-all hover:shadow-md">
      <CardContent className="p-4 flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Checkbox
            id={`task-${task._id}`}
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isLoading.complete || isLoading.edit || isLoading.delete}
            aria-labelledby={`task-title-${task._id}`}
          />
          {isEditing ? (
            <Input
              type="text"
              value={newTitle}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="h-8 text-sm flex-1"
              autoFocus
              disabled={isLoading.edit}
              aria-label="Edit task title"
            />
          ) : (
            <label
              htmlFor={`task-${task._id}`}
              id={`task-title-${task._id}`}
              className={cn(
                "text-sm font-medium leading-none truncate cursor-pointer",
                task.completed ? "line-through text-muted-foreground" : "",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              )}
            >
              {task.title}
            </label>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveEdit}
                disabled={
                  isLoading.edit ||
                  !newTitle.trim() ||
                  newTitle.trim() === task.title
                }
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
                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:pointer-fine:cursor-pointer"
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
      </CardContent>
    </Card>
  );
}