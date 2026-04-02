export function projectStatusBadgeClass(status: string) {
	const s = status.toLowerCase();
	if (s === 'active') {
		return 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-200';
	}
	if (s === 'stale') {
		return 'bg-amber-500/15 text-amber-950 dark:text-amber-100';
	}
	return 'bg-muted text-muted-foreground';
}
