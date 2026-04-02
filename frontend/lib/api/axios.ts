import axios from 'axios';

import { createClient } from '@/lib/supabase/client';

const baseURL = (
	process.env.NEXT_PUBLIC_API_URL?.trim() ?? 'http://127.0.0.1:8000'
).replace(/\/$/, '');

export const api = axios.create({
	baseURL,
	headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const token = session?.access_token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
