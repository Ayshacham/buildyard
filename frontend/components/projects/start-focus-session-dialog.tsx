'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
import { startFocusSession } from '@/lib/api/sessions';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { ProjectTask } from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';

type StartFocusSessionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	tasks: ProjectTask[];
	plannedDurationMinutes: number;
};

export function StartFocusSessionDialog({
	open,
	onOpenChange,
	projectId,
	tasks,
	plannedDurationMinutes,
}: StartFocusSessionDialogProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [taskId, setTaskId] = React.useState<string>('');

	React.useEffect(() => {
		if (open) {
			setTaskId('');
		}
	}, [open]);

	const selectableTasks = React.useMemo(
		() =>
			tasks.filter(
				(t) => t.status === 'in_progress' || t.status === 'todo',
			),
		[tasks],
	);

	const mutation = useMutation({
		mutationFn: () =>
			startFocusSession({
				planned_duration_minutes: plannedDurationMinutes,
				project_id: projectId,
				...(taskId ? { task_id: taskId } : {}),
			}),
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.sessions.active(), {
				timer: data.timer,
				session: data.session,
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
			toast.success('Focus session started');
			onOpenChange(false);
			router.push('/dashboard');
		},
		onError: () => {},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Start focus session</DialogTitle>
					<DialogDescription>
						Optional: link this session to a task, or skip to focus on the
						project only.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<label htmlFor="focus-task" className="text-sm font-medium">
						Task
					</label>
					<select
						id="focus-task"
						value={taskId}
						onChange={(e) => setTaskId(e.target.value)}
						disabled={mutation.isPending}
						className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
					>
						<option value="">Skip (no task)</option>
						{selectableTasks.map((t) => (
							<option key={t.id} value={t.id}>
								{t.title}
							</option>
						))}
					</select>
				</div>
				{mutation.isError ? (
					<p className="text-sm text-destructive" role="alert">
						{getApiErrorMessage(mutation.error)}
					</p>
				) : null}
				<DialogFooter className="gap-2 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={mutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={() => mutation.mutate()}
						disabled={mutation.isPending}
					>
						Start
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
