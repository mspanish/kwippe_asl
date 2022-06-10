
<script>
//import { doNotZip from '../scripts/do-not-zip';
import { doNotZip, downloadFiles } from '../scripts/do-not-zip.js';
import { uniq, removeFrom } from '../scripts/utilities.js';
import { Toast } from '../scripts/toaster-js/index.js';   
import { createTypeForExports } from '../scripts/paletteHelpers.js';
import { patternPalette, onscreen, currentPalette, colorPalette, colorPalettes } from '../store.js'

//import { createAse } from '../../node_modules/rgb2adobeswatch/lib/lib/createAse.js';
//import { encode } from '../ase_encode/encode.js';


let hexNames = {};
let exportTypes = ['json_array', 'json_object','css','html_table', 'SVG (current palette only)', 'text', 'Adobe Swatch Exchange', 'Sketch Palette', 'GIMP Palette'];
let selectedExports = [];
let selectedPalettes = [];

const addExportType = (type,e) => {
	
	//console.log('selectedExports are '+JSON.stringify(selected));
	//state.selectedExports;
	if (e.currentTarget.checked) {
		selectedExports.push(type);
	}
	else {
		removeFrom(selected,type);
	}
   // if (type == 'html_table') selected.push('css');
	selectedExports = uniq(selectedExports);
	console.log('selectedExports are '+JSON.stringify(selectedExports));
};
const selectPalette = (palette, e) => {
	console.log('trying to select palette '+palette)
	console.log('ecurrentTarget is '+e.currentTarget.checked);
	if (e.currentTarget.checked) {
		selectedPalettes.push(palette);
	}
	else {
		removeFrom(selectedPalettes,palette);
	}
	selectedPalettes = uniq(selectedPalettes);
	console.log('we got these palettes '+selectedPalettes);
};

const createType = (type) => {
	return createTypeForExports(type, $colorPalettes, selectedPalettes);
};
const createExports = () => {
	let data = [];
	let types = selectedExports;
	for (let i = 0; i < types.length; i++) {
		let newdata = createType(types[i]);
		
		//console.log(JSON.stringify(newdata));
		//console.log('our typeof is '+Array.isArray(newdata));
		if (Array.isArray(newdata)) {
			//console.log('got yer array!!');
			data = data.concat(newdata);
		}
		else {
			//console.log('NO GOT NO ARRAY');
			data.push(newdata);
		}
	}
	return data

};
const exportFiles = () => {

	let types = selectedExports;
	if (types.length < 1) {
		let str = 'Please choose an export type!';

			new Toast(str, 'modal','error', 0,[
				{text:'ok', action:'ok'}
			]); 
		return
	}
	let palettes = selectedPalettes;                
	if (palettes.length < 1) {
		let str = 'Please select at least 1 palette!';
		new Toast(str, 'modal','error', 0,[
				{text:'ok', action:'ok'}
			]); 
		return
	}                
	const data = createExports();
	
	//console.log('data is '+JSON.stringify(data));
	const blob = doNotZip(data);
//			console.log(blob)
		// output will be a Buffer on the server and a Blob on the client   
	downloadFiles('color_palettes.zip', blob);
};

</script>

<style>
#checklist {
	padding-bottom: 100px;
}
ul {
    list-style: none !important;
}
.left {
    float: left;
    width: 50%;
    margin:0;
}
.right {
    float: right;
    width: 50%;
    margin:0;
}
#palettes {
    cursor:pointer;
}
.colorHolder {
    width: 70%;
    top: 9px;
    display:block;
    position: absolute;
    overflow-x: auto;
    overflow-y: hidden;
    text-align: left;
    margin: 0;
    padding: 0;
    height: 30px;
    margin-left: 175px;    
}
</style>

<div class="left">
    <div class="selectP"><h2>Select palette(s)</h2></div>
</div>
<div class="right">
        <div class="selectP"><h2>Select format(s)</h2>
            <ul>
                {#each exportTypes as format, x}
                <li class="pure-menu-item block h40">
				<!--"addExportType(format,event) -->
                        <input on:click="{() => addExportType(format,event)}" id="styled-{x}" class="styled-checkbox" type="checkbox" value="{ format }">
                        <label for="styled-{x}">{ format.replace('_', ' ') }</label>
                </li>
                {/each}
            
            </ul>
		<!-- exportFiles() -->
        <button on:click={exportFiles} class="pure-button pure-primary-button">download</button>
        </div>
</div>
<div class="wrappy">
    <ul id="checklist">
        {#each $colorPalettes as colorPalette, x}
        <li class="pure-menu-item block"  tab-index="{x}">
         <div class="pHolder">            
			<a  class="pure-menu-link"  >       
                    <div class="styled" value="{colorPalette.n}" >
					
					<!-- -->
                    <input id="styled-checkbox-{x}"   class="styled-checkbox"  on:click="{()=>selectPalette(colorPalette.n, event)}" type="checkbox" value="{colorPalette.n}">
                    <label for="styled-checkbox-{x}">               
                    {colorPalette.n}
                    </label>
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
    </ul>
</div>