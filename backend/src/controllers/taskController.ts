import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task'; 

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks: ITask[] = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error: unknown) {
     handleServerError(res, error);
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
       res.status(400).json({ message: 'Task title is required and must be a non-empty string' });
       return;
    }
    if (description !== undefined && typeof description !== 'string') {
        res.status(400).json({ message: 'Description must be a string' });
        return;
    }
    if (dueDate !== undefined && isNaN(Date.parse(dueDate))) {
       res.status(400).json({ message: 'Invalid due date format' });
       return;
    }
    const allowedPriorities = ['Low', 'Medium', 'High'];
    if (priority !== undefined && !allowedPriorities.includes(priority)) {
        res.status(400).json({ message: 'Priority must be one of: Low, Medium, High' });
        return;
    }

    const newTaskData: Partial<ITask> = {
        title: title.trim(),
        completed: false, 
    };

    if (description !== undefined) newTaskData.description = description.trim();
    if (dueDate !== undefined) newTaskData.dueDate = new Date(dueDate); 
    if (priority !== undefined) newTaskData.priority = priority;


    const newTask: ITask = new Task(newTaskData);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask); 

  } catch (error: unknown) {
     if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({ message: "Validation Error", errors: (error as any).errors });
     } else {
        handleServerError(res, error);
     }
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const task: ITask | null = await Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.status(200).json(task);
    } catch (error: unknown) {
        handleServerError(res, error);
    }
};


export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {

    const { title, description, dueDate, priority, completed } = req.body;
    const taskId = req.params.id;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        res.status(400).json({ message: 'If provided, title must be a non-empty string' });
        return;
    }
    if (description !== undefined && typeof description !== 'string') {
        res.status(400).json({ message: 'If provided, description must be a string' });
        return;
    }
    if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
       res.status(400).json({ message: 'Invalid due date format' });
       return;
    }
    const allowedPriorities = ['Low', 'Medium', 'High'];
     if (priority !== undefined && !allowedPriorities.includes(priority)) {
        res.status(400).json({ message: 'Priority must be one of: Low, Medium, High' });
        return;
    }
     if (completed !== undefined && typeof completed !== 'boolean') {
        res.status(400).json({ message: 'If provided, completed must be a boolean' });
        return;
    }


    const updateData: Partial<ITask> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (dueDate === null || dueDate === undefined) {
        updateData.dueDate = undefined; 
    } else {
        updateData.dueDate = new Date(dueDate);
    }
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;


    const updatedTask: ITask | null = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true, context: 'query' } 
    );

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error: unknown) {
     if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({ message: "Validation Error", errors: (error as any).errors });
     } else {
        handleServerError(res, error);
     }
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const deletedTask: ITask | null = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json({ message: 'Task deleted successfully', taskId: deletedTask._id });
  } catch (error: unknown) {
    handleServerError(res, error);
  }
};


function handleServerError(res: Response, error: unknown): void {
    console.error('Server Error:', error); 
    if (error instanceof Error && error.name === 'CastError') {
        res.status(400).json({ message: 'Invalid Task ID format' });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
