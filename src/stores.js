import { writable } from 'svelte/store';

export let figures = writable({
    attackers: {
        rock: 5,
        scissor: 5,
        paper: 5
    },
    king: 1
});