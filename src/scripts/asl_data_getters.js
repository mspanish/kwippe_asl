<script context="module">

import { sample, removeFrom } from './utilities.js';
import AutoComplete from "simple-svelte-autocomplete";
//import {  handSwaps, characterColors, kwippeSignSchema, bodypartNumbers, regionKeys, customSigns, customRegions, words, regionPositions, asl2englishOverrides, aslLexOverrides, noGoodChoice } from '../stores.js';

//import { characterColors, handSwaps, kwippeSignSchema } from '../store.js';

let kwippeSignsObj = {};
let kwippeWordMenu = [];

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


let loadWordsDatabase = async() => {
	const res = await fetch('./kwippe_signs_allwords.json');
	let w = await res.json();
    //$words = w;
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
	//aslLexData = d;
	// calling fn should return this to aslLexData
	return d
}

let loadAsl2EnglishDefs = async(url) => {
	if (!url) return
	let source = 'asl2english';
	const res = await fetch('./'+source+'/'+url+ '.json');
	let d = await res.json();	
	//asl2EnglishData = d;
	return d
}

let getKwippeSignData = async(url) => {
	if (!character) return
	//console.log('getKwippeSignData, url: '+JSON.stringify(url));
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
	return [frame, kwippeData, curSigndata, color];

//	getWordKwippe();
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
	kwippeWordMenu = [];
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
	kwippeWordMenu = arr;
}


//export {loadWordsDatabase, getKwippeSignArr, getKwippeWordDirectory, loadAslLexDefs, loadAsl2EnglishDefs, getKwippeSignData, createKwippeSignsObj, checkKwippeData, createKwippeSignsObj, kwippeSignsObj }

</script>