import {
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { SoftCard } from '@/components/dashboard/soft-card';

import { cn } from '@/utils/cn';

export type MetricStatCardProps = {
	label: string;
	value: string;
	hint?: string;
	hintPositive?: boolean;
};

export function MetricStatCard({
	label,
	value,
	hint,
	hintPositive,
}: MetricStatCardProps) {
	return (
		<SoftCard>
			<CardHeader className="space-y-1 px-5 pb-0 pt-5">
				<CardDescription className="text-xs font-medium uppercase tracking-wide">
					{label}
				</CardDescription>
				<CardTitle className="text-2xl font-semibold tabular-nums tracking-tight">
					{value}
				</CardTitle>
			</CardHeader>
			<CardContent className="px-5 pb-5 pt-2">
				{hint ? (
					<p
						className={cn(
							'text-xs',
							hintPositive
								? 'font-medium text-emerald-600 dark:text-emerald-400'
								: 'text-muted-foreground',
						)}
					>
						{hint}
					</p>
				) : null}
			</CardContent>
		</SoftCard>
	);
}
