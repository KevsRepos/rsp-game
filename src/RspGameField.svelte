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

    let yourMove = false;

    let chooseFirstMove = false;

    // $socket.on('chooseFirstMove', () => {
    //     chooseFirstMove = true;
    // });
    
    let gameStart = false;

    let currentFigureSelection = '';

    $: if(Object.values($figures.attackers).every(x => x === 0) && $figures.king === 0 && !gameStart) {
        let figuresArray = [];

        for (let i = 0; i < arrayAs2dField.length; i++) {
            for (let j = 0; j < arrayAs2dField[i].length; j++) {
                if(arrayAs2dField[i][j].self) {
                    figuresArray.push(arrayAs2dField[i][j].figure);
                }
            }
        }

        // console.log(figuresArray);

        $socket.emit('setFigures', figuresArray);
        gameStart = true;
    }

    $socket.on('firstMoveHas', data => {
        // console.log(data);
        if(data === null) {
            chooseFirstMove = true;
        }else {
            if(data === $socket.id) {
                yourMove = true;
            }
        }
    });

    $socket.on('opponentMoveTo', ([from, to]) => {
        console.log('opponent moves');
        // console.log(from);
        // console.log(to);
        moveOpponent(from, to);
    });

    $socket.on('callerLost', ({caller, from, to, fromInverted, toInverted, opponent}) => {
        console.log(caller);
        console.log(opponent);

        if(caller === $socket.id) {
            console.log('Du bist caller');
        }else {
            console.log('Gegner ist caller');
        }

        if(caller === $socket.id) moveOpponent(to, from, true, opponent); 
        else movePlayer(toInverted, fromInverted);
    });

    const movePlayer = (from, to) => {
        const selfFigure = arrayAs2dField[from.row][from.column].figure;

        setArrayAs2dField(to.row, to.column, 'self', true);
        setArrayAs2dField(to.row, to.column, 'opponent', false);
        setArrayAs2dField(to.row, to.column, 'showMove', false);
        setArrayAs2dField(to.row, to.column, 'figure', selfFigure);

        setArrayAs2dField(from.row, from.column, 'self', false);

        setArrayAs2dField(to.row, to.column, 'playerFrom', null);
    }

    const moveOpponent = (from, to, revealPlayer, figure) => {
        setArrayAs2dField(from.row, from.column, 'opponent', false);
        // setArrayAs2dField(from.row, from.column, 'freeSpace', true);

        setArrayAs2dField(to.row, to.column, 'figure', figure);

        setArrayAs2dField(from.row, from.column, 'figure', null);

        setArrayAs2dField(to.row, to.column, 'opponent', true);
        setArrayAs2dField(to.row, to.column, 'self', false);
        setArrayAs2dField(to.row, to.column, 'showMove', false);

        setArrayAs2dField(to.row, to.column, 'opponentRevealed', revealPlayer);
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
        // chooseFirstMove = true;

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

    const setFigure = settedFigure => {
        // console.log(settedFigure);
        // console.log('client: ' + settedFigure);
        $socket.emit('firstMove', settedFigure);
    }

    $: if(gameStart) chooseFirstMove = true;

    // $: console.log($figures);
    // $: console.table(arrayAs2dField);
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
                <FieldBox field={row} {arrayAs2dField} {setArrayAs2dField} figure={currentFigureSelection} {gameStart} {yourMove} />
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