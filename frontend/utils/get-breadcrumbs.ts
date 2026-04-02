import { MenuItem } from '@/types/layout';

export type BreadcrumbItem = {
	label: string;
	href: string;
};

type BreadcrumbResult = {
	breadcrumbs: BreadcrumbItem[];
	title: string;
};

function findTrailInMenu(
	menuItems: MenuItem[],
	pathname: string,
	trail: BreadcrumbItem[] = []
): BreadcrumbItem[] | null {
	for (const item of menuItems) {
		const itemTrail: BreadcrumbItem[] = [
			...trail,
			{ label: item.title, href: item.url },
		];

		if (item.url === pathname) {
			return itemTrail;
		}

		if (item.items) {
			const found = findTrailInMenu(item.items, pathname, itemTrail);
			if (found) return found;
		}
	}
	return null;
}

export function getBreadcrumbsFromPath(
	pathname: string,
	menuItems: MenuItem[]
): BreadcrumbResult {
	if (pathname === '/') {
		return { breadcrumbs: [], title: 'Home' };
	}

	const baseCrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
	if (pathname.startsWith('/dashboard') && pathname !== '/dashboard') {
		baseCrumbs.push({ label: 'Dashboard', href: '/dashboard' });
	}

	if (pathname === '/dashboard') {
		return { breadcrumbs: baseCrumbs, title: 'Dashboard' };
	}

	if (pathname.startsWith('/projects/') && pathname !== '/projects') {
		const segments = pathname.split('/').filter(Boolean);
		if (segments[0] === 'projects' && segments.length === 2) {
			return {
				breadcrumbs: [
					baseCrumbs[0],
					{ label: 'Projects', href: '/projects' },
				],
				title: 'Project',
			};
		}
	}

	const menuTrail = findTrailInMenu(menuItems, pathname);

	if (menuTrail) {
		const breadcrumbs = [...baseCrumbs, ...menuTrail.slice(0, -1)];
		const title = menuTrail[menuTrail.length - 1]?.label ?? 'Dashboard';
		return { breadcrumbs, title };
	}

	const segments = pathname.split('/').filter(Boolean);
	const title =
		segments.length > 0
			? segments[segments.length - 1].charAt(0).toUpperCase() +
			segments[segments.length - 1].slice(1)
			: 'Dashboard';

	let href = pathname.startsWith('/dashboard') ? '/dashboard' : '';
	const startIdx = pathname.startsWith('/dashboard') && segments[0] === 'dashboard' ? 1 : 0;
	for (let i = startIdx; i < segments.length - 1; i++) {
		href += `/${segments[i]}`;
		baseCrumbs.push({
			label: segments[i].charAt(0).toUpperCase() + segments[i].slice(1),
			href,
		});
	}

	return { breadcrumbs: baseCrumbs, title };
}
