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

export type HealthSnapshotApi = {
	id: string;
	health_score: number;
	commits_this_week: number;
	open_prs: number;
	avg_pr_age_days: number;
	focus_minutes_this_week: number;
	tasks_completed_this_week: number;
	status: string;
	signals: unknown;
	snapped_at: string;
};

export type GithubPRApi = {
	id: string;
	pr_number: number;
	title: string;
	state: string;
	author: string;
	url: string;
	additions: number;
	deletions: number;
	comments_count: number;
	pr_opened_at: string | null;
	pr_merged_at: string | null;
	age_days: number | null;
};

export type GithubCommitApi = {
	id: string;
	sha: string;
	sha_short: string;
	message: string;
	author_name: string;
	committed_at: string | null;
	url: string;
};

export type ProjectDetail = {
	id: string;
	name: string;
	description: string;
	color: string;
	status: string;
	github_repo: string;
	github_default_branch: string;
	health_score: number | null;
	last_context: string;
	total_focus_minutes: number;
	last_session_at: string | null;
	last_commit_at: string | null;
	created_at: string;
	commits_this_week: number;
	focus_minutes_this_week: number;
	tasks_completed_this_week: number;
	recent_commits: GithubCommitApi[];
	open_prs: GithubPRApi[];
	latest_health: HealthSnapshotApi | null;
};

export type ProjectTask = {
	id: string;
	project: string;
	parent_task: string | null;
	title: string;
	is_micro_task: boolean;
	estimated_minutes: number | null;
	status: 'todo' | 'in_progress' | 'done';
	priority: 'low' | 'medium' | 'high';
	completed_at: string | null;
	created_at: string;
};
