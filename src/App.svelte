<script>
    import RspGameField from "./RspGameField.svelte";

    let game = "rsp";
</script>

{#if game === 'rsp'}
    <RspGameField />
{:else}
    <button on:click={() => {game = 'rsp'}}>New Game</button>
{/if}