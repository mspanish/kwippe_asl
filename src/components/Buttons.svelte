<script>
export let btn1;
export let btn2;
export let btn3;
export let action1;
export let action2;
export let action3;
export let value;
export let input;

import { Toast, deleteAllToasts, deleteTopToast } from '../scripts/toaster-js/index.js';     
import { shuffle, saveToLocalStorage, sample, startCase, removeFromIndex } from '../scripts/utilities.js';

import { settings, controls, iconsArray, onscreen, colorPalette, currentPalette, colorPalettes, paletteBuilderColors, iconsForPalette, paletteBLoaded, shades, paletteV, paletteExpand, paletteChangedFlag, colorNames, paletteName, memes, tempIcons, selectedLayer } from '../store.js'

const saveImportedPalette = (name,input) => {
	
	console.log('importing palette '+input);
	input = input.replace(/ /, '').replace(/\r?\n|\r/g, '');
	let arr = input.split(',');
	let cols = [];
	//let state = store.get();
	//let state = store.get();
	// TODO: do a match for named colors, convert to hex


	for (let coly of arr) {
		coly = coly.trim();
		//console.log('processing '+coly);
		if (coly.includes('#')) {
			
			/* get rid of quotes if they are there */
			coly = coly.replace(/'/g, '').replace(/"/g, '');
		   // console.log('got '+arr[i]);
			//console.log('got a hex to check '+arr[i])
			if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(coly)) {
				//console.log('we have a valid hex color! '+arr[i])
				cols.push(coly);
			}
			// check to see if valid hex color
		}
		else {
			// check to see if it's an html color name

			let colors = $colorNames;
			if (colors[coly]) {
				//console.log(WE GOT a NAMED COLOR  '+colors[coly]);
				cols.push(colors[coly]);
			}
		}
	}
	// TODO: error if NO valid hex colors!!!!
	
	if (cols.length > 0) {
		$paletteName = name;
		$paletteExpand = []; 
		$paletteV = []; 
		$currentPalette = cols; 
		$paletteBuilderColors = cols;
		$colorPalette = cols;
		$colorPalettes.unshift({c:$colorPalette,n:name});
		deleteAllToasts();
		
		if (cols.length ==1 ) {					

			let ics = $iconsForPalette;

			for (let i = 0; i < ics.length; i++) {
				ics[i].color = cols[0];
			}
			$iconsForPalette = ics;
		}

		else {
			let arr = recolorPaletteIcons($currentPalette, $iconsForPalette);
			//console.log('arr is +'+JSON.stringify(arr));
			$iconsForPalette = arr;
		}
	}
	else {
		// deleteAllToasts();
			let str = "Sorry, we don't recognize these colors!";
			new Toast(str, 'modal','error'); 
	}
}

const savePalette = (text_input) => {
	deleteAllToasts();
	setTimeout(function(){
		let str = 'Super! Saved '+text_input;
		new Toast(str, 'modal','success'); 
		let inp = document.getElementById('input_form');
		if (inp) {
			inp.value = '';      
		} 
	},350)

	let p = $colorPalettes;
	let cur = $currentPalette;
	
	text_input = text_input.toLowerCase().replace(/ /g, '_');
	//console.log('we have no current palette, naming now!')
	p.unshift({n:text_input, c: cur});
	text_input =  startCase(text_input.replace(/_/g, ' '));
	$paletteName = text_input;
	$colorPalettes = p;		
	saveToLocalStorageStorage('palettes', p);	
}

const deletePalette = (name) => {
  //console.log('trying to delete '+name);
  
  let palettes = $colorPalettes;
  for (let i = 0; i < palettes.length; i++) {

      if (palettes[i].n === name) {
          palettes.splice(i, 1);
          //store.set({paletteName: '', paletteExpand: [], paletteV: [], paletteBuilderColors: getMat(), currentPalette: [], colorPalettes:palettes});
         // recolorIconArray('#000000');
          deleteAllToasts();

        break;
      }
  }
}
	 	 
const deleteExistingPalette = (name) => {
  console.log('trying to delete '+name);
  
  let palettes = $colorPalettes;
  for (let i = 0; i < palettes.length; i++) {

      if (palettes[i].n === name) {
          palettes.splice(i, 1);
          //store.set({colorPalettes:palettes});
          deleteAllToasts();

        break;
      }
  }
}

const newDesign = () => {
    let bg = $memes['bg'];
    $memes = {};
    $memes['bg'] = bg;
    $selectedLayer = 'bg';
    $memes.selectedLayer = 'bg';   
    
    $tempIcons = {};

    $memes['layers'] = $memes['layers'] ||  [];
    $memes.paragraph = false;
    $memes.fixedFontSize = true;	
    
    setTimeout(() => {
        deleteAllToasts();
        saveToLocalStorage('memes', $memes);
        saveToLocalStorage('tempIcons', {});
    },20);	

}

const closeAllPopovers = () => {	
	$onscreen.popover = false;
	
	$onscreen.textPositionPopover = false;
	$onscreen.opacityPopover = false;
	$onscreen.patternPopover = false;
	$onscreen.rectSettingsPopover = false;
	$onscreen.sizePopover = false;
	$onscreen.positionPopover = false;
}
	 
const doIt = (action,value, input) => { 
	console.log('button click, action is '+action);
	console.log('button click, value is '+value);
	console.log('button click, input is '+input);
	
	switch (action) {
		/* close the modal */
		case 'overwritePalette':
			value = value.toLowerCase().replace(/ /g, '_');
			console.log('deleting palette '+value)
			deleteExistingPalette(value);
			setTimeout(() => {
				saveImportedPalette(value, input);
			  //savePalette(value);
				deleteTopToast();
				deleteTopToast();
			},100)
		break;
		case 'pdfLandscape':
            $settings.pdfLayout = 'landscape';
            $settings.pdfLayoutFlag = true;
            deleteAllToasts();            
		break;
		case 'pdfUnload':
            $settings.pdfUnloadFlag = true;
            deleteAllToasts();            
		break;
		case 'pdfPortrait':
            $settings.pdfLayout = 'portrait';
            $settings.pdfLayoutFlag = true;
            deleteAllToasts();
        break;
		
		case 'deleteObjects':
    
            console.log('trying to delete objects')
            $settings.toastAction = 'deleteObjects';
		
		break;
		
		case 'deleteLayer': 
			/* layers should be 
			[
			{	type: type,
				id: makeId(5), 
				displayName: type+id
			}
			]
			their index will be mutable, all references to them based on type plus randomId, z-index will be based on their array index, which user can change
			*/
			$memes[value] = null;
			let arr;
			for (let i=0; i<$memes.layers.length;i++){
				if ($memes.layers[i].id == value) {
					arr = $memes.layers;
					removeFromIndex(arr, i)
				}
			}
			if (arr.length > 0) {
				$memes['layers'] = [];
				// big pain but the SVGs need to totally reset, not incrementally reset, or your relative svg values go out of whack. To get Svelte to do that, we have to dump the layers and add em back 1 by 1...
				setTimeout(()=> {
					let e = 0;
					for (let el of arr) {
						$memes['layers'][e] = el;
						e++;
					}
				},10)				
			}
			saveToLocalStorage('memes', $memes);
			$controls = ['colors'];
			closeAllPopovers();
			setTimeout(() => {
				deleteAllToasts();
			},20);	 
		break;
		case 'newDesign':
            console.log('deleting current and creating NEW design.')
            newDesign();
		break;
		case 'deletePalette': 
            value = value.toLowerCase().replace(/ /g, '_');
            console.log('deleting palette '+value)
            deletePalette(value);
		break;
		case 'delete':
		//algo
		break;
		case 'cancel':
		  deleteAllToasts();    
		break;             
		case 'ok':
		  deleteTopToast();
		  deleteTopToast();
		break;
		case 'close': 
		  deleteAllToasts();
		break;
		/* for reloading icons back to whatever the store has, minus colors */
		case 'reload':
		  let icons = store.get();
		   icons = icons.icons;

		  for (var i = 0; i< icons.length; i++) {
			const ico = icons[i];
			icons[i].color = '#000000'
		  }

		   store.set({icons:icons});
		  deleteAllToasts();
		break;

	}
}

</script>
<!-- ="doIt(action1)" -->
<div class="pure-g buttonHolder">
    <button on:click="{() => doIt(action1)}" class="pure-button pure-button">{btn1}</button>
    {#if btn2}
<!-- ="doIt(action2,value)"  -->
    <button on:click="{() => doIt(action2, value, input)}" class="pure-button pure-button-primary">{btn2}</button>
    {/if}
    {#if btn3}
    <button on:click="{() => doIt(action3, value, input)}" class="pure-button pure-button-error">{btn3}</button>
    {/if}    
    
</div>
 
<style>
.buttonHolder {
     display:inline-block;
}
.buttonHolder > button {
    margin: 10px;
}
</style>
 
