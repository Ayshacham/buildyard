import { api } from '@/lib/api/axios';
import type { ProjectTask } from '@/lib/api/types';

export async function regenerateProjectContext(projectId: string) {
	const { data } = await api.post<{ last_context: string }>(
		'/api/ai/context/',
		{ project_id: projectId },
	);
	return data;
}

export async function postRubberDuck(body: {
	message: string;
	project_id?: string;
}) {
	const { data } = await api.post<{ reply: string }>(
		'/api/ai/rubber-duck/',
		body,
	);
	return data;
}

export async function postBreakDownTask(taskId: string) {
	const { data } = await api.post<ProjectTask[]>('/api/ai/breakdown/', {
		task_id: taskId,
	});
	return data;
}
