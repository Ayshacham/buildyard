import { DashboardShell } from '@/app/dashboard/dashboard-shell';

export default function TasksLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DashboardShell>{children}</DashboardShell>;
}
