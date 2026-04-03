'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

import { AddProjectDialog } from '@/components/projects/add-project-dialog';
import { StartFocusSessionDialog } from '@/components/projects/start-focus-session-dialog';
import { ProjectAdhdToolsCard } from '@/components/projects/project-detail-view/adhd-tools-card';
import { ProjectContextCard } from '@/components/projects/project-detail-view/context-card';
import { ProjectGoalsCard } from '@/components/projects/project-detail-view/project-goals-card';
import { ProjectDetailHeader } from '@/components/projects/project-detail-view/header';
import { ProjectOpenPrsCard } from '@/components/projects/project-detail-view/open-prs-card';
import { ProjectRecentCommitsCard } from '@/components/projects/project-detail-view/recent-commits-card';
import { ProjectDetailSessionBanner } from '@/components/projects/project-detail-view/session-banner';
import { ProjectDetailSkeleton } from '@/components/projects/project-detail-view/skeleton';
import { ProjectStatsRow } from '@/components/projects/project-detail-view/stats-row';
import { ProjectTasksCard } from '@/components/projects/project-detail-view/tasks-card';
import { ErrorState } from '@/components/ui/error-state';
import { useMe } from '@/hooks/use-me';
import { useProject } from '@/hooks/use-project';
import { useProjectTasks } from '@/hooks/use-project-tasks';
import { regenerateProjectContext } from '@/lib/api/ai';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { ProjectDetail } from '@/lib/api/types';
import { effectiveElapsedSeconds } from '@/lib/timer-display';
import { queryKeys } from '@/queries/keys';
import { sessionsQueries } from '@/queries/sessions';
import { githubRepoUrl } from '@/utils/github';

export function ProjectDetailView({ projectId }: { projectId: string }) {
	const queryClient = useQueryClient();
	const { data: user, isPending: isUserPending } = useMe();
	const projectQuery = useProject(projectId);
	const tasksQuery = useProjectTasks(projectId);
	const activeSessionQuery = useQuery(sessionsQueries.active());
	const timer = activeSessionQuery.data?.timer ?? null;
	const activeProjectId =
		timer?.project ?? activeSessionQuery.data?.session?.project ?? null;
	const sessionForThisProject = Boolean(timer) && activeProjectId === projectId;
	const sessionForOtherProject =
		Boolean(timer) && activeProjectId !== projectId;

	const [startFocusOpen, setStartFocusOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const [liveTick, setLiveTick] = useState(0);
	useEffect(() => {
		if (!timer?.is_running || timer.is_paused) return;
		const id = window.setInterval(() => setLiveTick((n) => n + 1), 1000);
		return () => window.clearInterval(id);
	}, [timer?.is_running, timer?.is_paused, timer?.id]);

	const remainingSeconds = useMemo(() => {
		void liveTick;
		if (!timer) return 0;
		return Math.max(0, timer.planned_seconds - effectiveElapsedSeconds(timer));
	}, [timer, liveTick]);

	const regenerateMutation = useMutation({
		mutationFn: () => regenerateProjectContext(projectId),
		onSuccess: (data) => {
			queryClient.setQueryData(
				queryKeys.projects.detail(projectId),
				(old: ProjectDetail | undefined) =>
					old ? { ...old, last_context: data.last_context } : old,
			);
			toast.success('Context updated');
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	if (projectQuery.isPending) {
		return <ProjectDetailSkeleton />;
	}

	if (projectQuery.isError || !projectQuery.data) {
		return (
			<ErrorState
				title="Could not load project"
				description={getApiErrorMessage(projectQuery.error)}
			>
				<Link
					href="/projects"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Back to projects
				</Link>
			</ErrorState>
		);
	}

	const project = projectQuery.data;
	const tasks = tasksQuery.data ?? [];
	const ghUrl = githubRepoUrl(project.github_repo);

	return (
		<div className="space-y-8">
			<StartFocusSessionDialog
				open={startFocusOpen}
				onOpenChange={setStartFocusOpen}
				projectId={projectId}
				tasks={tasks}
				plannedDurationMinutes={user?.focus_duration ?? 25}
			/>
			<AddProjectDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				project={{
					id: project.id,
					name: project.name,
					description: project.description,
					goals: project.goals ?? '',
					color: project.color,
					github_repo: project.github_repo,
				}}
			/>

			<ProjectDetailHeader
				color={project.color}
				name={project.name}
				status={project.status}
				githubRepo={project.github_repo}
				repoUrl={ghUrl}
				lastSessionAt={project.last_session_at}
				sessionForThisProject={sessionForThisProject}
				sessionForOtherProject={sessionForOtherProject}
				userPending={isUserPending}
				onOpenStartFocus={() => setStartFocusOpen(true)}
				onEditProject={() => setEditOpen(true)}
			/>

			{sessionForThisProject && timer ? (
				<ProjectDetailSessionBanner
					timer={timer}
					remainingSeconds={remainingSeconds}
				/>
			) : null}

			<ProjectContextCard
				lastContext={project.last_context}
				onRegenerate={() => regenerateMutation.mutate()}
				isRegenerating={regenerateMutation.isPending}
			/>

			<ProjectGoalsCard projectId={projectId} goals={project.goals ?? ''} />

			<ProjectStatsRow
				commitsThisWeek={project.commits_this_week ?? 0}
				openPrsCount={project.open_prs.length}
				focusMinutesThisWeek={project.focus_minutes_this_week ?? 0}
				tasksCompletedThisWeek={project.tasks_completed_this_week ?? 0}
			/>

			<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
				<ProjectTasksCard
					projectId={projectId}
					isPending={tasksQuery.isPending}
					isError={tasksQuery.isError}
					error={tasksQuery.error}
					tasks={tasks}
				/>

				<div className="space-y-6">
					<ProjectOpenPrsCard
						pullRequests={project.open_prs}
						repoFallbackUrl={ghUrl}
					/>
					<ProjectAdhdToolsCard
						projectId={projectId}
						projectName={project.name}
						tasks={tasks}
					/>
				</div>
			</div>

			<ProjectRecentCommitsCard commits={project.recent_commits} />
		</div>
	);
}
