<script>
import { io } from "socket.io-client";
import RspGameField from "/src/components/RspGameField.svelte";
import { socket } from "/src/stores";

let game = "";

const findOpponent = () => {
    $socket = io('http://localhost:5000');

    $socket.on("connect", () => {  console.log($socket.id);});

    $socket.on('start', () => {
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
    
</style>