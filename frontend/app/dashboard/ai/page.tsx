'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api/errors';
import { postRegenerateStandup } from '@/lib/api/ai';
import type { StandupApi } from '@/lib/api/types';
import { queryKeys } from '@/queries/keys';
import { aiQueries } from '@/queries/ai';
import { cn } from '@/utils/cn';

function StandupList({
	items,
	dotClass,
}: {
	items: string[];
	dotClass: string;
}) {
	if (!items.length) {
		return (
			<p className="text-sm text-muted-foreground">Nothing here yet.</p>
		);
	}
	return (
		<ul className="space-y-3">
			{items.map((line) => (
				<li key={line} className="flex gap-3 text-sm">
					<span
						className={cn('mt-1.5 size-2 shrink-0 rounded-full', dotClass)}
						aria-hidden
					/>
					<span className="text-pretty leading-relaxed text-foreground">
						{line}
					</span>
				</li>
			))}
		</ul>
	);
}

function StandupSections({ standup }: { standup: StandupApi }) {
	return (
		<div className="space-y-8">
			<section>
				<h3 className="mb-3 text-sm font-semibold text-foreground">
					What you shipped
				</h3>
				<StandupList items={standup.highlights} dotClass="bg-emerald-500" />
			</section>
			<section>
				<h3 className="mb-3 text-sm font-semibold text-foreground">
					Where you are
				</h3>
				<StandupList
					items={standup.where_you_are ?? []}
					dotClass="bg-violet-500"
				/>
			</section>
			<section>
				<h3 className="mb-3 text-sm font-semibold text-foreground">
					What&apos;s blocking or aging
				</h3>
				<StandupList items={standup.blockers} dotClass="bg-amber-500" />
			</section>
			<section>
				<h3 className="mb-3 text-sm font-semibold text-foreground">
					What to tackle next
				</h3>
				<StandupList items={standup.suggestions} dotClass="bg-sky-500" />
			</section>
		</div>
	);
}

function HistoryRow({
	st,
	open,
	onToggle,
}: {
	st: StandupApi;
	open: boolean;
	onToggle: () => void;
}) {
	const label = useMemo(() => {
		const d = new Date(st.standup_date + 'T12:00:00');
		return new Intl.DateTimeFormat(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(d);
	}, [st.standup_date]);

	return (
		<div className="rounded-xl border border-border/40 bg-muted/10 dark:bg-white/5">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
			>
				<span>{label}</span>
				<ChevronDown
					className={cn(
						'size-4 shrink-0 text-muted-foreground transition-transform',
						open && 'rotate-180',
					)}
				/>
			</button>
			{open && (
				<div className="border-t border-border/40 px-4 py-4">
					<StandupSections standup={st} />
				</div>
			)}
		</div>
	);
}

export default function StandupPage() {
	const queryClient = useQueryClient();
	const todayStr = useMemo(() => {
		const d = new Date();
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}, []);

	const standupQuery = useQuery(aiQueries.standup());
	const historyQuery = useQuery(aiQueries.standupHistory());

	const [expandedDate, setExpandedDate] = useState<string | null>(null);

	const regenerate = useMutation({
		mutationFn: postRegenerateStandup,
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.ai.standup(), data);
			void queryClient.invalidateQueries({ queryKey: queryKeys.ai.standupHistory() });
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const historyPast = useMemo(() => {
		const rows = historyQuery.data ?? [];
		return rows.filter((s) => s.standup_date !== todayStr);
	}, [historyQuery.data, todayStr]);

	const todayHeading = useMemo(() => {
		const d = new Date();
		return new Intl.DateTimeFormat(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(d);
	}, []);

	const loading = standupQuery.isPending || regenerate.isPending;

	useEffect(() => {
		if (standupQuery.isError) {
			toast.error(getApiErrorMessage(standupQuery.error));
		}
	}, [standupQuery.isError, standupQuery.error]);

	return (
		<div className="mx-auto max-w-3xl space-y-8">
			<SoftCard>
				<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 px-6 pb-2 pt-6">
					<div className="space-y-1">
						<CardTitle className="text-xl">AI standup</CardTitle>
						<CardDescription>{todayHeading}</CardDescription>
					</div>
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={loading}
						onClick={() => regenerate.mutate()}
					>
						Regenerate
					</Button>
				</CardHeader>
				<CardContent className="px-6 pb-6 pt-0">
					{loading && !standupQuery.data ? (
						<div className="space-y-6">
							<Skeleton className="h-4 w-full max-w-md" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
					) : standupQuery.data ? (
						<StandupSections standup={standupQuery.data} />
					) : null}
				</CardContent>
			</SoftCard>

			<div className="space-y-3">
				<h2 className="text-sm font-semibold text-muted-foreground">
					History
				</h2>
				{historyQuery.isPending && (
					<Skeleton className="h-12 w-full rounded-xl" />
				)}
				<div className="space-y-2">
					{historyPast.map((st) => (
						<HistoryRow
							key={st.id}
							st={st}
							open={expandedDate === st.standup_date}
							onToggle={() =>
								setExpandedDate((prev) =>
									prev === st.standup_date ? null : st.standup_date,
								)
							}
						/>
					))}
				</div>
				{!historyQuery.isPending && historyPast.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No past standups yet.
					</p>
				)}
			</div>
		</div>
	);
}
