import { persistedState } from './persistedState.svelte.js';
import initialAirlines from '../data/airlines.json';

// Create a persisted store for Airline Master Data
const airlineState = persistedState('umrah_master_airlines_prod_v1', initialAirlines);

export const airlineStore = {
    get airlines() { return airlineState.value.airlines; },
    get airports() { return airlineState.value.airports; },

    // Actions
    addAirline: (item) => {
        airlineState.value = { ...airlineState.value, airlines: [...airlineState.value.airlines, item] };
    },

    addAirport: (item) => {
        airlineState.value = { ...airlineState.value, airports: [...airlineState.value.airports, item] };
    },

    reset: () => {
        airlineState.value = initialAirlines;
    }
};
