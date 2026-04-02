'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

type HeaderProps = {
	title?: string;
	breadcrumbs?: { label: string; href: string }[];
};

export function Header({
	title: titleOverride,
	breadcrumbs: breadcrumbsOverride,
}: HeaderProps) {
	const pathname = usePathname();
	const { breadcrumbs, title } = getBreadcrumbsFromPath(pathname, menuItems);
	const displayBreadcrumbs = breadcrumbsOverride ?? breadcrumbs;
	const displayTitle = titleOverride ?? title;

	return (
		<header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:border-white/[0.06] dark:bg-background/30">
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
				<Badge
					variant="secondary"
					className="hidden border-0 bg-emerald-500/10 font-medium text-emerald-800 shadow-none sm:inline-flex dark:bg-emerald-500/15 dark:text-emerald-200"
				>
					7-day streak
				</Badge>

				<Button size="lg" variant="soft" className="rounded-full">
					<PlusIcon className="size-4" />
					New project
				</Button>
			</div>
		</header>
	);
}
