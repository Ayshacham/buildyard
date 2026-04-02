'use client';

import { StreakCard } from '@/components/dashboard/streak-card';
import { StandupCard } from '@/components/dashboard/standup-card';
import { ProjectsCard } from '@/components/dashboard/projects-card';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { FocusTimerCard } from '@/components/dashboard/focus-timer-card';
import { DashboardMetricsRow } from '@/components/dashboard/dashboard-metrics-row';

import { computeDashboardMetrics } from '@/lib/dashboard-metrics';
import type { ApiUser, ProjectListItem, StreakResponse } from '@/lib/api/types';

export type DashboardHomeProps = {
	user: ApiUser;
	streak: StreakResponse;
	projects: ProjectListItem[];
};

export function DashboardHome({ user, streak, projects }: DashboardHomeProps) {
	const dashboardMetrics = computeDashboardMetrics(user, streak);

	return (
		<div className="space-y-8">
			<DashboardHero />
			<DashboardMetricsRow user={user} metrics={dashboardMetrics} />
			<div className="grid gap-4 lg:grid-cols-2">
				<StandupCard />
				<FocusTimerCard />
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<ProjectsCard projects={projects} />
				<StreakCard
					user={user}
					streak={streak}
					metrics={dashboardMetrics}
				/>
			</div>
		</div>
	);
}
