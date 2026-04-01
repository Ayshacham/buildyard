import Link from 'next/link';
import Image from 'next/image';

import {
	Card,
	CardTitle,
	CardContent,
	CardFooter,
	CardHeader,
	CardDescription,
} from '@/components/ui/card';

type AuthShellProps = {
	title: string;
	description: string;
	children: React.ReactNode;
	footer: React.ReactNode;
};

export function AuthShell({
	title,
	description,
	children,
	footer,
}: AuthShellProps) {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
			<div
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,oklch(0.99_0.03_320)_0%,oklch(0.985_0.02_230)_45%,oklch(0.97_0.04_250)_100%)] dark:bg-[linear-gradient(165deg,oklch(0.18_0.02_260)_0%,oklch(0.16_0.025_250)_50%,oklch(0.14_0.03_270)_100%)]"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute -right-20 bottom-1/4 size-80 rounded-full bg-sky-400/25 blur-3xl dark:bg-sky-500/15"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-violet-300/15 blur-3xl dark:bg-violet-500/10"
				aria-hidden
			/>

			<div className="relative w-full max-w-[420px]">
				<div className="mb-10 flex flex-col items-center justify-center text-center">
					<Link href="/" className="transition-opacity hover:opacity-90">
						<Image
							src="/images/logo.png"
							alt="BuildYard"
							width={160}
							height={40}
							className="h-10 w-auto object-contain"
							priority
						/>
					</Link>
					<p className="mt-3 max-w-[28ch] text-xs font-medium leading-relaxed text-muted-foreground">
						Focus sessions, projects, and AI help—built for solo developers who
						need structure, not noise.
					</p>
				</div>

				<Card variant="soft" className="overflow-hidden">
					<CardHeader className="items-center text-center">
						<CardTitle>{title}</CardTitle>
						<CardDescription className="max-w-[34ch]">
							{description}
						</CardDescription>
					</CardHeader>
					<CardContent className="mt-10 flex flex-col items-stretch pt-2">
						{children}
					</CardContent>
					<CardFooter className="text-center text-sm text-muted-foreground">
						{footer}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
