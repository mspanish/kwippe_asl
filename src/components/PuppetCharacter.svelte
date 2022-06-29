<script >
import '@mszu/pixi-ssr-shim'; // <----------------- IMPORTANT
import { onMount } from 'svelte';
import { sample, removeFrom } from '../scripts/utilities.js';
import { randomizeKwippe, changeHand } from '../scripts/puppet_bodyparts.js';
//import {  handSwaps, characterColors, kwippeSignSchema, bodypartNumbers, regionKeys, customSigns, customRegions, words, regionPositions, asl2englishOverrides, aslLexOverrides, noGoodChoice } from '../stores.js';
import { aslObj, characterColors, handSwaps, kwippeSignSchema } from '../store.js';
import * as PIXI from 'pixi.js'; 
//import * as PIXI from 'pixi.js-legacy'

import { resetPuppet, rotateArm, rotateElbow, rotateHand, flipHand, resetHand, mirror, loadFrame } from '../scripts/puppet_movement.js';

import { Spine, TextureAtlas } from 'pixi-spine';

//::LISTENER #1:: so whenever the word is updated this should run...
$: { 
	if ($aslObj.newWordFlag == true) {
		getWordKwippe();
		$aslObj.newWordFlag = false;
	}
}

let view;
let app;

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

$aslObj.gender = 'female';
$aslObj.PIXI = PIXI;

let chardef = 'girl_black';//girl_shorthair'; //happy_alien'; //'guy'; //dude, guy
$aslObj.bodyColor =  '#FFBE96';// '#764630';
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
		   forceCanvas:false,
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
		.add('hairfront', 'spine/hair_'+$aslObj.gender+'.json')
		.add('eyebrows', 'spine/eyebrows_'+$aslObj.gender+'.json')
		.add('clothes', 'spine/clothes_'+$aslObj.gender+'.json')	    
		.add('mouths', 'spine/mouths.json')	  
		.add('nose', 'spine/nose.json')	 
		.add('ears', 'spine/ears.json')	 	     	      
		.add('hairback', 'spine/hairback_'+$aslObj.gender+'.json')
		.add('eyesiris', 'spine/eyesiris.json')	  
		.add('eyesfront', 'spine/eyesfront_'+$aslObj.gender+'.json')	   
		.add('eyesback', 'spine/eyesback_'+$aslObj.gender+'.json')	
		.add('faceshape', 'spine/faceshape.json')	   	     
		.add('body_female', 'spine/body_female.png')

		.load(function (loader, resources) {
			character = new Spine(resources.spineCharacter.spineData);
			skin = new Spine(resources.spineSkin.spineData);	

			let middle = character.width/2;
			character.height - container.height * .75;
			character.y = 10;
			skin.y = 10
			container2.addChild(skin);	
			container.addChild(character);

			var slot = skin.skeleton.findSlot('clothes_bottom');
			slot.color.setFromString('#6a1ff1');		
			app.start();
			$aslObj.character = character;
			$aslObj.skin = skin;
			randomizeKwippe(true, $characterColors, $aslObj);
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
	changeHand(false, h, h2, noSwap, $aslObj, $handSwaps);
	$aslObj.numberPositions = Array.from({ length: d.num_positions }, (val, key) => key);
	
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
	loadFrame($aslObj);
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