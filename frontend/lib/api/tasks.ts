import { api } from '@/lib/api/axios';
import type {
	PatchProjectTaskInput,
	ProjectTask,
	UserTaskListItem,
} from '@/lib/api/types';

export async function listUserTasks() {
	return await api
		.get<UserTaskListItem[]>('/api/tasks/')
		.then((r) => r.data);
}

export async function patchTask(taskId: string, body: PatchProjectTaskInput) {
	const { data } = await api.patch<ProjectTask>(`/api/tasks/${taskId}/`, body);
	return data;
}
