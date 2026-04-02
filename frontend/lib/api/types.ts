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
