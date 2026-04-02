import { SoftCard } from '@/components/dashboard/soft-card';
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type ProjectContextCardProps = {
	lastContext: string | null | undefined;
};

export function ProjectContextCard({ lastContext }: ProjectContextCardProps) {
	return (
		<SoftCard>
			<CardHeader className="px-6 pb-2 pt-6">
				<CardTitle className="text-lg">What was I doing?</CardTitle>
				<CardDescription>
					Last saved context from this project.
				</CardDescription>
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
