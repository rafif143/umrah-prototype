import { persistedState } from './persistedState.svelte.js';
import initialData from '../data/flightStorage.json';

// Create a persisted store for Flight Storage data
const flightStorageState = persistedState('umrah_flight_storage', initialData);

export const flightStorageStore = {
    get confirmBookings() {
        return flightStorageState.value.confirmBookings || [];
    },

    get tentativeBookings() {
        return flightStorageState.value.tentativeBookings || [];
    },

    // Add a new confirm booking
    addConfirmBooking: (booking) => {
        const newBooking = {
            ...booking,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        flightStorageState.value = {
            ...flightStorageState.value,
            confirmBookings: [...flightStorageState.value.confirmBookings, newBooking]
        };
        return newBooking;
    },

    // Update a confirm booking (e.g., to add PNR later)
    updateConfirmBooking: (id, updatedData) => {
        flightStorageState.value = {
            ...flightStorageState.value,
            confirmBookings: flightStorageState.value.confirmBookings.map(b =>
                b.id === id ? { ...b, ...updatedData, updatedAt: new Date().toISOString() } : b
            )
        };
    },

    // Delete a confirm booking
    deleteConfirmBooking: (id) => {
        flightStorageState.value = {
            ...flightStorageState.value,
            confirmBookings: flightStorageState.value.confirmBookings.filter(b => b.id !== id)
        };
    },

    // Add a new tentative booking
    addTentativeBooking: (booking) => {
        const newBooking = {
            ...booking,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        flightStorageState.value = {
            ...flightStorageState.value,
            tentativeBookings: [...flightStorageState.value.tentativeBookings, newBooking]
        };
        return newBooking;
    },

    // Update a tentative booking
    updateTentativeBooking: (id, updatedData) => {
        flightStorageState.value = {
            ...flightStorageState.value,
            tentativeBookings: flightStorageState.value.tentativeBookings.map(b =>
                b.id === id ? { ...b, ...updatedData, updatedAt: new Date().toISOString() } : b
            )
        };
    },

    // Delete a tentative booking
    deleteTentativeBooking: (id) => {
        flightStorageState.value = {
            ...flightStorageState.value,
            tentativeBookings: flightStorageState.value.tentativeBookings.filter(b => b.id !== id)
        };
    },

    // Reset to initial state
    reset: () => {
        flightStorageState.value = initialData;
    }
};
