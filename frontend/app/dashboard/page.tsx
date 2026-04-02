'use client';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

const placeholders = [
	{
		title: 'Focus time',
		description: 'This week’s deep work will show up here.',
	},
	{
		title: 'Active projects',
		description: 'Repos and health at a glance.',
	},
	{
		title: 'Next up',
		description: 'Tasks and AI nudges when you’re ready.',
	},
];

export default function DashboardPage() {
	useEffect(() => {
		const fetchData = async () => {
			const supabase = createClient();
			const { data } = await supabase.auth.getSession();
			console.log(data?.session?.access_token);
		};
		fetchData().catch(console.error);
	}, []);
	return (
		<div className="space-y-8">
			<div className="space-y-1.5">
				<h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
					Dashboard
				</h1>
				<p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
					Quiet overview of your workspace—nothing loud, nothing nagging. Just
					what you need to ship today.
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{placeholders.map((item) => (
					<Card
						key={item.title}
						variant="soft"
						className="transition-shadow duration-300 hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,0.18)]"
					>
						<CardHeader className="items-start px-6 pb-2 pt-6 text-left">
							<CardTitle className="text-lg">{item.title}</CardTitle>
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>
						<CardContent className="min-h-[88px] px-6 pb-6 pt-0">
							<div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-4 dark:bg-white/[0.03]">
								<p className="text-xs text-muted-foreground">Coming soon</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
