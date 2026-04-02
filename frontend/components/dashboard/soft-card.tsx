import * as React from 'react';

import { cn } from '@/utils/cn';

import { Card } from '@/components/ui/card';

const softHover =
	'transition-shadow duration-300 hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,0.18)]';

export function SoftCard({
	className,
	...props
}: React.ComponentProps<typeof Card>) {
	return (
		<Card variant="soft" className={cn(softHover, className)} {...props} />
	);
}
