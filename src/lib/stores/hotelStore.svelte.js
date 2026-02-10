import { persistedState } from './persistedState.svelte.js';
import hotelList from '../data/masterData-hotel.json';

// Build the initial data structure the store expects
const initialHotelData = {
    hotels: hotelList,
    roomTypes: [
        { id: 'rt-1', name: 'Single', capacity: 1 },
        { id: 'rt-2', name: 'Double', capacity: 2 },
        { id: 'rt-3', name: 'Triple', capacity: 3 },
        { id: 'rt-4', name: 'Quad', capacity: 4 },
        { id: 'rt-5', name: 'Quint', capacity: 5 }
    ],
    basisTypes: [
        { id: 'bt-1', name: 'Room Only' },
        { id: 'bt-2', name: 'Bed & Breakfast' },
        { id: 'bt-3', name: 'Half Board' },
        { id: 'bt-4', name: 'Full Board' }
    ],
    foodTypes: [
        { id: 'ft-1', name: 'Breakfast' },
        { id: 'ft-2', name: 'Lunch' },
        { id: 'ft-3', name: 'Dinner' },
        { id: 'ft-4', name: 'Buffet' }
    ],
    hotelViews: [
        { id: 'hv-1', name: 'Kaaba View' },
        { id: 'hv-2', name: 'Haram View' },
        { id: 'hv-3', name: 'City View' },
        { id: 'hv-4', name: 'Garden View' }
    ]
};

// Create a persisted store for Hotel Master Data
const hotelState = persistedState('umrah_master_hotel', initialHotelData);

export const hotelStore = {
    get hotels() { return hotelState.value.hotels; },
    get roomTypes() { return hotelState.value.roomTypes; },
    get basisTypes() { return hotelState.value.basisTypes; },
    get foodTypes() { return hotelState.value.foodTypes; },
    get hotelViews() { return hotelState.value.hotelViews; },

    // Hotel Actions
    addHotel: (hotel) => {
        hotelState.value = { ...hotelState.value, hotels: [...hotelState.value.hotels, hotel] };
    },
    updateHotel: (id, updatedHotel) => {
        hotelState.value = {
            ...hotelState.value,
            hotels: hotelState.value.hotels.map(h => h.id === id ? { ...h, ...updatedHotel } : h)
        };
    },
    deleteHotel: (id) => {
        hotelState.value = {
            ...hotelState.value,
            hotels: hotelState.value.hotels.filter(h => h.id !== id)
        };
    },

    // Config Actions
    addRoomType: (item) => {
        hotelState.value = { ...hotelState.value, roomTypes: [...hotelState.value.roomTypes, item] };
    },
    addFoodType: (item) => {
        hotelState.value = { ...hotelState.value, foodTypes: [...hotelState.value.foodTypes, item] };
    },
    addHotelView: (item) => {
        hotelState.value = { ...hotelState.value, hotelViews: [...hotelState.value.hotelViews, item] };
    },

    reset: () => {
        hotelState.value = initialHotelData;
    }
};
