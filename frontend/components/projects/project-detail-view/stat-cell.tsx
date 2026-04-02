export function StatCell({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div className="rounded-xl border border-border/40 bg-muted/75 px-3 py-3 text-center dark:bg-white/5">
			<p className="text-2xl font-semibold tabular-nums text-foreground">
				{value}
			</p>
			<p className="mt-1 text-xs text-muted-foreground">{label}</p>
		</div>
	);
}
