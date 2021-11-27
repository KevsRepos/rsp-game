<script>
import { getContext, setContext } from "svelte";
import ChooseSoldierPicker from "./ChooseSoldierPicker.svelte";
import { figures } from "./stores";

    export let field, arrayAs2dField, setArrayAs2dField, figure, gameStart;

    const rows = getContext('rows');
    const columns = getContext('columns');

    let isOnPlayerClick = false;
    let pat = null;

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
        const selfFigure = arrayAs2dField[field.playerFrom.row][field.playerFrom.column].figure;

        setArrayAs2dField(field.place.row, field.place.column, 'self', true);
        setArrayAs2dField(field.place.row, field.place.column, 'opponent', false);
        setArrayAs2dField(field.place.row, field.place.column, 'showMove', false);
        setArrayAs2dField(field.place.row, field.place.column, 'figure', selfFigure);

        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'self', false);
        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'figure', null);

        setArrayAs2dField(field.place.row, field.place.column, 'playerFrom', null);

        removeMovingPossibilities();
    }

    const moveOpponent = () => {
        setArrayAs2dField(field.place.row, field.place.column, 'opponent', false);
        setArrayAs2dField(field.place.row, field.place.column, 'freeSpace', true);

        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'figure', field.figure);

        setArrayAs2dField(field.place.row, field.place.column, 'figure', null);

        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'opponent', true);
        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'self', false);
        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'showMove', false);

        removeMovingPossibilities();
    }

    const revealOpponent = () => {
        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'opponentRevealed', true);
    }

    const setFigure = (settedFigure = null) => {
        if(settedFigure) {
            console.log(settedFigure);
            setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'figure', settedFigure);
            return;
        }

        if(figure !== "" && !field.figure) {
            if($figures.attackers[figure] === 0) return;

            if(figure === 'king') $figures.king -= 1;
            else $figures.attackers[figure] -= 1;

            setArrayAs2dField(field.place.row, field.place.column, 'figure', figure);
        }
    }

    const attackOpponent = () => {
        const opponent = arrayAs2dField[field.place.row][field.place.column];
        const attacker = arrayAs2dField[field.playerFrom.row][field.playerFrom.column];

        const opponentFigure = opponent.figure;
        const attackFigure = attacker.figure;

        console.log('Figure: ' + attackFigure);
        console.log('Opponent Figure: ' + opponentFigure);

        if(opponentFigure === attackFigure) {
            setTimeout(() => {
                pat = true;
                console.log('pat');
            }, 1000);
        }else if(
            (opponentFigure === 'rock' && attackFigure === 'paper') ||
            (opponentFigure === 'paper' && attackFigure === 'scissor') ||
            (opponentFigure === 'scissor' && attackFigure === 'rock')
        ) {
            movePlayer();
        }else {
            moveOpponent();
            revealOpponent();
        }
    }

    $: if(gameStart && field.opponent && pat === false) {
        console.log('attack opponent again');
        attackOpponent();
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

{#if !gameStart && field.self && !field.figure}
    <div class="box self" on:click={() => setFigure()}>
        Du
    </div>
{:else if !gameStart && field.self}
    <div class="box self" on:click={setFigure}>
        {field.figure}
    </div>
{:else if gameStart && field.self}
    <div class="box self" on:click={playerClicked}>
        {field.figure}
    </div>
{:else if field.opponent && field.showMove}
    <div class="box opponent showAttackable" on:click={attackOpponent}>
        Gegner
    </div>
{:else if field.opponent && field.opponentRevealed}
    <div class="box opponent">
        Gegner<br />
        {field.figure}
    </div>
{:else if field.opponent}
    <div class="box opponent">
        Gegner
    </div>
{:else if gameStart && field.showMove}
    <div class="box showMovable" on:click={movePlayer}>

    </div>
{:else}
    <div class="box">

    </div>
{/if}

{#if pat}
<ChooseSoldierPicker {setFigure} setPatFalse={() => pat = false} />
{/if}