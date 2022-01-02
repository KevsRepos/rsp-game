<script>
import { setContext } from "svelte";
import ChooseSoldierPicker from "./ChooseSoldierPicker.svelte";
import FieldBox from './FieldBox.svelte';
import LostScreen from "./LostScreen.svelte";
import { figures, socket } from "/src/stores";
import WinningScreen from "./WinningScreen.svelte";

let rotate = false;
let gameField;
let currentFigureSelection;
let chooseFirstMove = false;
let isPat = false;
let yourMove = false;
let gameStart = false;
let gameWon = false;
let gameLost = false;

setContext('attackers', $figures.attackers);

$socket.on('rotateField', () => {
    rotate = true;
    console.log('hier muss rotaten');   
});

$socket.on('gameField', field => {
    gameField = field;

    isPat = false;
});

$socket.on('nextMove', () => yourMove = !yourMove);

$socket.on('chooseStarter', () => {
    chooseFirstMove = true;
});

$socket.on('firstMoveHas', data => {
    if(data === null) {
        chooseFirstMove = true;
    }else {
        if(data === $socket.id) {
            yourMove = true;
        }

        gameStart = true;
    }
});

$socket.on('pat', () => {
    isPat = true;
});

$socket.on('gameWinner', (winner) => {
    if(winner === $socket.id) {
        gameWon = true;
    }else {
        gameLost = true;
    }
})

const setGameField = (row, column, property, value) => {
    gameField[row][column][property] = value;
}

const setFigureSelection = (figure) => {
    if($figures.attackers[figure] === 0) return;

    if(currentFigureSelection === figure) {
        currentFigureSelection = '';
    }else {
        currentFigureSelection = figure;
    }
}

const setFigure = settedFigure => {
    if(isPat) $socket.emit('newFigure', settedFigure);
    else $socket.emit('firstMove', settedFigure);
}
</script>

<main>
    <section class:rotate={rotate}>
        {#if gameField}
            {#each gameField as column}
                <div class="row">
                    {#each column as row}
                        <FieldBox field={row} {gameField} {setGameField} figure={currentFigureSelection} {gameStart} {yourMove} {rotate} />
                    {/each}
                </div>
            {/each}
        {/if}
    </section>

    <div class="btns">
        {#each Object.entries($figures.attackers) as [attacker, count]}
            <button on:click={() => setFigureSelection(attacker)}>{attacker} {count}</button>
        {/each}
        <button on:click={() => setFigureSelection('king')}>King {$figures.king}</button>
    </div>
    
    {#if chooseFirstMove || isPat}
        <ChooseSoldierPicker {setFigure} setPatFalse={() => chooseFirstMove = false} />
    {/if}

    {#if gameWon}
        <WinningScreen />
    {/if}

    {#if gameLost}
        <LostScreen />
    {/if}
</main>

<style>
.rotate {
    transform: rotateX(180deg);
}
.row {
        display: flex;
        flex-direction: row;
}
.btns {
    margin: 10px;
}
</style>
