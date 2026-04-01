'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { Github } from 'lucide-react';

import { ROUTES } from '@/utils/routes';

import { Button } from '@/components/ui/button';

import { createClient } from '@/lib/supabase/client';

type GitHubSignInButtonProps = {
	children: React.ReactNode;
	next?: string;
};

export function GitHubSignInButton({
	children,
	next = ROUTES.DASHBOARD,
}: GitHubSignInButtonProps) {
	const [pending, setPending] = useState(false);

	async function handleClick() {
		setPending(true);
		const supabase = createClient();
		const origin = window.location.origin;
		const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
			next,
		)}`;

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo,
				scopes: 'read:user user:email',
			},
		});

		if (error) {
			toast.error(error.message);
			setPending(false);
			return;
		}

		if (data.url) {
			window.location.href = data.url;
			return;
		}

		setPending(false);
	}

	return (
		<Button
			type="button"
			variant="oauth"
			size="pill"
			className="w-full"
			disabled={pending}
			onClick={handleClick}
		>
			<Github className="size-4" aria-hidden />
			{pending ? 'Signing you in…' : children}
		</Button>
	);
}
