'use client';

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroupLabel,
} from '@/components/ui/sidebar';

import { menuItems } from '@/components/layout/menu-items';

export function NavMain() {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Workspace</SidebarGroupLabel>
			<SidebarMenu>
				{menuItems.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton tooltip={item.title}>
							{item.icon}
							<span>{item.title}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
