<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
//import PDFNav from './PDFNav.svelte';
//import Import from './Import.svelte';

import { getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';

import {selectedModePuppet, onscreen, settings, drawType } from '../store.js';
import 'fabric-history';

export let canvas;
export let tools;
export let tooltipT;

$selectedModePuppet = 'positions';

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

let changeSelected = (event) => {
 //   console.log(event.target.id);
    $selectedModePuppet = event.target.id;
    // these components are loaded in the main editor, this will trigger the change
    if ($selectedModePuppet == 'design') {
        $onscreen.slideMenu = 'puppetDesign';
        tools = ['hair', 'clothes', 'faceshape', 'ears', 'nose', 'mouth', 'eyesfront', 'eyesiris'];
        tooltipT = {
            hair: 'change or configure hair',
            clothes: 'change or configure clothes',
            faceshape: 'change or configure face',
            ears: 'change or configure ears',
            nose: 'change or configure nose',
            mouth: 'change or configure mouth',
            eyesfront: 'change or configure eyes',
            eyesiris: 'change or configure eyes iris'
        };        

    }
    else {
        $onscreen.slideMenu = 'puppetPositions';
        tools = ['back', 'insert'];
        tooltipT = {
            back: 'back to the regular editor',
            insert: 'insert this ASL design into the main editor'
        };        
    }
    removeTooltip();
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
</style>


<div class="pure-menu pure-menu-horizontal">

    <ul class="pure-menu-list">
        <li class="pure-menu-item mid">mode:</li>
        <li class="pure-menu-item pure-menu-selected">
           <span id="positions" on:click={changeSelected} class="pure-menu-link {$selectedModePuppet == 'positions' ? 'selectedButton' : '' }">Positions</span>
        </li>
        <li class="pure-menu-item pure-menu-selected">
            <span id="design" on:click={changeSelected} class="pure-menu-link {$selectedModePuppet == 'design' ? 'selectedButton' : '' }">Design</span>
        </li>        

    </ul>
</div>
