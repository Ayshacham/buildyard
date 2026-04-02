import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { ProjectTask } from '@/lib/api/types';

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

function TaskRow({ task }: { task: ProjectTask }) {
	return (
		<li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 dark:bg-white/5">
			<span className="min-w-0 flex-1 font-medium text-foreground">
				{task.title}
			</span>
			<PriorityBadge priority={task.priority} />
		</li>
	);
}

function TaskSection({
	title,
	tasks,
}: {
	title: string;
	tasks: ProjectTask[];
}) {
	return (
		<div className="space-y-2">
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			{tasks.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border/50 bg-muted/15 px-3 py-4 text-sm text-muted-foreground">
					None
				</p>
			) : (
				<ul className="space-y-2">
					{tasks.map((task) => (
						<TaskRow key={task.id} task={task} />
					))}
				</ul>
			)}
		</div>
	);
}

type ProjectTasksCardProps = {
	isPending: boolean;
	isError: boolean;
	error: unknown;
	inProgress: ProjectTask[];
	todo: ProjectTask[];
};

export function ProjectTasksCard({
	isPending,
	isError,
	error,
	inProgress,
	todo,
}: ProjectTasksCardProps) {
	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<CardTitle className="text-lg">Tasks</CardTitle>
				<CardDescription>Open work for this project.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6 px-6 pb-6 pt-0">
				{isPending ? (
					<div className="space-y-3">
						<div className="h-10 animate-pulse rounded-lg bg-muted/40" />
						<div className="h-10 animate-pulse rounded-lg bg-muted/40" />
					</div>
				) : isError ? (
					<p className="text-sm text-destructive" role="alert">
						{getApiErrorMessage(error)}
					</p>
				) : (
					<>
						<TaskSection title="In progress" tasks={inProgress} />
						<TaskSection title="To do" tasks={todo} />
					</>
				)}
			</CardContent>
		</SoftCard>
	);
}
