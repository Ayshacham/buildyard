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
		<header className="flex h-16 shrink-0 items-center px-4 justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-vertical:h-4 data-vertical:self-auto"
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

			<div className="flex items-center gap-3">
				<Badge className="bg-green-700/30  text-black">7 day streak</Badge>

				<Button size="lg" variant="secondary">
					<PlusIcon /> New Project
				</Button>
			</div>
		</header>
	);
}
