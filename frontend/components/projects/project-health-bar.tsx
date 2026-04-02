type ProjectHealthBarProps = {
	score: number | null;
};

export function ProjectHealthBar({ score }: ProjectHealthBarProps) {
	const s = Math.max(
		0,
		Math.min(100, typeof score === 'number' && Number.isFinite(score) ? score : 0),
	);
	const hue = (s / 100) * 120;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
				<span>Health</span>
				<span className="tabular-nums font-medium text-foreground">{s}</span>
			</div>
			<div
				className="h-2 w-full overflow-hidden rounded-full bg-muted/80 dark:bg-white/10"
				role="progressbar"
				aria-valuenow={s}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div
					className="h-full rounded-full transition-[width] duration-300"
					style={{
						width: `${s}%`,
						backgroundColor: `hsl(${hue} 55% 42%)`,
					}}
				/>
			</div>
		</div>
	);
}
