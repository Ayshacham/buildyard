import { api } from '@/lib/api/axios';
import type { ProjectListItem } from '@/lib/api/types';

export async function listProjects() {
	return await api.get<ProjectListItem[]>('/api/projects/').then((r) => r.data);
}

export type CreateProjectInput = {
	name: string;
	description?: string;
	color: string;
	github_repo?: string;
};

export async function createProject(input: CreateProjectInput) {
	return await api
		.post<unknown>('/api/projects/', input)
		.then((r) => r.data);
}
