import Link from 'next/link';

import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { SoftCard } from '@/components/dashboard/soft-card';

import {
	formatRelativeShort,
	projectActivityStatus,
} from '@/lib/dashboard-format';
import type { ProjectListItem } from '@/lib/api/types';

import { cn } from '@/utils/cn';

export function ProjectsCard({ projects }: { projects: ProjectListItem[] }) {
	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<CardTitle className="text-lg">Projects</CardTitle>
					<span className="text-xs text-muted-foreground">click to open</span>
				</div>
				<CardDescription>Repos linked to BuildYard.</CardDescription>
			</CardHeader>

			<CardContent className="px-6 pb-6 pt-0">
				{projects?.length === 0 ? (
					<p className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground dark:bg-white/3">
						No projects yet—open{' '}
						<Link
							href="/projects"
							className="font-medium text-primary underline-offset-4 hover:underline"
						>
							Projects
						</Link>{' '}
						and use &quot;New project&quot; to add one.
					</p>
				) : (
					<ul className="space-y-3">
						{projects?.slice(0, 8).map((project) => {
							const status = projectActivityStatus(project);
							return (
								<li
									key={project.id}
									className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/15 px-3 py-2.5 dark:bg-white/4"
								>
									<span className="font-medium text-foreground">
										{project.name}
									</span>
									<div className="flex items-center gap-2 text-xs">
										<Badge
											variant="secondary"
											className={cn(
												'border-0 font-medium',
												status === 'active'
													? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
													: 'bg-amber-500/15 text-amber-900 dark:text-amber-200',
											)}
										>
											{status}
										</Badge>
										<span className="tabular-nums text-muted-foreground">
											{formatRelativeShort(project.last_session_at)}
										</span>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</SoftCard>
	);
}
