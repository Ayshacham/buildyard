'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api/errors';
import { updateProject } from '@/lib/api/projects';
import type { ProjectDetail } from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';

type ProjectGoalsCardProps = {
	projectId: string;
	goals: string;
};

export function ProjectGoalsCard({ projectId, goals }: ProjectGoalsCardProps) {
	const queryClient = useQueryClient();
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(goals);

	React.useEffect(() => {
		if (!editing) {
			setDraft(goals);
		}
	}, [goals, editing]);

	const saveMutation = useMutation({
		mutationFn: (next: string) =>
			updateProject(projectId, { goals: next }),
		onSuccess: (data) => {
			queryClient.setQueryData(
				queryKeys.projects.detail(projectId),
				(old: ProjectDetail | undefined) =>
					old ? { ...old, goals: data.goals } : old,
			);
		},
		onError: (err: unknown) => {
			toast.error(getApiErrorMessage(err));
		},
	});

	const trimmedInitial = goals.trim();
	if (!trimmedInitial && !editing) {
		return null;
	}

	function commit() {
		const next = draft.trim();
		if (next === goals.trim()) {
			setEditing(false);
			return;
		}
		saveMutation.mutate(next, {
			onSuccess: () => setEditing(false),
			onError: () => setDraft(goals),
		});
	}

	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<CardTitle className="text-lg">Goals &amp; phases</CardTitle>
				<CardDescription>
					What you planned for this project — click to edit.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				{editing ? (
					<textarea
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onBlur={() => commit()}
						autoFocus
						rows={5}
						disabled={saveMutation.isPending}
						className="min-h-24 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
					/>
				) : (
					<button
						type="button"
						onClick={() => setEditing(true)}
						className="w-full rounded-xl border border-border/40 bg-muted/15 px-4 py-4 text-left text-sm leading-relaxed text-foreground outline-none transition-colors hover:bg-muted/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-white/5"
					>
						{trimmedInitial}
					</button>
				)}
			</CardContent>
		</SoftCard>
	);
}
