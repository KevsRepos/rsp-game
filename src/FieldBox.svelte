<script>
import { afterUpdate, getContext, onMount, setContext } from "svelte";
import ChooseSoldierPicker from "./ChooseSoldierPicker.svelte";
import { figures, socket } from "./stores";

    export let field, arrayAs2dField, setArrayAs2dField, figure, gameStart, yourMove;

    const rows = getContext('rows');
    const columns = getContext('columns');

    let isOnPlayerClick = false;
    let pat = null;

    onMount(() => {
        setTimeout(() => {
            // console.log(field);
            if(field.self) {
                // console.log('huier');
                setFigure(null, true);
            }
        }, 0);
        // placeFiguresInterval = setInterval(() => {
        //     if(gameStart) clearInterval(placeFiguresInterval);

        //     placeFiguresCounter--;

        //     if(placeFiguresCounter == 0) {
        //         clearInterval(placeFiguresInterval);

        //         if(!gameStart) {
        //             setFigure(null, 'random');
        //         }
        //     }
        // }, 30000);
    });

    const playerClicked = () => {
        if(!yourMove) return;

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

    const getMovePermission = () => {
        const selfFigure = arrayAs2dField[field.playerFrom.row][field.playerFrom.column].figure;

        $socket.emit('movePlayer', {
            figure: selfFigure,
            playerPos: {
                row: field.playerFrom.row, 
                column: field.playerFrom.column
            },
            field: {
                row: field.place.row, 
                column: field.place.column
            }
        });

        $socket.on('moveAllowed', isAllowed => {
            $socket.off('moveAllowed');
            console.log('allowed: ' + isAllowed);
            if(!isAllowed) return;

            console.log(field);
            movePlayer();
        });
    }

    const movePlayer = (from = field.playerFrom, to = field.place) => {
        const selfFigure = arrayAs2dField[from.row][from.column].figure;

        setArrayAs2dField(to.row, to.column, 'self', true);
        setArrayAs2dField(to.row, to.column, 'opponent', false);
        setArrayAs2dField(to.row, to.column, 'showMove', false);
        setArrayAs2dField(to.row, to.column, 'figure', selfFigure);

        setArrayAs2dField(from.row, from.column, 'self', false);
        setArrayAs2dField(from.row, from.column, 'figure', null);

        setArrayAs2dField(to.row, to.column, 'playerFrom', null);

        removeMovingPossibilities();
    }

    const moveOpponent = (from = field.playerFrom, to = field.place) => {
        console.log('hier');
        setArrayAs2dField(from.row, from.column, 'opponent', false);
        setArrayAs2dField(from.row, from.column, 'freeSpace', true);

        setArrayAs2dField(to.row, to.column, 'figure', field.figure);

        setArrayAs2dField(from.row, from.column, 'figure', null);

        setArrayAs2dField(to.row, to.column, 'opponent', true);
        setArrayAs2dField(to.row, to.column, 'self', false);
        setArrayAs2dField(to.row, to.column, 'showMove', false);

        removeMovingPossibilities();
    }

    const revealOpponent = () => {
        setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'opponentRevealed', true);
    }

    const setFigure = (settedFigure = null, random) => {
        if(settedFigure) {
            // console.log(settedFigure);
            setArrayAs2dField(field.playerFrom.row, field.playerFrom.column, 'figure', settedFigure);
            return;
        }

        if(random) {
            let attackers = {...$figures.attackers};

            for (const key in attackers) {
                if(attackers[key] === 0) {
                    delete attackers[key];
                }
            }

            let keys = Object.keys(attackers);

            const randomFigure = keys[Math.floor(Math.random() * keys.length)];

            figure = randomFigure;

            if($figures.king !== 0) {
                figure = 'king';
            }
        }

        //place figure on field
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

        // console.log('Figure: ' + attackFigure);
        // console.log('Opponent Figure: ' + opponentFigure);

        if(opponentFigure === attackFigure) {
            setTimeout(() => {
                pat = true;
                // console.log('pat');
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

    // $: if(gameStart && field.opponent && pat === false) {
    //     // console.log('attack opponent again');
    //     attackOpponent();
    // }
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
    <div class="box opponent showAttackable" on:click={getMovePermission}>
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
    <div class="box showMovable" on:click={getMovePermission}>

    </div>
{:else}
    <div class="box">

    </div>
{/if}

{#if pat}
<ChooseSoldierPicker {setFigure} setPatFalse={() => pat = false} />
{/if}