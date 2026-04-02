import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { SoftCard } from '@/components/dashboard/soft-card';

import { cn } from '@/utils/cn';

const ITEMS: { dot: string; text: string }[] = [
	{ dot: 'bg-emerald-500', text: 'Shipped auth callback route for BuildYard' },
	{ dot: 'bg-sky-500', text: '3 PRs open on portfolio-site — aging 2d' },
	{ dot: 'bg-amber-500', text: 'Stuck on Channels Redis config — 45 min' },
	{
		dot: 'bg-violet-500',
		text: 'Suggest: tackle Redis before new tasks today',
	},
];

export function StandupCard() {
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
			<CardContent className="px-6 pb-6 pt-0">
				<ul className="space-y-3">
					{ITEMS.map((item) => (
						<li key={item.text} className="flex gap-3 text-sm">
							<span
								className={cn('mt-1.5 size-2 shrink-0 rounded-full', item.dot)}
								aria-hidden
							/>
							<span className="text-pretty leading-relaxed text-foreground">
								{item.text}
							</span>
						</li>
					))}
				</ul>
			</CardContent>
		</SoftCard>
	);
}
