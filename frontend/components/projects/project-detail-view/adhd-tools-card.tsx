'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { postBreakDownTask, postRubberDuck } from '@/lib/api/ai';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { ProjectTask } from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';

type ProjectAdhdToolsCardProps = {
	projectId: string;
	projectName: string;
	tasks: ProjectTask[];
};

export function ProjectAdhdToolsCard({
	projectId,
	projectName,
	tasks,
}: ProjectAdhdToolsCardProps) {
	const queryClient = useQueryClient();
	const [duckOpen, setDuckOpen] = React.useState(false);
	const [breakOpen, setBreakOpen] = React.useState(false);
	const [duckMessage, setDuckMessage] = React.useState('');
	const [duckReply, setDuckReply] = React.useState<string | null>(null);
	const [breakTaskId, setBreakTaskId] = React.useState('');

	const selectable = React.useMemo(
		() =>
			tasks.filter(
				(t) => t.status === 'in_progress' || t.status === 'todo',
			),
		[tasks],
	);

	React.useEffect(() => {
		if (duckOpen) {
			setDuckReply(null);
			setDuckMessage(
				`What I'm stuck on with "${projectName}": `,
			);
		}
	}, [duckOpen, projectName]);

	React.useEffect(() => {
		if (!breakOpen) return;
		if (selectable.length) {
			setBreakTaskId((prev) =>
				prev && selectable.some((t) => t.id === prev)
					? prev
					: selectable[0].id,
			);
		} else {
			setBreakTaskId('');
		}
	}, [breakOpen, selectable]);

	const duckMutation = useMutation({
		mutationFn: () =>
			postRubberDuck({
				message: duckMessage.trim(),
				project_id: projectId,
			}),
		onSuccess: (data) => {
			setDuckReply(data.reply);
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err));
		},
	});

	const breakMutation = useMutation({
		mutationFn: () => postBreakDownTask(breakTaskId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.projects.tasks(projectId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.tasks.user() });
			toast.success('Subtasks created');
			setBreakOpen(false);
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err));
		},
	});

	return (
		<>
			<SoftCard>
				<CardHeader className="px-6 pb-2 pt-6">
					<CardTitle className="text-lg">ADHD tools</CardTitle>
					<CardDescription>
						Lightweight helpers when you feel stuck.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 px-6 pb-6 pt-0">
					<button
						type="button"
						className="flex w-full gap-3 rounded-xl border border-border/40 bg-muted/15 px-3 py-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/5"
						onClick={() => setDuckOpen(true)}
					>
						<span className="text-2xl" aria-hidden>
							🦐
						</span>
						<div className="min-w-0 flex-1 space-y-1">
							<p className="font-medium text-foreground">Rubber duck</p>
							<p className="text-sm text-muted-foreground">
								Get unstuck on this project
							</p>
							<p className="pt-1 text-xs font-medium text-primary">
								Open →
							</p>
						</div>
					</button>
					<button
						type="button"
						disabled={selectable.length === 0}
						className="flex w-full gap-3 rounded-xl border border-border/40 bg-muted/15 px-3 py-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:bg-white/5"
						onClick={() => setBreakOpen(true)}
					>
						<span className="text-2xl" aria-hidden>
							⚡
						</span>
						<div className="min-w-0 flex-1 space-y-1">
							<p className="font-medium text-foreground">Break down a task</p>
							<p className="text-sm text-muted-foreground">
								Split into 15-min chunks
							</p>
							<p className="pt-1 text-xs font-medium text-primary">
								{selectable.length === 0
									? 'Add a task first'
									: 'Open →'}
							</p>
						</div>
					</button>
				</CardContent>
			</SoftCard>

			<Dialog open={duckOpen} onOpenChange={setDuckOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Rubber duck</DialogTitle>
						<DialogDescription>
							Describe where you are stuck. You will get one short next step
							or question.
						</DialogDescription>
					</DialogHeader>
					<textarea
						value={duckMessage}
						onChange={(e) => setDuckMessage(e.target.value)}
						rows={5}
						disabled={duckMutation.isPending}
						className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
					/>
					{duckReply ? (
						<div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground">
							{duckReply}
						</div>
					) : null}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setDuckOpen(false)}
							disabled={duckMutation.isPending}
						>
							Close
						</Button>
						<Button
							type="button"
							onClick={() => duckMutation.mutate()}
							disabled={
								duckMutation.isPending || !duckMessage.trim()
							}
						>
							{duckMutation.isPending ? (
								<Loader2Icon className="size-4 animate-spin" />
							) : null}
							Send
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={breakOpen} onOpenChange={setBreakOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Break down a task</DialogTitle>
						<DialogDescription>
							We will add small subtasks under the task you pick.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2">
						<label htmlFor="break-task" className="text-sm font-medium">
							Task
						</label>
						<select
							id="break-task"
							value={breakTaskId}
							onChange={(e) => setBreakTaskId(e.target.value)}
							disabled={breakMutation.isPending}
							className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
						>
							{selectable.map((t) => (
								<option key={t.id} value={t.id}>
									{t.title}
								</option>
							))}
						</select>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setBreakOpen(false)}
							disabled={breakMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={() => breakMutation.mutate()}
							disabled={
								breakMutation.isPending || !breakTaskId
							}
						>
							{breakMutation.isPending ? (
								<Loader2Icon className="size-4 animate-spin" />
							) : null}
							Break it down
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
