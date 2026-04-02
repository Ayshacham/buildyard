import { api } from '@/lib/api/axios';
import type {
	ProjectDetail,
	ProjectListItem,
	ProjectTask,
} from '@/lib/api/types';

export async function listProjects() {
	return await api.get<ProjectListItem[]>('/api/projects/').then((r) => r.data);
}

export async function getProject(projectId: string) {
	return await api
		.get<ProjectDetail>(`/api/projects/${projectId}/`)
		.then((r) => r.data);
}

export async function listProjectTasks(projectId: string) {
	return await api
		.get<ProjectTask[]>(`/api/projects/${projectId}/tasks/`)
		.then((r) => r.data);
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
