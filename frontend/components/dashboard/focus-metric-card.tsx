import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';

import { SoftCard } from '@/components/dashboard/soft-card';
import { LinearProgress } from '@/components/dashboard/linear-progress';

export type FocusMetricCardProps = {
	focusMinutes: number;
	dailyGoalMinutes: number;
	focusGoalProgressFraction: number;
};

export function FocusMetricCard({
	focusMinutes,
	dailyGoalMinutes,
	focusGoalProgressFraction,
}: FocusMetricCardProps) {
	return (
		<SoftCard>
			<CardHeader className="space-y-1 px-5 pb-0 pt-5">
				<CardDescription className="text-xs font-medium uppercase tracking-wide">
					Focus time
				</CardDescription>
				<CardTitle className="text-2xl font-semibold tabular-nums tracking-tight">
					{focusMinutes}m
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 px-5 pb-5 pt-2">
				<p className="text-xs text-muted-foreground">
					of {dailyGoalMinutes}m goal
				</p>
				<LinearProgress fractionComplete={focusGoalProgressFraction} />
			</CardContent>
		</SoftCard>
	);
}
