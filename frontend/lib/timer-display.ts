export type TimerStateSnapshot = {
	elapsed_seconds: number;
	planned_seconds: number;
	is_running: boolean;
	is_paused: boolean;
	last_tick_at: string | null;
};

export function effectiveElapsedSeconds(timer: TimerStateSnapshot): number {
	let elapsed = timer.elapsed_seconds;
	if (timer.is_running && !timer.is_paused && timer.last_tick_at) {
		const lastTickMs = new Date(timer.last_tick_at).getTime();
		elapsed += (Date.now() - lastTickMs) / 1000;
	}
	return Math.min(timer.planned_seconds, Math.floor(elapsed));
}

export function formatMinutesSeconds(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
