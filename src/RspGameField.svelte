<script>
import { getContext, onMount, setContext } from "svelte";
import FieldBox from './FieldBox.svelte';
import { figures } from "./stores";

    const rows = 8;
    const columns = 8;

    setContext('rows', rows);
    setContext('columns', columns);
    
    let gameStart = false;

    let currentFigureSelection = '';

    $: if(Object.values($figures.attackers).every(x => x === 0) && $figures.king === 0) {
        // console.log('game');
        gameStart = true;
    }

    setContext('attackers', $figures.attackers);

    let arrayAs2dField = new Array(columns);

    const setArrayAs2dField = (row, column, property, value) => {
        arrayAs2dField[row][column][property] = value;
    }

    for (let rows = 0; rows < arrayAs2dField.length; rows++) {
        arrayAs2dField[rows] = new Array(columns);

        for (let columns = 0; columns < arrayAs2dField[rows].length; columns++) {
            arrayAs2dField[rows][columns] = {
                place: {
                    column: columns, 
                    row: rows
                },
                self: false,
                opponent: false,
                opponentRevealed: false,
                freeSpace: false,
                showMove: false,
                playerFrom: null,
                figure: null
            };
        }
    }

    onMount(() => {
        arrayAs2dField.forEach((column, columnIndex) => {
            column.forEach((row, rowIndex) => {
                if(columnIndex === columns - 2 || columnIndex === columns - 1) {
                    arrayAs2dField[columnIndex][rowIndex].self = true;
                    // arrayAs2dField[columnIndex][rowIndex].playerSoldier = 'paper';
                }else if(columnIndex === 0 || columnIndex === 1) {
                    arrayAs2dField[columnIndex][rowIndex].opponent = true;
                    arrayAs2dField[columnIndex][rowIndex].figure = 'paper';
                }else {
                    arrayAs2dField[columnIndex][rowIndex].freeSpace = true;
                }
            });
        });
    });

    const setFigureSelection = (figure) => {
        if($figures.attackers[figure] === 0) return;

        if(currentFigureSelection === figure) {
            currentFigureSelection = '';
        }else {
            currentFigureSelection = figure;
        }
    }

    // $: console.log($figures);
    // $: console.log(arrayAs2dField);
</script>

<style>
    .row {
         display: flex;
         flex-direction: row;
    }
    .btns {
        margin: 10px;
    }
</style>

<main>
    {#each arrayAs2dField as column}
        <div class="row">
            {#each column as row}
                <FieldBox field={row} {arrayAs2dField} {setArrayAs2dField} figure={currentFigureSelection} {gameStart} />
            {/each}
        </div>
    {/each}
    <div class="btns">
        {#each Object.entries($figures.attackers) as [attacker, count]}
            <button on:click={() => setFigureSelection(attacker)}>{attacker} {count}</button>
        {/each}
        <button on:click={() => setFigureSelection('king')}>King {$figures.king}</button>
    </div>
</main>