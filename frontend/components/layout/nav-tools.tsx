'use client';

import {
	SidebarMenu,
	SidebarGroup,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroupLabel,
} from '@/components/ui/sidebar';

type Tool = {
	name: string;
	url: string;
	icon: React.ComponentType<{ className?: string }>;
};

export function NavTools({ tools }: { tools: readonly Tool[] }) {
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
				Quick tools
			</SidebarGroupLabel>
			<SidebarMenu>
				{tools.map((tool) => {
					const Icon = tool.icon;
					return (
						<SidebarMenuItem key={tool.name}>
							<SidebarMenuButton asChild>
								<a href={tool.url}>
									<Icon className="size-4" />
									<span>{tool.name}</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
