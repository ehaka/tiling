<script>
    import { spring } from 'svelte/motion';
    import { derived } from 'svelte/store';
    import {camerax,cameray,canvasheight, grid, pieces, sidelabels, tile_presentation, tilesrc,mintext,activezoom,zoomfactor,maxsq, maximalsquare, bestsquare, msqgrid} from './data.js'
    import {} from './Grid.svelte'
    import { onMount } from "svelte";

    export let pid;
    export let gridx;
	export let gridy;
    export let type;

    $: sides = $sidelabels[type];
    $: sqsize = maxsq*$zoomfactor;

    let x;
	let y;
    let piece_index = pid;
    let coords = spring({ x: gridx*sqsize, y: gridy*sqsize }, {stiffness: 1, damping: 1});
    let invalid = false;
	let lastfree = [gridx,gridy];
	let lastvalid = [gridx,gridy];
	let prevpos = [gridx,gridy];
    let inmotion = false;
    
    const MSQ_NOCHANGE = 0;
    const MSQ_NEWMAX = 1;
    const MSQ_NEWBEST = 2;

    // geometric image is aligned to bottom left
    $: draw_w = sqsize*68/60;
    $: draw_h = sqsize*75.16/60;
	$: offsetx = 0;//-sqsize/2;
	$: offsety = sqsize-draw_h;
    $: geomimg = $tilesrc[type];

    $: max_drop_y = $canvasheight;
    $: drop_oob = inmotion && y>max_drop_y;

	$: gx = Math.round($coords.x/sqsize);
	$: gy = Math.round($coords.y/sqsize);
	$: snapx = lastfree[0]*sqsize;
	$: snapy = lastfree[1]*sqsize;
    $: snap_dx = snapx-$coords.x;
    $: snap_dy = snapy-$coords.y;


    onMount(initialize);

    function initialize() {
        updatePos(1);
        updateMaxSquareCounts(gx,gy);
    }

    function updateMaxSquareCounts(mx,my) {
        // update sizes of maximal squares propagating up and left from (mx,my)
        let cy = my;
        let maxblock = 0;
        let prevmax = 0;

        // @ts-ignore
        while (cy == my || [mx,cy] in $grid) {
            let cx = mx;
            // @ts-ignore
            if (cy == my && !([mx,my] in $grid)) {
                // [mx,my] is already deleted from $msqgrid, only propagate changes
                cx = mx-1;
            }

            // @ts-ignore
            while ([cx,cy] in $grid) {
                // @ts-ignore
                let d = $msqgrid[[cx,cy+1]] || 0;
                // @ts-ignore
                let dr = $msqgrid[[cx+1,cy+1]] || 0;
                // @ts-ignore
                let r = $msqgrid[[cx+1,cy]] || 0;

                let blocksize = 1+Math.min(d,dr,r);
                // @ts-ignore
                let prev = $msqgrid[[cx,cy]];
                if (prev>prevmax) prevmax = prev;
                // @ts-ignore
                $msqgrid[[cx,cy]] = blocksize;
                if (blocksize>maxblock) maxblock = blocksize;
                cx--;
            }
            cy--;
        }

        if (prevmax>maxblock) {
            // potentially eliminated the maximal square
            let globalmax = 0;
            for (let prop in $msqgrid) {
                let s = $msqgrid[prop];
                if (s>globalmax) globalmax=s;
            }
            $maximalsquare = globalmax;
            return MSQ_NOCHANGE;
        }

        if (maxblock>$bestsquare) {
            $bestsquare = maxblock;
            $maximalsquare = maxblock;
            return MSQ_NEWBEST;
        }

        if (maxblock>$maximalsquare) {
            $maximalsquare = maxblock;
            return MSQ_NEWMAX;
        } 

    }

    zoomfactor.subscribe(updatePos);
    function updatePos(value) {
        // zoom has changed, get grid coords and update coords
        const p = update_piece_index();
        if (p === undefined) return;
        coords.stiffness = coords.damping = 1;
        // the derived value sqsize may not have updated yet, so use maxsq*zoomfactor directly
        coords.set({x: p.gx*maxsq*$zoomfactor, y:p.gy*maxsq*$zoomfactor});
    }

    function gotoGridPos(gridx, gridy, soft) {
		if(soft) {
			coords.stiffness = 0.3;
			coords.damping = 0.7;
		}
		else {
			coords.stiffness = coords.damping = 1;
		}
		coords.set({x: gridx*sqsize, y:gridy*sqsize});
        x = gridx*sqsize;
        y = gridy*sqsize;
	}

    function handleMousedown(event) {
		x = event.clientX;
		y = event.clientY;

		window.addEventListener('mousemove', handleMousemove);
		window.addEventListener('mouseup', handleMouseup);
        
        startMove();
	}
    function startMove() {
		coords.stiffness = coords.damping = 1;
        inmotion = true;
        // @ts-ignore
        delete $grid[[gx,gy]];
        // @ts-ignore
        delete $msqgrid[[gx,gy]];
        updateMaxSquareCounts(gx,gy);
        lastvalid = lastfree = [gx,gy];
    }
    function handleTouchstart(event) {
        const touches = event.touches;
        if ($activezoom) return;
        event.preventDefault();

        const touch = touches[0];
		x = touch.clientX;
		y = touch.clientY;

		window.addEventListener('touchmove', handleTouchmove);
		window.addEventListener('touchcancel', handleTouchend);
		window.addEventListener('touchend', handleTouchend);

        startMove();
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
        }
	}
    function update_piece_index() {
        if (piece_index >= $pieces.length) {
            piece_index = $pieces.length-1;
        }
        let p = $pieces[piece_index];
        while(piece_index>=0 && (p.id != pid)) {
            piece_index--;
            p = $pieces[piece_index];
        }
        if (piece_index>=0) return p;
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
        if (drop_oob) {
            // delete piece from grid
            update_piece_index();
            // take on the identity of the last element of the list to avoid strange things
            const last = $pieces.length-1;
            let p = $pieces[last];
            $pieces[piece_index] = p;
            gotoGridPos(p.gx,p.gy,false);
            pid = p.id;
            $pieces.pop();
            $pieces = $pieces;
            $grid = $grid;
            $msqgrid = $msqgrid;
            return;
        }

        gotoGridPos(lastvalid[0],lastvalid[1],true);
        // @ts-ignore
        $grid[lastvalid] = type;
        updateMaxSquareCounts(lastvalid[0],lastvalid[1]);
        update_piece_index();
        $pieces[piece_index] = {id:pid, type:type, gx:lastvalid[0], gy:lastvalid[1]};
	}
</script>

<style>
	.piece {
        position: absolute;
        text-align: center;
		user-select: none;
        background-size: 100%;
		left: 0;
        color: black;
        text-align: center;
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
</style>

{#if $tile_presentation == 'labels'}
<div class="piece box"
    on:mousedown={handleMousedown}
    on:touchstart={handleTouchstart}
	style="width: {sqsize}px;
	height: {sqsize}px;
	left: {0}px;
	top: {0}px;
	line-height: {sqsize/4}px;
	cursor: {inmotion ? 'move' : 'auto'};
	transform: translate({$coords.x+$camerax}px,{$coords.y+$cameray}px)">

    
    <table class="table">
        <tr><td></td><td>{sides.u}</td><td></td></tr>
        <tr><td>{sides.l}</td><td></td><td>{sides.r}</td></tr>
        <tr><td></td><td>{sides.d}</td><td></td></tr>
    </table>
</div>
{:else if $tile_presentation == 'jigsaw'}
    <div class="piece"
        on:mousedown={handleMousedown}
        on:touchstart={handleTouchstart}
        style="width: {draw_w}px;
        height: {draw_h}px;
        background-image: url({geomimg});
        left: {0}px;
        top: {offsety}px;
        transform: translate({$coords.x+$camerax}px,{$coords.y+$cameray}px);
        line-height: {draw_h}px;
        {inmotion ? 'z-index: 3; cursor: move;' : 'z-index: 2; cursor: auto;'}
        visibility: {drop_oob ? 'hidden' : 'visible'}">
        {sqsize<mintext ? '' : type}
    </div>
    {#if inmotion}
    <div class="piece"
        style="width: {draw_w}px;
        height: {draw_h}px;
        background-image: url({geomimg});
        left: {0}px;
        top: {offsety}px;
        z-index: 2;
        line-height: {draw_h}px;
        cursor: move;
        filter: drop-shadow({snap_dx}px {snap_dy}px 1px {invalid ? 'rgba(255,60,71,0.5)' : 'rgba(39,60,71,0.3)'});
        transform: translate({$coords.x+$camerax}px,{$coords.y+$cameray}px);
        visibility: {drop_oob ? 'hidden' : 'visible'}">
    </div>
    {/if}
{/if}