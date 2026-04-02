import { ExternalLinkIcon, PlayIcon, TimerIcon } from 'lucide-react';

import { projectStatusBadgeClass } from '@/components/projects/project-status-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatLastSessionDays } from '@/lib/dashboard-format';
import { cn } from '@/utils/cn';

function statusLabel(status: string) {
	return status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ');
}

type ProjectDetailHeaderProps = {
	color: string;
	name: string;
	status: string;
	githubRepo: string;
	repoUrl: string | null;
	lastSessionAt: string | null;
	sessionForThisProject: boolean;
	sessionForOtherProject: boolean;
	startPending: boolean;
	userPending: boolean;
	onStartSession: () => void;
};

export function ProjectDetailHeader({
	color,
	name,
	status,
	githubRepo,
	repoUrl,
	lastSessionAt,
	sessionForThisProject,
	sessionForOtherProject,
	startPending,
	userPending,
	onStartSession,
}: ProjectDetailHeaderProps) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-4">
			<div className="min-w-0 space-y-3">
				<div className="flex flex-wrap items-center gap-3">
					<span
						className="size-4 shrink-0 rounded-full ring-2 ring-background"
						style={{ backgroundColor: color }}
						aria-hidden
					/>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{name}
					</h1>
					<Badge
						variant="secondary"
						className={cn(
							'border-0 font-medium capitalize',
							projectStatusBadgeClass(status),
						)}
					>
						{statusLabel(status)}
					</Badge>
				</div>
				{repoUrl ? (
					<a
						href={repoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
					>
						{githubRepo}
						<ExternalLinkIcon className="size-3.5" aria-hidden />
					</a>
				) : (
					<p className="text-sm text-muted-foreground">
						No GitHub repo linked
					</p>
				)}
				<p className="text-sm text-muted-foreground">
					Last session:{' '}
					<span className="font-medium text-foreground">
						{formatLastSessionDays(lastSessionAt)}
					</span>
				</p>
			</div>
			{sessionForThisProject ? (
				<Button
					size="lg"
					variant="secondary"
					className="shrink-0 rounded-full"
					type="button"
					disabled
				>
					<TimerIcon className="size-4" />
					Session in progress
				</Button>
			) : sessionForOtherProject ? (
				<Button
					size="lg"
					variant="outline"
					className="shrink-0 rounded-full"
					type="button"
					disabled
				>
					<TimerIcon className="size-4" />
					Focus active elsewhere
				</Button>
			) : (
				<Button
					size="lg"
					variant="soft"
					className="shrink-0 rounded-full bg-primary text-primary-foreground"
					type="button"
					disabled={startPending || userPending}
					onClick={onStartSession}
				>
					<PlayIcon className="size-4" />
					Start focus session
				</Button>
			)}
		</div>
	);
}
