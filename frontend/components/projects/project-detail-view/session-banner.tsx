import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { TimerStateApi } from '@/lib/api/types';
import { formatMinutesSeconds } from '@/lib/timer-display';

type ProjectDetailSessionBannerProps = {
	timer: TimerStateApi;
	remainingSeconds: number;
};

export function ProjectDetailSessionBanner({
	timer,
	remainingSeconds,
}: ProjectDetailSessionBannerProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/75 px-4 py-3 text-sm">
			<div className="space-y-0.5">
				<p className="font-medium text-foreground">
					Focus session running for this project
				</p>
				<p className="text-muted-foreground">
					{timer.is_paused ? (
						<>Paused · {formatMinutesSeconds(remainingSeconds)} left</>
					) : (
						<>{formatMinutesSeconds(remainingSeconds)} left on the timer</>
					)}
				</p>
			</div>
			<Button variant="outline" size="sm" asChild>
				<Link href="/dashboard">Open timer</Link>
			</Button>
		</div>
	);
}
