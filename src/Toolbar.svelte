<script>
    import PieceTemplate from './PieceTemplate.svelte'
    import {grid, pieces, resetAll} from './data.js'

    let showreset = false;
    function settings() {
        showreset = true;
		window.addEventListener('mouseup', handleMouseup);
    }
    function closedialog() {
        showreset=false;
        window.removeEventListener('mouseup', handleMouseup);
    }
    function handleMouseup(event) {
        closedialog();
    }
    function reset() {
        resetAll();
        closedialog();
    }
</script>



<style>
    .nodrag {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
    }
    .toolcontainer {
        float: bottom;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        width: 100%;
        user-select: none;
        background-color: #C7B198;
        z-index: 10;
        border-width: 4px;
        border-style:ridge;
		border-color: #DFD3C3;
    }
    .tool {
        padding-left:10px;
        text-align: center;
        color:black;
    }
    .button {
        position: relative;
        color:black;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        background-color: #F0ECE2;
        border-width: 4px;
        border-style: outset;
        border-color: black;
    }
    .button:active {
        border-style: inset;
    }
    .resetdialog {
        display: block;
        position: absolute;
        left: 50%;
        top: 40%;
        width: 200px;
        height: 100px;
        transform: translate(-50%, -50%);
		border-radius: 10px;
        border-style:ridge;
        border-width: 4px;
		border-color: #000000;
		background-color: #C7B198;
        color:black;
        padding: 8px;
        z-index: 1001;
        visibility: hidden;
    }
    .resetdialog .text {
        position: absolute;
        display: block;
        left: 8px;
        right: 12px;
        top: 8px;
        bottom: 48px;
    }
    .resetdialog .buttons {
        position: absolute;
        display:flex;
        width:100%;
        bottom: 8px;
        padding: 10px;
    }
    .show {
        visibility: visible;
    }
</style>

<div class="toolcontainer nodrag" draggable="false">
    <PieceTemplate type=0/>
    <PieceTemplate type=1/>
    <PieceTemplate type=2/>
    <PieceTemplate type=3/>
    <PieceTemplate type=4/>
    <PieceTemplate type=5/>
    <PieceTemplate type=6/>
    <PieceTemplate type=7/>
    <PieceTemplate type=8/>
    <PieceTemplate type=9/>
    <PieceTemplate type=10/>
    <div class="tool">
        <button id="settings" class="button" on:click={settings}>Reset</button>
    </div>
</div>
<div class="resetdialog{showreset ? " show" : ""}">
    <div class="text">
        CLEAR EVERYTHING?
    </div>
    <div class="buttons">
        <button class="button" on:click={reset}>Reset</button>
        <button class="button" on:click={closedialog}>Cancel</button>
    </div>
</div>