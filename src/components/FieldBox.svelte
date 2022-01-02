<script>
import { figures, socket } from "/src/stores";

export let field, gameField, setGameField, figure, gameStart, yourMove, rotate;

const playerClicked = () => {
    if(!yourMove) return;

    const nextFields = getNextFields(field.coords);
    const movingPossibilities = checkMovingPossibilities(nextFields);

    removeMovingPossibilities();
    
    showMovingPossibilities(movingPossibilities, field.coords);
}

const getNextFields = ({column, row}) => {
    return {
        top: gameField?.[row - 1]?.[column] ?? null,
        bottom: gameField?.[row + 1]?.[column] ?? null,
        left: gameField?.[row]?.[column - 1] ?? null,
        right: gameField?.[row]?.[column + 1] ?? null
    }
}

const checkMovingPossibilities = (nextFields) => {
    const movingPossibilities = {};

    for (const [key, entries] of Object.entries(nextFields)) {
        movingPossibilities[key] = 
        !entries ? false :
        entries.opponent ? entries.coords :
        entries.self ? false :
        entries.coords;
    }

    return movingPossibilities;
}

const showMovingPossibilities = (movingPossibilities, currentField) => {
    for (const [key, entry] of Object.entries(movingPossibilities)) {
        if(entry) {
            setGameField(entry.row, entry.column, 'showMove', true);
            setGameField(entry.row, entry.column, 'playerFrom', currentField);
        }
    }
}

const removeMovingPossibilities = () => {
    gameField.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            setGameField(rowIndex, columnIndex, 'showMove', false);
        });
    });
}

const movePlayer = () => {
    $socket.emit('movePlayer', {
        from: {
            row: field.playerFrom.row, 
            column: field.playerFrom.column
        },
        to: {
            row: field.coords.row, 
            column: field.coords.column
        }
    });
}

const setFigure = () => {
    let random = false;
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

    if(figure) {
        if($figures.attackers[figure] === 0) return;

        $socket.emit('figurePlaced', {
            coords: {
                row: field.coords.row,
                column: field.coords.column
            },
            figure: figure
        });

        if(figure === 'king') $figures.king -= 1;
        else $figures.attackers[figure] -= 1;
    }
}
</script>

<span class:rotate={rotate}>
    {#if !gameStart && field.player === $socket.id && !field.figure}
        <div class="box self" on:click={setFigure}>
            Du
        </div>
    {:else if !gameStart && field.player === $socket.id}
        <div class="box self">
            {field.figure}
        </div>
    {:else if gameStart && field.player === $socket.id}
        <div class="box self" on:click={playerClicked}>
            {field.figure}
        </div>
    {:else if field.player !== $socket.id && field.player && field?.showMove}
        <div class="box opponent showAttackable" on:click={movePlayer}>
            Gegner
            {field.figure}
        </div>
    {:else if field.player !== $socket.id && field.player && field.figure !== null}
        <div class="box opponent">
            Gegner
            {field.figure}
        </div>
    {:else if field.player !== $socket.id && field.player}
        <div class="box opponent">
            
        </div>
    {:else if gameStart && field?.showMove}
        <div class="box showMovable" on:click={movePlayer}>

        </div>
    {:else}
        <div class="box">

        </div>
    {/if}
</span>

<style>
.rotate {
    transform: rotateX(-180deg);
}
.box {
    height: calc(100vw / 8);;
    width: calc(100vw / 8);
    border: 1px black solid;
}
.showMovable {
    background-color: green;
}
.showAttackable {
    background-color: red;
}
</style>