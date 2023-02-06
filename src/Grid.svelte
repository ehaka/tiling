<script>
    import { writable } from 'svelte/store';
    import Piece from './Piece.svelte'
    import Toolbar from './Toolbar.svelte'
    import {camerax, cameray,canvasheight, pieces,maxsq,zoomfactor,activezoom,maximalsquare,bestsquare} from './data.js'
    import { onMount, onDestroy } from "svelte";

    let x;
    let y;
    let camerapan = false;
    let prevzoom;
    let touchdist;
    let zoomcenterx;
    let zoomcentery;
    let sortedpieces;

    $: sqsize = maxsq*$zoomfactor;

    
	function handleMousedown(event) {
		x = event.clientX;
        y = event.clientY;
        camerapan = true;

		window.addEventListener('mousemove', handleMousemove);
		window.addEventListener('mouseup', handleMouseup);
	}
    function touchdistance(t1, t2) {
        const dx = t1.clientX-t2.clientX;
        const dy = t1.clientY-t2.clientY;
        return Math.sqrt(dx*dx+dy*dy);
    }
    function handleZoomTouch(event) {
        event.preventDefault();
        if (event.touches.length<2) {
            return;
        }
        $activezoom = true;
        camerapan = false;
        prevzoom = $zoomfactor;
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        zoomcenterx = (t1.clientX+t2.clientX)/2;
        zoomcentery = (t1.clientY+t2.clientY)/2;
        touchdist = touchdistance(t1,t2);

        window.addEventListener('touchmove',handleTouchmove);
        window.addEventListener('touchcancel',handleTouchend);
        window.addEventListener('touchend',handleTouchend);
    }
	function handleTouchstart(event) {
        if (event.touches.length>1) {
            return;
        }
        event.preventDefault();

        const touch = event.touches[0]
        x = touch.clientX;
        y = touch.clientY;
        camerapan = true;

        window.addEventListener('touchmove',handleTouchmove);
        window.addEventListener('touchcancel',handleTouchend);
        window.addEventListener('touchend',handleTouchend);
	}
	function handleMousemove(event) {
		const dx = event.clientX - x;
		const dy = event.clientY - y;
		x = event.clientX;
		y = event.clientY;
        movecamera(dx,dy);
	}
    function changeZoom(scale) {
        // compute grid coords for zoom center
        const gx = (zoomcenterx-$camerax)/(maxsq*$zoomfactor);
        const gy = (zoomcentery-$cameray)/(maxsq*$zoomfactor);
        // pan camera so that grid coords are still in zoom center
        $camerax = zoomcenterx-gx*(maxsq*prevzoom*scale);
        $cameray = zoomcentery-gy*(maxsq*prevzoom*scale);

        $zoomfactor = prevzoom*scale;
    }
    function handleWheelZoom(event) {
        zoomcenterx = event.clientX;
        zoomcentery = event.clientY;
        let dy = -0.001*event.deltaY;
        prevzoom = $zoomfactor;
        if (dy>0.1) dy=0.1;
        if (dy<-0.1) dy=-0.1;
        changeZoom(1+dy);
    }
	function handleTouchmove(event) {
        event.preventDefault();
        if ($activezoom) {
            if (event.touches.length<2) {
                return;
            }
            const t1 = event.touches[0];
            const t2 = event.touches[1];
            const td = touchdistance(t1,t2);
            changeZoom(td/touchdist);
            return;
        }
        const touch = event.touches[0]
		const dx = touch.clientX - x;
		const dy = touch.clientY - y;
		x = touch.clientX;
		y = touch.clientY;
        movecamera(dx,dy);
	}
    function movecamera(dx,dy) {
        $camerax += dx;
        $cameray += dy;
    }
	function handleMouseup(event) {
        camerapan = false;
		window.removeEventListener('mousemove', handleMousemove);
        window.removeEventListener('mouseup', handleMouseup);
    }
	function handleTouchend(event) {
        event.preventDefault();
        $activezoom = false;
        camerapan = false;
        window.removeEventListener('touchmove',handleTouchmove);
        window.removeEventListener('touchcancel',handleTouchend);
        window.removeEventListener('touchend',handleTouchend);
    }
    function addZoomHooks() {
        window.addEventListener('touchstart',handleZoomTouch);
        window.addEventListener('wheel',handleWheelZoom);
    }
    function removeZoomHooks() {
        window.removeEventListener('touchstart',handleZoomTouch);
        window.removeEventListener('wheel',handleWheelZoom);
    }
    onMount(addZoomHooks);
    onDestroy(removeZoomHooks);
</script>


<style>
    .canvas {
        position: absolute;
        display: flex;
        flex-direction: column;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .nodrag {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
    }
    .background {
        float: top;
        display: block;
        width: 100%;
        height: 100%;
        user-select: none;
        background-color: #596E79;
    }
</style>

<div class="canvas" draggable="false">
    <div class="background nodrag"
    on:mousedown={handleMousedown}
    on:touchstart={handleTouchstart}
    bind:clientHeight={$canvasheight}
    style="cursor: {camerapan ? 'move' : 'auto'};">
    </div>
    {#each $pieces as p}
        <Piece pid={p.id} type={p.type} gridx={p.gx} gridy={p.gy}/>
    {/each}
    <Toolbar />
</div>