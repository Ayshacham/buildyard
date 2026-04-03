'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiErrorMessage } from '@/lib/api/errors';
import { updateProjectTask } from '@/lib/api/projects';
import { patchTask as patchUserTask } from '@/lib/api/tasks';
import type { PatchProjectTaskInput, UserTaskListItem } from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';
import { cn } from '@/utils/cn';

function PriorityBadge({ priority }: { priority: UserTaskListItem['priority'] }) {
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

function TaskLine({
	task,
	busy,
	onPatch,
}: {
	task: UserTaskListItem;
	busy: boolean;
	onPatch: (patch: PatchProjectTaskInput) => void;
}) {
	const done = task.status === 'done';
	return (
		<li className="flex flex-wrap items-start gap-3 rounded-xl border border-border/40 bg-muted/15 px-3 py-2.5 dark:bg-white/5">
			<label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					checked={done}
					disabled={busy}
					onChange={() =>
						onPatch({
							status: done ? 'todo' : 'done',
						})
					}
					className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
				/>
				<span
					className={cn(
						'min-w-0 flex-1 font-medium',
						done ? 'text-muted-foreground line-through' : 'text-foreground',
					)}
				>
					{task.title}
				</span>
			</label>
			<div className="flex flex-wrap items-center gap-2 sm:ml-auto">
				{task.project ? (
					<Link
						href={`/projects/${task.project}`}
						className="inline-flex max-w-48 items-center gap-2 truncate text-sm font-medium text-primary hover:underline"
					>
						<span
							className="size-2.5 shrink-0 rounded-full ring-1 ring-border"
							style={{ backgroundColor: task.project_color }}
							aria-hidden
						/>
						{task.project_name}
					</Link>
				) : (
					<span className="inline-flex max-w-48 items-center gap-2 truncate text-sm text-muted-foreground">
						<span
							className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40 ring-1 ring-border"
							aria-hidden
						/>
						Unassigned
					</span>
				)}
				<PriorityBadge priority={task.priority} />
				<select
					aria-label="Task status"
					value={task.status}
					onChange={(e) =>
						onPatch({
							status: e.target.value as UserTaskListItem['status'],
						})
					}
					disabled={busy}
					className="h-9 min-w-38 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
				>
					<option value="todo">To do</option>
					<option value="in_progress">In progress</option>
					<option value="done">Done</option>
					<option value="brain_dump">Brain dump</option>
				</select>
			</div>
		</li>
	);
}

export function TasksPageView({ tasks }: { tasks: UserTaskListItem[] }) {
	const queryClient = useQueryClient();
	const patchTask = useMutation({
		mutationFn: ({
			task,
			patch,
		}: {
			task: UserTaskListItem;
			patch: PatchProjectTaskInput;
		}) =>
			task.project
				? updateProjectTask(task.project, task.id, patch)
				: patchUserTask(task.id, patch),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tasks.user() });
			if (variables.task.project) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.projects.tasks(variables.task.project),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.projects.detail(variables.task.project),
				});
			}
			queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
		},
		onError: (err: unknown) => {
			toast.error(getApiErrorMessage(err));
		},
	});
	const busy = patchTask.isPending;

	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<CardTitle className="text-lg">All tasks</CardTitle>
				<CardDescription>
					Across your projects. Click the box to mark done or reopen.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				{tasks.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border/50 bg-muted/15 px-3 py-4 text-sm text-muted-foreground">
						No tasks yet — add some from a project page.
					</p>
				) : (
					<ul className="space-y-2">
						{tasks.map((task) => (
							<TaskLine
								key={task.id}
								task={task}
								busy={busy}
								onPatch={(patch) =>
									patchTask.mutate({ task, patch })
								}
							/>
						))}
					</ul>
				)}
			</CardContent>
		</SoftCard>
	);
}
