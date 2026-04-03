import { queryOptions } from '@tanstack/react-query';

import {
	getStandupHistory,
	getTodayStandup,
} from '@/lib/api/ai';

import { queryKeys } from './keys';

export const aiQueries = {
	standup: () =>
		queryOptions({
			queryKey: queryKeys.ai.standup(),
			queryFn: getTodayStandup,
		}),
	standupHistory: () =>
		queryOptions({
			queryKey: queryKeys.ai.standupHistory(),
			queryFn: getStandupHistory,
		}),
};
