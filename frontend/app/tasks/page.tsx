'use client';

import { TasksPageView } from '@/components/tasks/tasks-page';
import { ErrorState } from '@/components/ui/error-state';
import { useUserTasks } from '@/hooks/use-user-tasks';

export default function TasksPage() {
	const { data: tasks = [], isPending, isError, error } = useUserTasks();

	if (isPending) {
		return (
			<div className="space-y-6">
				<div className="h-9 w-48 animate-pulse rounded-lg bg-muted/50" />
				<div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorState
				title="Could not load tasks"
				description={error?.message ?? 'Something went wrong.'}
			>
				Check your connection and that the API is running.
			</ErrorState>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Tasks
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Everything in one place — jump to a project anytime.
				</p>
			</div>
			<TasksPageView tasks={tasks} />
		</div>
	);
}
