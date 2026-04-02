export type ApiUser = {
	id: string;
	username: string;
	email: string;
	github_username: string;
	avatar_url: string;
	adhd_mode: boolean;
	focus_duration: number;
	daily_goal_minutes: number;
	xp: number;
	level: number;
	supabase_uid: string | null;
};

export type StreakDayRow = {
	id: string;
	date: string;
	focus_minutes: number;
	tasks_completed: number;
	sessions_completed: number;
	goal_met: boolean;
};

export type StreakResponse = {
	days: StreakDayRow[];
	current_streak: number;
};

export type FocusSessionApi = {
	id: string;
	project: string | null;
	task: string | null;
	started_at: string;
	ended_at: string | null;
	duration_minutes: number | null;
	planned_duration_minutes: number;
	completed: boolean;
	xp_earned: number;
};

export type TimerStateApi = {
	id: string;
	session: FocusSessionApi | null;
	task: string | null;
	project: string | null;
	elapsed_seconds: number;
	planned_seconds: number;
	is_running: boolean;
	is_paused: boolean;
	last_tick_at: string | null;
	stuck_notification_sent?: boolean;
};

export type ActiveSessionResponse = {
	timer: TimerStateApi | null;
	session: FocusSessionApi | null;
};

export type ProjectListItem = {
	id: string;
	name: string;
	description: string;
	color: string;
	status: string;
	github_repo: string;
	health_score: number | null;
	total_focus_minutes: number;
	last_session_at: string | null;
	last_commit_at: string | null;
	created_at: string;
	open_prs_count: number;
	recent_commit: unknown;
};
