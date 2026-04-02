import { useMemo } from 'react';

import { useMe } from '@/hooks/use-me';
import { useStreak } from '@/hooks/use-streak';
import { useProjects } from '@/hooks/use-projects';

import { getApiErrorMessage } from '@/lib/api/errors';

export function useDashboardOverview() {
	const { isPending, isError: meError, isSuccess: meSuccess, data: user } = useMe();
	const { isPending: isStreakPending, isError: isStreakError, isSuccess: isStreakSuccess, data: streak } = useStreak();
	const { isPending: isProjectsPending, isError: isProjectsError, isSuccess: isProjectsSuccess, data: projects = [] } = useProjects();

	const isError = meError || isStreakError || isProjectsError;
	const isLoading = isPending || isStreakPending || isProjectsPending;
	const isSuccess = meSuccess && isStreakSuccess && isProjectsSuccess;

	const errorMessage = useMemo(() => {
		const err = meError ?? isStreakError ?? isProjectsError;
		return err ? getApiErrorMessage(err) : undefined;
	}, [meError, isStreakError, isProjectsError]);

	return {
		user,
		streak,
		projects,
		isLoading,
		isError,
		isSuccess,
		errorMessage,
	};
}
