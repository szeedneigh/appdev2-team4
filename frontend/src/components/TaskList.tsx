import React, { useState } from 'react';
import { Task } from '@/types';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TaskListProps {
    tasks: Task[];
    onTaskUpdated: (updatedTask: Task) => void;
    onTaskDeleted: (taskId: string, taskTitle: string) => void;
    isLoading: boolean;
    error: string | null;
}

export function TaskList({ tasks, onTaskUpdated, onTaskDeleted, isLoading, error }: TaskListProps) {
    type FilterStatus = 'all' | 'active' | 'completed';
    type SortBy = 'newest' | 'oldest' | 'priority';
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('newest');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    if (isLoading) {
        return (
          <div className="w-full max-w-md flex justify-center py-12">
            <div className="flex flex-col items-center space-y-4 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p>Loading tasks...</p>
            </div>
          </div>
        );
    }

    if (error) {
      return (
        <div className="w-full max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex flex-col items-center text-center space-y-2">
            <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading tasks</h3>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    const filteredTasks = tasks.filter(task => {
        // Status filter
        if (filterStatus === 'active' && task.completed) return false;
        if (filterStatus === 'completed' && !task.completed) return false;
        
        // Search query
        if (searchQuery) {
            return task.title.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'priority': {
                const priorityOrder = { High: 0, Medium: 1, Low: 2, undefined: 3 };
                const aPriority = a.priority || 'undefined';
                const bPriority = b.priority || 'undefined';
                return priorityOrder[aPriority as keyof typeof priorityOrder] - 
                       priorityOrder[bPriority as keyof typeof priorityOrder];
            }
            default:
                return 0;
        }
    });

    if (tasks.length === 0) {
        return (
          <div className="w-full max-w-md flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <svg className="h-12 w-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No tasks yet</h3>
            <p className="text-muted-foreground mt-1">Add your first task using the form above!</p>
          </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-between">
                <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
                        <TabsTrigger value="active">Active ({tasks.filter(t => !t.completed).length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({tasks.filter(t => t.completed).length})</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 relative w-full">
                        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-8"
                        />
                        {searchQuery && (
                            <X
                                className="absolute right-2 h-4 w-4 text-muted-foreground cursor-pointer"
                                onClick={() => setSearchQuery('')}
                            />
                        )}
                    </div>
                    
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 ml-2" aria-label="Open filters">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="mt-2">
                    <div className="flex items-center space-x-2">
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            
            <div className="space-y-2 mt-4">
                {sortedTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No tasks match your filters</p>
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onTaskUpdated={onTaskUpdated}
                            onTaskDeleted={onTaskDeleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
