import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { SoftCard } from '@/components/dashboard/soft-card';
import { LinearProgress } from '@/components/dashboard/linear-progress';

export function FocusTimerCard() {
	return (
		<SoftCard>
			<CardHeader className="flex flex-row items-start justify-between gap-3 px-6 pb-2 pt-6">
				<div className="space-y-1">
					<CardTitle className="text-lg">Focus timer</CardTitle>
					<CardDescription>Current focus block.</CardDescription>
				</div>
				<Badge
					variant="secondary"
					className="shrink-0 border-0 bg-muted font-medium"
				>
					Session 3/4
				</Badge>
			</CardHeader>

			<CardContent className="space-y-4 px-6 pb-6 pt-0">
				<div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center dark:bg-white/3">
					<p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-foreground md:text-5xl">
						15:24
					</p>
					<div className="mx-auto mt-4 max-w-xs">
						<LinearProgress fractionComplete={0.62} />
					</div>
					<p className="mt-3 text-sm text-muted-foreground">
						Channels + Upstash Redis setup.
					</p>
				</div>
				<div className="flex flex-wrap justify-end gap-2">
					<Button type="button" variant="outline" size="sm">
						Skip
					</Button>
					<Button type="button" variant="outline" size="sm">
						End session
					</Button>
				</div>
			</CardContent>
		</SoftCard>
	);
}
