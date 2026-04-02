'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroupLabel,
} from '@/components/ui/sidebar';

import { menuItems } from '@/components/layout/menu-items';

export function NavMain() {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
				Workspace
			</SidebarGroupLabel>
			<SidebarMenu className="gap-0.5">
				{menuItems.map((item) => {
					const active = pathname === item.url || pathname.startsWith(`${item.url}/`);
					return (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={active}
							>
								<Link href={item.url}>
									{item.icon}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
