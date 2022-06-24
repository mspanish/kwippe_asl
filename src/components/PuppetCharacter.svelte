<script >
import '@mszu/pixi-ssr-shim'; // <----------------- IMPORTANT
import { onMount } from 'svelte';
import { sample, removeFrom } from '../scripts/utilities.js';
//import {  handSwaps, characterColors, kwippeSignSchema, bodypartNumbers, regionKeys, customSigns, customRegions, words, regionPositions, asl2englishOverrides, aslLexOverrides, noGoodChoice } from '../stores.js';
import { aslObj, characterColors, handSwaps, kwippeSignSchema } from '../store.js';
//import * as PIXI from 'pixi.js'; 
import * as PIXI from 'pixi.js-legacy'

import { resetPuppet, rotateArm, rotateElbow, rotateHand, flipHand, resetHand, mirror } from '../scripts/puppet_movement.js';

import { Spine, TextureAtlas } from 'pixi-spine';

//::LISTENER #1:: so whenever the word is updated this should run...
$: { 
	if ($aslObj.word) {
		getWordKwippe();
	}
}

let view;
let app;
let numberPositions;
let kwippeRandomize = true;
//let curSigndata;
//let frame = 0;
let signIndex = 0;
let open_pose;
let pText;
let armAngle = {
		right: 0,
		left: 0
}
let jsonFile = '';
let container,container2;
let character;
let skin;

let gender = 'female';
let chardef = 'girl_black';//girl_shorthair'; //happy_alien'; //'guy'; //dude, guy
let bodyColor =  '#FFBE96';// '#764630';
let characterIndices = {
	eyesiris: 0,
	eyesfront: 0,
	mouth: 0,
	nose: 0,
	clothes: 0,
	eyebrows: 0,
	ears: 0,
	hair: 0,
	face: 0
} 
let bodyparts = [];
let selectedPart = 'hairfront';
let scaleFactor = .01;
let moveFactor = .03;
let partStartValues = {
	face: {
		scale: {}, 
		move: {}
	}
};
let armData = {
	left: {
		arm: 0,
		arm_bottom: 0,
		hand: {
			flipX: false,
			flipY: false,
			palmfaces: {},
			rotation: false
		},
	},
	right: {
		arm: 0,
		arm_bottom: 0,
		hand: {
			flipX: false,
			flipY: false,
			palmfaces: {},
			rotation: false
		}	
	}
};


onMount(async() => {
	$aslObj.selectedArm = 'right';
	$aslObj.character = character;
	$aslObj.bothHands = false;
	$aslObj.armData = armData;

	//console.clear();
	let w = 600;
	let h = 800;
	app = new PIXI.Application({
		  // renderer: canvas,
		   view: view, 
		   forceCanvas:true,
		   width: w,
		   height: h,
		   transparent:true, antialias: true
		
	});
	app.stage.interactive = false;// This can't be forgotten 
	//app.renderer.plugins.interaction.cursorStyles.default = 'crosshair'
	// arms only
	container = new PIXI.Container();
	container.x = 75;
	container.y = 68;
	//head body
	container2 = new PIXI.Container();		
	container2.x = 300;
	container2.y = 150;
	app.stage.addChild(container2);
	app.stage.addChild(container);
 	addCharacter();
});

let addCharacter = () => {
	let images = {};
	let files = [];

	var loader = new PIXI.Loader();

	loader
	.add('skinData', 'spine/'+chardef+'/kwippe.json')	
	.load(function (loader, resources) {	
		console.log('loader')
	//console.log(resources.skinData)
		let textures = resources.skinData.data.skins[0].attachments; //.default;
		var atlas = new TextureAtlas();
		for(let i in textures) {
			let img =  PIXI.Texture.from('./spine/'+ chardef +'/'+i+ '.png');
			images[i] = img
		}
		bodyparts = Object.keys(images);
		bodyparts.sort();
		//console.log('keys for images atlas '+Object.keys(images));
		atlas.addTextureHash(images, true);

		var spineLoaderOptions = { metadata: { spineSkeletonScale: .60 } };
		var skinLoaderOptions = { metadata: { spineSkeletonScale: .25, spineAtlas: atlas } };	
		
		app.loader
		.add('spineCharacter', 'spine/boy_template_layered_joints_shoulder.json', spineLoaderOptions)
		.add('spineSkin', 'spine/'+chardef+'/kwippe.json', skinLoaderOptions)	
		.add('hairfront', 'spine/hair_'+gender+'.json')
		.add('eyebrows', 'spine/eyebrows_'+gender+'.json')
		.add('clothes', 'spine/clothes_'+gender+'.json')	    
		.add('mouths', 'spine/mouths.json')	  
		.add('nose', 'spine/nose.json')	 
		.add('ears', 'spine/ears.json')	 	     	      
		.add('hairback', 'spine/hairback_'+gender+'.json')
		.add('eyesiris', 'spine/eyesiris.json')	  
		.add('eyesfront', 'spine/eyesfront_'+gender+'.json')	   
		.add('eyesback', 'spine/eyesback_'+gender+'.json')	
		.add('faceshape', 'spine/faceshape.json')	   	     
		.add('body_female', 'spine/body_female.png')

		.load(function (loader, resources) {
			character = new Spine(resources.spineCharacter.spineData);
			skin = new Spine(resources.spineSkin.spineData);	

			let middle = character.width/2;
			character.height - container.height * .6;

			container2.addChild(skin);	
			container.addChild(character);

			var slot = skin.skeleton.findSlot('clothes_bottom');
			slot.color.setFromString('#6a1ff1');		
			app.start();
			$aslObj.character = character;
		});	 // first app loader
	});	 // end app loader
} // end addCharacter()

/* key FN, populates the menu of signers for kwippe signs for given word	 */

let getWordKwippe = () => {
	console.log('running getWordKwippe')
	let h,h2;
	let d = $aslObj.curSigndata;
	// leave swaps in place for this data
	let noSwap = false;
	//console.log(JSON.stringify(d.handshapes));
	if ($aslObj.frame == 0) {
		h = d.handshapes.begin.d;
		h2 = d.handshapes.begin.nd;
	}
	else {
		h = d.handshapes.end.d;
		h2 = d.handshapes.end.nd;
	}
	changeHand(false, h, h2, noSwap);
	numberPositions = Array.from({ length: d.num_positions }, (val, key) => key);
	
	/* debugging
	
	let part = 'wrist';
	let armShort = 'r';
	
	let d1 = d.positions[0][part][armShort].aClicks;	
	let d2 = d.positions[1][part][armShort].aClicks;	
	let d3 = null;
	if (d.positions[2] && d.positions[2][part][armShort].aClicks) {
		d3 = d.positions[2][part][armShort].aClicks;
	}
	console.log('frames check0: '+d1);
	console.log('frames check1: '+d2);
	console.log('frames check2: '+d3);
	*/
	// comment out until you figure out where these functions should go, the controls will load in the side panel
	// loadFrame();
}

/* key fn! Once all of our data is converted to kwippe style data using angles rather than regions, this is all it will take to load any frame. All other fns doing this stuff should be moved once data is converted */

let loadFrame = () => { 
	if (!$aslObj.character) {
		console.log('cant load frame no character');
		return
	}
//	console.log('loading frame '+frame+ ' for '+curSigndata.word);
	let d = $aslObj.curSigndata;
	changeMouth(d.sign);
	let aClicks, angleDirection;
	let arms = ['right', 'left'];	
	let parts = ['elbow', 'wrist', 'hand'];	
	
	resetPuppet(false);

	//word.sign = d.word;

	for (let arm of arms) {

		for (let part of parts) {
			let armShort = arm[0];
			let data = d.positions[frame][part][armShort];	
			aClicks = data.aClicks;
			angleDirection = data.angleDir;
		
			if (part == 'elbow') { // equivalent to part 'arm' in our original run			
				for (let i = 1; i <= aClicks; i++) {
					//console.log(i+ ' roArm>>>>>>>>>>>. angleDir is '+angleDirection);
					rotateArm(angleDirection, arm);
				}
			}
			if (part == 'wrist') {  // equivalent to part 'elbow' in our original run
				for (let i = 1; i <= aClicks; i++) {
					//console.log(i+ ' roElbow>>>>>>>>>>>. angleDir is '+angleDirection);
					rotateElbow(angleDirection, arm);
				}
			}
			if (part == 'hand') {
				//console.log('ignoring hand, aClicks: '+aClicks)
				for (let i = 1; i <= aClicks; i++) {
					//console.log(i+ ' roHand>>>>>>>>>>>. angleDir is '+angleDirection);
					//rotateHand('incr'+angleDirection,arm);
				}
				if (data.thumb_angle.angleReverse) {
					// seems like I need certain conditions here as this is causing some things to flip that perhaps are already flipped due to their position - need to check this
					//console.log('got a flipX!');
					flipHand('x',arm);
				}		
			}
		} // end for parts 
	} // end for arms	
}

let changeHand = (signdata, h, h2, noSwap) => {
	if (!$aslObj.character) return
	let pos = 'begin';
	if ($aslObj.frame > 0) pos = 'end';
	/* if opendata has nada, try aslLex */
	
	if (!h && $aslObj.aslLexData) h = $aslObj.aslLexData.handshapes[pos].d;
	if (!h2 && $aslObj.aslLexData) h2 = $aslObj.aslLexData.handshapes[pos].nd;
	//console.log(JSON.stringify(aslLexData))
	
	/* neither have data, try asl2English. May be better to always deafult to these */
	if (!h && $aslObj.asl2EnglishData) {
		h = $aslObj.asl2EnglishData.handshapes[pos].d; 
		noSwap = true;
	}
	if (!h2 && $aslObj.asl2EnglishData) {
		// this hand data is messy due to their inconsistent nested arrays system, so let's only add the ND hand if we're sure it's not a 1 handed sign
		if ($aslObj.asl2EnglishData.hands > 1) {
			h2 = $aslObj.asl2EnglishData.handshapes[pos].nd; 
			noSwap = true;
		}
		//console.log(JSON.stringify(asl2EnglishData.handshapes))
	}
	//console.log('dominant hand is '+h);
	//console.log('non dominant hand is '+h2);
		
	if (!h) {
		$aslObj.character.skeleton.setAttachment("hand_right",'23');
		// we don't return here because we need to look at the other hand
	}
	else {
		h = h.toString().toLowerCase().replace('_', '-');
		//console.log('dh is '+h)
		if (!noSwap) h = $handSwaps[h];
		if (h) $aslObj.character.skeleton.setAttachment("hand_right",h);
		if (!h) $aslObj.character.skeleton.setAttachment("hand_right",'23');
	}
	
	if (!h2) {
		$aslObj.character.skeleton.setAttachment("hand_left",'23');
		colorHands();
		return
	}
	h2 = h2.toString().toLowerCase().replace('_', '-');
	//console.log('nd2 is '+h2)
	if (!noSwap) h2 = $handSwaps[h2];
	if (h2) $aslObj.character.skeleton.setAttachment("hand_left",h2);
	if (!h2) $aslObj.character.skeleton.setAttachment("hand_left",'23');
	colorHands();
} 

let colorHands = (color) => {
	if (!color) color = bodyColor;
	var slot = $aslObj.character.skeleton.findSlot('hand_right');
	slot.color.setFromString(color);	
	slot = $aslObj.character.skeleton.findSlot('hand_left');
	slot.color.setFromString(color);	
}


</script>

<style>
	#character_canvas {
		z-index: 10;
		position: absolute;
		margin-left:  100px;
		margin-top:  50px;
	}
</style>

<canvas id="character_canvas" bind:this={view}/>