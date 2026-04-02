import React from 'react';

export const LoadingSkeleton = () => {
	return (
		<div className="space-y-8">
			<div className="space-y-1.5">
				<div className="h-9 w-56 animate-pulse rounded-lg bg-muted/60" />
				<div className="h-4 max-w-md animate-pulse rounded bg-muted/40" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-28 animate-pulse rounded-[1.75rem] bg-muted/30"
					/>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="h-72 animate-pulse rounded-[1.75rem] bg-muted/30" />
				<div className="h-72 animate-pulse rounded-[1.75rem] bg-muted/30" />
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="h-64 animate-pulse rounded-[1.75rem] bg-muted/30" />
				<div className="h-64 animate-pulse rounded-[1.75rem] bg-muted/30" />
			</div>
		</div>
	);
};
