import { persistedState } from './persistedState.svelte.js';
import initialServices from '../data/services.json';

// Create a persisted store for Service Master Data
const serviceState = persistedState('umrah_master_services', initialServices);

export const serviceStore = {
    get suppliers() { return serviceState.value.suppliers; },
    get services() { return serviceState.value.services; },

    // Actions
    addSupplier: (item) => {
        serviceState.value = { ...serviceState.value, suppliers: [...serviceState.value.suppliers, item] };
    },

    addService: (item) => {
        serviceState.value = { ...serviceState.value, services: [...serviceState.value.services, item] };
    },

    reset: () => {
        serviceState.value = initialServices;
    }
};
