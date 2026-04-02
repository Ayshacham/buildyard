'use client';

import { sidebarConfig } from '@/config/sidebar';

import {
	Sidebar,
	SidebarRail,
	SidebarFooter,
	SidebarHeader,
	SidebarContent,
} from '@/components/ui/sidebar';

import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import { NavTools } from '@/components/layout/nav-tools';
import { SidebarLogo } from '@/components/layout/sidebar-logo';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" variant="floating" {...props}>
			<SidebarHeader>
				<SidebarLogo />
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
				<NavTools tools={sidebarConfig.tools} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={sidebarConfig.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
