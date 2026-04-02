import { create } from 'zustand';

type UiStore = {
	newProjectOpen: boolean;
	setNewProjectOpen: (open: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
	newProjectOpen: false,
	setNewProjectOpen: (open) => set({ newProjectOpen: open }),
}));
