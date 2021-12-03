import { readable, writable } from 'svelte/store';

export let figures = writable({
    attackers: {
        rock: 5,
        scissor: 5,
        paper: 5
    },
    king: 1
});

export const socket = writable();