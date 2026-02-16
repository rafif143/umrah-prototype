import { persistedState } from './persistedState.svelte.js';
import initialData from '$lib/data/hotelStorage.json';

const hotelStorageState = persistedState('hotelStorage_v6', initialData);

export const hotelStorageStore = {
    get hotels() {
        return hotelStorageState.value.hotels || [];
    },

    addHotel: (hotel) => {
        const newHotel = { ...hotel, hotelId: `h-${Date.now()}`, contracts: [] };
        hotelStorageState.value = { ...hotelStorageState.value, hotels: [...hotelStorageState.value.hotels, newHotel] };
        return newHotel;
    },

    updateHotel: (hotelId, updates) => {
        hotelStorageState.value = {
            ...hotelStorageState.value,
            hotels: hotelStorageState.value.hotels.map(h => h.hotelId === hotelId ? { ...h, ...updates } : h)
        };
    },

    deleteHotel: (hotelId) => {
        hotelStorageState.value = {
            ...hotelStorageState.value,
            hotels: hotelStorageState.value.hotels.filter(h => h.hotelId !== hotelId)
        };
    },

    addContract: (hotelId, contract) => {
        const newContract = { ...contract, id: `contract-${Date.now()}` };
        hotelStorageState.value = {
            ...hotelStorageState.value,
            hotels: hotelStorageState.value.hotels.map(h =>
                h.hotelId === hotelId ? { ...h, contracts: [...h.contracts, newContract] } : h
            )
        };
        return newContract;
    },

    updateContract: (hotelId, contractId, updates) => {
        hotelStorageState.value = {
            ...hotelStorageState.value,
            hotels: hotelStorageState.value.hotels.map(h =>
                h.hotelId === hotelId
                    ? { ...h, contracts: h.contracts.map(c => c.id === contractId ? { ...c, ...updates } : c) }
                    : h
            )
        };
    },

    deleteContract: (hotelId, contractId) => {
        hotelStorageState.value = {
            ...hotelStorageState.value,
            hotels: hotelStorageState.value.hotels.map(h =>
                h.hotelId === hotelId
                    ? { ...h, contracts: h.contracts.filter(c => c.id !== contractId) }
                    : h
            )
        };
    },

    reset: () => {
        hotelStorageState.value = initialData;
    }
};
