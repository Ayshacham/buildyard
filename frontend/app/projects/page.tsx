'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';

import { AddProjectDialog } from '@/components/projects/add-project-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useProjects } from '@/hooks/use-projects';
import {
	formatRelativeShort,
	projectActivityStatus,
} from '@/lib/dashboard-format';
import type { ProjectListItem } from '@/lib/api/types';
import { cn } from '@/utils/cn';

function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
	if (projects.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground dark:bg-white/3">
				No projects yet—use &quot;New project&quot; above to add one.
			</p>
		);
	}

	return (
		<ul className="space-y-3">
			{projects.map((project) => {
				const status = projectActivityStatus(project);
				return (
					<li
						key={project.id}
						className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/15 px-3 py-2.5 dark:bg-white/4"
					>
						<div className="flex min-w-0 items-center gap-2">
							<span
								className="size-2.5 shrink-0 rounded-full"
								style={{ backgroundColor: project.color }}
								aria-hidden
							/>
							<span className="truncate font-medium text-foreground">
								{project.name}
							</span>
						</div>
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
	);
}

export default function ProjectsPage() {
	const [addOpen, setAddOpen] = React.useState(false);
	const { data: projects = [], isPending, isError, error } = useProjects();

	if (isPending) {
		return (
			<div className="space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="h-9 w-40 animate-pulse rounded-lg bg-muted/60" />
					<div className="h-9 w-36 animate-pulse rounded-full bg-muted/50" />
				</div>
				<div className="h-48 animate-pulse rounded-[1.75rem] bg-muted/30" />
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorState
				title="Could not load projects"
				description={error?.message ?? 'Something went wrong.'}
			>
				Check your connection and that the API is running.
			</ErrorState>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Projects
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Repos and focus areas in BuildYard.
					</p>
				</div>
				<Button
					size="lg"
					variant="soft"
					className="rounded-full bg-primary text-white/90"
					type="button"
					onClick={() => setAddOpen(true)}
				>
					<PlusIcon className="size-4" />
					New project
				</Button>
			</div>

			<AddProjectDialog open={addOpen} onOpenChange={setAddOpen} />

			<SoftCard>
				<CardHeader className="px-6 pb-2 pt-6">
					<CardTitle className="text-lg">Your projects</CardTitle>
					<CardDescription>
						Click a row to open details when that flow exists.
					</CardDescription>
				</CardHeader>
				<CardContent className="px-6 pb-6 pt-0">
					<ProjectsList projects={projects} />
				</CardContent>
			</SoftCard>
		</div>
	);
}
