export const queryKeys = {
	accounts: {
		all: ['accounts'] as const,
		me: () => ['accounts', 'me'] as const,
		streak: () => ['accounts', 'streak'] as const,
	},
	projects: {
		all: ['projects'] as const,
		list: () => ['projects', 'list'] as const,
		detail: (id: string) => ['projects', 'detail', id] as const,
		tasks: (projectId: string) =>
			['projects', projectId, 'tasks'] as const,
	},
	sessions: {
		all: ['sessions'] as const,
		active: () => ['sessions', 'active'] as const,
	},
	tasks: {
		all: ['tasks'] as const,
		user: () => ['tasks', 'user'] as const,
	},
	ai: {
		all: ['ai'] as const,
		standup: () => ['ai', 'standup'] as const,
		standupHistory: () => ['ai', 'standupHistory'] as const,
	},
};
