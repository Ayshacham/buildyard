import { api } from '@/lib/api/axios';
import type { ProjectListItem } from '@/lib/api/types';

export async function listProjects() {
	return await api.get<ProjectListItem[]>('/api/projects/').then((r) => r.data);
}
