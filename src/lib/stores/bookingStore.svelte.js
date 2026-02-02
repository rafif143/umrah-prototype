import { persistedState } from './persistedState.svelte.js';
import initialBookings from '../data/bookings.json';

// Create a persisted store for bookings
// Key: 'umrah_bookings'
const bookingState = persistedState('umrah_bookings', initialBookings);

export const bookingStore = {
    get bookings() {
        return Array.isArray(bookingState.value) ? bookingState.value : [];
    },

    addBooking: (booking) => {
        bookingState.value = [...bookingState.value, booking];
    },

    updateBooking: (id, updatedBooking) => {
        bookingState.value = bookingState.value.map(b =>
            b.id === id ? { ...b, ...updatedBooking } : b
        );
    },

    deleteBooking: (id) => {
        bookingState.value = bookingState.value.filter(b => b.id !== id);
    },

    // Reset to initial JSON data (helpful for demos)
    reset: () => {
        bookingState.value = initialBookings;
    }
};
