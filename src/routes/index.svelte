<script>
import { io } from "socket.io-client";
import { onMount } from "svelte";
import RspGameField from "/src/components/RspGameField.svelte";
import { socket } from "/src/stores";

let 
game = "",
searching = false;

const findOpponent = () => {
    if($socket) return;

    searching = true;

    $socket = io('http://localhost:5200');

    $socket.on("connect", () => {  console.log($socket.id);});

    $socket.on('start', () => {
        searching = false;
        game = 'rsp';
        // console.log('Gegner gefunden');
    });
}
</script>

{#if game === 'rsp'}
    <RspGameField />
{:else}
    <header>
        <h1>RSP ONLINE</h1>
    </header>

    <nav>
        <button on:click={findOpponent}>Match suchen</button>
    </nav>

    <footer>
        More Information
    </footer>
{/if}

<style>
header {
    display: flex;
    justify-content: center;
    padding: 10px;
}
nav {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 50vh;
}
footer {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: max-content;
}
</style>