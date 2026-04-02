import { StatCell } from './stat-cell';

type ProjectStatsRowProps = {
	commitsThisWeek: number;
	openPrsCount: number;
	focusMinutesThisWeek: number;
	tasksCompletedThisWeek: number;
};

export function ProjectStatsRow({
	commitsThisWeek,
	openPrsCount,
	focusMinutesThisWeek,
	tasksCompletedThisWeek,
}: ProjectStatsRowProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<StatCell label="Commits this week" value={commitsThisWeek} />
			<StatCell label="Open PRs" value={openPrsCount} />
			<StatCell label="Focus minutes (week)" value={focusMinutesThisWeek} />
			<StatCell
				label="Tasks completed (week)"
				value={tasksCompletedThisWeek}
			/>
		</div>
	);
}
