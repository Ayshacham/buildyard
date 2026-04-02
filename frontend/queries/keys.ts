export const queryKeys = {
	accounts: {
		all: ['accounts'] as const,
		me: () => ['accounts', 'me'] as const,
		streak: () => ['accounts', 'streak'] as const,
	},
	projects: {
		all: ['projects'] as const,
		list: () => ['projects', 'list'] as const,
	},
	sessions: {
		all: ['sessions'] as const,
		active: () => ['sessions', 'active'] as const,
	},
};
