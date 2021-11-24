<script>
import { onMount, setContext } from "svelte";
import FieldBox from './FieldBox.svelte';

    const rows = 8;
    const columns = 8;

    setContext('rows', rows);
    setContext('columns', columns);

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
                freeSpace: false,
                showMove: false,
                playerFrom: null
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

        console.table(arrayAs2dField);
    });

    $: console.log(arrayAs2dField);
</script>

<style>
    .row {
         display: flex;
         flex-direction: row;
    }
</style>

<main>
    <!-- {arrayAs2dField} -->
    {#each arrayAs2dField as column}
        <div class="row">
            {#each column as row}
                <FieldBox field={row} {arrayAs2dField} {setArrayAs2dField} />
            {/each}
        </div>
    {/each}
</main>