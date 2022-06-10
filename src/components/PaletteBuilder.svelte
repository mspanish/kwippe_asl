<script>	
import { onMount } from 'svelte';
import { removeFrom, makeId, getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';
import Icon from './Icon.svelte';
import { addColors, recolorPaletteIcons, recolorIconArray, getMat } from '../scripts/colorHelpers.js'
import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js'; 
import { iconsArray, onscreen, colorPalette, currentPalette, colorPalettes, paletteBuilderColors, iconsForPalette, paletteBLoaded, shades, paletteV, paletteExpand, paletteChangedFlag, colorNames, paletteName, colorsForParts, selectedLayer } from '../store.js'

let icon = {};
let currentSet = 'mat';
let setName = 'open color';
let iconArray = [];
$paletteExpand = ['#000000'];

$: { if ($paletteChangedFlag) { 
		//console.log('palette changed');
		recolor();
		$paletteChangedFlag = false;
		$onscreen.slider = true;
		$onscreen.shiftColors = true;
	}
}

$onscreen.palettes = true;
$onscreen.slider = false;
$onscreen.shiftColors = false;
$onscreen.importPalette = true;
$onscreen.exportPalettes = true;
$onscreen.newPalette = true
$onscreen.input = true;
//$onscreen.newPalette


$paletteBuilderColors = getMat();
$currentPalette = [];
$iconsForPalette = [];

onMount(() => {
	let url = 'data/html-colors.json'
	fetch(url)
		.then(res => res.json())
		.then(data => {
		$colorNames = data;
	});

	var urly = 'data/json/palette_builder_icons.json'
	fetch(urly)
		.then(res => res.json())
		.then(data => {
		let arr = [];
		$iconsArray = [];
		for (let i = 0; i < data.length; i++) {
			let obj = { stroke: 0, fill: '#000000', name: 'pb'+i, path: data[i], coll: 'pb'};
			arr.push(obj);
			// wow even push DOES create an assignment, we have to redo this completely
			$iconsArray.push({ stroke: 0, fill: '#000000', name: 'pb'+i, path: data[i], coll: 'pb'}); 
		}
		//console.log('iconsArray is '+JSON.stringify($iconsArray));
		iconArray = arr;
		$paletteBLoaded = true;
		$paletteBuilderColors = getMat(); 
		$iconsForPalette = arr;
		//$currentPalette = getMat();
	});
})
const changeData = (set) => {   
	let arr = getMat();

	if (set == 'mat') {
		/* this is actually open colors - they are switching FROM mat */
		arr = ["#ffffff", "#adb5bd", "#ff6b6b", "#f06595", "#cc5de8", "#845ef7", "#5c7cfa", "#339af0", "#22b8cf", "#20c997", "#51cf66", "#94d82d", "#fcc419", "#ff922b", "#000000"];
		currentSet = 'open';
		setName = 'material design';
	}
	else {
		currentSet = 'mat';
		setName = 'open color';
	}
	$paletteBuilderColors = arr;
};
const recolor = () => {
	//console.log('recolor fn, $currentPalette: '+$currentPalette);
	//console.log('recolor fn, $colorPalette: '+$colorPalette);
	let arr = recolorPaletteIcons($currentPalette, $iconsForPalette);
	//console.log('arr is +'+JSON.stringify(arr));
	$iconsForPalette = arr;
};
const expand = (color) => {
	//console.log('expanding color '+color); 
	
	let obj = addColors(color);
	//console.log('obj is '+JSON.stringify(obj));
	
	if (obj.paletteExpand) $paletteExpand = obj.paletteExpand;
	if (obj.paletteV) $paletteV = obj.paletteV;
	if (obj.shades) $shades = obj.shades;
};
const colorChange = (color,type,variations) => {
	
	//console.log('running colorChange '+color);

	let cur = $currentPalette || [];
	let p = $colorPalettes;

	if (cur.length >20 && type == 'add') {
		let str = 'Sorry, palettes can\'t be more than 20 colors!';
		new Toast(str, 'modal','error', 0,[
		{ text:'ok', action:'cancel'}
		]);
		return
	}

	adjustColor(color,cur,p,type);
	
	//console.log('color change color: '+color);

	if (variations) {
		/* also change out our variations!
		the 2nd flag is true to switch these out */
		addColors(color,true)
	}
};
const adjustColor = (color,cur,p,type) => {
	//console.log('adjustColor, type is '+type);
	//console.log('adjustColor, color is '+color);

	//return

	if (type == 'add') {
		cur.push(color);
	}
	else {
		cur = removeFrom(cur,color);  
		//cur = cur.reverse();            
	 //   console.log('palette is now '+cur)
	}
	
	//console.log('cur is '+JSON.stringify(cur));

	$colorPalette = cur;
	$currentPalette = cur;
	$colorPalettes = p; 
	saveToLocalStorage('palettes', p);
	
	if (type == 'add') {
		let palette = $currentPalette;
		let end = palette.splice(palette.length-1,1);
		palette.unshift(end);
		$currentPalette = palette;
	}
	
	if (cur.length == 0) {
		//console.log('we are out of icons, reset!')
		for (let element of iconArray) {
			element.fill = '#000000';
		}		
		
		$iconsForPalette = iconArray;
		return
	}	

	if (cur.length == 1) {
		//console.log('palette lenny LESS than 2');
		// this is for black and white icons, the initial state
 
		if (type == 'add') {
			let ics = $iconsForPalette;
			//console.log('trying to UNICOLOR the icons '+color);
			//console.log('ics lenny is '+ics.length);
			
			for (let i = 0; i < ics.length; i++) {
				ics[i].fill = color;
			}
			$iconsForPalette = ics;
		}
		// else for removal we have to grab initial paths instead of split!
		else {
			console.log('trying to recolorIconArray');
			let ics = iconArray;
			color = cur[0]
			for (let i = 0; i < ics.length; i++) {
				ics[i].fill = color;
				console.log('color is '+color);
				ics[i].color = color;
			}
			$iconsForPalette = ics;		
			return
			//$iconsForPalette =  recolorIconArray(cur[0]);
		}         
	}
	else {
		//console.log('trying to recolor');
		recolor();
	}     
	//console.log(JSON.stringify($iconsForPalette));	
	$onscreen.slider = true;
	$onscreen.shiftColors = true;
};

const ondestroy = () => {
	$paletteBLoaded = false;
};

const closePaletteBuilder = () => {
// needs to SAVE current working palette so you can use it
	$onscreen.paletteBuilder = false;
	$colorsForParts = {
		name: $selectedLayer,
		colors : $currentPalette
	}	
	$onscreen.importPalette = false;
	$onscreen.exportPalettes = false;
	$onscreen.newPalette = false;
	$onscreen.slider = false;
	$onscreen.shiftColors = false;
	$onscreen.input = false;
	
	/* if user didn't save this we need to do it now so they can use the palette menu to apply this palette to whatever they want */
	
	if (!$paletteName) {
		let p = $colorPalettes;
		let cur = $colorPalette;
		let id = makeId(4);
		p.unshift({n:'palette_'+id, c: cur});
		$colorPalettes = p;	
		saveToLocalStorage('palettes', p);		
	}
	
	setTimeout(() => {
		$onscreen.memesHide = false;
	},20);
}
</script>

<style>
.leftMargin {
	margin-left:150px;
}
button {
	margin-left:20px;
}
.variations {
	display:inline-block;
	margin-top: 15px;
}
span {
	display:inline-block;
	margin-left: 30px;
	margin-right: 30px;
	color: #999999;
	font-style:italic;
}
#material {
	padding-bottom: 20px;
	border-bottom: solid rgba(0, 0, 0, .1) 1px;
}
#colors {
	min-height: 85px;
	position: fixed;
	background: white;
	width: 100%;
	top: 270px;
	padding-top: 20px;
	margin-bottom: 20px;
	border-bottom: solid rgba(204, 137, 137, 0.1) 1px;
}
#outer {
	width: 100vw;
}
#wrap {
	padding-left:50px;
}
#pWrap {
	margin-top: 360px;
	text-align: left;
	padding-left:1vw;
}
:global(.iconTop > svg) {
	overflow: visible !important;
	width: 125px !important;
	height: 125px !important;
}
#iconsWrap {
	text-align: center;
	padding-left: 0;
}
.iconsTop {
	left:0;
	background-color: white;
	margin-bottom: 30px;
	border-bottom: solid 1px #ececec;
	position: fixed;
	top: 130px;
}
.backBtn {
	margin-top:50px;
	margin-left:10px;
	width: 100px;
	position: absolute;
}
</style>  

<div class="pure-button btny backBtn" on:click={closePaletteBuilder}>back</div>

<div id="outer">

<div id="wrap">
<div id="pWrap" class="margin-0x5-h">
	<div id="iconsWrap">
		<div class="iconsTop row-center-center">
		{#if $iconsForPalette && $iconsForPalette.length > 1}
			{#each $iconsForPalette as icon}
			
				<div id='iconTop' class='iconTop'>
					<Icon {icon}/>      
				</div> 
			{/each}    
		{/if}
		</div>
	</div>
        
    <div id="colors">
    
        {#if $currentPalette.length > 0}
            <h2>{$paletteName || 'Your'} Palette</h2><span>click to remove</span>
        {/if}

		<!--in:fly="{x: 50}" -->
        {#each $currentPalette as color}
            <div on:click="{() => colorChange(color,'remove')}" class="pbox pboxT"  style="background-color:{color}"></div>
        {/each} 
       
    </div>

    <h2>Pick a Color</h2>
    <button on:click="{() => changeData(currentSet)}" class="pure-button">change to {setName}</button>

	<!-- in: fade -->
    <div id="material" >
	
        {#each $paletteBuilderColors as color}
        <div class="pbox" on:click="{() => expand(color)}" style="background-color:{color}"></div>
        {/each} 
        
    </div>

    {#if $paletteExpand.length >1}
    <h2>Add to Palette</h2><span>click to add</span>
    <div id="colors_hex">
            {#each $paletteExpand as color}
            <div class="pbox" on:click="{() => colorChange(color,'add',true)}" style="background-color:{color}"></div>
			
        {/each} 

    </div>
    {/if}

    {#if $paletteV.length >1}
    {#each $paletteV as palette}
    <div class="variations">
            <h4>{palette.name}</h4>
            {#each palette.colors as color}
			
            <div class="pbox"  on:click="{() => colorChange(color,'add')}" style="background-color:{color}"></div>
        {/each} 
    </div>
    {/each}

    {/if}

</div>
</div>
</div>