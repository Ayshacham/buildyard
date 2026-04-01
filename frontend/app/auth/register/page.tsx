'use client';

import Link from 'next/link';

import { ROUTES } from '@/utils/routes';

import { AuthShell } from '@/components/auth/auth-shell';
import { GitHubSignInButton } from '@/components/auth/github-sign-in-button';

export default function RegisterPage() {
	return (
		<AuthShell
			title="Create your workspace"
			description="Start tracking focus time, shipping, and what actually matters—without the guilt spiral."
			footer={
				<>
					Already have an account?{' '}
					<Link
						href={ROUTES.LOGIN}
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</>
			}
		>
			<GitHubSignInButton>Continue with GitHub</GitHubSignInButton>
		</AuthShell>
	);
}
