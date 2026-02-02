import { browser } from '$app/environment';

/**
 * Creates a persisted state that syncs with localStorage
 * @template T
 * @param {string} key - LocalStorage key
 * @param {T} initialValue - Initial value if storage is empty
 * @returns {{ value: T }} - Reactive state object
 */
export function persistedState(key, initialValue) {
    let state = $state(initialValue);

    if (browser && typeof localStorage !== 'undefined') {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                state = JSON.parse(stored);
            }
        } catch (e) {
            console.error(`Error parsing localStorage key "${key}":`, e);
        }
    }

    return {
        get value() {
            return state;
        },
        set value(v) {
            state = v;
            if (browser && typeof localStorage !== 'undefined') {
                try {
                    localStorage.setItem(key, JSON.stringify(v));
                } catch (e) {
                    console.error(`Error writing to localStorage key "${key}":`, e);
                }
            }
        }
    };
}
