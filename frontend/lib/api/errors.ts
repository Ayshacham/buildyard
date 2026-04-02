import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown): string {
	if (isAxiosError(error)) {
		const responseBody = error.response?.data;
		if (responseBody && typeof responseBody === 'object' && 'detail' in responseBody) {
			const detail = (responseBody as { detail: unknown }).detail;
			if (typeof detail === 'string') return detail;
			if (Array.isArray(detail)) return JSON.stringify(detail);
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return 'Something went wrong';
}
