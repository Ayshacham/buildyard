export function ProjectDetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="h-12 w-2/3 animate-pulse rounded-lg bg-muted/50" />
			<div className="h-32 animate-pulse rounded-2xl bg-muted/40" />
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-24 animate-pulse rounded-xl bg-muted/40"
					/>
				))}
			</div>
		</div>
	);
}
