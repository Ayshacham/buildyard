import type { ApiUser } from '@/lib/api/types';
import type { DashboardMetrics } from '@/lib/dashboard-metrics';

import { MetricStatCard } from '@/components/dashboard/metric-stat-card';
import { FocusMetricCard } from '@/components/dashboard/focus-metric-card';

type DashboardMetricsRowProps = {
	user: ApiUser;
	metrics: DashboardMetrics;
};

export function DashboardMetricsRow({
	user,
	metrics,
}: DashboardMetricsRowProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
			<MetricStatCard
				label="Sessions today"
				value={String(metrics.sessionsToday)}
				hint={metrics.sessionHint}
				hintPositive={metrics.sessionHintPositive}
			/>
			<FocusMetricCard
				focusMinutes={metrics.focusMinutesToday}
				dailyGoalMinutes={metrics.dailyGoalMinutes}
				focusGoalProgressFraction={metrics.focusGoalProgressFraction}
			/>
			<MetricStatCard
				label="Tasks done"
				value={String(metrics.tasksToday)}
				hint={metrics.taskHint}
				hintPositive={metrics.taskHintPositive}
			/>
			<MetricStatCard
				label="XP earned"
				value={String(user.xp)}
				hint={`level ${user.level} → ${metrics.nextLevel}`}
			/>
		</div>
	);
}
