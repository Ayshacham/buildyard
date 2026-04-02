import { useQuery } from '@tanstack/react-query';

import { accountsQueries } from '@/queries/accounts';

export function useStreak() {
	return useQuery(accountsQueries.streak());
}
