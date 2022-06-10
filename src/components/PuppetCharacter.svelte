<script >
import '@mszu/pixi-ssr-shim'; // <----------------- IMPORTANT
import { onMount } from 'svelte';
import { sample, removeFrom } from '../scripts/utilities.js';
//import {  handSwaps, characterColors, kwippeSignSchema, bodypartNumbers, regionKeys, customSigns, customRegions, words, regionPositions, asl2englishOverrides, aslLexOverrides, noGoodChoice } from '../stores.js';
import { aslObj, characterColors, handSwaps, kwippeSignSchema } from '../store.js';
//import * as PIXI from 'pixi.js'; 
import * as PIXI from 'pixi.js-legacy'

import { Spine, TextureAtlas } from 'pixi-spine';

let view;
let app;
let numberPositions;
let kwippeRandomize = true;
let curSigndata;
let frame = 0;
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

onMount(async() => {
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
		});	 // first app loader
	});	 // end app loader
} // end addCharacter()

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