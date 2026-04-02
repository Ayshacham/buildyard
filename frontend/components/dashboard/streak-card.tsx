import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { SoftCard } from '@/components/dashboard/soft-card';
import { LinearProgress } from '@/components/dashboard/linear-progress';

import { findStreakDay } from '@/lib/dashboard-format';
import type { ApiUser, StreakResponse } from '@/lib/api/types';
import type { DashboardMetrics } from '@/lib/dashboard-metrics';

import { cn } from '@/utils/cn';

type StreakCardProps = {
	user: ApiUser;
	streak: StreakResponse;
	metrics: Pick<
		DashboardMetrics,
		| 'streakWeekIsoDates'
		| 'xpLevelProgressFraction'
		| 'nextLevelXpThreshold'
		| 'xpPointsUntilNextLevel'
		| 'nextLevel'
	>;
};

export function StreakCard({ user, streak, metrics }: StreakCardProps) {
	const {
		nextLevel,
		streakWeekIsoDates,
		nextLevelXpThreshold,
		xpPointsUntilNextLevel,
		xpLevelProgressFraction,
	} = metrics ?? {};

	return (
		<SoftCard>
			<CardHeader className="flex flex-row items-start justify-between gap-3 px-6 pb-2 pt-6">
				<div className="space-y-1">
					<CardTitle className="text-lg">Streak</CardTitle>
					<CardDescription>Daily goal consistency.</CardDescription>
				</div>
				<Badge
					variant="secondary"
					className="shrink-0 border-0 bg-primary/10 font-medium text-primary"
				>
					{streak?.current_streak} days
				</Badge>
			</CardHeader>

			<CardContent className="space-y-5 px-6 pb-6 pt-0">
				<div className="flex gap-1.5 sm:gap-2">
					{streakWeekIsoDates?.map((isoDate) => {
						const streakDay = findStreakDay(streak?.days ?? [], isoDate);
						const goalMet = streakDay?.goal_met ?? false;
						return (
							<div
								key={isoDate}
								title={isoDate}
								className={cn(
									'aspect-square min-h-0 flex-1 rounded-md border transition-colors',
									goalMet
										? 'border-primary/30 bg-primary/35 dark:bg-primary/40'
										: 'border-border/40 bg-muted/30 dark:bg-white/5',
								)}
							/>
						);
					})}
				</div>
				<div className="space-y-2">
					<div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
						<span className="font-medium text-foreground">
							Level {user.level}
						</span>
						<span className="tabular-nums text-muted-foreground">
							{user.xp} / {nextLevelXpThreshold} XP
						</span>
					</div>
					<LinearProgress fractionComplete={xpLevelProgressFraction} />
					<p className="text-xs text-muted-foreground">
						{xpPointsUntilNextLevel} XP to level {nextLevel}
					</p>
				</div>
			</CardContent>
		</SoftCard>
	);
}
