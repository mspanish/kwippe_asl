<script>
import { fabric } from "fabric";
import { onMount, onDestroy } from 'svelte';

import { fillCol, outlineCol, drawType, onscreen } from '../../store.js';
import { sample, removeAllFrom } from '../../scripts/utilities.js';

export let symbolMode;
export let canvas;

let image; 
let dragText;
let dragColor;
let dragFont;
let fontSize = 50;

let currentlyDragging = false;

let checks = [];
let newchecks = [];
let maths = [];
let asl = [];
let asl_signs = [];
let crosses = [];
let fractions = [];
let stamps = [];
let generic = [];
let textColor = '#000000';
let stampFonts = [];
let fonts = ['kg_chasing_carsregular','janda_manatee_solidregular','janda_manatee_bubbleregular','kg_defying_gravityregular','kg_second_chances_solidRg','kg_second_chances_sketchRg','kg_summer_sunshine_shadowRg','kg_summer_sunshine_blackoutRg','kg_summer_sunshineregular','kg_red_handsregular','kg_red_hands_outlineregular'];

let graphics = ['checks', 'crosses','math','school', 'arrows', 'callouts', 'asl'];
let graphic_names = ['checkmarks & positive', 'x marks & negative', 'math', 'school stamps', 'arrows', 'speech bubbles', 'sign language (asl)'];
let chars = `+'!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~'`

let defaultFont = sample(fonts);


const switchSymbolMode = () => {
    checks = [];
    newchecks = [];
    maths = [];
    crosses = [];
    fractions = [];
    stamps = [];
    asl = [];
    generic = [];
    textColor = '#000000';
    stampFonts = [];
    let alph = "abcdefghijklmnopqrstuvwxyz";
    let alphUpper = alph.toUpperCase();

    switch (symbolMode) {

        case 'checks':
            alph = alph + '8';
            newchecks = alph.split('').concat(alphUpper.split('')).concat([ '1','2','3','4','7','8','9','~','!','@','#','$','%']).reverse();
            newchecks = removeAllFrom(newchecks, ['a','u','x','p', 'D','W']);
            
            stamps = ["100%","A+","Yes!","Nailed it!","Excellent!","Great job!","I believe in you!","I can see your improvement!","WOW!","High five","Good effort!","Proud of you!","This rocks!","#nailedit","#yourock","#amazing","#highfive","#flawless","#lol","#yep"]
            textColor = 'green';
        break;
        
        case 'math':
        
            maths = [':', ';', '?','*',',','/','`','.','(', '(.', ')', '0', '1','2','3','4','5','6','7','8','9'];
            fractions = alph.split('').concat(alphUpper.split('')).concat(['0', '1','2','3','4','5','6','7','8','9'])
        break;
        
        case 'arrows':
            //á é í ó ü ñ ¿ ¡ Á
            generic = chars.split('')
            generic = removeAllFrom(generic, ['0'])
            generic.unshift('á', 'é', 'í', 'ó', 'ü', 'ñ','¿', '¡', 'Á')
            textColor = 'crimson';
    
        break;
        case 'callouts':
            //á é í ó ü ñ ¿ ¡ Á
            generic = 'abcdefghijklmsuxMXZTPRN'.split('')
            textColor = 'black';
            fontSize = 175;
    
        break;        
        case 'asl':
            //á é í ó ü ñ ¿ ¡ Á
            asl_signs = alph.split('').concat(alphUpper.split('')).concat(['0', '1','2','3','4','5','6','7','8','9'])
            textColor = 'black';
            fontSize = 225;
        break; 
        
        case 'crosses':
            crosses = "ABCDfHIJKLMNOPQRSUV1Z"
            stamps = ["SHOW YOUR WORK","Keep trying!","INCOMPLETE","LATE WORK","Um?","Try again & return","Getting closer!","#yougotthis"]
            textColor = 'red';
        break;
        
        case 'school':
            stamps = ["Don't forget!","Check spelling","Final Copy","Homework","Extra credit","Look here ➡","ROUGH DRAFT","Sign & Return","LAST CALL!","Quiz/test tomorrow!","Study","Second chance","Follow directions"]
            textColor = 'navy';
            fontSize = 50;
    }

    if (['checks','crosses','school'].includes(symbolMode))  {
        let e = 0;
        for (let stamp in stamps){
            if (e > fonts.length-1) e = 0;
            stampFonts.push(fonts[e]);
            e++;
        }
    }
} // end switchSymbolMode()
const toggleGraphicsList = () => {
	console.log('toggling fonts list');
	if ($onscreen.graphicsList) {
		$onscreen.graphicsList = false;
	}
	else {
		$onscreen.graphicsList = true;	
	}
}

const changeGraphics = (e) => {
    let graphics = e.target.getAttribute('data-graphics');
    console.log('graphics change, value is '+graphics)
    symbolMode = graphics;
    switchSymbolMode();
    $onscreen.graphicsList = false;	
}
//console.log(fractions)

onMount(() => {
    $onscreen.draggedGraphic = false;
    switchSymbolMode();
    $onscreen.graphicsList = false;
    // Bind the event listeners for the canvas
    var canvasContainer = document.getElementsByClassName('canvas-container')[0];
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);
})

onDestroy(() => {
    var canvasContainer = document.getElementsByClassName('canvas-container')[0];
    if (canvasContainer) {
        canvasContainer.removeEventListener('dragenter', handleDragEnter, false);
        canvasContainer.removeEventListener('dragover', handleDragOver, false);
        canvasContainer.removeEventListener('dragleave', handleDragLeave, false);
        canvasContainer.removeEventListener('drop', handleDrop, false);
    }
})

function handleDragStart(e) {

    console.log('starting drag')
    currentlyDragging = e.target;
    dragText = e.target.textContent;
    dragColor = e.target.getAttribute('data-color');
    dragFont = e.target.getAttribute('data-font');
    e.dataTransfer.setData("text", e.target.textContent);
    //e.dataTransfer.setData("color", e.target.getAttribute('data-color'));
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDragEnd(e) {

}

function handleDrop(e) {
    if (e.preventDefault) {
      e.preventDefault(); 
    }
    $onscreen.draggedGraphic = true;
    if (dragFont == 'baseten' || dragFont == 'fractions') {
        fontSize = 200;
    }
    
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    let text = dragText//e.dataTransfer.getData("text");
    let col = dragColor//e.dataTransfer.getData("color");
    console.log('text is '+text)
    console.log('col is '+col)
    /* if you don't have this and user has scrolled, graphics are in wrong place */
    let canvasHolder = document.getElementById('canvasWrapper')
    let scrollY = canvasHolder.scrollTop;
    let scrollX = canvasHolder.scrollLeft

    let pointer = {x: e.clientX, y: e.clientY}
    pointer.x = pointer.x + scrollX;
    pointer.y = pointer.y + scrollY;
    
    let canvasObject = new fabric.IText(text, {
        left:  pointer.x -40,
        top:   pointer.y - 110,
        width: 10,
        fontSize: fontSize,
        padding: 10,
        originX: 'center',
        textAlign: 'center',
        fill: col,
        //stroke: 'green',
        fontFamily: dragFont
    })
    canvas.add(canvasObject)
   // canvas.renderAll();
    var dataList = e.dataTransfer.items;
//     for (var i = 0; i < dataList.length; i++) {
//         dataList.remove(i);
//     }
    // Clear any remaining drag data
    dataList.clear();
 return
 
}

</script>


<style>
.fractions {
    font-family: 'fractions' !important;
    font-size: 60px !important;
}
.checks {
    font-family: 'checks' !important;
    font-size: 45px !important;
    color: green;
}
.cross {
    font-family: 'cross' !important;
    font-size: 45px !important;
    color: red;
}
.school {
    font-size: 45px !important;
    color: navy;
}
.callouts {
    font-size: 100px !important;
}
.math {
    font-family: 'baseten' !important;
    font-size: 100px !important;
}
.symbol {
    font-size: 40px;
    font-family: 'symbola';
    float: left;
    margin: 10px;
}
.stamp {
    font-size: 40px;
    clear: both;
}
#fontList {
    cursor:pointer;
/*    transform: translateY(50%);
    position:absolute;*/

}
#graphicsList > li > span {
    background-color: #eee;
    text-decoration: none;
}
#graphicsList > li > span:hover {
    opacity:.6;
}
a {
    text-decoration: none;
}
.pure-menu-children {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    padding-top: 20px;
    margin-left: 0;
    left: 0;
    top: 50px;
}
.pure-menu-item {
    clear:both;
}
:global(.dragMsg) {
    padding-top: 20p;
    text-align: center;
    color: #8c002c;
    margin-top: 0 !important;
}
:global(.dragImg) {
    margin-top:0 !important;
    height: 70px !important;
    width: 100%;
    position: relative !important;
    padding-top: 15px;
}
</style>
<div style="display: inline-block; margin-top: 10px">

    <span class="slideTitle">School Stamps</span>
        
    <div class="section"  id="school_stamps">  

        <div style="padding-bottom: 100%;">

            <ul id="graphicsList" class="pure-menu-list">
                <li id="paletteM" class="pure-menu-item pure-menu-has-children">
                    <span on:click={toggleGraphicsList} class="pure-menu-link">more graphics</span>
                    {#if $onscreen.graphicsList}
                        <ul id="graphicsList" class="pure-menu-children wrap">
                            {#each graphics as graphic, x}
                                <li class="pure-menu-item block">
                                    <div class="pHolder">
                                        <a class="pure-menu-link"> 
                        
                                            <div on:click="{changeGraphics}" data-graphics="{graphic}">{graphic_names[x]}</div>

                                        </a>
                                    </div>
                                </li>
                            {/each}      
                        </ul>
                    {/if}
                <li>
                <ul>    
            
            <div class="dragMsg">
                <img alt="drag to insert" class="dragImg" src="images/drag2.svg" />
                <span>drag to insert, scroll for more</span>
            </div>
            
            
            {#each newchecks as fraction}
                <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="green" data-font="checks" class="symbol checks unselectable">{fraction}</div>
            {/each}  
        
            {#each crosses as fraction}
                <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="red" data-font="cross" class="symbol cross unselectable">{fraction}</div>
            {/each}   
            
 
            {#each asl_signs as fraction}
                <div class="asl_style">
                    <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="{textColor}" data-font="{symbolMode}" class="symbol asl_style unselectable asl_symbol" style="font-family: {symbolMode}; color: {textColor};">{fraction}
                    </div>  
                    <div class="asl_signs">{fraction}</div>
                </div>
            {/each}    
            
            
            {#each generic as fraction}
                <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="{textColor}" data-font="{symbolMode}" class="symbol {symbolMode} unselectable" style="font-family: {symbolMode}; color: {textColor};">{fraction}</div>
            {/each}  
            
            
            
            {#each stamps as stamp, x}
            
                <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="{textColor}" data-font="{stampFonts[x]}" class="symbol stamp unselectable" style="color:{textColor}; font-family: {stampFonts[x]}">{stamp}</div>
            {/each}      
            

            
            {#each maths as math}
                <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="#000000" data-font="baseten" class="symbol math unselectable" style="color:#000000">{math}</div>
            {/each}    
            {#each fractions as fraction}
                <div on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true" data-color="#000000" data-font="fractions" class="symbol fractions unselectable" style="color:#000000">{fraction}</div>
            {/each}       

        </div>
    </div>
</div>
