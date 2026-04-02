import { Loader2Icon, RefreshCwIcon } from 'lucide-react';

import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProjectContextCardProps = {
	lastContext: string | null | undefined;
	onRegenerate: () => void;
	isRegenerating: boolean;
};

export function ProjectContextCard({
	lastContext,
	onRegenerate,
	isRegenerating,
}: ProjectContextCardProps) {
	return (
		<SoftCard>
			<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 px-6 pb-2 pt-6">
				<div className="space-y-1.5">
					<CardTitle className="text-lg">What was I doing?</CardTitle>
					<CardDescription>
						Last saved context from this project.
					</CardDescription>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="shrink-0 gap-1.5"
					disabled={isRegenerating}
					onClick={onRegenerate}
				>
					{isRegenerating ? (
						<Loader2Icon className="size-4 animate-spin" aria-hidden />
					) : (
						<RefreshCwIcon className="size-4" aria-hidden />
					)}
					Regenerate context
				</Button>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				<div className="rounded-xl border border-border/40 bg-muted/15 px-4 py-4 text-sm leading-relaxed text-foreground">
					{lastContext?.trim() ? (
						lastContext
					) : (
						<span className="text-muted-foreground">
							No context yet — complete a focus session to generate one.
						</span>
					)}
				</div>
			</CardContent>
		</SoftCard>
	);
}
