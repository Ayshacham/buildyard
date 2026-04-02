import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { formatRelativeShort } from '@/lib/dashboard-format';
import type { GithubCommitApi } from '@/lib/api/types';

type ProjectRecentCommitsCardProps = {
	commits: GithubCommitApi[];
};

export function ProjectRecentCommitsCard({
	commits,
}: ProjectRecentCommitsCardProps) {
	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<CardTitle className="text-lg">Recent commits</CardTitle>
				<CardDescription>Last five synced from GitHub.</CardDescription>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				{commits.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border/50 bg-muted/15 px-3 py-4 text-sm text-muted-foreground">
						No commits synced yet
					</p>
				) : (
					<ul className="space-y-3">
						{commits.map((c) => (
							<li
								key={c.id}
								className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/40 bg-muted/15 px-3 py-2.5 text-sm dark:bg-white/5"
							>
								<div className="min-w-0 flex-1">
									<a
										href={c.url || '#'}
										target="_blank"
										rel="noopener noreferrer"
										className="font-mono text-xs font-medium text-primary hover:underline"
									>
										{c.sha_short}
									</a>
									<span className="ml-2 text-foreground">
										{c.message.split('\n')[0]}
									</span>
								</div>
								<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
									{formatRelativeShort(c.committed_at)}
								</span>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</SoftCard>
	);
}
