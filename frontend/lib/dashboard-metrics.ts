import type { ApiUser, StreakResponse } from '@/lib/api/types';
import {
	calendarDaysEnding,
	findStreakDay,
	xpProgressWithinLevel,
} from '@/lib/dashboard-format';

export type DashboardMetrics = {
	sessionsToday: number;
	sessionHint?: string;
	sessionHintPositive: boolean;
	focusMinutesToday: number;
	focusGoalProgressFraction: number;
	dailyGoalMinutes: number;
	tasksToday: number;
	taskHint?: string;
	taskHintPositive: boolean;
	streakWeekIsoDates: string[];
	xpLevelProgressFraction: number;
	nextLevelXpThreshold: number;
	xpPointsUntilNextLevel: number;
	nextLevel: number;
};

export function computeDashboardMetrics(
	user: ApiUser,
	streak: StreakResponse,
): DashboardMetrics {
	const today = new Date();
	const todayKey = calendarDaysEnding(today, 1)[0];
	const yesterdayKey = calendarDaysEnding(
		new Date(today.getTime() - 86400000),
		1,
	)[0];

	const todayRow = findStreakDay(streak.days, todayKey);
	const yesterdayRow = findStreakDay(streak.days, yesterdayKey);

	const sessionsToday = todayRow?.sessions_completed ?? 0;
	const sessionsYesterday = yesterdayRow?.sessions_completed ?? 0;
	const sessionDelta = sessionsToday - sessionsYesterday;

	const sessionHint =
		sessionDelta === 0 && sessionsYesterday === 0
			? undefined
			: sessionDelta >= 0
				? `+${sessionDelta} vs yesterday`
				: `${sessionDelta} vs yesterday`;

	const focusMinutesToday = todayRow?.focus_minutes ?? 0;
	const dailyGoalMinutes = user.daily_goal_minutes;
	const focusGoalProgressFraction =
		dailyGoalMinutes > 0 ? focusMinutesToday / dailyGoalMinutes : 0;

	const tasksToday = todayRow?.tasks_completed ?? 0;

	const streakWeekIsoDates = calendarDaysEnding(today, 7);
	const averageTasksPerDayLastWeek =
		streakWeekIsoDates.reduce((sum, isoDate) => {
			const streakDay = findStreakDay(streak.days, isoDate);
			return sum + (streakDay?.tasks_completed ?? 0);
		}, 0) / 7;
	const tasksVersusWeekAverage = Math.round(
		tasksToday - averageTasksPerDayLastWeek,
	);

	const taskHint =
		tasksToday === 0 && averageTasksPerDayLastWeek === 0
			? undefined
			: `${tasksVersusWeekAverage >= 0 ? '+' : ''}${tasksVersusWeekAverage} vs avg`;

	const { levelProgressFraction } = xpProgressWithinLevel(user.xp);
	const nextLevel = user.level + 1;
	const nextLevelXpThreshold = user.level * 500;
	const xpPointsUntilNextLevel = Math.max(
		0,
		nextLevelXpThreshold - user.xp,
	);

	return {
		sessionsToday,
		sessionHint,
		sessionHintPositive: sessionDelta >= 0,
		focusMinutesToday,
		focusGoalProgressFraction,
		dailyGoalMinutes,
		tasksToday,
		taskHint,
		taskHintPositive: tasksVersusWeekAverage >= 0,
		streakWeekIsoDates,
		xpLevelProgressFraction: levelProgressFraction,
		nextLevelXpThreshold,
		xpPointsUntilNextLevel,
		nextLevel,
	};
}
