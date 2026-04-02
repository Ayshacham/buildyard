'use client';

import { DashboardHome } from '@/components/dashboard/dashboard-home';
import { LoadingSkeleton } from '@/components/dashboard/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useDashboardOverview } from '@/hooks/use-dashboard-overview';

export default function DashboardPage() {
	const {
		user,
		streak,
		projects,
		isLoading,
		isError,
		isSuccess,
		errorMessage,
	} = useDashboardOverview();

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (isError || !isSuccess || !user || !streak) {
		return (
			<ErrorState
				title="Backend unreachable or unauthorized"
				description={errorMessage ?? 'Could not load dashboard.'}
			>
				Ensure Django is running, CORS allows this origin, and{' '}
				<code>NEXT_PUBLIC_API_URL</code> points at it (default{' '}
				<code>http://127.0.0.1:8000</code>
				).
			</ErrorState>
		);
	}

	return <DashboardHome user={user} streak={streak} projects={projects} />;
}
