import { BotIcon, BrainCogIcon, BrainIcon } from 'lucide-react';

export const sidebarConfig = {
  user: {
    name: 'BuildYard',
    email: 'hello@buildyard.dev',
    avatar: '/avatars/shadcn.jpg',
  },
  tools: [
    { name: 'Focus Mode', url: '/dashboard', icon: BrainCogIcon },
    { name: 'Brain Dump', url: '/dashboard/brain-dump', icon: BrainIcon },
    { name: 'AI Standup', url: '/dashboard/ai', icon: BotIcon },
  ],
} as const;
