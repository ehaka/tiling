import { derived, readable, writable } from 'svelte/store';
import { spring } from 'svelte/motion';
import t00 from './assets/tile00.svg'
import t01 from './assets/tile01.svg'
import t02 from './assets/tile02.svg'
import t03 from './assets/tile03.svg'
import t04 from './assets/tile04.svg'
import t05 from './assets/tile05.svg'
import t06 from './assets/tile06.svg'
import t07 from './assets/tile07.svg'
import t08 from './assets/tile08.svg'
import t09 from './assets/tile09.svg'
import t10 from './assets/tile10.svg'

export const minsquares = 8;
export const maxsq = 64;
export const mintext = 32;
export const zoomfactor = writable(JSON.parse(localStorage.getItem('zoomfactor')) || 1);
zoomfactor.subscribe((value) => localStorage.zoomfactor = JSON.stringify(value));
export const canvasheight = writable(0);
export const activezoom = writable(false);
export const nextid = writable(JSON.parse(localStorage.getItem('nextid')) || 0);
nextid.subscribe((value) => localStorage.nextid = JSON.stringify(value));
export const grid = writable(JSON.parse(localStorage.getItem('grid')) || {});
grid.subscribe((value) => localStorage.grid = JSON.stringify(value));
export const pieces = writable(JSON.parse(localStorage.getItem('pieces')) || []);
pieces.subscribe((value) => localStorage.pieces = JSON.stringify(value));

export const camerax = writable(JSON.parse(localStorage.getItem('camerax')) || 0);
export const cameray = writable(JSON.parse(localStorage.getItem('cameray')) || 0);
camerax.subscribe((value) => localStorage.camerax = JSON.stringify(value));
cameray.subscribe((value) => localStorage.cameray = JSON.stringify(value));
export const tile_presentation = readable('jigsaw')
export const sidelabels = readable(
    [
        {'d':1, 'l':3, 'u':1, 'r':1},
        {'d':2, 'l':3, 'u':2, 'r':1},
        {'d':3, 'l':3, 'u':1, 'r':3},
        {'d':1, 'l':2, 'u':0, 'r':2},
        {'d':0, 'l':2, 'u':2, 'r':2},
        {'d':1, 'l':0, 'u':0, 'r':0},
        {'d':2, 'l':0, 'u':1, 'r':3},
        {'d':2, 'l':1, 'u':2, 'r':0},
        {'d':0, 'l':1, 'u':2, 'r':1},
        {'d':2, 'l':1, 'u':3, 'r':3},
        {'d':1, 'l':3, 'u':1, 'r':0}
    ],
);
export const sidelabels_fig3 = readable(
    [
        {'d':1, 'l':3, 'u':1, 'r':1},
        {'d':2, 'l':3, 'u':2, 'r':1},
        {'d':3, 'l':3, 'u':1, 'r':3},
        {'d':1, 'l':2, 'u':4, 'r':2},
        {'d':0, 'l':2, 'u':2, 'r':2},
        {'d':1, 'l':0, 'u':0, 'r':0},
        {'d':2, 'l':0, 'u':1, 'r':3},
        {'d':2, 'l':1, 'u':2, 'r':0},
        {'d':4, 'l':1, 'u':2, 'r':1},
        {'d':2, 'l':1, 'u':3, 'r':3},
        {'d':1, 'l':3, 'u':1, 'r':0} 
    ],
);
export const tilesrc = readable([t00,t01,t02,t03,t04,t05,t06,t07,t08,t09,t10])

export function resetAll() {
    camerax.set(0);
    cameray.set(0);
    zoomfactor.set(1);
    grid.set({});
    pieces.set([]);
    nextid.set(0);
}