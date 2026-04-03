'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getApiErrorMessage } from '@/lib/api/errors';
import { postBrainDump } from '@/lib/api/ai';
import { patchTask } from '@/lib/api/tasks';
import type { ProjectListItem, ProjectTask } from '@/lib/api/types';
import { useProjects } from '@/hooks/use-projects';
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

export default function BrainDumpPage() {
	const router = useRouter();
	const { data: projects = [] } = useProjects();

	const [text, setText] = React.useState('');
	const [tasks, setTasks] = React.useState<ProjectTask[] | null>(null);
	const [assignBusy, setAssignBusy] = React.useState<string | null>(null);

	const dumpMutation = useMutation({
		mutationFn: () => postBrainDump({ text }),
		onSuccess: (created) => {
			setTasks(created);
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const onAssign = async (taskId: string, projectId: string) => {
		setAssignBusy(taskId);
		try {
			const updated = await patchTask(taskId, { project: projectId });
			setTasks((prev) =>
				prev
					? prev.map((t) => (t.id === taskId ? updated : t))
					: prev,
			);
		} catch (e: unknown) {
			toast.error(getApiErrorMessage(e));
		} finally {
			setAssignBusy(null);
		}
	};

	const showForm = tasks === null;

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<SoftCard>
				<CardHeader className="px-6 pb-2 pt-6">
					<CardTitle className="text-xl">Brain dump</CardTitle>
					<CardDescription>
						Drop everything on your mind — we will turn it into tasks.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 px-6 pb-6 pt-0">
					{showForm ? (
						<>
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="Everything on your mind right now — don't organise, just type."
								rows={12}
								className="min-h-48 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
							/>
							<div className="flex justify-end">
								<Button
									type="button"
									disabled={dumpMutation.isPending || !text.trim()}
									onClick={() => dumpMutation.mutate()}
								>
									Dump and organise
								</Button>
							</div>
						</>
					) : (
						<>
							<ul className="space-y-4">
								{tasks.map((task) => (
									<li
										key={task.id}
										className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-white/5"
									>
										<div className="min-w-0 flex-1 space-y-2">
											<p className="font-medium leading-snug text-foreground">
												{task.title}
											</p>
											<div className="flex flex-wrap items-center gap-2">
												<PriorityBadge priority={task.priority} />
												{task.estimated_minutes != null && (
													<span className="text-xs text-muted-foreground">
														~{task.estimated_minutes} min
													</span>
												)}
											</div>
										</div>
										<ProjectPicker
											projects={projects}
											value={task.project}
											disabled={assignBusy === task.id}
											onChange={(projectId) =>
												void onAssign(task.id, projectId)
											}
										/>
									</li>
								))}
							</ul>
							<div className="flex justify-end pt-2">
								<Button
									type="button"
									onClick={() => router.push('/tasks')}
								>
									Save all
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</SoftCard>
		</div>
	);
}

function ProjectPicker({
	projects,
	value,
	disabled,
	onChange,
}: {
	projects: ProjectListItem[];
	value: string | null;
	disabled: boolean;
	onChange: (projectId: string) => void;
}) {
	return (
		<label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground sm:items-end">
			<span className="sr-only">Add to project</span>
			<select
				className={cn(
					'h-10 w-full min-w-[12rem] rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:w-56 dark:bg-input/30',
					!value && 'text-muted-foreground',
				)}
				disabled={disabled}
				value={value ?? ''}
				onChange={(e) => {
					const v = e.target.value;
					if (v) onChange(v);
				}}
			>
				<option value="">Add to project</option>
				{projects.map((p) => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</label>
	);
}
