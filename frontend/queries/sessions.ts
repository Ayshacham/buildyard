import { queryOptions } from '@tanstack/react-query';

import { getActiveSession } from '@/lib/api/sessions';

import { queryKeys } from './keys';

export const sessionsQueries = {
	active: () =>
		queryOptions({
			queryKey: queryKeys.sessions.active(),
			queryFn: getActiveSession,
		}),
};
