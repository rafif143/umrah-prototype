import { persistedState } from './persistedState.svelte.js';
import initialInquiries from '../data/inquiries.json';

// Create a persisted store for inquiries
// Key: 'umrah_inquiries'
const inquiryState = persistedState('umrah_inquiries', initialInquiries);

export const inquiryStore = {
    get inquiries() {
        return Array.isArray(inquiryState.value) ? inquiryState.value : [];
    },

    addInquiry: (inquiry) => {
        inquiryState.value = [...inquiryState.value, inquiry];
    },

    updateInquiry: (id, updatedInquiry) => {
        inquiryState.value = inquiryState.value.map(i =>
            i.id === id ? { ...i, ...updatedInquiry } : i
        );
    },

    deleteInquiry: (id) => {
        inquiryState.value = inquiryState.value.filter(i => i.id !== id);
    },

    // Reset to initial JSON data
    reset: () => {
        inquiryState.value = initialInquiries;
    }
};
