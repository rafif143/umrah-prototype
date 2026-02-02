import { persistedState } from './persistedState.svelte.js';
import initialTransports from '../data/transports.json';

// Create a persisted store for Transport Master Data
const transportState = persistedState('umrah_master_transports', initialTransports);

export const transportStore = {
    get suppliers() { return transportState.value.suppliers; },
    get vehicleTypes() { return transportState.value.vehicleTypes; },
    get routes() { return transportState.value.routes; },

    // Supplier Actions
    addSupplier: (item) => {
        transportState.value = { ...transportState.value, suppliers: [...transportState.value.suppliers, item] };
    },

    // Vehicle Type Actions
    addVehicleType: (item) => {
        transportState.value = { ...transportState.value, vehicleTypes: [...transportState.value.vehicleTypes, item] };
    },

    reset: () => {
        transportState.value = initialTransports;
    }
};
