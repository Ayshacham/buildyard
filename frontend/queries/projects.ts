import { queryOptions } from '@tanstack/react-query';

import { getProject, listProjectTasks, listProjects } from '@/lib/api/projects';

import { queryKeys } from './keys';

export const projectsQueries = {
	list: () =>
		queryOptions({
			queryKey: queryKeys.projects.list(),
			queryFn: listProjects,
		}),
	detail: (projectId: string) =>
		queryOptions({
			queryKey: queryKeys.projects.detail(projectId),
			queryFn: () => getProject(projectId),
		}),
	tasks: (projectId: string) =>
		queryOptions({
			queryKey: queryKeys.projects.tasks(projectId),
			queryFn: () => listProjectTasks(projectId),
		}),
};
