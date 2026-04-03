'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { SoftCard } from '@/components/dashboard/soft-card';

import { cn } from '@/utils/cn';
import { aiQueries } from '@/queries/ai';

export function StandupCard() {
	const standupQuery = useQuery(aiQueries.standup());

	const lines = (() => {
		const s = standupQuery.data;
		if (!s) return [];
		const where = s.where_you_are ?? [];
		const merged = [
			...s.highlights.map((t) => ({ t, kind: 'h' as const })),
			...where.map((t) => ({ t, kind: 'w' as const })),
			...s.blockers.map((t) => ({ t, kind: 'b' as const })),
			...s.suggestions.map((t) => ({ t, kind: 's' as const })),
		];
		return merged.slice(0, 8);
	})();

	const dotFor = (kind: 'h' | 'w' | 'b' | 's') => {
		if (kind === 'h') return 'bg-emerald-500';
		if (kind === 'w') return 'bg-violet-500';
		if (kind === 'b') return 'bg-amber-500';
		return 'bg-sky-500';
	};

	return (
		<SoftCard>
			<CardHeader className="flex flex-row items-start justify-between gap-3 px-6 pb-2 pt-6">
				<div className="space-y-1">
					<CardTitle className="text-lg">AI standup</CardTitle>
					<CardDescription>Quick read on what matters today.</CardDescription>
				</div>
				<Badge
					variant="secondary"
					className="shrink-0 border-0 bg-primary/10 font-medium text-primary"
				>
					Today
				</Badge>
			</CardHeader>
			<CardContent className="space-y-4 px-6 pb-6 pt-0">
				{standupQuery.isPending && (
					<ul className="space-y-3">
						{[0, 1, 2, 3].map((i) => (
							<li key={i} className="flex gap-3">
								<Skeleton className="mt-1.5 size-2 shrink-0 rounded-full" />
								<Skeleton className="h-4 flex-1 rounded-md" />
							</li>
						))}
					</ul>
				)}
				{standupQuery.data && (
					<ul className="space-y-3">
						{lines.map(({ t, kind }, i) => (
							<li key={`${kind}-${i}-${t}`} className="flex gap-3 text-sm">
								<span
									className={cn(
										'mt-1.5 size-2 shrink-0 rounded-full',
										dotFor(kind),
									)}
									aria-hidden
								/>
								<span className="text-pretty leading-relaxed text-foreground">
									{t}
								</span>
							</li>
						))}
					</ul>
				)}
				{standupQuery.isSuccess && lines.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No standup lines yet — open the full page to generate.
					</p>
				)}
				<p className="text-sm">
					<Link
						href="/dashboard/ai"
						className="font-medium text-primary hover:underline"
					>
						Open full standup
					</Link>
				</p>
			</CardContent>
		</SoftCard>
	);
}
