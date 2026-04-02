import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { cn } from '@/utils/cn';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/errors';

export type ErrorStateProps = {
	title?: string;
	description?: string | null;
	error?: unknown;
	children?: React.ReactNode;
	onRetry?: () => void;
	retryLabel?: string;
	showIcon?: boolean;
	className?: string;
};

export function ErrorState({
	title = 'Something went wrong',
	description,
	error,
	children,
	onRetry,
	retryLabel = 'Retry',
	showIcon = true,
	className,
}: ErrorStateProps) {
	const message =
		description ?? (error !== undefined ? getApiErrorMessage(error) : null);

	return (
		<div
			role="alert"
			className={cn(
				'rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive',
				className,
			)}
		>
			<div className="flex gap-3">
				{showIcon ? (
					<AlertCircle
						aria-hidden
						className="mt-0.5 size-4 shrink-0 text-destructive/80"
					/>
				) : null}
				<div className="min-w-0 flex-1 space-y-1">
					<p className="font-medium">{title}</p>
					{message ? (
						<p className="text-pretty text-destructive/90">{message}</p>
					) : null}
					{children ? (
						<div className="pt-1 text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-foreground">
							{children}
						</div>
					) : null}
				</div>
			</div>

			{onRetry ? (
				<div className="mt-3 flex justify-end">
					<Button
						type="button"
						variant="destructive"
						size="sm"
						onClick={onRetry}
					>
						{retryLabel}
					</Button>
				</div>
			) : null}
		</div>
	);
}
