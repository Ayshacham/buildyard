import { useQuery } from '@tanstack/react-query';

import { projectsQueries } from '@/queries/projects';

export function useProjectTasks(projectId: string | undefined) {
	return useQuery({
		...projectsQueries.tasks(projectId ?? ''),
		enabled: Boolean(projectId),
	});
}
