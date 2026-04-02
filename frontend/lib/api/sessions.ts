import type {
	TimerStateApi,
	FocusSessionApi,
	ActiveSessionResponse,
} from '@/lib/api/types';
import { api } from '@/lib/api/axios';

export async function getActiveSession(): Promise<ActiveSessionResponse> {
	const { data } = await api.get<ActiveSessionResponse>('/api/sessions/active/');
	return data;
}

export async function startFocusSession(body: {
	planned_duration_minutes?: number;
	project_id?: string;
	task_id?: string;
}): Promise<{ session: FocusSessionApi; timer: TimerStateApi }> {
	const { data } = await api.post<{
		session: FocusSessionApi;
		timer: TimerStateApi;
	}>('/api/sessions/start/', body);
	return data;
}

export async function postSessionHeartbeat(
	elapsedSeconds: number,
): Promise<TimerStateApi> {
	const { data } = await api.post<TimerStateApi>('/api/sessions/active/', {
		elapsed_seconds: elapsedSeconds,
	});
	return data;
}

export async function endFocusSession(body?: {
	elapsed_seconds?: number;
}): Promise<FocusSessionApi> {
	const { data } = await api.post<FocusSessionApi>(
		'/api/sessions/end/',
		body ?? {},
	);
	return data;
}

export async function pauseFocusSession(body?: {
	elapsed_seconds?: number;
}): Promise<TimerStateApi> {
	const { data } = await api.post<TimerStateApi>(
		'/api/sessions/pause/',
		body ?? {},
	);
	return data;
}

export async function resumeFocusSession(): Promise<TimerStateApi> {
	const { data } = await api.post<TimerStateApi>('/api/sessions/resume/');
	return data;
}
