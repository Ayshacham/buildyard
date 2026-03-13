export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">Welcome back. Here’s an overview of your workspace.</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm" />
				))}
			</div>
		</div>
	);
}
