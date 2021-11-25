<script>
import { getContext, onMount, setContext } from "svelte";
import FieldBox from './FieldBox.svelte';

    const rows = 8;
    const columns = 8;

    setContext('rows', rows);
    setContext('columns', columns);
    
    let gameStart = false;

    let currentSoldierSelection = '';

    const soldiers = [
        'rock',
        'scissors',
        'paper',
        'king'
    ];

    let soldierCount = {
        rock: 5,
        scissors: 5,
        paper: 5,
        king: 1
    }

    let arrayAs2dField = new Array(columns);

    const setArrayAs2dField = (row, column, property, value) => {
       arrayAs2dField[row][column][property] = value;

       if(property === 'playerSoldier' && !gameStart) {
           soldierCount[value] -= 1;
       }
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
                freeSpace: false,
                showMove: false,
                playerFrom: null,
                playerSoldier: null
            };
        }
    }

    onMount(() => {
        arrayAs2dField.forEach((column, columnIndex) => {
            column.forEach((row, rowIndex) => {
                if(columnIndex === columns - 2 || columnIndex === columns - 1) {
                    arrayAs2dField[columnIndex][rowIndex].self = true;
                }else if(columnIndex === 0 || columnIndex === 1) {
                    arrayAs2dField[columnIndex][rowIndex].opponent = true;
                }else {
                    arrayAs2dField[columnIndex][rowIndex].freeSpace = true;
                }
            });
        });
    });

    const setSoldierSelection = (soldier) => {
        if(soldierCount[soldier] === 0) return;

        if(currentSoldierSelection === soldier) {
            currentSoldierSelection = '';
        }else {
            currentSoldierSelection = soldier;
        }
    }

    $: console.log(arrayAs2dField);

    $: if(Object.values(soldierCount).every(x => x === 0)) {
        console.log('game');
        gameStart = true;
    }
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
                <FieldBox field={row} {arrayAs2dField} {setArrayAs2dField} soldier={currentSoldierSelection} {soldierCount} {gameStart} />
            {/each}
        </div>
    {/each}
    <div class="btns">
        {#each soldiers as soldier}
            <button on:click={() => setSoldierSelection(soldier)}>{soldier} {soldierCount[soldier]}</button>
        {/each}
    </div>
</main>