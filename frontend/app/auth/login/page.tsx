'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useEffect } from 'react';

import { ROUTES } from '@/utils/routes';

import { AuthShell } from '@/components/auth/auth-shell';
import { GitHubSignInButton } from '@/components/auth/github-sign-in-button';

export default function LoginPage() {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get('error') === 'oauth') {
			toast.error('Sign-in didn’t complete. Please try again.');
			window.history.replaceState({}, '', '/auth/login');
		}
	}, []);

	return (
		<AuthShell
			title="Welcome back"
			description="Pick up where you left off—sessions, streaks, and your projects."
			footer={
				<>
					New here?{' '}
					<Link
						href={ROUTES.REGISTER}
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Create an account
					</Link>
				</>
			}
		>
			<GitHubSignInButton>Continue with GitHub</GitHubSignInButton>
		</AuthShell>
	);
}
