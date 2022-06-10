<script>
export let paletteButton;

import { onMount } from 'svelte';
   // import { initDropdowns } from '../menus.js';	
import { Toast } from '../scripts/toaster-js/index.js';  
import { recolorPaletteIcons } from '../scripts/colorHelpers.js'
import { listKeyDown, startCase, getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';
import { invertHex, updateColorObject } from '../scripts/colorHelpers.js';
import { patternPalette, paletteChangedFlag, onscreen, paletteName, paletteV, paletteBuilderColors, currentPalette, colorPalette, colorPalettes, colorsForParts, colorsFromPaletteFlag } from '../store.js'

const togglePaletteList = () => {
	console.log('toggling palette list');
	if ($onscreen.palettesList) {
		$onscreen.palettesList = false;
	}
	else {
		$onscreen.palettesList = true;	
		closeAllPopovers();
	}
	//console.log('toggling $onscreen.palettesList, should be '+$onscreen.palettesList);
}
const closeAllPopovers = () => {	
	$onscreen.popover = false;
	
	$onscreen.textPositionPopover = false;
	$onscreen.opacityPopover = false;
	$onscreen.patternPopover = false;
	$onscreen.rectSettingsPopover = false;
}

/* debugging
$: {
	if ($colorPalettes) {
	console.log('$$$$$$$$ got a change in color palettes!');
	 for (let p of $colorPalettes) {
		
		if (p.n == 'judy') {
			console.log('colors: '+p.c);
		}
	 }
	}
}
*/
const palettesFocusOn = () => {
	//console.log('toggleForPalettes adding keydown !');
	document.addEventListener("keydown", listKeyDown)
}

const palettesFocusOff = () => {
	//console.log('OFF toggleForPalettes');
	document.removeEventListener("keydown", listKeyDown);
}

const changePalette = (name, e) => { 

	let str = 'changed color palette to '+name;
	//console.log(str);
	
	 e.stopPropagation();
	 e.preventDefault(); 
	 //::TODO:: make this an OPTION - it destroys navigating through colors w/ your arrow keys, which I find really helpful - so not sure which to have as default behavior. For now I'm just turning the autoclose palettes OFF.

	 // $onscreen.palettesList = false;
	new Toast(str,'toast','success',1200); 
	
	 // this is for our avatar builder  - ideally we'd use a switch and only 1 or the other values if we actually need them or are in that mode, but for now this is easier
	 //let colorsForPartsBackup = state.colorsForPartsBackup || {};
	 //console.log('colorsForPartsBackup is '+JSON.stringify(colorsForPartsBackup));
	 let part = $colorsForParts.name;
	 
	 let palettes = $colorPalettes;

	 for (let i = 0; i < palettes.length; i++) {
		 if (palettes[i].n == name) {
			 name = name.replace(/_/g, ' ');
			 name = startCase(name);
			 
			// avatar & meme builder switch palettes
		
			//yikes this would eliminate our default palettes
			//colorsForPartsBackup[part] = palettes[i].c;
			
			if ($colorsForParts) {
				 $currentPalette = palettes[i].c;
				 $colorPalette = palettes[i].c;
				 $colorsForParts.colors = palettes[i].c;
				 $patternPalette = [];
				 // avoid Svelte auto assign hell
				 for (let colory of palettes[i].c){
					$patternPalette.push(colory);
				 };
				 $colorsFromPaletteFlag = true;
				// console.log('running $colorsForParts from palettes')
			 }
			else {
			 	$currentPalette = palettes[i].c;
				$patternPalette = [];
				for (let colory of palettes[i].c){
					$patternPalette.push(colory);
				};
				// updateColorObject(palettes[i].c, false);
			}			 
		}
	 } 
	 $paletteName = name;
	 $paletteChangedFlag = true;
	 $onscreen.palettesList = false;
	 // close palette menu
	 //const menu = document.getElementById('paletteM');
	 //menu.classList.remove('pure-menu-active');

/* ::TODO:: either add to store or create some dir for paletteBLoaded

	 if (paletteBLoaded) {
		// console.log('palette b is loaded')
		recolorPaletteIcons();
	 }
*/
}; 

onMount(() => {	

	const div = document.getElementsByClassName('pure-menu-item block');
	let cp = getFromLocalStorage('palettes');
	if (cp) $colorPalettes = cp;
	if ($colorPalettes) {
		// do nada, we should already have what we need
		console.log('we already got some localPalettes, do nada!');
	}
	else {
		console.log('we dont have localPalettes in storage...FETCH em...');
		let urly = '/data/json/palettes.json';

		fetch(urly)
			.then(res => res.json())
			.then(data => {
               // console.log('we have palettes now!')
                //console.log(data)
				//store.set({colorPalette: data[0].c, colorPalettes: data });
				$colorPalette = data[0].c;
                $currentPalette = $colorPalette;
				$colorPalettes =  data; 
				//initDropdowns();
		});
	}
}); // onMount

</script>
<style>
.wrap {
 overflow-y:scroll;
 height: 90vh;
} 
#paletteList {
    cursor:pointer;
/*    transform: translateY(50%);
    position:absolute;*/
    display: inline-block;
}
#paletteList > li > span {
    background-color: #eee;
}
#paletteList > li > span:hover {
    opacity:.6;
}
.pure-menu-children {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    padding-top: 20px;
}
.pure-menu-item {
    height: 40px;
}
.pHolder {
	width: 300px;
	height: 40px;
}
/*
.scroll::-webkit-scrollbar {
	height: 14px;
	border-radius: 20px;
	display: none;
}
.scroll::-webkit-scrollbar-track{
	background: #CCEEF4;
	border-radius: 20px;
}
*/
.pHolder:hover .scroll::-webkit-scrollbar{
	display:inline;  
}
.name {
    font-size: .8rem;
    vertical-align: top;
    display:inline-block;
    width: 25%;
    margin-right: 5%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
}
.colorHolder {
    display: inline-block;
    width: 70%;
    overflow-x:auto;
    overflow-y:hidden;
    text-align:left;
    margin:0;
    padding:0;
    height: 30px;
}
.c {
    display:inline-block;
    width: 15px;
    height:18px;
    text-align:left;
    margin: 0 4px 10px 0;
    border: solid 1px rgba(170, 170, 170, 0.3);
}
.block {
    display:block;
}
</style>

<ul id="paletteList" class="pure-menu-list">
	<li  on:mouseenter={palettesFocusOn} on:mouseleave={palettesFocusOff} id="paletteM" class="pure-menu-item pure-menu-has-children">
		<span on:click={togglePaletteList} class="pure-menu-link">{paletteButton}</span>
		
		{#if $onscreen.palettesList}
		<ul id="palettesList" class="pure-menu-children wrap">
			{#if $colorPalettes && $colorPalettes.length > 0}
			
			{#each $colorPalettes as colorPalette, x}
			
			<li class="pure-menu-item block" on:click="{() => changePalette(colorPalette.n, event) }" tabindex="{x+1}">
				<div class="pHolder">
					<a class="pure-menu-link">  
						<div value="{colorPalette.n}">
							<div class="name">
							{colorPalette.n}
							</div>
							<div class="colorHolder scroll">
								{#each colorPalette.c as color}
								<div class="c" style="background-color:{color}"></div>
								{/each}
							</div> 
						</div>  
					</a>
				</div>
			</li>
			{/each}
			{/if}
		</ul>
		{/if}
	</li>
</ul>
