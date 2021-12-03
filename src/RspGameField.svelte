<script>
    import { io } from "socket.io-client";
    import { getContext, onMount, setContext } from "svelte";
    import ChooseSoldierPicker from "./ChooseSoldierPicker.svelte";
    import FieldBox from './FieldBox.svelte';
    import { figures, socket } from "./stores";

    const rows = 8;
    const columns = 8;

    setContext('rows', rows);
    setContext('columns', columns);

    let opponentFirstMove;
    let yourMove = false;

    $socket.on('opponentFirstMove', (opponentFigure) => {
        opponentFirstMove = opponentFigure;
        console.log('Gegner: ' + opponentFigure);
    });

    let chooseFirstMove = false;

    // $socket.on('chooseFirstMove', () => {
    //     chooseFirstMove = true;
    // });
    
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
        chooseFirstMove = true;

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

    const attackOpponent = figure => {
        const opponentFigure = opponentFirstMove;
        const attackFigure = figure;

        if(opponentFigure === attackFigure) {
            setTimeout(() => {
                chooseFirstMove = true;
                console.log('pat');
            }, 1000);
        }else if(
            (opponentFigure === 'rock' && attackFigure === 'paper') ||
            (opponentFigure === 'paper' && attackFigure === 'scissor') ||
            (opponentFigure === 'scissor' && attackFigure === 'rock')
        ) {
            console.log('gewonnen');
            chooseFirstMove = false;
            yourMove = true;
        }else {
            console.log('verloren');
            chooseFirstMove = false;
            yourMove = false;
        }
    }

    const setFigure = settedFigure => {
        if(opponentFirstMove) {
            attackOpponent(settedFigure);
        }else {
            console.log('client: ' + settedFigure);
            $socket.emit('firstMoveSet', settedFigure);
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
                <FieldBox field={row} {arrayAs2dField} {yourMove} {setArrayAs2dField} figure={currentFigureSelection} {gameStart} />
            {/each}
        </div>
    {/each}
    <div class="btns">
        {#each Object.entries($figures.attackers) as [attacker, count]}
            <button on:click={() => setFigureSelection(attacker)}>{attacker} {count}</button>
        {/each}
        <button on:click={() => setFigureSelection('king')}>King {$figures.king}</button>
    </div>
    {#if chooseFirstMove}
        <ChooseSoldierPicker {setFigure} setPatFalse={() => chooseFirstMove = false} />
    {/if}
</main>