import { queryOptions } from '@tanstack/react-query';

import { listProjects } from '@/lib/api/projects';

import { queryKeys } from './keys';

export const projectsQueries = {
	list: () =>
		queryOptions({
			queryKey: queryKeys.projects.list(),
			queryFn: listProjects,
		}),
};
