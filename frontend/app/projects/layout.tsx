import { DashboardShell } from '@/app/dashboard/dashboard-shell';

export default function ProjectsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DashboardShell>{children}</DashboardShell>;
}
