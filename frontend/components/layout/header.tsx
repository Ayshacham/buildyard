'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';

import { AddProjectDialog } from '@/components/projects/add-project-dialog';
import { Button } from '@/components/ui/button';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { menuItems } from '@/components/layout/menu-items';

import { getBreadcrumbsFromPath } from '@/utils/get-breadcrumbs';

import { useStreak } from '@/hooks/use-streak';

import { Badge } from '../ui/badge';

type HeaderProps = {
	title?: string;
	breadcrumbs?: { label: string; href: string }[];
};

export function Header({
	title: titleOverride,
	breadcrumbs: breadcrumbsOverride,
}: HeaderProps) {
	const router = useRouter();
	const [addProjectOpen, setAddProjectOpen] = React.useState(false);
	const streak = useStreak();
	const streakDays = streak.isSuccess ? streak.data.current_streak : null;

	const pathname = usePathname();
	const { breadcrumbs, title } = getBreadcrumbsFromPath(pathname, menuItems);
	const displayBreadcrumbs = breadcrumbsOverride ?? breadcrumbs;
	const displayTitle = titleOverride ?? title;

	return (
		<>
			<header className="flex h-14 shrink-0 rounded-t-2xl items-center justify-between gap-3 border-b border-border/40 bg-background/85 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:border-white/6 dark:bg-background/30">
				<div className="flex min-w-0 items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-1 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							{displayBreadcrumbs.map((breadcrumb) => (
								<React.Fragment key={breadcrumb.href}>
									<BreadcrumbItem>
										<BreadcrumbLink href={breadcrumb.href}>
											{breadcrumb.label}
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
								</React.Fragment>
							))}

							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbPage>{displayTitle}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						className="gap-1.5"
						onClick={() => setAddProjectOpen(true)}
					>
						<PlusIcon className="size-4" />
						<span className="hidden sm:inline">New project</span>
					</Button>
					<AddProjectDialog
						open={addProjectOpen}
						onOpenChange={setAddProjectOpen}
						onCreated={(p) => router.push(`/projects/${p.id}`)}
					/>
					<Badge
						variant="secondary"
						className="hidden border-0 bg-emerald-500/30 font-medium text-emerald-900 shadow-none sm:inline-flex dark:bg-emerald-500/15 dark:text-emerald-200"
					>
						{streakDays === null ? 'Streak' : `${streakDays}-day streak`}
					</Badge>
				</div>
			</header>
		</>
	);
}
