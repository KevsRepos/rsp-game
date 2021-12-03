<script>
    import { io } from "socket.io-client";
    import RspGameField from "./RspGameField.svelte";
    import { socket } from "./stores";

    const findOpponent = () => {
        $socket = io('http://localhost:3000');

        $socket.on("connect", () => {  console.log($socket.id);});

        $socket.on('initiateGame', () => {
            game = 'rsp';
            console.log('Gegner gefunden');
        });
    }

    let game = "";
</script>

{#if game === 'rsp'}
    <RspGameField />
{:else}
    <button on:click={findOpponent}>Match suchen</button>
{/if}