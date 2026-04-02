'use client';

import { useMemo } from 'react';

import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { SoftCard } from '@/components/dashboard/soft-card';
import { LinearProgress } from '@/components/dashboard/linear-progress';

import { useFocusSession } from '@/hooks/use-focus-session';

import type { ProjectListItem } from '@/lib/api/types';
import { formatMinutesSeconds } from '@/lib/timer-display';

const DAILY_FOCUS_BLOCKS = 4;

type FocusTimerCardProps = {
	focusDurationMinutes: number;
	sessionsCompletedToday: number;
	projects: ProjectListItem[];
};

export function FocusTimerCard({
	focusDurationMinutes,
	sessionsCompletedToday,
	projects,
}: FocusTimerCardProps) {
	const defaultProjectId = projects[0]?.id;

	const {
		session,
		progressFraction,
		timeLabel,
		isLoadingActive,
		isBusy,
		hasActiveSession,
		isRunning,
		isPaused,
		start,
		end,
		pause,
		resume,
	} = useFocusSession({
		focusDurationMinutes,
		defaultProjectId,
	});

	const sessionLabel = useMemo(() => {
		const projectId = session?.project;
		if (!projectId) return 'Focus session';
		const match = projects.find((project) => project.id === projectId);
		return match?.name ?? 'Focus session';
	}, [session?.project, projects]);

	const idlePreview = formatMinutesSeconds(focusDurationMinutes * 60);

	const sessionNumber = Math.min(
		DAILY_FOCUS_BLOCKS,
		sessionsCompletedToday + 1,
	);

	const badgeLabel = (() => {
		if (isPaused) return 'Paused';
		if (isRunning) return 'Running';
		if (hasActiveSession) return 'Ready';
		return `Session ${sessionNumber} / ${DAILY_FOCUS_BLOCKS}`;
	})();

	return (
		<SoftCard>
			<CardHeader className="flex flex-row items-start justify-between gap-3 px-6 pb-2 pt-6">
				<div className="space-y-1">
					<CardTitle className="text-lg">Focus timer</CardTitle>
					<CardDescription>Current focus block.</CardDescription>
				</div>
				<Badge
					variant="secondary"
					className="shrink-0 border-0 bg-muted font-medium"
				>
					{badgeLabel}
				</Badge>
			</CardHeader>

			<CardContent className="space-y-4 px-6 pb-6 pt-0">
				<div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center dark:bg-white/[0.03]">
					<p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-foreground md:text-5xl">
						{isLoadingActive
							? '—:—'
							: hasActiveSession
							? timeLabel
							: idlePreview}
					</p>
					<div className="mx-auto mt-4 max-w-xs">
						<LinearProgress
							fractionComplete={hasActiveSession ? progressFraction : 0}
						/>
					</div>
					<p className="mt-3 text-sm text-muted-foreground">{sessionLabel}</p>
				</div>

				<div className="flex flex-wrap justify-end gap-2">
					{!hasActiveSession ? (
						<Button type="button" size="sm" disabled={isBusy} onClick={start}>
							Start focus
						</Button>
					) : (
						<>
							{isRunning ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isBusy}
									onClick={pause}
								>
									Pause
								</Button>
							) : (
								<Button
									type="button"
									size="sm"
									disabled={isBusy}
									onClick={resume}
								>
									Resume
								</Button>
							)}
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isBusy}
								onClick={end}
							>
								End session
							</Button>
						</>
					)}
				</div>
			</CardContent>
		</SoftCard>
	);
}
