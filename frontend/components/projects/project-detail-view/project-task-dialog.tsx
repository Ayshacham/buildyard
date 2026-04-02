'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
	createProjectTask,
	updateProjectTask,
} from '@/lib/api/projects';
import type {
	CreateProjectTaskInput,
	ProjectTask,
} from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';

type ProjectTaskDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	task: ProjectTask | null;
};

export function ProjectTaskDialog({
	open,
	onOpenChange,
	projectId,
	task,
}: ProjectTaskDialogProps) {
	const queryClient = useQueryClient();
	const isEdit = Boolean(task);
	const [title, setTitle] = React.useState('');
	const [priority, setPriority] =
		React.useState<ProjectTask['priority']>('medium');
	const [status, setStatus] = React.useState<ProjectTask['status']>('todo');
	const [estimatedMinutes, setEstimatedMinutes] = React.useState('');

	React.useEffect(() => {
		if (open && task) {
			setTitle(task.title);
			setPriority(task.priority);
			setStatus(task.status);
			setEstimatedMinutes(
				task.estimated_minutes != null ? String(task.estimated_minutes) : '',
			);
		} else if (open && !task) {
			setTitle('');
			setPriority('medium');
			setStatus('todo');
			setEstimatedMinutes('');
		}
	}, [open, task]);

	const mutation = useMutation({
		mutationFn: (payload: CreateProjectTaskInput) => {
			if (isEdit && task) {
				return updateProjectTask(projectId, task.id, payload);
			}
			return createProjectTask(projectId, payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.tasks(projectId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.detail(projectId),
			});
			toast.success(isEdit ? 'Task updated' : 'Task added');
			onOpenChange(false);
		},
		onError: (err: unknown) => {
			toast.error(getApiErrorMessage(err));
		},
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed) {
			toast.error('Title is required');
			return;
		}
		const raw = estimatedMinutes.trim();
		let estimated_minutes: number | null = null;
		if (raw !== '') {
			const n = Number.parseInt(raw, 10);
			if (Number.isNaN(n) || n < 1) {
				toast.error('Estimate must be a positive number of minutes');
				return;
			}
			estimated_minutes = n;
		}
		mutation.mutate({
			title: trimmed,
			priority,
			status,
			estimated_minutes,
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
					<DialogDescription>
						Title, priority, and status. Estimate is optional.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<label htmlFor="task-title" className="text-sm font-medium">
							Title
						</label>
						<Input
							id="task-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="What needs doing?"
							required
							autoComplete="off"
							disabled={mutation.isPending}
						/>
					</div>
					<div className="grid gap-2">
						<label htmlFor="task-priority" className="text-sm font-medium">
							Priority
						</label>
						<select
							id="task-priority"
							value={priority}
							onChange={(e) =>
								setPriority(e.target.value as ProjectTask['priority'])
							}
							disabled={mutation.isPending}
							className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					<div className="grid gap-2">
						<label htmlFor="task-status" className="text-sm font-medium">
							Status
						</label>
						<select
							id="task-status"
							value={status}
							onChange={(e) =>
								setStatus(e.target.value as ProjectTask['status'])
							}
							disabled={mutation.isPending}
							className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
						>
							<option value="todo">To do</option>
							<option value="in_progress">In progress</option>
							<option value="done">Done</option>
						</select>
					</div>
					<div className="grid gap-2">
						<label htmlFor="task-est" className="text-sm font-medium">
							Estimate (minutes){' '}
							<span className="font-normal text-muted-foreground">
								(optional)
							</span>
						</label>
						<Input
							id="task-est"
							type="number"
							min={1}
							step={1}
							value={estimatedMinutes}
							onChange={(e) => setEstimatedMinutes(e.target.value)}
							placeholder="e.g. 25"
							autoComplete="off"
							disabled={mutation.isPending}
						/>
					</div>
					<DialogFooter className="gap-2 sm:gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={mutation.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={mutation.isPending}>
							{isEdit ? 'Save' : 'Add task'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
