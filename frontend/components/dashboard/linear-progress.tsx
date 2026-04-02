import { cn } from '@/utils/cn';

export type LinearProgressProps = {
	fractionComplete: number;
	className?: string;
};

export function LinearProgress({
	fractionComplete,
	className,
}: LinearProgressProps) {
	const widthPercent = Math.min(100, Math.max(0, fractionComplete * 100));

	return (
		<div
			className={cn(
				'h-1.5 w-full overflow-hidden rounded-full bg-muted/80 dark:bg-white/10',
				className,
			)}
		>
			<div
				className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
				style={{ width: `${widthPercent}%` }}
			/>
		</div>
	);
}
