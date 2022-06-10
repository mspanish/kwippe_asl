<script>
export let pic; // trying to replace $avatarIcons with something extensible!

let editMode = 'edit';

import { onMount } from 'svelte';

import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js';   
//import { clearHTTPRequests } from '../scripts/fileFetching.js';
import { abortSilently } from '../scripts/xhttp/xhttp-browser.js';

import { LighterSteps, updateColorObject } from '../scripts/colorHelpers.js'; 
import { removeFrom, removeFromIndex, sample, shuffle, saveToLocalStorage, removeFromLocalStorage} from '../scripts/utilities.js';
import AvatarIcon from './AvatarIcon.svelte';
import IconComplex from './IconComplex.svelte';

import Filter from './Filter.svelte';

import { getPosition } from '../scripts/positions.js';

import { currentPalette, colorsForParts, xhrArray, icons, controls, memes, avatar, qty, onscreen, reRunFiles, reRunPartsFlag, fileMode, partsChooser, selectedLayer, selectedParts, bodypartsRetrieved, avatarIcons, colorObj, filtersActive, tempIcons } from '../store.js'

import { graphicControls } from '../scripts/controls.js';

// ::LISTENER #9::
/*
$: {
	if ($onscreen.selectedThumbs == false) {
		removeSelectedThumbs($partsChooser.part);
	}
}
*/	
$: {
	if ($onscreen.partsLoader) {

		if (!pic) {
			//console.log('onMount replace pic w/ $icons...');
			pic = $icons;
		}
			
	}
}
onMount(() => {
	if ($onscreen.memeBuilder) {
		$onscreen.bgImageChooser = true;
	}
})
const clearHTTPRequests = () => {
    //console.log('existing $xhrArray length is '+$xhrArray.length)
    if ($xhrArray.length > 0) {
        //  //console.log('destroying previous Xhttp req')
        for (var i=0; i < $xhrArray.length; i++) {
            let req = $xhrArray[i];
            const index = $xhrArray.indexOf(i);
            if (index > -1) {
              $xhrArray.splice(index, i);
            }
            abortSilently(req,i)
        }
    }       
}

const checkMode = (part) => {
	return $fileMode[part];
};



const addToSelected = (name, icon) => {
	console.log('addToSelected, editMode is '+editMode);
	if (editMode != 'edit') {
		console.log('editMode NOT edit, returning');
		return;
	}
	//console.log('addingToSelected, icon is '+icon);
	//console.log('addingToSelected, name is '+name);
	//$icons[index].selected = true;
	let index;
	for (let i = 0; i < $icons.length; i++) {

		if ($icons[i].name == name) {
			index = i;
			//console.log('icon for this index is '+JSON.stringify($icons[index]));
		}
	}
	
    if (!icon) {
		//console.log('uh oh something is seriously messed up you have no ICON!');
		return
	}


	$onscreen.loadIcon = icon;
	let part = $partsChooser.part;	

	if ($onscreen.memeBuilder) {
		part = 'bgImage';
	}
	/*
	let mode = $fileMode[part];
	
	if (mode == 'single') {
		removeSelectedThumbs(part)
	}	
	*/
}

const colorizeSelected = (yObj, name, coll, index) => {

	let stylesByLayer = '<style>';
	
	if (['ssj','ope'].includes(coll)) {
		//console.log('running for coll '+icon.coll);

		for (let group in yObj) {
			stylesByLayer += ` .style_${group}_${name}_${index} {fill: ${sample( $currentPalette)} ; }  `
		}
	}
   
	return stylesByLayer += '</style>';
	
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

const closePartsChooser = () => {
	$icons = [];
	$tempIcons = {};
	//console.log('$$$$$$$$$$$$ closePartsChooser');
	clearHTTPRequests();
	$onscreen.modes = false;
	$partsChooser = false;
	
	if ($onscreen.iconsChooser) {
		$onscreen.iconSearch = true;	
		$colorsForParts = false;
		$partsChooser = false; 
		$onscreen.bgImageChooser = false; 
		$controls = [];	
		$onscreen.partsLoader = false;
		$onscreen.partAdjuster = false;
		$onscreen.partsChooser = false;
		$onscreen.iconsChooser = false;
	}
	else {
		$onscreen.modes = false;
		$onscreen.partsChooser = false;
		$partsChooser = false;
		$onscreen.partAdjuster = true;	

// troubleshooting why when you back out of create palette > colors > thumbs to main the main panel is hidden
		$colorsForParts = false
		$onscreen.partsLoader = false;
		$onscreen.fontList = false
		$onscreen.memesHide = false;
		
	}
	closeAllPopovers();
	// only empty controls if there is no artwork
	let isGraphic = false;

	if ($onscreen.memeBuilder) {
		for (let layer of $memes['layers']) {
			if (layer.id == $selectedLayer && layer.type == 'graphic'){
				isGraphic = true;
			} 
		}
		
		// if we have artwork, controls should remain
		if (isGraphic && $memes[$selectedLayer][0] && $memes[$selectedLayer][0].type == 'graphic') {
			$controls = graphicControls;	
		}
		else {	
			$controls = [];
		}
	}
	setTimeout(() => {
		let target = document.getElementById($selectedLayer);
		if (target) {
			target.classList.add('selected');	
		}
	},100)	
	//let partAdjuster = document.getElementsByClassName('partAdjuster')[0];
	//partAdjuster.style.display = 'block';
};

/* ::WHY:: I added 2, as in {num}2 to AvatarIcon below because the gradients are based  on this number, and otherwise the original gradient being used by the avatars applies itself to the parts 
*/ 

/* ::TODO:: So we need a few things here.
		1- parts that are already in play should be highlighted so you know they are selected (even if they aren't showing yet due to the fact that they are 10 selected and only 4 avatars, for example).
		2- somewhere there needs to be a choice for method of how to apply the parts: stepped or random
		3- click event for parts to add them to the selection
		4- some kind of X or something on selected parts to unselect them. Could also do "edit" button above where an X for unselected would be added to each part.

*/

const getSelectedParts = () => {
// the initial setting of status is in the data parsing, ending in a data-selected attribute on the icon div...

// see which part we're displaying
	let part = $partsChooser.part;
// first check store, if nada is there, then all parts in $bodypartsRetrieved are selected
	let sParts = [];
	
	if ($selectedParts[part]) {
	
	// ok we do have some selected parts, so let's highlight them (maybe we should pull them to front of elements too?
	
	// parts elements will have to have a data=filename attribute or some way to identify them
	
	}
	
	else {
		sParts = $bodypartsRetrieved[part];
	}
}
const loadingZoneEdit = () => {
	if (editMode == 'edit') {
		for (let i = 0; i < $onscreen.selectedIcons.length; i++) {
				$onscreen.selectedIcons[i].edit = true;
		}
		editMode = 'close editing';
	}
	else {
		for (let i = 0; i < $onscreen.selectedIcons.length; i++) {
				$onscreen.selectedIcons[i].edit = false;
		}
		editMode = 'edit';	
	}
}
const removeThumb = (name,index,event) => {
/*
	1- remove from $onscreen.selectedIcons
	2- remove from $tempIcons
	3- remove from $memes
	4- save to localStorage
*/
	console.log('removing thumb and art for '+name + ' index '+index);
	//1
	let arr = $onscreen.selectedIcons;
	for (let i = 0; i < arr.length; i++) {
		let ic = arr[i];
		if (ic.name == name) {
			arr.splice(i, 1);
		}
	}
	$onscreen.selectedIcons = arr;
	//2
	delete $tempIcons[name];
	//3
	for (let i = 0; i < $qty.length; i++) {
		
		if ($memes[$selectedLayer] && $memes[$selectedLayer][i] && $memes[$selectedLayer][i].name == name) {
			let other;
			for (let e = 0; e < $qty.length; e++) {
				if ($memes[$selectedLayer][e] && $memes[$selectedLayer][e].name != name) {
					other = $memes[$selectedLayer][e];
					break;
				}
				else {
					other = {};
					}
			}
			$memes[$selectedLayer][i] = other;
		}
	}
	// 4 save to localStorage
	saveToLocalStorage('tempIcons', $tempIcons);
	saveToLocalStorage('selectedIcons', $onscreen.selectedIcons);
	saveToLocalStorage('memes', $memes);	
	
}
const doNada = () => {
}

const selectForAvatars = (name, index, icon) => {
    if (!icon) {
		console.log('uh oh something is seriously messed up you have no ICON!');
		return
	}
	let part = $partsChooser.part;	
	let actualPart;
	//console.log('part is '+part);
	
	//console.log(name+ ' selectForAvatars: icon json is \n'+JSON.stringify(icon));
	
	//console.log('colorObj is '+ JSON.stringify(icon.colorObj));
	
	name = icon.coll + '_'+name;
		
	//if ($onscreen.memeBuilder && ['backs', 'patterns'].includes(part)) 
	

	if (!$selectedParts[part]) $selectedParts[part] = [];
	
	let mode = checkMode(part);
	
	let pattern = false;
	$onscreen.selectedThumbs = true;
	//let arr = [];
	
	//console.log(index + ' > addToSelected, mode: '+mode+ ' name: '+name + ' index: '+index);
	//console.log('part is '+part);
// remove selected from any other elements if the mode is single!!
	if (mode == 'single') {
		//removeSelectedThumbs(part)
	}	
	
	// this should cover us for selectedParts. Now create a new array matching the names with index numbers so you can match that up with the pic entry
	let files = $selectedParts[part] || [];
	files.push(name)
	$selectedParts[part] = files;	
	
	//console.log('files are '+files);
	
	
	let fileIndex = buildSelectedFilesIndex(part, false, icon.coll);
	
	//console.log('our fileIndex is now '+JSON.stringify(fileIndex));
	icon.selected = true;
	
	
	// for icons, this layer needs to be CREATED in the memes!
	

	for (let i = 0; i < $qty.length; i++) { 
		// for icons, if not exist, create!

		
			//console.log('adding '+name+ ' to avatar '+i);
		
		if (mode != 'single') {
			//console.log('mode is NOT single! i is '+i+ ' fileIndex lenny is '+fileIndex.length);
			let index = fileIndex[i];
			
			if (mode == 'random') index = sample(fileIndex);
			
			if (index == null) { 
				index = fileIndex[0];
				//console.log('NO index found for '+i);
			} else {
				//console.log(i+' GOT the index,  its '+index);
			}
		
			//console.log('our fileIndex is '+JSON.stringify(fileIndex));
			icon = pic[index];
			if (!icon) {
				console.log('theres no icon here at index '+index)
				return
			}
		}
		// FIXED: you cannot, I repeat: cannot - just assign "icon" to the $memes['bgImage][i] = or this single icon will be the only variation in your memes array (part of Svelte's auto-magical updating of assigned variables I think...)
		
		let obj = {				
			vb: icon.vb,
			pos: icon.pos || {},
			vb2: icon.vb2
		};

		//console.log('coll: '+icon.coll+ ' name: '+icon.name);
		obj = getPosition(obj, icon.coll, icon.name);  
		//console.log('our obj is '+JSON.stringify(obj));
		icon = Object.assign(icon, obj);
		$avatar[part][i] = Object.assign($avatar[part][i],icon);
	
			//$avatar[part][i].colorObj = icon.colorObj//$avatar['bg'][i].colorObj;
	}		
	
}
const removeFromSelectedAvatars = (name, index, icon) =>{
	
	// if this is the only one selected, and our mode is 'single' - this should throw an error that you need to have at least 1 selected.
	// we could instead throw an error that w/ NONE selected this part will be hidden...
	let part = $partsChooser.part;	
	// needed for icons to process correctly, they  don't have unique names outside of their coll! Within their coll, however, they do.
	name = icon.coll + '_'+name;
		
	//if ($onscreen.memeBuilder && ['backs', 'patterns'].includes(part)) part = 'bgImage';
	
	//::WIP:: working on icons loading into bgs, for now it's our only layer
	if ($onscreen.memeBuilder) part = 'bgImage';
	
	if (!$selectedParts[part]) $selectedParts[part] = [];
	
	let mode = checkMode(part);
	
	console.log(index + ' > removeFromSelected, mode: '+mode+ ' name: '+name + ' index: '+index);
	
	// allow user to get rid of the bg completely
	if (mode ==  'single' && $onscreen.memeBuilder && $selectedParts[part].length == 1) {
		pic[index].selected = undefined;
		$selectedParts[part] = [];
		$controls = [];
		for (let i = 0; i < $qty.length; i++) { 		
			$memes[part][i] = {};
		}
		return
	} 
	if (mode == 'single') {
		addToSelected(name, index, icon);		
		return
	}
	if (!$selectedParts[part]) $selectedParts[part] = [];
	
	pic[index].selected = undefined;
	
	//let fileIndex = buildSelectedFilesIndex(part);
	//removeFrom($selectedParts[part], name);
	
	// now loop through the dom, and REPLACE any pic that have the guy we've just removed....(match by name);
	let indexObj = buildSelectedFilesIndex(part, 'object');
	let removeIndex = indexObj[name];
	console.log('removeIndex is '+removeIndex);
	
	// Svelte won't auto-update on slice(), so we need to re-assign
	let temp = removeFrom($selectedParts[part], name);
	console.log('temp should have '+name+ ' removed! '+temp);
	$selectedParts[part] = temp;	
	
	// lazy way, same for stepped or random
	
	let replacementIndex;
	let replacementFilename;
	console.log('$sParts is '+JSON.stringify($selectedParts[part]));
	if (mode == 'random') {
		let replacementFilename = sample($selectedParts[part]);
		replacementIndex = indexObj[replacementFilename];
	}
	if (mode == 'stepped') {
		let lenny = $selectedParts[part].length;
		let replacementFilename = $selectedParts[part][lenny-1];
		console.log('selectedP is now '+$selectedParts[part]);
		replacementIndex = indexObj[replacementFilename];	
	}
	console.log('replacement files index is '+replacementIndex);
	if (replacementIndex === null || replacementIndex === undefined)  replacementIndex = 0;
	
	for (let i = 0; i < $qty.length; i++) { 
		if ($onscreen.memeBuilder) {
			if ($memes[part][i].coll+ '_'+$memes[part][i].name == name) {
			//  for memes let's REMOVE all graphics to this later if the user chooses to remove them...
				if ($selectedParts[part].length == 0) {
					$memes[part][i] = {};
					$controls = [];		
					$onscreen.selectedThumbs = false;
				} else {
				$memes[part][i] = pic[replacementIndex];
				}
			}
		} 
		if ($onscreen.avatarBuilder) {
		
			if ($avatar[part][i].name == name) {
				$avatar[part][i] = pic[replacementIndex];
			}
		}
	}
}
const removeSelectedThumbs = (part) => {
	let current = document.getElementsByClassName('top');
	//console.log('got single, removing glows from '+current.length);
	// there really should only be one selected, and this should be handled when they change modes, but just in case something slips by and there are more than one, we'll deselect ALL here
	for (let i = 0; i < current.length; i++) {
		let ele = current[i];
		let indexy = ele.getAttribute('data-index');
		pic[indexy].selected = false;
	}
	// for single we can zero out the $selectedParts, simple
	$selectedParts[part] = [];
}


const buildSelectedFilesIndex = (part, type) => {
/* this is a key fn, w/out it the stepped and random files display from the PartsChooser does not work! */
	let fileIndex = [];
	let pc = document.getElementById('partsChooser');
	let thumbs = pc.getElementsByClassName('icon');
	//console.log('thumbs lenny = '+thumbs.length);
	if (!$selectedParts[part]) $selectedParts[part] = [];
	
	// create a quick object to match filenames to index numbers. Since we really only need these here for now, adding more bloat to the global store seems worse to me
	let indexObj = {};
	
	for (let thumb of thumbs) {
		let ind = parseInt(thumb.getAttribute('data-index'));
		let fna = thumb.getAttribute('data-filename');
		let coll = thumb.getAttribute('data-coll');
		let n = coll+'_'+fna;
		//console.log('the name for this icon is '+n);
		indexObj[n] = parseInt(ind);
	}
	
	for (let file of $selectedParts[part]) {
		let n = file;
		let ind = indexObj[n];
		//console.log('ind is '+ind +' for '+n);
		// CARAMBA a 0 value will fail under if (ind) !!!!!
		if (ind !== null) fileIndex.push(ind);
	}
	if (type == 'object'){
		return indexObj
	}
	else {
		//console.log('our fileIndex is now '+JSON.stringify(fileIndex));
		return fileIndex
	}
}
</script>

<style>
.top {
	order: 1;
}

[data-selected="true"] > svg  {
	
}
.btny {
	display:block;
}
/* lame but this got tree shook out before I added :global */

#partsWrapper {
/*	top: 60px;
	position: absolute;
	left: 0;	
*/
	height: 100%;
	z-index: 100;
}
:global(#partsChooser) {
	margin-top: 15px;

	height: 100%;
/*	width: 200px;
    overflow-y: auto; */
	padding-bottom: 60px;
}
.icons {
	display: flex;
	overflow-y: auto;
}
.bottom {
	order: 2;
}
svg {
	margin: 5px;
} 
:global(.icon) {
    width: 65px;
    height: 65px;
    margin: 10px;
}
:global(.thumbImage) {
	display:inline-block; 
	overflow: hidden; 
	background-repeat: no-repeat; 
	display: block;
}	 
.edit {
	zoom: .4;
	margin-right: 20px;
    margin-left: 20px;
}  
.close_editing {	
	color: crimson;
}
.label {
	text-align: center;
	padding-top: 5px;
	display: inline-block;
	padding-left: 5px;
}
.top {
	position:relative;
}
.editMode:active {
	opacity: 1;
}
.editMode {
	position: absolute;
	top: 0;
	width: 75px; 
	height: 75px; 
	background-position: -150px -75px; 
	background-image: url("data/textures/cats/symbols-icons/no_entry-do_not_enter~minus/0.png");
	opacity: .7;
	z-index: 10000;
	zoom: .5;
}
:global(.zoom) {
    position: absolute;
    transform: scale(.3) translateY(-100%);	
}
:global(.zoomRotate) {
    position: absolute;
    transform: scale(.3) translateY(-100%) rotate(180deg);	
}
.countBadge {
    font-size: .9rem;
    font-family: monospace;
    font-weight: 100;
    font-style: normal;
    background-color: #2d3e50;
    padding: .2rem;
    border-radius: 10px;
    margin-left: -40px;
    margin-right: 10px;
    color: white;
}
:global(.loadingMinimized) {
	display:none !important;
}
:global(.small) {
	height: 30%;
}
:global(.medium) {
	height: 70%;
}
:global(.full) {
	height: 100%;
}


@media (max-width: 1281px) and (orientation: landscape) {

	#partsWrapper {
		top: 80px;
	}
}

</style>




<div id="partsWrapper">
	{#if $onscreen.partsLoader}
		<div class="pure-button btny" on:click={closePartsChooser}>back</div>
	
	<div id="partsChooser">
	
<!--	{#if $partsChooser.files && $partsChooser.files.length > 0} -->
				
{#if $onscreen.memeBuilder}
			
{#if $onscreen.selectedIcons && $onscreen.selectedIcons.length > 0 }
	<div class="categoryToolbar">
		<div class="catTools title" style="width: 100%;text-align:center">
		<span class="countBadge">{$onscreen.selectedIcons.length}</span>
		{!$onscreen.loadingZoneMinimized ? 'selected art' : 'see selected art'}</div>

			{#if $onscreen.loadingZoneMinimized}
				<div on:click="{() => $onscreen.loadingZoneMinimized = false}" class="catTools close zoom" style="right: -3%; width: 75px; height: 51px; background-position: -75px 0px; background-image: url('data/textures/cats/symbols-icons/arrows~chevron_down/0.png')"></div>	
			{:else}
				<div on:click="{() => $onscreen.loadingZoneMinimized = true}" class="catTools open zoomRotate" style="right: -3%; width: 75px; height: 51px; background-position: -75px 0px; background-image: url('data/textures/cats/symbols-icons/arrows~chevron_down/0.png')"></div>					
			{/if}
	</div>


	<div on:click="{loadingZoneEdit}" class="edit {(editMode == 'close editing' ? 'close_editing' : '')}  {($onscreen.loadingZoneMinimized? 'loadingMinimized' : 'loading')}" style="width: 75px; height: 63px; background-position: -150px -600px; background-image: url('data/textures/e/edit/0.png')"></div>
	<div class="label {(editMode == 'close editing' ? 'close_editing' : '')}  {($onscreen.loadingZoneMinimized? 'loadingMinimized' : 'loading')}">{editMode}</div>
	
	
{/if}
		
<div class="icons flex-grid {($onscreen.loadingZoneMinimized? 'loadingMinimized' : 'loading')}  {(pic && pic.length > 0 ? 'small' : 'full')}">	
			
		{#if $onscreen.selectedIcons && $onscreen.selectedIcons.length > 0 }
	
			{#each $onscreen.selectedIcons as icon, y}
			
				<div data-cat={icon.cat || 0}  class="icon top" on:click="{() => addToSelected(icon.name, icon)}" data-sort={icon.sortMe} data-license={icon.license} data-coll={icon.coll} data-selected={icon.selected} data-filename={icon.name} data-index={icon.index} >	

				<div class="thumbImage" style="width:{icon.pos[0]}px; height: {icon.pos[1]}px; background-position: {icon.pos[2]}px {icon.pos[3]}px; background-image:url(data/textures/{icon.url}.png);opacity:{(editMode == 'edit' ? '1': '.4')}" > </div>	
				
				<div class="editMode" on:click="{() => removeThumb(icon.name, y, event)}" style="display:{(editMode == 'edit' ? 'none': 'block')}"></div>
			
				</div>
		
			{/each}
		{/if}
	</div>		
		
	{#if pic && pic.length > 0}
		
			<div class="icons flex-grid {($onscreen.selectedIcons && $onscreen.selectedIcons.length  > 0 && !$onscreen.loadingZoneMinimized ? 'medium' : 'full')}">		
				<div><h2>click to select</h2></div>			
				{#each pic as icon, y}
			
					<div data-cat={icon.cat || 0} style="{(icon.selected == true ? ' display: none': '' )}"  on:click="{() => addToSelected(icon.name, icon)}" class="icon bottom" data-license={icon.license} data-coll={icon.coll} data-selected={icon.selected || ''} data-filename={icon.name} data-index={icon.index} data-y={y} >	

					<div class="thumbImage" style="width:{icon.pos[0]}px; height: {icon.pos[1]}px; background-position: {icon.pos[2]}px {icon.pos[3]}px; background-image:url(data/textures/{icon.url}.png" > </div>				
					</div>
			
				{/each}

			</div>
		
		{/if}
		
	<!-- {/if} -->
	
	<!-- if $onscreen.memeBuilder -->
	{/if}
	

	
{#if $onscreen.avatarBuilder}

		<div class="icons flex-grid">	
			
		{#if document.getElementsByClassName('top').length > 0 && $onscreen.selectedThumbs}
				<div><h2>click to remove</h2></div>	
		{/if}

		{#each pic as icon, y}
		
			{#if icon.selected}

				<div data-cat={icon.cat || 0} on:click="{() => removeFromSelectedAvatars(icon.name, icon.index, icon)}" class="icon top" style="order: {y}" data-license={icon.license} data-coll={icon.coll} data-selected={icon.selected} data-filename={icon.name} data-index={icon.index} >	

					<svg style="filter:url(#glow{y})" id="svg{y}" width="80px" height="80px" preserveAspectRatio='xMidYMid'>
					 
						<Filter {y} /> 

						<AvatarIcon aspect={"xMidYMin"} uid={""} name={partsChooser.part} num={y}2  colorObj={$colorObj}  {icon} />			
			</div>
			{/if}
		{/each}
		</div>
		 
		<div class="icons flex-grid">		
			<div><h2>click to select</h2></div>			
			{#each pic as icon, y}

				{#if !icon.selected}

						<div data-cat={icon.cat || 0} style="order: {y}"  on:click="{() => selectForAvatars(icon.name, icon.index, icon)}" class="icon bottom" data-license={icon.license} data-coll={icon.coll} data-selected={icon.selected || ''} data-filename={icon.name} data-index={icon.index} >	

						{#if $onscreen.pngThumbs}
							<img src="data/art_pngs/{icon.coll}/{icon.name}.png" width="75" height="75" />
						
						{:else}
						
							<svg id="svg{y}" width="80px" height="80px" preserveAspectRatio='xMidYMid'>

								{#if icon.selected}
									<Filter {y} />
								{/if}

								<AvatarIcon aspect={"xMidYMin"} uid={""} name={partsChooser.part} num={y}2  colorObj={$colorObj}  {icon} />

							</svg>	

						{/if}
						</div>
						
				{/if}
			
			{/each}
			
			</div>

<!-- end if $onscreen.avatarBuilder -->

	{/if}
	
</div>

{/if}

</div>

	<!-- 

div partsWrapper
if partsLoader
div partsChooser
if avatarBuilder
div icons flex-grid
each pic

-->


<!-- on:click="{() => changeMode(y)}" 

<img src="data/art_pngs/{icon.coll}/{icon.name}.png" width="75" height="75" />

-->
