<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
//import PDFNav from './PDFNav.svelte';
//import Import from './Import.svelte';
import PuppetWords from './PuppetWords.svelte';
import PuppetCharacter from './PuppetCharacter.svelte';

import { getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';

import {aslObj, currentPalette, selectedModePuppet, onscreen, settings, drawType } from '../store.js';
import 'fabric-history';

export let canvas;

let color;

const removeTooltip = (e) => {
    let tooltip = document.getElementById('menu_tooltip');
    tooltip.style.opacity = 0;
    //tooltip.style.display = 'none';
}

const saveJSON = () => {
    var json = JSON.stringify( canvas.toJSON() );
    console.log(json)
    saveToLocalStorage('canvas', json)
}
const undo = () => {
    canvas.undo();
}
const redo = () => {
    canvas.redo();
}

const objectQuickColor = (e) => {
    color = e.target.id;
    console.log(color);
}

</script>

<style>
.pure-menu-horizontal {
    width: 100%;
    white-space: nowrap;
    background-color: #fafbfd;
    height: 65px;
}

.pure-menu-horizontal .pure-menu-list {
    display: inline-block;
}


.pure-menu-horizontal .pure-menu-item,
.pure-menu-horizontal .pure-menu-heading,
.pure-menu-horizontal .pure-menu-separator {
    display: inline-block;
    *display: inline;
    zoom: 1;
    vertical-align: middle;
}

/* Submenus should still be display: block; */
.pure-menu-item .pure-menu-item {
    display: block;
    cursor: pointer;
}

.pure-menu-children {
    display: none;
    position: absolute;
    left: 100%;
    top: 0;
    margin: 0;
    padding: 0;
    z-index: 3;
}

.pure-menu-link {
    cursor: pointer;
}
.pure-menu-horizontal .pure-menu-children {
    left: 0;
    top: auto;
    width: inherit;
}

.pure-menu-allow-hover:active > .pure-menu-children,
.pure-menu-active > .pure-menu-children {
    display: block;
    position: absolute;
}

.pure-menu-allow-hover:hover > .pure-menu-children,
.pure-menu-active > .pure-menu-children {
    display: block;
    position: absolute;
}


/* Vertical Menus - show the dropdown arrow */
.pure-menu-has-children > .pure-menu-link:after {
    padding-left: 0.5em;
    content: "\25B8";
    font-size: small;
}

/* Horizontal Menus - show the dropdown arrow */
.pure-menu-horizontal .pure-menu-has-children > .pure-menu-link:after {
    content: "\25BE";
}
.iconTool {
    display: inline-block;
    margin-top: 10px;
    cursor: pointer;
    margin-top: -15px;
    padding: 3px;
    height: 80px;
}
.lefty {
    transform: scale(.65) rotate(10deg);
}
.righty {
    transform: scale(.65) rotate(-10deg);
}
.iconLabel {
    
    transform: translateX(10px);
    margin-top: 43px;
    top: 0;
    position: absolute;
    font-size: .8rem;
    color: #666666;
    text-align: center;
    /* margin-top: -20px; */
    overflow: visible;
}
.iconTool:hover {
    background: #f8fab2;
    box-shadow: 0px 0px 1px #988585;
}
.mid {
    line-height:  3;
    padding-left:  15px;
}
.selectedButton {
    background-color:  yellow;
}
:global(#toolbar) {
    margin-top:  0 !important;
}
 
</style>

<PuppetCharacter></PuppetCharacter>
    
<div class="pure-menu pure-menu-horizontal">

    <ul class="pure-menu-list">
        {#if $selectedModePuppet == 'positions'}
            <PuppetWords bind:canvas={canvas} ></PuppetWords>
        {:else}
            <li class="pure-menu-item pure-menu-selected">
                 {#if $onscreen.showColors && $currentPalette && $currentPalette.length > 0}
                    <div id="colorBoxes">
                        {#each $currentPalette as color, y}
                            <div id={color} class="colorbox {($settings.activeColor == color || !$settings.activeColor && y == 0) ? 'active' : ''}" on:click={objectQuickColor} style="background-color:{color}"></div>
                        {/each}
                    </div>
                {/if}
            </li>
        {/if}
    </ul>
</div>
