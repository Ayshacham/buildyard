import { FolderIcon, ListTodoIcon, LayoutDashboardIcon } from 'lucide-react';

import { MenuItem } from '@/types/layout';

export const menuItems: MenuItem[] = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: <LayoutDashboardIcon />,
		isActive: true,
	},
	{
		title: 'Projects',
		url: '/projects',
		icon: <FolderIcon />,
		isActive: true,
	},
	{
		title: 'Tasks',
		url: '/tasks',
		icon: <ListTodoIcon />,
		isActive: true,
	},
];
