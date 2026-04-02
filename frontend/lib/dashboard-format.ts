import type { ProjectListItem, StreakDayRow } from '@/lib/api/types';

export function isoDateLocal(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function calendarDaysEnding(end: Date, count: number): string[] {
	const isoDates: string[] = [];
	for (let index = count - 1; index >= 0; index--) {
		const cursor = new Date(end);
		cursor.setDate(cursor.getDate() - index);
		isoDates.push(isoDateLocal(cursor));
	}
	return isoDates;
}

export function findStreakDay(
	streakDays: StreakDayRow[],
	isoDate: string,
): StreakDayRow | undefined {
	return streakDays.find(
		(streakDay) => streakDay.date.slice(0, 10) === isoDate.slice(0, 10),
	);
}

export function formatRelativeShort(isoTimestamp: string | null): string {
	if (!isoTimestamp) return '—';
	const parsed = new Date(isoTimestamp).getTime();
	if (Number.isNaN(parsed)) return '—';
	const diffMs = Date.now() - parsed;
	const minutesAgo = Math.floor(diffMs / 60000);
	if (minutesAgo < 1) return 'just now';
	if (minutesAgo < 60) return `${minutesAgo}m ago`;
	const hoursAgo = Math.floor(minutesAgo / 60);
	if (hoursAgo < 24) return `${hoursAgo}h ago`;
	const daysAgo = Math.floor(hoursAgo / 24);
	return `${daysAgo}d ago`;
}

export function formatLastSessionDays(isoTimestamp: string | null): string {
	if (!isoTimestamp) return 'No sessions yet';
	const parsed = new Date(isoTimestamp).getTime();
	if (Number.isNaN(parsed)) return 'No sessions yet';
	const daysAgo = Math.floor((Date.now() - parsed) / 86400000);
	if (daysAgo <= 0) return 'Today';
	if (daysAgo === 1) return '1 day ago';
	return `${daysAgo} days ago`;
}

export function projectActivityStatus(
	project: ProjectListItem,
): 'active' | 'stale' {
	if (!project.last_session_at) return 'stale';
	const daysSinceSession =
		(Date.now() - new Date(project.last_session_at).getTime()) / 86400000;
	return daysSinceSession > 3 ? 'stale' : 'active';
}

export function xpProgressWithinLevel(totalXp: number): {
	xpIntoCurrentLevel: number;
	xpRemainingWithinLevel: number;
	levelProgressFraction: number;
} {
	const xpIntoCurrentLevel = totalXp % 500;
	const xpRemainingWithinLevel = 500 - xpIntoCurrentLevel;
	const levelProgressFraction = xpIntoCurrentLevel / 500;
	return { xpIntoCurrentLevel, xpRemainingWithinLevel, levelProgressFraction };
}
