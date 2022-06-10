<script>
export let text_input;
if (!text_input) text_input = '';
export let input_type;
export let placeholder;
export let maxLength;
import { Toast, deleteAllToasts } from '../scripts/toaster-js/index.js';
import { onscreen, paletteName, colorPalettes, currentPalette, colorPalette } from '../store.js'
import { startCase } from '../scripts/utilities.js';

const saveIt = (type, input) => {
	let str = input.toString();
	console.log(str+ ' : got save '+type)
	switch (type) {
		case 'palette_name':
			saveInput(input,type);
		break;
	
	}
}

const saveInput = (text_input,type) =>{

	if ($currentPalette && $currentPalette.length <1) {
	let str = 'Please pick at least 1 color first!';
		new Toast(str, 'modal','error', 0,[
			{text:'ok', action:'ok'}
		]); 
		return
	}				

	//console.log('got yer saveInput '+text_input+ ' type is '+type)
	const input = document.getElementById('input_form');
	if (!input.validity.valid || !input) {
		let str = 'Invalid name, try again!';
		new Toast(str, 'modal','error', 1300);
	return
	}
	
	let names = $colorPalettes;
	
	const nameCheck = names.filter(function(child){
		return child.n == text_input
	});
	//console.log(JSON.stringify(nameCheck));
	if (nameCheck.length > 0) {
		let str = 'Name already taken! Overwrite existing palette?';
		new Toast(str, 'modal','warning',0,[
				{text:'cancel',action:'ok'},
				{text: 'overwrite?',action:'overwritePalette', value:text_input}
			]); 
	}

	else {
		savePalette(text_input);
	}
};

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
	let cur = $colorPalette;
	text_input = text_input.toLowerCase().replace(/ /g, '_');
	//console.log('we have no current palette, naming now!')
	p.unshift({n:text_input, c: cur});
	/* once we activate saving everything to local storage - we won't need any more logic here, although
	we should warn the user that they should periodically save these palettes to JSON or something in 
	case their localStorage gets wiped out */
	text_input =  startCase(text_input.replace(/_/g, ' '));
	$paletteName = text_input;
	$colorPalettes = p;	
	saveToLocalStorageStorage('palettes', p);	
}
 
</script>

<div class="pure-form">
	<input id="input_form" bind:value={text_input} required type="text" minlength="1" maxlength="{maxLength || 20}" placeholder="{placeholder}">

    <span id="input_btn" on:click="{() => saveIt(input_type,text_input)}"  class='text pure-button'>save</span>
	
	<span class="icon saveI" >
		<img src="./img/save.svg"/>
	</span>
</div>
  
  <style>
.icon:hover::before{
	position: absolute;
	top: 35px;
	width: 48px;
	text-align: center;
	color: #999999;
}

.saveI:hover::before {
	content: 'save';
}
span.icon {
	display:inline-block;
	vertical-align: middle;
}
span.text {display:none;}

span img {
	width: 35px;
	filter: opacity(.4);
	margin-left: .8vw;
	margin-right: .8vw;
}


/* desktop!! */
@media (min-width: 1025px) {
	.toolbar {
		left: 200px;
	}
	span.icon {display:none}
	span.text {display:inline-block}
}
</style>