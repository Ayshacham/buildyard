'use client';

import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-svh bg-[linear-gradient(165deg,oklch(0.99_0.03_320)_0%,oklch(0.985_0.02_230)_45%,oklch(0.97_0.04_250)_100%)] dark:bg-[linear-gradient(165deg,oklch(0.18_0.02_260)_0%,oklch(0.16_0.025_250)_50%,oklch(0.14_0.03_270)_100%)]">
			<div
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,oklch(0.92_0.06_280/0.35),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,oklch(0.35_0.08_280/0.2),transparent_55%)]"
				aria-hidden
			/>
			<SidebarProvider className="relative">
				<AppSidebar />
				<SidebarInset>
					<Header />
					<div className="flex flex-1 flex-col gap-6 p-5 md:p-6 lg:p-8">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
