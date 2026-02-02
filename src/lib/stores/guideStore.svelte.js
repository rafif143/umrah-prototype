import { persistedState } from './persistedState.svelte.js';
import initialGuides from '../data/guides.json';

// Create a persisted store for Guide Master Data
const guideState = persistedState('umrah_master_guides', initialGuides);

export const guideStore = {
    get guides() { return guideState.value.guides; },
    get leaders() { return guideState.value.leaders; },

    // Actions
    addGuide: (item) => {
        guideState.value = { ...guideState.value, guides: [...guideState.value.guides, item] };
    },

    addLeader: (item) => {
        guideState.value = { ...guideState.value, leaders: [...guideState.value.leaders, item] };
    },

    reset: () => {
        guideState.value = initialGuides;
    }
};
