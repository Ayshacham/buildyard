import { api } from '@/lib/api/axios';
import type {
	CreateProjectTaskInput,
	PatchProjectTaskInput,
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

export async function createProjectTask(
	projectId: string,
	input: CreateProjectTaskInput,
) {
	return await api
		.post<ProjectTask>(`/api/projects/${projectId}/tasks/`, input)
		.then((r) => r.data);
}

export async function updateProjectTask(
	projectId: string,
	taskId: string,
	input: PatchProjectTaskInput,
) {
	return await api
		.patch<ProjectTask>(
			`/api/projects/${projectId}/tasks/${taskId}/`,
			input,
		)
		.then((r) => r.data);
}

export async function deleteProjectTask(projectId: string, taskId: string) {
	await api.delete(`/api/projects/${projectId}/tasks/${taskId}/`);
}

export type CreateProjectInput = {
	name: string;
	description?: string;
	color: string;
	github_repo?: string;
};

export async function createProject(input: CreateProjectInput) {
	return await api
		.post<ProjectDetail>('/api/projects/', input)
		.then((r) => r.data);
}

export async function updateProject(
	projectId: string,
	input: Partial<CreateProjectInput>,
) {
	return await api
		.patch<ProjectDetail>(`/api/projects/${projectId}/`, input)
		.then((r) => r.data);
}
