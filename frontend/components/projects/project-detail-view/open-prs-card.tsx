import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import type { GithubPRApi } from '@/lib/api/types';

function prAgeLabel(ageDays: number | null | undefined) {
	if (ageDays === null || ageDays === undefined) return '—';
	if (ageDays === 0) return 'Opened today';
	if (ageDays === 1) return '1 day old';
	return `${ageDays} days old`;
}

type ProjectOpenPrsCardProps = {
	pullRequests: GithubPRApi[];
	repoFallbackUrl: string | null;
};

export function ProjectOpenPrsCard({
	pullRequests,
	repoFallbackUrl,
}: ProjectOpenPrsCardProps) {
	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<CardTitle className="text-lg">Open pull requests</CardTitle>
				<CardDescription>From GitHub sync.</CardDescription>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				{pullRequests.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border/50 bg-muted/15 px-3 py-4 text-sm text-muted-foreground">
						No open pull requests
					</p>
				) : (
					<ul className="space-y-3">
						{pullRequests.map((pr) => (
							<li
								key={pr.id}
								className="rounded-lg border border-border/40 bg-muted/15 px-3 py-2.5 dark:bg-white/5"
							>
								<div className="flex flex-wrap items-baseline justify-between gap-2">
									<a
										href={pr.url || repoFallbackUrl || '#'}
										target="_blank"
										rel="noopener noreferrer"
										className="min-w-0 font-medium text-primary hover:underline"
									>
										#{pr.pr_number} {pr.title}
									</a>
									<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
										{prAgeLabel(pr.age_days)}
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</SoftCard>
	);
}
