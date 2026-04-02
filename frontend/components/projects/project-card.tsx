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

export function ProjectCard({ project }: { project: ProjectListItem }) {
	const score = project.health_score ?? 0;

	return (
		<Link
			href={`/projects/${project.id}`}
			className="group block h-full rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<SoftCard className="h-full transition-shadow duration-200 group-hover:shadow-md">
				<CardContent className="space-y-4 px-6 pb-6 pt-6">
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
						<span className="tabular-nums font-medium text-foreground">
							{project.open_prs_count}
						</span>
					</div>

					<ProjectHealthBar score={score} />
				</CardContent>
			</SoftCard>
		</Link>
	);
}
