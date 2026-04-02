'use client';

import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-svh bg-[#f3f4f6]">
			<div className="pointer-events-none fixed inset-0" aria-hidden />
			<SidebarProvider className="relative">
				<AppSidebar />
				<SidebarInset className="bg-[#d2cbe8]!">
					<Header />
					<div className="flex flex-1 flex-col gap-6 p-5 md:p-6 lg:p-8">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
