import { useQuery } from '@tanstack/react-query';

import { accountsQueries } from '@/queries/accounts';

export function useMe() {
	return useQuery(accountsQueries.me());
}
