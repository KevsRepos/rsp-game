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

//timers
let
figureTimer = null,
moveTimer = null;

setContext('attackers', $figures.attackers);

$socket.on('rotateField', () => {
    rotate = true;
});

$socket.on('gameField', field => {
    gameField = field;

    // console.table(gameField);

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

$socket.on('figureTimer', time => figureTimer = time);

$socket.on('moveTimer', time => moveTimer = time);

const setGameField = (row, column, property, value) => {
    gameField[row][column][property] = value;
}

const setFigureSelection = (figure) => {
    // console.log(figure);
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
    <div class:rotate={rotate}>
        <section>
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
    </div>
    {#if !gameStart || chooseFirstMove}
        <div class="btns">
            <div class="buttonsRow">
                {#each Object.entries($figures.attackers) as [attacker, count]}
                    <div class="column">
                        <button on:click={() => setFigureSelection(attacker)}>
                            <img src="/assets/{attacker}.webp" alt="{attacker}" />
                        </button>
                        <span>{count}</span>
                    </div>
                {/each}
                <div class="column">
                    <button on:click={() => setFigureSelection('king')}>
                        <img alt="king" src="/assets/king.webp" />
                    </button>
                    <span>{$figures.king}</span>
                </div>
            </div>
        </div>
    {/if}
</main>

{#if chooseFirstMove || isPat}
    <ChooseSoldierPicker {setFigure} setPatFalse={() => chooseFirstMove = false} />
{/if}

{#if gameWon}
    <WinningScreen />
{/if}

{#if gameLost}
    <LostScreen />
{/if}

{#if figureTimer}
    <div class="figureTimer timer">
        {figureTimer}
    </div>
{/if}

{#if moveTimer}
    <div class="moveTimer timer">
        {moveTimer}
    </div>
{/if}

{#if yourMove}
    <div class="msg">Du bist dran</div>
{:else}
    <div class="msg">Warte auf deinen Gegner</div>
{/if}
<style>
.rotate {
    transform: rotateX(180deg);
}
main {
    display: flex;
    flex-direction: row;
    /* justify-content: center; */
    /* align-items: center; */
}
section {
    /* margin: 50px 0px; */
}
.row {
    display: flex;
    flex-direction: row;
}
.buttonsRow {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.btns {
    display: flex;
    flex-direction: row;
}
.column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.flex span {
    font-size: 1.5em;
}
button {
    margin: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: transparent;
}
img {
    height: 32px;
    width: 32px;
    image-rendering: crisp-edges;
    image-rendering: -moz-crisp-edges;          /* Firefox */
    image-rendering: -o-crisp-edges;            /* Opera */
    image-rendering: -webkit-optimize-contrast; /* Webkit (non-standard naming)*/
}
.msg {
    position: fixed;
    bottom: 0px;
    right: 0px;
    padding: 5px;
}
.timer {
    position: fixed;
    top: 0px;
    right: 0px;
}
.figureTimer {
    height: 30px;
    width: 30px;
    background-color: rgb(255, 119, 119);
    padding: 5px;
}
.moveTimer {
    height: 30px;
    width: 30px;
    background-color: rgb(10, 58, 0);
    padding: 5px;
}
</style>
