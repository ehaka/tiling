<script>
    import { spring } from 'svelte/motion';
    import { derived } from 'svelte/store';
    import {camerax,cameray,canvasheight, grid, sidelabels, tile_presentation, tilesrc, pieces, nextid, zoomfactor,activezoom,mintext,maxsq} from './data.js'

    export let type;

    $: sides = $sidelabels[type];
    $: sqsize = maxsq*$zoomfactor;

    let x;
	let y;
    let coords = spring({ x: 0, y: 0 }, {stiffness: 1, damping: 1});
    let invalid = false;
	let lastfree = [0,0];
	let lastvalid = [0,0];


    let inmotion = false;
    let anyvalid = false;

    // geometric image is aligned to bottom left
    $: draw_w = sqsize*68/60;
    $: draw_h = sqsize*75.16/60;
	$: offsetx = 0;//-sqsize/2;
	$: offsety = sqsize-draw_h;
    $: geomimg = $tilesrc[type];

    $: max_drop_y = $canvasheight;
    $: drop_oob = y>max_drop_y;

	$: gx = Math.round($coords.x/sqsize);
	$: gy = Math.round($coords.y/sqsize);
	$: snapx = lastfree[0]*sqsize;
	$: snapy = lastfree[1]*sqsize;
    $: snap_dx = snapx-$coords.x;
    $: snap_dy = snapy-$coords.y;

    function handleMousedown(event) {
		window.addEventListener('mousemove', handleMousemove);
		window.addEventListener('mouseup', handleMouseup);
        startmove(event.clientX,event.clientY);
	}
    function handleTouchstart(event) {
        if($activezoom) return;
        event.preventDefault();
		window.addEventListener('touchmove', handleTouchmove);
		window.addEventListener('touchcancel', handleTouchend);
		window.addEventListener('touchend', handleTouchend);

        const touches = event.touches;
        const touch = touches[0];
        startmove(touch.clientX,touch.clientY);
	}
    function startmove(ex,ey) {
		coords.stiffness = coords.damping = 1;
		x = ex;
		y = ey;
		coords.set({x: x-sqsize/2-$camerax, y: y-sqsize/2-$cameray});

        inmotion = true;
        anyvalid = false;

        lastvalid = lastfree = [gx,gy];
    }
	function handleMousemove(event) {
        move(event.clientX, event.clientY);
    }
	function handleTouchmove(event) {
        if ($activezoom) return;
        event.preventDefault();
        const touches = event.changedTouches;
        const touch = touches[0]
        move(touch.clientX, touch.clientY);
    }

    function move(ex,ey) {
		const dx = ex - x;
		const dy = ey - y;
		x = ex;
		y = ey;
		coords.update($coords => ({
			x: $coords.x + dx,
			y: $coords.y + dy
		}));

        // check if position is free and compatible with neighbors
        const pos = [gx, gy];
        // @ts-ignore
        if (!(pos in $grid)) {
            invalid = false;
            lastfree = pos;

            // left neighbor compatible?
            let npos = [gx-1,gy];
            // @ts-ignore
            if(npos in $grid) {
                // @ts-ignore
                const otype = $grid[npos];
                if ($sidelabels[otype].r != sides.l) {
                    invalid = true;
                    return;
                }
            }
            // right neighbor compatible?
            npos = [gx+1,gy];
            // @ts-ignore
            if(npos in $grid) {
                // @ts-ignore
                const otype = $grid[npos];
                if ($sidelabels[otype].l != sides.r) {
                    invalid = true;
                    return;
                }
            }
            // top neighbor compatible?
            // @ts-ignore
            npos = [gx,gy-1];
            // @ts-ignore
            if(npos in $grid) {
                // @ts-ignore
                const otype = $grid[npos];
                if ($sidelabels[otype].d != sides.u) {
                    invalid = true;
                    return;
                }
            }
            // bottom neighbor compatible?
            // @ts-ignore
            npos = [gx,gy+1];
            // @ts-ignore
            if(npos in $grid) {
                // @ts-ignore
                const otype = $grid[npos];
                if ($sidelabels[otype].u != sides.d) {
                    invalid = true;
                    return;
                }
            }

            // compatible with all neighbors
            lastvalid = lastfree;
            anyvalid = true;
        }
	}
	function handleMouseup(event) {
		window.removeEventListener('mousemove', handleMousemove);
		window.removeEventListener('mouseup', handleMouseup);
        stopMove();
    }
	function handleTouchend(event) {
        event.preventDefault();
		window.removeEventListener('touchmove', handleTouchmove);
		window.removeEventListener('touchcancel', handleTouchend);
		window.removeEventListener('touchend', handleTouchend);
        stopMove();
    }
    function stopMove() {
        inmotion = false;

        if(drop_oob || !anyvalid) {
            return;
        }

		const nx = lastvalid[0];
		const ny = lastvalid[1];
        const pid = $nextid;
        $nextid++;
		$pieces.push({id:pid, type:type, gx:nx, gy:ny});
		$pieces=$pieces;
        // @ts-ignore
        $grid[[nx,ny]] = type;
	}
</script>

<style>
	.piece {
        text-align: center;
		user-select: none;
        color: black;
        text-align: center;
	}
    .static {
        width: 14%;
        max-width: 64px;
        padding:2px;
        position: relative;
    }
    .box {
		border-style: outset;
		border-color: #000000;
		background-color: lightgray;
    }
    .table {
        width:100%;
        height:100%;
    }
    .image {
        width: 100%;
    }
    .imagelabel {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .nodrag {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
    }
</style>

{#if $tile_presentation == 'labels'}
<div class="piece box static"
    on:mousedown={handleMousedown}
    on:touchstart={handleMousedown}
	style="width: {sqsize}px;
	height: {sqsize}px;
	line-height: {sqsize/4}px;
	cursor: {inmotion ? 'move' : 'auto'};
	z-index: 4">

    <table class="table">
        <tr><td></td><td>{sides.u}</td><td></td></tr>
        <tr><td>{sides.l}</td><td></td><td>{sides.r}</td></tr>
        <tr><td></td><td>{sides.d}</td><td></td></tr>
    </table>
</div>
{:else if $tile_presentation == 'jigsaw'}
<div class="piece nodrag static" draggable="false"
	on:mousedown={handleMousedown}
    on:touchstart={handleTouchstart}
	style="z-index: 4;
	cursor: auto;">
    <img class="image nodrag" draggable="false" src = {geomimg}>
    <div class="imagelabel">{type}</div>
</div>
{/if}
{#if inmotion}
<div class="piece"
	style="width: {draw_w}px;
	height: {draw_h}px;
	background-image: url({geomimg});
    background-size: {draw_w}px {draw_h}px;
    background-repeat: no-repeat;
	position: absolute;
	left: {0}px;
	top: {offsety}px;
	z-index: 5;
	line-height: {draw_h}px;
	cursor: move;
    filter: drop-shadow({snap_dx}px {snap_dy}px 1px {invalid ? 'rgba(255,60,71,0.5)' : 'rgba(39,60,71,0.3)'});
	transform: translate({$coords.x+$camerax}px,{$coords.y+$cameray}px);
    visibility: {drop_oob ? 'hidden' : 'visible'};">
	{sqsize<mintext ? '' : type}
</div>
{/if}