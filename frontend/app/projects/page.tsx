'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';

import { AddProjectDialog } from '@/components/projects/add-project-dialog';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { useProjects } from '@/hooks/use-projects';
import type { ProjectListItem } from '@/lib/api/types';

function ProjectsGrid({ projects }: { projects: ProjectListItem[] }) {
	if (projects.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
				No projects yet—use &quot;New project&quot; above to add one.
			</p>
		);
	}

	return (
		<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{projects.map((project) => (
				<li key={project.id} className="min-h-0">
					<ProjectCard project={project} />
				</li>
			))}
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
					<div className="h-9 w-40 animate-pulse rounded-lg bg-muted/50" />
					<div className="h-9 w-36 animate-pulse rounded-full bg-muted/45" />
				</div>
				<div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
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

			<section aria-labelledby="projects-heading">
				<h2 id="projects-heading" className="sr-only">
					Your projects
				</h2>
				<ProjectsGrid projects={projects} />
			</section>
		</div>
	);
}
