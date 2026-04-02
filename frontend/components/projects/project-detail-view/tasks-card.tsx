'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { ProjectTaskDialog } from '@/components/projects/project-detail-view/project-task-dialog';
import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/errors';
import { deleteProjectTask, updateProjectTask } from '@/lib/api/projects';
import type { PatchProjectTaskInput, ProjectTask } from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';
import { cn } from '@/utils/cn';

function PriorityBadge({ priority }: { priority: ProjectTask['priority'] }) {
	const label =
		priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
	const variant =
		priority === 'high'
			? 'destructive'
			: priority === 'low'
				? 'outline'
				: 'secondary';
	return (
		<Badge variant={variant} className="shrink-0 font-medium capitalize">
			{label}
		</Badge>
	);
}

function TaskRow({
	task,
	busy,
	onPatch,
	onEdit,
	onDelete,
}: {
	task: ProjectTask;
	busy: boolean;
	onPatch: (patch: PatchProjectTaskInput) => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<li className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
			<div className="min-w-0 flex-1 space-y-1">
				<span className="font-medium text-foreground">{task.title}</span>
				{task.estimated_minutes != null ? (
					<p className="text-xs text-muted-foreground">
						~{task.estimated_minutes} min
					</p>
				) : null}
			</div>
			<div className="flex flex-wrap items-center gap-2 sm:justify-end">
				<PriorityBadge priority={task.priority} />
				<select
					aria-label="Task status"
					value={task.status}
					onChange={(e) =>
						onPatch({
							status: e.target.value as ProjectTask['status'],
						})
					}
					disabled={busy}
					className="h-9 min-w-38 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
				>
					<option value="todo">To do</option>
					<option value="in_progress">In progress</option>
					<option value="done">Done</option>
				</select>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-9 shrink-0"
					aria-label="Edit task"
					disabled={busy}
					onClick={onEdit}
				>
					<PencilIcon className="size-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-9 shrink-0 text-destructive hover:text-destructive"
					aria-label="Delete task"
					disabled={busy}
					onClick={onDelete}
				>
					<Trash2Icon className="size-4" />
				</Button>
			</div>
		</li>
	);
}

const TABS = [
	{ id: 'in_progress' as const, label: 'In progress' },
	{ id: 'todo' as const, label: 'To do' },
	{ id: 'done' as const, label: 'Done' },
];

type ProjectTasksCardProps = {
	projectId: string;
	isPending: boolean;
	isError: boolean;
	error: unknown;
	tasks: ProjectTask[];
};

export function ProjectTasksCard({
	projectId,
	isPending,
	isError,
	error,
	tasks,
}: ProjectTasksCardProps) {
	const queryClient = useQueryClient();
	const [tab, setTab] = React.useState<(typeof TABS)[number]['id']>(
		'in_progress',
	);
	const [dialog, setDialog] = React.useState<{
		open: boolean;
		task: ProjectTask | null;
	}>({ open: false, task: null });

	const patchTask = useMutation({
		mutationFn: ({
			taskId,
			patch,
		}: {
			taskId: string;
			patch: PatchProjectTaskInput;
		}) => updateProjectTask(projectId, taskId, patch),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.tasks(projectId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.detail(projectId),
			});
			if (vars.patch.status) {
				setTab(vars.patch.status);
			}
		},
		onError: (err: unknown) => {
			toast.error(getApiErrorMessage(err));
		},
	});

	const deleteTask = useMutation({
		mutationFn: (taskId: string) =>
			deleteProjectTask(projectId, taskId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.tasks(projectId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.detail(projectId),
			});
			toast.success('Task deleted');
		},
		onError: (err: unknown) => {
			toast.error(getApiErrorMessage(err));
		},
	});

	const byTab = React.useMemo(() => {
		return {
			in_progress: tasks.filter((t) => t.status === 'in_progress'),
			todo: tasks.filter((t) => t.status === 'todo'),
			done: tasks.filter((t) => t.status === 'done'),
		};
	}, [tasks]);

	const list = byTab[tab];
	const busy = patchTask.isPending || deleteTask.isPending;

	return (
		<>
			<ProjectTaskDialog
				open={dialog.open}
				onOpenChange={(open) => setDialog((s) => ({ ...s, open }))}
				projectId={projectId}
				task={dialog.task}
			/>
			<SoftCard>
				<CardHeader className="flex flex-col gap-4 space-y-0 px-6 pb-2 pt-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1.5">
						<CardTitle className="text-lg">Tasks</CardTitle>
						<CardDescription>Work tracked for this project.</CardDescription>
					</div>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						className="shrink-0 gap-1.5"
						onClick={() => setDialog({ open: true, task: null })}
					>
						<PlusIcon className="size-4" />
						Add task
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 px-6 pb-6 pt-0">
					<div
						className="flex flex-wrap gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 dark:bg-white/5"
						role="tablist"
						aria-label="Task sections"
					>
						{TABS.map((t) => (
							<button
								key={t.id}
								type="button"
								role="tab"
								aria-selected={tab === t.id}
								onClick={() => setTab(t.id)}
								className={cn(
									'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
									tab === t.id
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground',
								)}
							>
								{t.label}
								<span className="ml-1.5 tabular-nums text-muted-foreground">
									({byTab[t.id].length})
								</span>
							</button>
						))}
					</div>

					{isPending ? (
						<div className="space-y-3">
							<div className="h-10 animate-pulse rounded-lg bg-muted/40" />
							<div className="h-10 animate-pulse rounded-lg bg-muted/40" />
						</div>
					) : isError ? (
						<p className="text-sm text-destructive" role="alert">
							{getApiErrorMessage(error)}
						</p>
					) : list.length === 0 ? (
						<p className="rounded-lg border border-dashed border-border/50 bg-muted/15 px-3 py-4 text-sm text-muted-foreground">
							None — add a task to get started.
						</p>
					) : (
						<ul className="space-y-2">
							{list.map((task) => (
								<TaskRow
									key={task.id}
									task={task}
									busy={busy}
									onPatch={(patch) =>
										patchTask.mutate({ taskId: task.id, patch })
									}
									onEdit={() =>
										setDialog({ open: true, task })
									}
									onDelete={() => {
										if (
											typeof window !== 'undefined' &&
											!window.confirm(
												'Delete this task? Subtasks are removed too.',
											)
										) {
											return;
										}
										deleteTask.mutate(task.id);
									}}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</SoftCard>
		</>
	);
}
