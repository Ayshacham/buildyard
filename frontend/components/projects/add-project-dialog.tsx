'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createProject, updateProject } from '@/lib/api/projects';
import { getApiErrorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/queries/keys';

const PRESET_COLORS = [
	'#185FA5',
	'#16a34a',
	'#ca8a04',
	'#dc2626',
	'#9333ea',
	'#0ea5e9',
] as const;

export type ProjectFormValues = {
	id: string;
	name: string;
	description: string;
	color: string;
	github_repo: string;
};

type AddProjectDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project?: ProjectFormValues | null;
};

export function AddProjectDialog({
	open,
	onOpenChange,
	project,
}: AddProjectDialogProps) {
	const queryClient = useQueryClient();
	const isEdit = Boolean(project);
	const [name, setName] = React.useState('');
	const [description, setDescription] = React.useState('');
	const [color, setColor] = React.useState<string>(PRESET_COLORS[0]);
	const [githubRepo, setGithubRepo] = React.useState('');

	const { mutate, isPending, isError, error, reset } = useMutation({
		mutationFn: (
			payload:
				| {
						mode: 'create';
						name: string;
						color: string;
						description?: string;
						github_repo?: string;
				  }
				| {
						mode: 'edit';
						projectId: string;
						name: string;
						color: string;
						description: string;
						github_repo: string;
				  },
		) => {
			if (payload.mode === 'edit') {
				return updateProject(payload.projectId, {
					name: payload.name,
					color: payload.color,
					description: payload.description,
					github_repo: payload.github_repo,
				});
			}
			return createProject({
				name: payload.name,
				color: payload.color,
				...(payload.description ? { description: payload.description } : {}),
				...(payload.github_repo ? { github_repo: payload.github_repo } : {}),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
			if (isEdit && project) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.projects.detail(project.id),
				});
			}
			onOpenChange(false);
		},
	});

	React.useEffect(() => {
		if (open) {
			reset();
		}
	}, [open, reset]);

	React.useEffect(() => {
		if (open && project) {
			setName(project.name);
			setDescription(project.description ?? '');
			setColor(project.color);
			setGithubRepo(project.github_repo ?? '');
		} else if (open && !project) {
			setName('');
			setDescription('');
			setColor(PRESET_COLORS[0]);
			setGithubRepo('');
		}
	}, [open, project]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) return;
		const desc = description.trim();
		const repo = githubRepo.trim();
		if (isEdit && project) {
			mutate({
				mode: 'edit',
				projectId: project.id,
				name: trimmedName,
				color,
				description: desc,
				github_repo: repo,
			});
		} else {
			mutate({
				mode: 'create',
				name: trimmedName,
				color,
				...(desc ? { description: desc } : {}),
				...(repo ? { github_repo: repo } : {}),
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? 'Edit project' : 'New project'}
					</DialogTitle>
					<DialogDescription>
						Name your project, pick a color, and optionally link a GitHub repo.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<label htmlFor="project-name" className="text-sm font-medium">
							Name
						</label>
						<Input
							id="project-name"
							name="name"
							value={name}
							onChange={(ev) => setName(ev.target.value)}
							placeholder="My project"
							required
							autoComplete="off"
							disabled={isPending}
						/>
					</div>
					<div className="grid gap-2">
						<label htmlFor="project-description" className="text-sm font-medium">
							Description{' '}
							<span className="font-normal text-muted-foreground">(optional)</span>
						</label>
						<textarea
							id="project-description"
							name="description"
							value={description}
							onChange={(ev) => setDescription(ev.target.value)}
							placeholder="What are you building?"
							rows={3}
							disabled={isPending}
							className="min-h-18 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30"
						/>
					</div>
					<div className="grid gap-2">
						<span className="text-sm font-medium">Color</span>
						<div className="flex flex-wrap gap-2">
							{PRESET_COLORS.map((c) => {
								const selected = color === c;
								return (
									<button
										key={c}
										type="button"
										disabled={isPending}
										onClick={() => setColor(c)}
										className="size-9 rounded-full border-2 border-transparent shadow-sm transition-[box-shadow,transform] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
										style={{
											backgroundColor: c,
											boxShadow: selected
												? `0 0 0 2px var(--background), 0 0 0 4px ${c}`
												: undefined,
										}}
										aria-label={`Color ${c}`}
										aria-pressed={selected}
									/>
								);
							})}
						</div>
					</div>
					<div className="grid gap-2">
						<label htmlFor="project-github" className="text-sm font-medium">
							GitHub repo{' '}
							<span className="font-normal text-muted-foreground">(optional)</span>
						</label>
						<Input
							id="project-github"
							name="github_repo"
							value={githubRepo}
							onChange={(ev) => {
								setGithubRepo(ev.target.value);
								if (isError) reset();
							}}
							placeholder="owner/repo"
							autoComplete="off"
							disabled={isPending}
							aria-invalid={isError}
						/>
					</div>
					{isError ? (
						<p role="alert" className="text-sm text-destructive">
							{getApiErrorMessage(error)}
						</p>
					) : null}
					<DialogFooter className="gap-2 pt-2 sm:gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isEdit ? (
								<PencilIcon className="size-4" />
							) : (
								<PlusIcon className="size-4" />
							)}
							{isEdit ? 'Save changes' : 'Add project'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
