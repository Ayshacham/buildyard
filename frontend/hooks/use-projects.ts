import { useQuery } from '@tanstack/react-query';

import { projectsQueries } from '@/queries/projects';

export function useProjects() {
	return useQuery(projectsQueries.list());
}
