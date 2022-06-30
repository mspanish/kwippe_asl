<script >

import { onMount } from 'svelte';
import { sample, removeFrom } from '../scripts/utilities.js';
import AutoComplete from "simple-svelte-autocomplete";
//import {  handSwaps, characterColors, kwippeSignSchema, bodypartNumbers, regionKeys, customSigns, customRegions, words, regionPositions, asl2englishOverrides, aslLexOverrides, noGoodChoice } from '../stores.js';
import { aslObj, kwippeWordMenu } from '../store.js';
//import { characterColors, handSwaps, kwippeSignSchema } from '../store.js';
let numberPositions;
let kwippeData = true;
//let aslLexData = false;
//let asl2EnglishData = false;
let kwippeSignsObj = {};
let words = [];
let kwippeRandomize = true;
let curSigndata;
let frame = 0;
let signIndex = 0;
let base = './3d/'
let open_pose;
let pText;
let armAngle = {
		right: 0,
		left: 0
}
let jsonFile = '';
let setConsultant = false;
let defaultSigner = "tyler";
let consultants = {
	//dana:  { color: '03fdfc'}, // didn't capture any elbows for her so she's just like a head with hands, lol
	naomi: { color: 'FF69B4'},
	tyler: { color: '000000'},
	liz:   { color: 'FF6F61'},
	brady: { color: '34568B'},
	lana:  { color: 'EFC050'}	
}

export let word;

/* functions here:

 checkKwippeData 							(not async)
 	- builds the kwippeWordMenu array based on the kwippeSignsObj

 createKwippeSignsObj()					 	(not async)
 	- builds the data object kwippeSignsObj used to build the menu of signs done by the various consultants
 
 getKwippeSignArr(kwippeRandomize) 			async
 	- creates data & runs createKwippeSignsObj(d)
 
 getKwippeSignData(url)						async
 	-	gets the actual ai JSON for the sign, done by a consultant. 
 	Returns [frame, kwippeData, curSigndata, color], and the end of this should trigger getWordKwippe()

 getKwippeWordDirectory(word)				async
 	-	gets the JSON directory for that word, then opens additional data file based on which type it is, asl2English or aslLex. Runs createKwippeSignsObj(d.openData) and checkKwippeData(word);

 loadAsl2EnglishDefs						async
 	- gets asl2English defs for a word and returns data to asl2EnglishData

 loadAslLexDefs								async
 	- get aslLex defs for a words and returns the data

 loadWordsDatabase							async
 	- returns ./kwippe_signs_allwords.json data as json

*/

onMount(async() => {
	loadWordsDatabase();
});

let loadWordsDatabase = async() => {
	const res = await fetch('./kwippe_signs_allwords.json');
	let w = await res.json();
    words = w;
    return w
}

let getKwippeSignArr = async(kwippeRandomize) => {
	let f = './kwippe_signs.json';
	const res = await fetch(f);
	let d = await res.json();
	///console.log('fetched kwippe_signs.json');
	//console.log(d);
	let url = d[signIndex];
	if (kwippeRandomize) {
		url = sample(d);
	}
	createKwippeSignsObj(d);
	
	/* as we try making this data available to cross check against aslLex/asl2English, we'll forgo loading the character and just create a menu of available files to load once a word is loaded from the asl_merged.json file. First let's  */ 
	
	//getKwippeSignData(url);
}

let getKwippeWordDirectory = async(word) => {
	if (!word) return
	console.log('getKwippeWordDirectory word is '+word);
	console.log('shortWord is '+word[0]);
	let shortWord = word[0];
	let f = `/directories/${shortWord}/${word}_dir.json`;
	console.log('getting word directory for '+word);
	console.log('path is '+f);
	const res = await fetch(f);
	let d = await res.json();
	//getKwippeSignData(url);
	//console.log(JSON.stringify(d));
	createKwippeSignsObj(d.openData);
	if (d.aslLex[0]) loadAslLexDefs(d.aslLex[0]);
	if (d.asl2English[0]) loadAsl2EnglishDefs(d.asl2English[0]);
	checkKwippeData(word);
}

let loadAslLexDefs = async(url) => {
	if (!url) return
	let source = 'asllex';
	const res = await fetch('./'+source+'/'+url+ '.json');
	let d = await res.json();
	$aslObj.aslLexData = d;
	//console.log('we have aslLexData '+JSON.stringify(aslLexData));
	// calling fn should return this to aslLexData
}

let loadAsl2EnglishDefs = async(url) => {
	if (!url) return
	let source = 'asl2english';
	const res = await fetch('./'+source+'/'+url+ '.json');
	let d = await res.json();	
	$aslObj.asl2EnglishData = d;
	//console.log('we have asl2EnglishData '+JSON.stringify(asl2EnglishData));	
}

let getKwippeSignData = async(url) => {
//	if (!character) return
	console.log('getKwippeSignData, url: '+JSON.stringify(url));
	let source = 'opendata';
	const res = await fetch('./'+source+'/'+url+ '.json');
	let d = await res.json();
	//console.log(d);
	let frame = 0;
	let kwippeData = true;
	let curSigndata = d;
	// switch out shirt for our signer
	let color = consultants[d.signer.toLowerCase()].color;
	//var slot = skin.skeleton.findSlot('body');
	//slot.color.setFromString(color);	
	$aslObj = $aslObj || {};
	$aslObj.word = word;
	$aslObj.frame = frame;
	$aslObj.kwippeData = kwippeData;
	$aslObj.curSigndata = curSigndata; 
	$aslObj.color = color;
	//console.log(arr);
	console.log('full data for word '+word);
	//console.log(JSON.stringify($aslObj));
//	getWordKwippe();
	$aslObj.newWordFlag = true;
}

let createKwippeSignsObj = (data) => {
	//{label: text, url: sign.url, signer: sign.signer}
	let j = 0;
	for (let w of data) {
		//console.log('string is '+w);
		let url = w;
		w = w.split('_');
		//watermelon_Brady_189286_3
		let lenny = w.length-1;
		let signer = w[lenny-2];
		w.splice(lenny-2, 3);
		//console.log('spliced: '+w)
		let key = w.join('-');
		if (kwippeSignsObj[key] == undefined) {
			kwippeSignsObj[key] = [];
		}
		kwippeSignsObj[key].push({url: url, signer: signer});
		//console.log('url is '+url)
		//console.log('w is now '+w);
		//console.log('signer is now '+signer);
		//if (j == 2) return
		j++
	}
}

let checkKwippeData = (text) => {
	//console.log('checking kwippeSignObj for '+text);
	$kwippeWordMenu = [];
	let arr = [];
	let loaded = false;
	let e = 0;
	let first;
	
	if (kwippeSignsObj[text]) {
		//console.log('found this sign in kwippeSignsObj! '+text);
		
		/* if I've selected a default signer and they did this word, load it. Otherwise load the first signer's version */
		
		for (let sign of kwippeSignsObj[text]) {
			if (e == 0) first = sign.url;
			let obj = {label: text, url: sign.url, signer: sign.signer};
			arr.push(obj);
			if (sign.signer.toLowerCase() == defaultSigner && !loaded) {
				getKwippeSignData(sign.url);
				loaded = true;
			}
			e++;
		}
	}
	if (!loaded && first) {
		getKwippeSignData(first);
	}
	$kwippeWordMenu = arr;
}

//export {loadWordsDatabase, getKwippeSignArr, getKwippeWordDirectory, loadAslLexDefs, loadAsl2EnglishDefs, getKwippeSignData, createKwippeSignsObj, checkKwippeData }

</script>


<li class="pure-menu-item">
        words:
</li>
{#if  words && words.length > 0 }
	<li class="pure-menu-item">
		<AutoComplete  
		items="{words}" 
		delay="500"
		bind:onChange="{getKwippeWordDirectory}" 
		bind:selectedItem="{word}" 
		sortByMatchedKeywords="false"
		minCharactersToSearch="1"
		/>
	</li>
{/if}	


{#if $kwippeWordMenu.length > 0}
	<li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
		<span class="pure-menu-link">kwippe signs</span>
	    <ul class="pure-menu-children ">
	        {#each $kwippeWordMenu as s}
	        	<li class="pure-menu-item">
	              	<span on:click={ () => getKwippeSignData(s.url) } class="pure-menu-link">{s.label} by {s.signer}</span>
	            </li>
	        {/each}

	    </ul>
	</li> 


{/if} 	

<style>
.pure-menu-children {
    display: none;
    width: 200px;
    position: relative;
    left: 5%;
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

</style>