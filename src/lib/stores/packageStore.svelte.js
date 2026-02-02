import { persistedState } from './persistedState.svelte.js';
import initialPackages from '../data/packages.json';

// Create a persisted store for Packages
const packageState = persistedState('umrah_packages', initialPackages);

export const packageStore = {
    get packages() {
        return Array.isArray(packageState.value) ? packageState.value : [];
    },

    addPackage: (pkg) => {
        packageState.value = [...packageState.value, pkg];
    },

    updatePackage: (id, updatedPkg) => {
        packageState.value = packageState.value.map(p =>
            p.id === id ? { ...p, ...updatedPkg } : p
        );
    },

    deletePackage: (id) => {
        packageState.value = packageState.value.filter(p => p.id !== id);
    },

    reset: () => {
        packageState.value = initialPackages;
    }
};
