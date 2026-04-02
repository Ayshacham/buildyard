import { api } from '@/lib/api/axios';
import type { ApiUser, StreakResponse } from '@/lib/api/types';

export async function getMe() {
	return await api.get<ApiUser>('/api/accounts/me/').then((r) => r.data);
}

export async function getStreak() {
	return await api.get<StreakResponse>('/api/accounts/streak/').then((r) => r.data);
}
