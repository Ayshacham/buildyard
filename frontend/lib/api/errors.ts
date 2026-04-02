import { isAxiosError } from 'axios';

function collectDrfMessages(data: object): string[] {
	const messages: string[] = [];
	const body = data as Record<string, unknown>;
	for (const [key, val] of Object.entries(body)) {
		if (key === 'detail') continue;
		if (typeof val === 'string') {
			messages.push(val);
			continue;
		}
		if (Array.isArray(val)) {
			for (const item of val) {
				if (typeof item === 'string') messages.push(item);
			}
		}
	}
	if (messages.length > 0) return messages;
	if ('detail' in body) {
		const detail = body.detail;
		if (typeof detail === 'string') return [detail];
		if (Array.isArray(detail)) {
			return detail.filter((item): item is string => typeof item === 'string');
		}
	}
	return [];
}

export function getApiErrorMessage(error: unknown): string {
	if (isAxiosError(error)) {
		const responseBody = error.response?.data;
		if (responseBody && typeof responseBody === 'object') {
			const fromFields = collectDrfMessages(responseBody);
			if (fromFields.length > 0) return fromFields.join(' ');
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return 'Something went wrong';
}
