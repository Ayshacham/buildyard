import { queryOptions } from '@tanstack/react-query';

import { listUserTasks } from '@/lib/api/tasks';

import { queryKeys } from './keys';

export const tasksQueries = {
	user: () =>
		queryOptions({
			queryKey: queryKeys.tasks.user(),
			queryFn: listUserTasks,
		}),
};
