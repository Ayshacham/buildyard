import { useQuery } from '@tanstack/react-query';

import { tasksQueries } from '@/queries/tasks';

export function useUserTasks() {
	return useQuery(tasksQueries.user());
}
