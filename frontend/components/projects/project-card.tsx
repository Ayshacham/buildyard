import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { SoftCard } from '@/components/dashboard/soft-card';
import { ProjectHealthBar } from '@/components/projects/project-health-bar';
import { projectStatusBadgeClass } from '@/components/projects/project-status-badges';
import type { ProjectListItem } from '@/lib/api/types';
import { formatLastSessionDays } from '@/lib/dashboard-format';
import { cn } from '@/utils/cn';

function statusLabel(status: string) {
	return status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ');
}

function daysSinceLastSession(iso: string | null): number | null {
	if (!iso) return null;
	const t = new Date(iso).getTime();
	return Math.floor((Date.now() - t) / 86_400_000);
}

function staleStripMessage(project: ProjectListItem): string | null {
	const health = project.health_score ?? 100;
	const days = daysSinceLastSession(project.last_session_at);
	const stale =
		health < 50 ||
		days === null ||
		(days !== null && days >= 3);
	if (!stale) return null;
	if (!project.last_session_at) {
		return 'No sessions recorded — consider a focus session.';
	}
	if (days !== null && days >= 3) {
		return `No activity in ${days} days — consider a focus session.`;
	}
	return 'Health score is low — consider a focus session.';
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
	const score = project.health_score ?? 0;
	const aging = project.open_prs_aging_count ?? 0;
	const strip = staleStripMessage(project);

	return (
		<Link
			href={`/projects/${project.id}`}
			className="group block h-full rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<SoftCard className="flex h-full flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md">
				<CardContent className="flex flex-1 flex-col space-y-4 px-6 pb-6 pt-6">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-center gap-2.5">
							<span
								className="size-3 shrink-0 rounded-full ring-2 ring-background"
								style={{ backgroundColor: project.color }}
								aria-hidden
							/>
							<h2 className="truncate font-semibold text-foreground">
								{project.name}
							</h2>
						</div>
						<Badge
							variant="secondary"
							className={cn(
								'shrink-0 border-0 font-medium capitalize',
								projectStatusBadgeClass(project.status),
							)}
						>
							{statusLabel(project.status)}
						</Badge>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
						<span>Last session</span>
						<span className="tabular-nums text-foreground">
							{formatLastSessionDays(project.last_session_at)}
						</span>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
						<span>Open PRs</span>
						<div className="flex flex-wrap items-center justify-end gap-2">
							<span className="tabular-nums font-medium text-foreground">
								{project.open_prs_count}
							</span>
							{aging > 0 ? (
								<span className="font-medium text-destructive">
									{aging} PRs aging
								</span>
							) : null}
						</div>
					</div>

					<ProjectHealthBar score={score} />
				</CardContent>
				{strip ? (
					<div className="border-t border-amber-500/35 bg-amber-500/10 px-6 py-3 text-xs leading-snug text-amber-950 dark:text-amber-100">
						{strip}
					</div>
				) : null}
			</SoftCard>
		</Link>
	);
}
