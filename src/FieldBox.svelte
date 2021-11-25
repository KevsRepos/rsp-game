<script>
import { getContext, setContext } from "svelte";


    export let field, arrayAs2dField, setArrayAs2dField, soldier, soldierCount, gameStart;

    const rows = getContext('rows');
    const columns = getContext('columns');

    let isOnPlayerClick = false;

    const playerClicked = () => {
        isOnPlayerClick = isOnPlayerClick ? false : true;

        const nextFields = getNextFields(field.place);
        const movingPossibilities = checkMovingPossibilities(nextFields);

        removeMovingPossibilities();
        
        showMovingPossibilities(movingPossibilities, field.place);
    }

    const getNextFields = ({column, row}) => {
        return {
            top: arrayAs2dField?.[row - 1]?.[column] ?? null,
            bottom: arrayAs2dField?.[row + 1]?.[column] ?? null,
            left: arrayAs2dField?.[row]?.[column - 1] ?? null,
            right: arrayAs2dField?.[row]?.[column + 1] ?? null
        }
    }

    const checkMovingPossibilities = (nextFields) => {
        const movingPossibilities = {};

        for (const [key, entries] of Object.entries(nextFields)) {
            movingPossibilities[key] = 
            !entries ? false :
            entries.opponent ? entries.place :
            entries.self ? false :
            entries.place;
        }

        return movingPossibilities;
    }

    const showMovingPossibilities = (movingPossibilities, currentField) => {
        for (const [key, entry] of Object.entries(movingPossibilities)) {
            if(entry) {
                setArrayAs2dField(entry.row, entry.column, 'showMove', true);
                setArrayAs2dField(entry.row, entry.column, 'playerFrom', currentField);
            }
        }
    }

    const removeMovingPossibilities = () => {
        arrayAs2dField.forEach((row, rowIndex) => {
            row.forEach((column, columnIndex) => {
                setArrayAs2dField(rowIndex, columnIndex, 'showMove', false);
            });
        });
    }

    const movePlayer = () => {
        const fromSoldier = arrayAs2dField[field.playerFrom.row][field.playerFrom.column].playerSoldier;

        setArrayAs2dField(field.place.row, field.place.column, 'self', true);
        setArrayAs2dField(field.place.row, field.place.column, 'showMove', false);
        setArrayAs2dField(field.place.row, field.place.column, 'playerSoldier', fromSoldier);

        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'self', false);
        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'playerSoldier', null);

        setArrayAs2dField(field.place.row, field.place.column, 'playerFrom', null);

        removeMovingPossibilities();
    }

    const emptyFieldClicked = () => {

    }

    const moveToField = () => {

    }

    const setSoldier = () => {
        if(soldier !== "" && !field.playerSoldier) {
            if(soldierCount[soldier] === 0) return;
            setArrayAs2dField(field.place.row, field.place.column, 'playerSoldier', soldier);
        }
    }
</script>

<style>
    .box {
        height: 60px;
        width: 60px;
        border: 1px black solid;
    }
    .showMovable {
        background-color: green;
    }
    .showAttackable {
        background-color: red;
    }
</style>

{#if !gameStart && field.self && !field.playerSoldier}
<div class="box self" on:click={setSoldier}>
    Du
</div>
{:else if !gameStart && field.self}
<div class="box self" on:click={setSoldier}>
    {field.playerSoldier}
</div>
{:else if gameStart && field.self}
<div class="box self" on:click={playerClicked}>
    {field.playerSoldier}
</div>
{:else if field.opponent && field.showMove}
<div class="box opponent showAttackable">
    Gegner
</div>
{:else if field.opponent}
<div class="box opponent">
    Gegner
</div>
{:else if gameStart && field.showMove}
<div class="box showMovable" on:click={movePlayer}>

</div>
{:else}
<div class="box" on:click={emptyFieldClicked}>

</div>
{/if}