'use client';

import Image from 'next/image';
import Link from 'next/link';

import { SidebarMenuButton } from '@/components/ui/sidebar';

export function SidebarLogo() {
	return (
		<SidebarMenuButton size="lg" asChild className="rounded-xl">
			<Link href="/dashboard" className="gap-3">
				<div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden">
					<Image
						src="/images/logo-small.png"
						alt=""
						width={100}
						height={100}
						className="h-10 w-auto object-contain"
					/>
				</div>
				<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
					<Image
						src="/images/logo-text.png"
						alt=""
						width={100}
						height={100}
						className="h-10 w-auto object-contain"
					/>

					<span className="truncate text-xs text-sidebar-foreground/65">
						Focus time for builders
					</span>
				</div>
			</Link>
		</SidebarMenuButton>
	);
}
