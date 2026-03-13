import { BotIcon, BrainCogIcon, BrainIcon } from 'lucide-react';

export const sidebarConfig = {
  user: {
    name: 'BuildYard',
    email: 'hello@buildyard.dev',
    avatar: '/avatars/shadcn.jpg',
  },
  tools: [
    { name: 'Focus Mode', url: '#', icon: BrainCogIcon },
    { name: 'Brain Dump', url: '#', icon: BrainIcon },
    { name: 'AI Standup', url: '#', icon: BotIcon },
  ],
} as const;
