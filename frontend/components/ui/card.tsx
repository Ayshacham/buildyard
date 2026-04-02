import * as React from 'react';

import { cn } from '@/utils/cn';

function Card({
	className,
	variant = 'soft',
	...props
}: React.ComponentProps<'div'> & { variant?: 'soft' | 'plain' }) {
	return (
		<div
			data-slot="card"
			data-variant={variant}
			className={cn(
				variant === 'soft' && [
					'rounded-xl border border-white/50 bg-white/95 text-card-foreground',
					'shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_12px_40px_-12px_rgba(99,102,241,0.15),0_4px_16px_-4px_rgba(15,23,42,0.06)]',
					'backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/45',
					'dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_48px_-12px_rgba(0,0,0,0.55)]',
				],
				variant === 'plain' &&
					'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn('flex flex-col gap-1.5 px-8 pb-0 pt-8', className)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
	return (
		<h3
			data-slot="card-title"
			className={cn(
				'text-balance text-xl font-medium leading-tight tracking-tight text-foreground',
				className,
			)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot="card-description"
			className={cn(
				'text-pretty text-sm leading-relaxed text-muted-foreground',
				className,
			)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-content"
			className={cn('px-8 pb-8 pt-6', className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				'flex flex-col items-center border-t border-border/20 px-8 py-5 dark:border-white/[0.06]',
				className,
			)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
};
