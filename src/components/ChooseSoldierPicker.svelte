<script>
import { getContext, onMount } from "svelte";

export let setFigure, setPatFalse;

const attackers = getContext('attackers');

let counter = 10;
let countInterval;

const randomChooser = Math.floor(Math.random() * 3);

onMount(() => {
    console.log('Soldier choose Mount');
    countInterval = setInterval(() => {
        counter--;

        if(counter === 0) {
            clearInterval(countInterval);
            setFigure(Object.keys(attackers)[randomChooser])
            setPatFalse();
        }
    }, 1000);
});
</script>

<div>
    <span>{counter}</span>
    {#each Object.entries(attackers) as [attacker]}
        <button on:click={() => {setFigure(attacker); clearInterval(countInterval); setPatFalse(); }}>{attacker}</button>
    {/each}
</div>

<style>
div {
    position: fixed;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    background-color: #333;
    padding: 30px;
    box-shadow: 0px 0px 5px #bbbbbb;
}
button {
    padding: 2px;
    font-size: 0.8em;
}
</style>