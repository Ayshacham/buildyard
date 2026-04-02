import { queryOptions } from '@tanstack/react-query';

import { getMe, getStreak } from '@/lib/api/accounts';

import { queryKeys } from './keys';

export const accountsQueries = {
	me: () =>
		queryOptions({
			queryKey: queryKeys.accounts.me(),
			queryFn: getMe,
		}),
	streak: () =>
		queryOptions({
			queryKey: queryKeys.accounts.streak(),
			queryFn: getStreak,
		}),
};
