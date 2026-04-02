import { useQuery } from '@tanstack/react-query';

import { projectsQueries } from '@/queries/projects';

export function useProject(projectId: string | undefined) {
	return useQuery({
		...projectsQueries.detail(projectId ?? ''),
		enabled: Boolean(projectId),
	});
}
