<script>
export let text_input;
if (!text_input) text_input = '';
export let input_type;
export let placeholder;
export let maxLength;
let name = '';
import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js'; 
import { recolorPaletteIcons } from '../scripts/colorHelpers.js'
import { makeId } from '../scripts/utilities.js'

import { onscreen, colorPalette, currentPalette, colorPalettes, paletteBuilderColors, iconsForPalette, paletteBLoaded, shades, paletteV, paletteExpand, paletteChangedFlag, paletteName, colorNames } from '../store.js'

const saveImportedPalette = (input,name) => {
	let check = checkName(name,input);
    if (!check) return false
	console.log('importing palette '+input);
	input = input.replace(/ /, '').replace(/\r?\n|\r/g, '');
	let arr = input.split(',');
	let cols = [];
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

const checkName = (name,input) => {
	console.log('checkName input is '+input);
	if (name.length < 1) {
		let str = 'Your name must have at least 1 character';
		new Toast(str, 'modal','error'); 	
		return false;
	}
	let names = $colorPalettes;
	
	//console.table(names);
	const nameCheck = names.filter(function(child){
		return child.n == name
	});
	console.log('bugga bugga');
	//console.log(JSON.stringify(nameCheck));
	if (nameCheck.length > 0) {
		let str = 'Name already taken! Overwrite existing palette?';
		new Toast(str, 'modal','warning',0,[
				{text:'cancel',action:'ok'},
				{text: 'overwrite?',action:'overwritePalette', value:name, input:input}
			]); 
		return false
	}
	else {
		return true
	}
}

const saveIt = (type, input, name) => {
	console.log('saveIt, input is '+input);
	//console.log('got save '+type)
	switch (type) {
		case 'import_palette':
			//console.log('running saveImportedPalette');
			//checkName(name,input);
			saveImportedPalette(input, name);
		break;
	
	}
}

const cancelIt = (type) => {
	//console.log('got cancel '+type);
	switch (type) {
		case 'import_palette':
			//console.log('delete all toasts');
			deleteAllToasts();
		break;
	
	}	
}
</script>

<style>
textarea {
	display:block;
}
button {
	display: inline-block;
}
</style>


<textarea id="input_form" rows="10" bind:value={text_input} required type="text" minlength="1" maxlength="{maxLength || 20}" placeholder="{placeholder}"></textarea>

<div>
	<span>name: </span><input id="input_name" required type="text" bind:value={name} placeholder="enter name" />
</div>

<button id="cancel_btn"  on:click="{() => cancelIt(input_type,text_input)}" class='pure-button crimson'>cancel</button>

<button id="input_btn"  on:click="{() => saveIt(input_type,text_input,name)}"  class='pure-button'>save</button>


