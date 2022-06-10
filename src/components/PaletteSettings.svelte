<script>

import { recolorPaletteIcons} from '../scripts/colorHelpers.js'
import { saveToLocalStorage } from '../scripts/utilities.js';
import { Toast } from '../scripts/toaster-js/index.js';  
import { colorPalettes, currentPalette, colorPalette, iconsForPalette } from '../store.js'

let text_input;

const deleteAll = () => {
	//(cur, iconsForPalette, colorPalette)
	let monochrome =  {"n": "monochrome", "c": ["#000000","#989898","#eeeeee"]};
	$currentPalette = monochrome.c;
	$colorPalette = monochrome.c;
	$colorPalettes = [monochrome]; 
	saveToLocalStorageStorage('palettes', $colorPalettes);
	//(cur, iconsForPalette)
	recolorPaletteIcons($currentPalette,$iconsForPalette);			
	//let state = store.get();
	//saveToLocalStorage('state', JSON.stringify(state));
	setTimeout(function(){
		let str = 'All palettes except monochrome cleared.';
		new Toast(str, 'modal','success'); 
	},350)
};

const refresh = () => {
	//console.log('got refresh');
	let urly = '/data/json/palettes.json';
	let state = store.get();
	
	let currentPalettes = $colorPalettes;
	let i = 0;
	//console.table(currentPalettes);
	setTimeout(function(){
		let str = 'Default palettes have been reloaded.';
		new Toast(str, 'modal','success'); 
	},350)			
	
	fetch(urly)
		.then(res => res.json())
		.then(data => {
		// toss out anything with same name as default
			let obj1 = {}, obj2 = {};
			
			for (let p of currentPalettes) {
				let n = p.n;
				obj1[n] = p.c;
				
			}
			for (let p of data) {
				let n = p.n;
				obj2[n] = p.c;
			}
			//console.log(JSON.stringify(obj1));
			//console.log(JSON.stringify(obj2));
			
			// target will be OVERWRITTEN by sources, so new palettes will be overwritten by defaults
			let obj = Object.assign(obj1, obj2)
			
			let arr = [];
			
			for (let o in obj) {
				arr.push({n: o, c: obj[o]});
			}
			
		//	console.log('arr is now '+JSON.stringify(arr));
			
		
			//console.table(set);
			//console.log('s lenny is '+arr.length);
			store.set({colorPalettes: arr})
			//initDropdowns();
	});
};
</script>

<h1>Changes to Palette Builder</h1>

<table id="settings">
	
	<tr class="row1">
		<td><button  on:click={refresh} class='pure-button'>Refresh Default Palettes</button></td>
		<td><h2>Add back any default palettes that you've deleted. Warning! If you've made new palettes by overwriting default ones, these will be replaced.</h2></td>
	</tr>


		
	<tr class="row1">
		<td class="collapse"><button  on:click={deleteAll} class='pure-button'>Delete All Palettes</button></td>
		<td><h2>Remove all color palettes (leaves 1 monochrome palette)</h2></td>
	</tr>
</table>

<style>
td{
text-align:right
}
#settings{
  margin: 0 0 3em 0;
  padding: 0;
}
h1 {
    font-size: x-large;
	color: black;
}
.row1 {

}
h2 {
	
	color: white;
	font-size: x-large;
	text-align:left;
	display:block;
}
 button {
   
	margin-right: 20px;
	text-align: left;
}

   @media (max-width: 1023px) {
    td {
		display: block;
		float: left
	}
   }
</style>
  
