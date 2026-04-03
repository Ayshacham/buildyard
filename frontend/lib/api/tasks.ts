import { api } from '@/lib/api/axios';
import type { UserTaskListItem } from '@/lib/api/types';

export async function listUserTasks() {
	return await api
		.get<UserTaskListItem[]>('/api/tasks/')
		.then((r) => r.data);
}
