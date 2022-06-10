<script>
"use strict";
   
export const prerender = false;
import '@mszu/pixi-ssr-shim'; // <----------------- IMPORTANT	1
import { onMount } from 'svelte';
//import Counter from '$lib/Counter.svelte';
//import { absolutize, parse, normalize } from '../scripts/svgHelpers.js';
import { sample, removeFrom } from '../scripts/utilities.js';
//import { hexToRgb } from '../scripts/colorConverters.js';
//import { trimCanvas } from '../scripts/canvas_trimming.js';
//import AutoComplete from "simple-svelte-autocomplete";
//import {  handSwaps, characterColors, kwippeSignSchema, bodypartNumbers, regionKeys, customSigns, customRegions, words, regionPositions, asl2englishOverrides, aslLexOverrides, noGoodChoice } from '../stores.js';
//import * as PIXI from 'pixi.js';
//import * as PIXI from 'pixi.js-legacy'

//import { Spine, TextureAtlas } from 'pixi-spine';
//import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js';   


let app;

let selected;
let character; // holder for spine data to manipulate, switch out hands, colors, etc
let skin; //holder for skin (hair, body, mouth, eyes, nose, etc - all but arms and hands)
let region_data; 

let selectedRegion = 'move to region';
let highlightedRegions = [];
let regionData = [];
let sign = '';
let numberSigns = 0;
let numberHands = 1;
let right, left, right1, left1;

let container, container2;

let currentSignSchema = {}; //placeholder for our sign's data 
let bothHands = false; // whether new shapes should apply to 1 or both hands
let showHandshapes = false;
let selectedArm = 'right';
let activePalmface = false;
let activeArm = '';
// tracking which positions have already got data set
let positionsSet = {};
let hoverPosition;
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
/*
what I need from kwippe to easier manipulate the defs here:

1- shirt color
2- shirt number - maybe load from my end if not long enough?
3- hair number
4- skin color (for hands)
5- glasses (need skeleton first by creating a kwippe with these on)

~2- mouth~
~4- adjust hair~
~5- adjust hand colorizing in Spine - would probably be best to externalize hand graphics~
~[NO, BAD IDEA]9- externalize ALL png assets, probably don't need 300DPI either, check and see~
~1- nose~
~2- ears~
~1- eyebrows~
~2- clothes~
[LATER] 5- see about 2 tone tinting? Maybe via Pixi so white stays white

*/
	
let i = 0;
let word = 'a'
/* important! sets which handshapes from the subarrays our puppet will have */
let currentPosition = 0;

let activePath = "";

let flips = ['temple', 'thigh', 'hand', 'wrist', 'arm', 'arm_bottom', 'upper-arm']
let regions = [];
let puppet = {
	width: 287.5,
	height: 450	
}

let extract = '';

let armData = {
	/*regions is a new idea where I set e                                                                           ach arm's position based on what region the elbow and hand are actually in. So, elbow is in 'right' and hand is in 'chin' would tell us how to do both the arm and the hand, and if is a hand rotation for the word that will be set too.
	
	Using the data from asl-lex and asl2english I'm finding the words too spotty, while asl2english is better, I'm having to make a ton of adjustments. Lots of words are just plain wrong - and every single word in my database is going to need adjusting. Using exact rotations is a really bad idea, but I think I can get away with 2 regions per side - it's awfully hit and miss otherwise as a lot of supposedly 1.5 handed signs actually DO have a position for the left.
	
	2 regions presets instead of 1 will give me a lot more flexibility - right now I'm writing and entire system for data that seems pretty erratic and was never intended to help you create the sign from the data, it was just made to help you identify the sign from the data - which is really different. Even some of the motion data seems unhelpful = so at this point it seems quicker to create my own system and code each word from scratch. It will be slow to get to a few hundred words but right now I can't load these words as is - too many of them fail.
	
	So sign specific is for the custom code for that hand. The handshapes will autofill from the current handshapes, and update if you change them. Regions is a new object where each hand will have a new region variable consisting of: handRegion_elbowRegion for each position. So for example, chest_middle-right.
	
	I'll need to code these regions just once - there will be a lot for some regions like chest, and fewer for others. In the end this will be a far better system than trying to alter my code every time another word can't be correctly drawn from the data alone provided in asl2english or aslLex. Yet it will remain flexible and not be tied to coordinates used by this particular skeleton system. The palmface rotations are the only part that will be an absolute rotation number, but since the asl2english words all have a palmface, I may be able to generalize some there, but some signs may just need 100% customization to look perfect.
	signData.handshapes[0] - dominant
	signData.handshapes[1] - non
	signData.regions[selectedArm][currentPosition]
	
	Also remember you need to use regions on the LEFT for left, right for right, unless you want to cross over. The old system didn't give an actual region for the nondominant hand - it was supposed to just somehow follow some rules for when it as a base, etc - but I found that in reality this resulted in
	
	My system of setting a region per hand per position should be far more accurate, and once the regions are set it's just a matter of running signs and clicking to choose the regions for each hand (which will add them the puppet for a visual look 
	
	*/
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

let ttWords = ["a","a-little","a-lot","a_little","a_lot","airplane","all","all-done","all_done","apple","arm","b","baby","back","bad","bar","bat","bear","bicycle","bird","birthday","bite","black","blue","book","bowl","box","bread","break","brown","brush","brush-teeth","brush_teeth","bubba","build","cake","candy","careful","cat","chair","chicken","children","christmas","climb","close","cold","color","come","cookie","crackers","cup","d","dada","dance","diaper","dinosaur","dirty","disco","disco-music","disco_music","dog","down","drink","drive","duck","ear","eat","elephant","eyes","eyes-","eyes-on-you","eyes_","eyes_on_you","fast","fish","fly","fork","friend","frog","full","garbage","gentle","get","gift","giraffe","give","go","gold","good","goodbye","grain","green","h","happy","hat","head","hello","help","horse","hot","hot-hot-hot","hot_hot_hot","hungry","i", "it","dont-like", "dont_like1", "dont_like2", "like","dont_like","ice","ice-cream","ice_cream","in","jail","jello","jelly","juice","sister","jump","leg","less","listen","look","love","mad","make","mama","milk","monkey","more","mouth","movie","neck","no","nose","off","ok","on","open","orange","out","pain","pants","peanut","peanut-butter","peanut_butter","people","phone","pig","pillow","pineapple","pink","plate","play","please","plug","poop","pretty","purple","pumpkin","puzzle","quiet","quinoa","read","red","rooster","sad","sandwich","scared","seasoning","share","sheep","shirt","shoes","signing","sit","sleep","slide","slow","smart","socks","sorry","speak","split","split-up","split_up","spoon","stay","stay-there","stay_there","stinky","strawberry","swim","swing","t","table","tablet","tall","teacher","thank","thank-you","thank_you","thirsty","tickle","towel", "tree","under","up","vitamins","wait","walk","want","wash","watch","water","what","white","work","write","yellow","yes","yogurt","you"]

onMount(async() => {
	/*
	if (import.meta.hot) {
		import.meta.hot.on(
		"vite:beforeUpdate",
		() => console.clear()
		);
	}
	*/	
	console.clear();
	let w = window.innerWidth;
	let h = window.innerHeight;
	app = new PIXI.Application({
		   renderer: canvas,
		   view: canvas, 
		   forceCanvas:true,
		   width: w,
		   height: h,
		   transparent:true, antialias: true
		
	});
	app.stage.interactive = true;// This can't be forgotten 
	//app.stage.hitArea = new PIXI.Rectangle(0, 0, w, h);
	//document.body.appendChild(app.view);
	app.renderer.plugins.interaction.cursorStyles.default = 'crosshair'
		
	container = new PIXI.Container();
	container2 = new PIXI.Container();	
	app.stage.addChild(container2);
	app.stage.addChild(container);


	
	container.width = w-100;
	container.height = h;
	container.x = 0;
	container.y = 40;
	container.pivot.x = container.width / 2;
	container.pivot.y = container.height / 2;
	
	container2.width = w-100;
	container2.height = h;
	container2.x = 228;
	container2.y = 130;
	container2.pivot.x = container2.width / 2;
	container2.pivot.y = container2.height / 2;
	 
/* redundant loading but I don't see any other way to get the texture data created before loading spine skin */

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
					
					//console.log(img)
					images[i] = img
					//console.log(images[i])
				}
		bodyparts = Object.keys(images);
		bodyparts.sort();
		//console.log('keys for images atlas '+Object.keys(images));
				atlas.addTextureHash(images, true);
	//})
 
    var spineLoaderOptions = { metadata: { spineSkeletonScale: .60 } };
	var skinLoaderOptions = { metadata: { spineSkeletonScale: .25, spineAtlas: atlas } };	
	//var skinLoaderOptions = { metadata: { spineSkeletonScale: .60 } };	
  //  setTimeout(() => {
				
	app.loader
		.add('spineCharacter', 'spine/boy_template_layered_joints_shoulder.json', spineLoaderOptions)
		.add('spineSkin', 'spine/'+chardef+'/kwippe.json', skinLoaderOptions)	
	    .add('hairfront', 'hair_'+gender+'.json')
	    .add('eyebrows', 'eyebrows_'+gender+'.json')
	    .add('clothes', 'clothes_'+gender+'.json')	    
	    .add('mouths', 'mouths.json')	  
	    .add('nose', 'nose.json')	 
	    .add('ears', 'ears.json')	 	     	      
	    .add('hairback', 'hairback_'+gender+'.json')
	    .add('eyesiris', 'eyesiris.json')	  
	    .add('eyesfront', 'eyesfront_'+gender+'.json')	   
	    .add('eyesback', 'eyesback_'+gender+'.json')	
	    .add('faceshape', 'faceshape.json')	   	     
	    .add('body_female', 'body_female.png')

        
		.load(function (loader, resources) {
			character = new Spine(resources.spineCharacter.spineData);
			skin = new Spine(resources.spineSkin.spineData);	

				 
			let middle = character.width/2;
			character.height - container.height * .6;

		//mouth.sprites['mouth'].texture = images[1];
		//Region attachments are tricky: they must have width and height, specify it if your texture differs from old one
	//	Spine.hackTextureBySlotName('arm', myTexture, { width: 100, height : 100 });
 
			container2.addChild(skin);	
			container.addChild(character);
	
			//resetRegions();  
			app.start();
				   
			let color = '#ff0000';
			//var slot = skin.skeleton.findSlot('body');
			//slot.color.setFromString(color);
			     
			let num = 0;
		
			//getWords();

			//runRotationDefs();
			setTimeout(() => {
			
				randomizeKwippe(true)
	
			
				if (kwippeData) {
					//getKwippeSignArr();
					//getKwippeWords();
					loadWordsDatabase()
					//getWords();
				}
				else {
					getSignData();
				}
		    },2500);
		    
		    
		    
		    
		});	 // first app loader

		//	},1000)	

		    

	});	 // end app loader
	
	
	
}); // end onMount

// variables for our openpose puppet skeleton drawings


let editingActive = true; // too much going on right now need seperate modes for saving data and nav
let controlsActive = true;// for debugging puppet, hides controls
let ASLData;
let dataBody = {
	neckPoint:  [],
	shoulderPoint:  [],
	shoulderStatic: [],
	shoulderStatic2: [],
	wristPoints:  [],
	elbowPoints:  [],
	elbowToHandPoints:  [],
	fingerTips:  [],
	pinkyTips:  [],
	thumbTips:  []
}; // this is for values we do NOT want svelte to auto-update as they change
let debugSchema = false;
let outputJSON = false;
let outputImages = false;
let numberPositions;
let kwippeData = true;
let aslLexData = false;
let asl2EnglishData = false;
let kwippeWords = [];
let kwippeWordMenu = [];// when you load an aslLex/asl2English word, it cross checks for if in kwippe 
let kwippeSignsObj = {};
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

// end variables for openpose

/* key FN, populates the menu of signers for kwippe signs for given word	 */

let getWordKwippe = () => {
	let h,h2;
	let d = curSigndata;
	// leave swaps in place for this data
	let noSwap = false;
	//console.log(JSON.stringify(d.handshapes));
	if (frame == 0) {
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
	
	loadFrame();
}

/* key fn! Once all of our data is converted to kwippe style data using angles rather than regions, this is all it will take to load any frame. All other fns doing this stuff should be moved once data is converted */

let loadFrame = () => { 
	if (!character) {
		console.log('cant load frame no character');
		return
	}
//	console.log('loading frame '+frame+ ' for '+curSigndata.word);
	let d = curSigndata;
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

let getNewFrame = () => {
	resetPuppet();	

   if (kwippeData) {
		getWordKwippe();
	}
}

let getSampleFromRange = (lenny,begin) => {
	let range = [];
	
	if (!begin) begin = 0;
	let j = begin;
	
	while (j < lenny) {
		range.push(j)
		j++;
	}
		
	let id = sample(range);
	
	return id
}

let randomizeKwippe = (firstRun) => {
	console.log('randomiing kwippe');
	let skinArr = $characterColors[gender]['faceshape'];
	bodyColor = sample(skinArr);	
	colorHands(bodyColor);
	changeHair();
	changeEyebrows();
	changeEars();
	changeNose();	
	changeBody();
	changeFace();
	changeEyes();
	changeMouth(false,true);
	if (firstRun) {
		changeEyes(); //HACK workaround, first time I load these it throws the Spine draw order out of whack and eyesiris draws on TOP of these! arggh
		scaleHead();
	}
	changeEyesiris();	
	changeClothes();	
	colorShirt();
}

let hideBodyparts = (exclude) => {
	for (let part of bodyparts) {
		// don't hide this part if we're troubleshooting
		if (part == exclude) continue;
		skin.skeleton.setAttachment(part, null);
	}			
}
/* begin bodypart SCALE */

let scaleHead = (amount) => {
	if (!amount) amount = .92;
	let el = skin.skeleton.findBone('faceshape');
	el.scaleX = el.scaleX * amount;
	el.scaleY = el.scaleY * amount;
}
/* begin bodypart COLOR */

let colorEyebrows = (color) => {
	if (!color) color = '#331800';
	var slot = skin.skeleton.findSlot('eyebrows');
	slot.color.setFromString(color);	
}

let colorHands = (color) => {
	if (!color) color = bodyColor;
	var slot = character.skeleton.findSlot('hand_right');
	slot.color.setFromString(color);	
	slot = character.skeleton.findSlot('hand_left');
	slot.color.setFromString(color);	
}

let colorShirt = (color) => {
	 let arr = ["arm_left_top_joint","arm_right_top_joint","arm_left_bottom","arm_left_top", "arm_right_bottom","arm_left_sleeve","arm_right_top","arm_right_sleeve", "clothes", "clothes_bottom" ];
	if (!color) color = $characterColors[gender]['glasses'];
	color = sample(color);
	for (let el of arr) {
		var slot = character.skeleton.findSlot(el);
		if (el.includes('clothes')) slot = skin.skeleton.findSlot(el);
		slot.color.setFromString(color);	
	}
}

let colorFace = (color) => {
	if (!color) color = bodyColor;
	let face = skin.skeleton.findSlot('faceshape');
	face.color.setFromString(color);//'#0000ff');
	let body = skin.skeleton.findSlot('body');
	body.color.setFromString(color);
	let eyesfront = skin.skeleton.findSlot('eyesfront');
	eyesfront.color.setFromString(color);
	
	let nose = skin.skeleton.findSlot('nose');
	nose.color.setFromString(color);
	let ears = skin.skeleton.findSlot('ears');
	ears.color.setFromString(color);			
}

let colorEyesiris = (color) => {
	if (!color) color = sample($characterColors[gender]['eyesiris']); 
	let eyesiris = skin.skeleton.findSlot('eyesiris');
	eyesiris.color.setFromString(color);
}

/* end COLOR */


/* begin Kwippe controls  */

let resetPart = (part) => {
	if (!part) {
		part = selectedPart;
	}
	if (part == 'faceshape') part = 'face';
	if (part == 'head') part = 'faceshape';
	// nothing's been changed, exit

	console.log('resetting part: '+part);
	if (!partStartValues[part]) return

	let arr = ['scale', 'move'];
	let scaleX, scaleY, x, y;

	for (let t of arr) {
		if (partStartValues[part][t] && t == 'scale') {
			scaleX = partStartValues[part][t].x || false;
			scaleY = partStartValues[part][t].y || false;			
		}
		if (partStartValues[part][t] && t == 'move') {
			x = partStartValues[part][t].x || false;
			y = partStartValues[part][t].y || false;			
		}		
	}

	if (part == 'face') {
		let slot = skin.skeleton.findSlot('faceshape');
		let face = slot.sprites['faceshape']
		if (scaleX) face.scale.x = 1.03;//scaleX;
		if (scaleY) face.scale.y = -1.03;// scaleY;
		if (x) face.x = x;
		if (y) face.y = y;	
		console.log('resetting '+part + ' vals: '+scaleX+ ','+scaleY+','+x+','+y);
		console.log(JSON.stringify(partStartValues[part]));			
		return
	}
	else {
		let bone = skin.skeleton.findBone(part);
		if (scaleX) bone.scaleX = scaleX;
		if (scaleY) bone.scaleY = scaleY;
		if (x) bone.x = x;
		if (y) bone.y = y;		
	}

	if (part == 'hairfront') resetPart('hairback');
	if (part == 'eyesfront') resetPart('eyesback');
	console.log('resetting '+part)
	console.log(JSON.stringify(partStartValues[part]));
}

let saveOriginalValues = (part,type,valType,val) => {
	partStartValues[part] = partStartValues[part] || {};
	partStartValues[part][type] = partStartValues[part][type] || {};
	partStartValues[part][type][valType] = partStartValues[part][type][valType] || val;

	console.log('original values saves');
	console.log(JSON.stringify(partStartValues));
}

let scaleFace = (dir) => {
	let slot = skin.skeleton.findSlot('faceshape');
	let face = slot.sprites['faceshape']
	let x,y;

	let startX = face.scale.x;
	let startY = face.scale.y;

	partStartValues['face'].scale = {
		x: startX,
		y: startY
	}
	saveOriginalValues('face','scale','x',startX);
	saveOriginalValues('face','scale','y',startY);	

	
	if (dir == "plus") {
		x = startX + (startX * scaleFactor);
		y = startY + (startY * scaleFactor);
	}
	if (dir == "minus") {
		x = startX - (startX * scaleFactor);
		y = startY - (startY * scaleFactor);
	}
	face.scale.x = x;
	face.scale.y = y;
}

let scalePart = (dir,part) => {
	if (!part) {
		part = selectedPart;
	}
	if (part == 'faceshape') {
		console.log('scaling FACE');
	 	scaleFace(dir);
	 	return
	}
	if (part == 'head') part = 'faceshape';
	let x, y;
	let bone = skin.skeleton.findBone(part)	
	
	let startX = bone.scaleX;
	let startY = bone.scaleY;

	saveOriginalValues(part,'scale','x',startX);
	saveOriginalValues(part,'scale','y',startY);		

	if (dir == "plus") {
		x = startX + (startX * scaleFactor);
		y = startY + (startY * scaleFactor);
	}
	if (dir == "minus") {
		x = startX - (startX * scaleFactor);
		y = startY - (startY * scaleFactor);
	}	
	bone.scaleX = x;
	bone.scaleY = y;
	if (part == 'hairfront') scalePart(dir, 'hairback');
	if (part == 'eyesfront') scalePart(dir, 'eyesback');

	//console.log('scale is now '+x);
}

let moveFaceY = (dir) => {
	let slot = skin.skeleton.findSlot('faceshape');
	let face = slot.sprites['faceshape']
	let y;

	let startY = face.y;
	saveOriginalValues('face','move','y',startY);		

	if (dir == "minus") {
		y = startY + (startY *  moveFactor);
	}
	if (dir == "plus") {
		y = startY - (startY *  moveFactor);
	}
	face.y = y;
}
let moveFaceX = (dir) => {
	console.log('moveFaceX '+dir)
	let slot = skin.skeleton.findSlot('faceshape');
	let face = slot.sprites['faceshape']
	let x;

	let startX = face.x;
	saveOriginalValues('face','move','x',startX);	

	if (dir == "plus") {
		x = startX + (moveFactor * 50);
	}
	if (dir == "minus") {
		x = startX - (moveFactor * 50);
	}
	face.x = x;;
}

let movePartX = (dir,part) => {
	let bone = skin.skeleton.findBone(part)	
	let startX = bone.x;
	let x;
	saveOriginalValues(part,'move','x',startX);
	
	if (dir == "plus") {
		x = startX + (moveFactor *20);
	}
	if (dir == "minus") {
		x = startX - (moveFactor * 20);
	}
	bone.x = x;
	if (part == 'hairfront') movePartX(dir,'hairback');
	if (part == 'eyesfront') movePartX(dir,'eyesback');
	console.log('moved part '+part + ' x '+x)
}

let movePart = (dir,axis,part) => {
	if (!part) {
		part = selectedPart;
	}
	if (part == 'faceshape') {
		if (axis == 'x') moveFaceX(dir);
		if (axis == 'y') moveFaceY(dir);
	 	return
	}
	if (part == 'head') part = 'faceshape';

	let bone = skin.skeleton.findBone(part)	

	if (axis == 'x' ) {
		movePartX(dir,part);
		return
	}

	let y;
	let startY = bone.y;

	saveOriginalValues(part,'move','y',startY);	

	if (dir == "plus") {
		y = startY + (startY * moveFactor);
	}
	if (dir == "minus") {
		y = startY - (startY * moveFactor);
	}	
	bone.y = y;
	if (part == 'hairfront') movePart(dir, 'y', 'hairback');
	if (part == 'eyesfront') movePart(dir, 'y', 'eyesback');

	//console.log('x is now '+x);
}


/* end Kwippe controls  */


/* begin bodypart CHANGE */

let changeBody = () => {
	//console.log('changing body')
   // debugging
   //	skin.skeleton.setAttachment('clothes', null);
   	
	let h = PIXI.Texture.from('body_'+gender+'.png');
	let el = skin.skeleton.findSlot('body');
	el.sprites['body'].texture = h;

	let y = el.sprites['body'];
	y.anchor.y = 0;
	y.scale.x = .34;
	y.scale.y = -.37;
	y.y = 46;
	colorFace();
	
}

let changeEyebrows = () => {
	//debugging
	/*
	skin.skeleton.setAttachment('faceshape', null);
	skin.skeleton.setAttachment('hairfront', null);
	skin.skeleton.setAttachment('hairback', null);
	skin.skeleton.setAttachment('eyesfront', null);
	skin.skeleton.setAttachment('ears', null);	
	*/
	let scalingX = 1;  
	let scalingY = 1;	
	let range = [];
	let lenny = 17;
	
	//this gives an array beginning with 0, ending on 15 for total of 16 entries
	for (let j = 0; j < lenny+1; j++) {
		range.push(j)
	}
	let i = characterIndices.eyebrows;
	
	if (i > lenny) {
		characterIndices.eyebrows = 0;
		i = 0;
	}
	
	characterIndices['eyebrows']++;
	let id = range[i];//sample(range);

	//console.log('$$$$ eyebrows image is number '+id);

	let container_sprites = new PIXI.Container();
	container_sprites.width = 300;
	
	let img1 = new PIXI.Sprite.from('eyebrows_'+gender+ '_'+ id+ '.png');			 
	let img2 = new PIXI.Sprite(img1.texture);
	
	img1.scale.y = .76;
	img1.scale.x = .76;
	
	img2.scale.y = .76;
	img2.scale.x = -.76;
	
	img1.x = 40;		
	let secondPos =  10 + (img1.width + (img1.width * 1.5 ));		
	img2.x = secondPos;

	//container.addChild(container_sprites);
	
	container_sprites.addChild(img1);
	container_sprites.addChild(img2);

	let h = app.renderer.generateTexture(container_sprites);
	//console.log(h)
	//container_sprites.removeChildren();
		
	let eyebrows = skin.skeleton.findSlot('eyebrows');
	eyebrows.sprites['eyebrows'].texture = h;
	let y = eyebrows.sprites['eyebrows']
//	console.log(y);

	let bone = skin.skeleton.findBone('eyebrows')	

	y.anchor.y = 0;
	y.y = 10;
	bone.scaleX = 1.3;
	bone.scaleY = 1.3;
	setTimeout(() => {
		//container_sprites.removeChildren();
	},200)
	colorEyebrows();
}

let changeEars = () => {
	//debugging
	//skin.skeleton.setAttachment('faceshape', null);
	//skin.skeleton.setAttachment('hairfront', null);
	//skin.skeleton.setAttachment('hairback', null);
	let scalingX = 1;  
	let scalingY = 1;	
	let range = [];
	let lenny = 7;
	
	//this gives an array beginning with 0, ending on 15 for total of 16 entries
	for (let j = 0; j < lenny+1; j++) {
		range.push(j)
	}
	let i = characterIndices.ears;
	
	if (i > lenny) {
		characterIndices.ears = 0;
		i = 0;
	}
	
	characterIndices['ears']++;
	let id = range[i];//sample(range);

	//console.log('$$$$ ears image is number '+id);

	let container_sprites = new PIXI.Container();
	container_sprites.width = 300;
	
	let img1 = new PIXI.Sprite.from('ears_'+id+ '.png');			 
	let img2 = new PIXI.Sprite(img1.texture);
	
	img1.scale.y = 1;
	img1.scale.x = 1;
	
	img2.scale.y = 1;
	img2.scale.x = -1;
	
	img1.x = -145;		
	let secondPos =  70 + (img1.width + (img1.width * 1.5 ));		
	img2.x = secondPos;

	//container.addChild(container_sprites);
	
	container_sprites.addChild(img1);
	container_sprites.addChild(img2);

	let h = app.renderer.generateTexture(container_sprites);
	//console.log(h)
	//container_sprites.removeChildren();
		
	let ears = skin.skeleton.findSlot('ears');
	ears.sprites['ears'].texture = h;
	let y = ears.sprites['ears']
//	console.log(y);

	let bone = skin.skeleton.findBone('ears')	

	y.anchor.y = 0;
	y.y = 0;
	bone.scaleX = 1.3;
	bone.scaleY = 1.3;
	setTimeout(() => {
		//container_sprites.removeChildren();
	},200)
}

let changeEyesiris = () => {

	let scalingX = 1;  
	let scalingY = 1;	
	let range = [];
	let lenny = 13;
	
	//this gives an array beginning with 0, ending on 15 for total of 16 entries
	for (let j = 0; j < lenny+1; j++) {
		range.push(j)
	}
	let i = characterIndices.eyesiris;
	
	if (i > lenny) {
		characterIndices.eyesiris = 0;
		i = 0;
	}
	
	characterIndices['eyesiris']++;
	let id = range[i];//sample(range);

	//console.log('$$$$ eyesiris image is number '+id);

	
	let container_sprites = new PIXI.Container();
	container_sprites.width = 300;
	
	let img1 = new PIXI.Sprite.from('eyesiris_'+id+ '.png');			 
	let img2 = new PIXI.Sprite(img1.texture);
	
	img1.scale.y = 1;
	img1.scale.x = 1;
	
	img2.scale.y = 1;
	img2.scale.x = -1;
	
	img1.x = -25;		
	let secondPos =  47 + (img1.width + (img1.width * 1.5 ));		
	img2.x = secondPos;
	//console.log('secondPos '+secondPos);
	
			// only rgb works so we have to convert
	let color = sample($characterColors[gender]['eyesiris']); 
	//let originalColor = hexToRgb('#dcdcdc') //[220,220,220];
	//let newColor = hexToRgb(color);	
	
	//container.addChild(container_sprites);

	let anchorNum = 0;
	
	container_sprites.addChild(img1);
	container_sprites.addChild(img2);
	//		[0xFFFFFF, 0x00FF00],
			

	let h = app.renderer.generateTexture(container_sprites);
	//console.log(h)
	//container_sprites.removeChildren();
		
	let eyesiris = skin.skeleton.findSlot('eyesiris');
	colorEyesiris();

	eyesiris.sprites['eyesiris'].texture = h;
	let y = eyesiris.sprites['eyesiris']
//	console.log(y);

	let bone = skin.skeleton.findBone('eyesiris')	
	
	//console.log('y anchor half '+ y.height/2)
	y.anchor.y = 0// anchorNum;
	//y.x = 0
	//y.x = 5;//-35;
	y.y = 10;
	//y.y = 0// y.height/2;
	//y.anchor.y = 20;
	bone.scaleX = 1.5;
	bone.scaleY = 1.5;
	setTimeout(() => {
		//container_sprites.removeChildren();
	},200)
	//y.x = 5;//-35;
}

let changeEyes = () => {

	let id = getSampleFromRange(16,0)
	//debugging
	//skin.skeleton.setAttachment('hairback', null);
	//skin.skeleton.setAttachment('hairfront', null);
	//skin.skeleton.setAttachment('eyebrows', null);
	//skin.skeleton.setAttachment('faceshape', null);

	//good to troubleshoot iris z-index: id = 3;
	
	//console.log('$$$$ eyesfront image is number '+id);
	
	//let h = PIXI.Texture.from('eyesfront_'+gender+'_'+id);
	

	let container_sprites = new PIXI.Container();
	container_sprites.width = 300;
	
	let img1 = new PIXI.Sprite.from('eyesfront_'+gender+'__'+id + '.png');			 
	let img2 = new PIXI.Sprite(img1.texture);

	container_sprites.addChild(img1);
	container_sprites.addChild(img2);
			
	let num = .85;
	img1.scale.y = num;
	img1.scale.x = num;
	
	img2.scale.y = num;
	img2.scale.x = -num;
	
	img1.x = 30;		
	let secondPos =  (30 + img1.width + img1.width *.95);		
	img2.x = secondPos;
	//console.log('secondPos '+secondPos);
	
	let anchorNum = 0;
	
	let h = app.renderer.generateTexture(container_sprites);
	//container.addChild(container_sprites)
	
	//hair.scale.set(1.5,1.5)
	container_sprites.removeChildren();
	
	let eyesfront = skin.skeleton.findSlot('eyesfront');
	eyesfront.sprites['eyesfront'].texture = h;
	let y = eyesfront.sprites['eyesfront']
	let bone = skin.skeleton.findBone('eyesfront')	
	//debugging
	//y.alpha = .6;
//	console.log('y anchor half '+ y.height/2)
	y.anchor.y = anchorNum;
	y.scale.x = .85;
	y.scale.y = -.85;
	y.y =  0 + y.height/2;	

	img1 = new PIXI.Sprite.from('eyesback_'+gender+'_'+id + '.png');			 
	img2 = new PIXI.Sprite(img1.texture);
	container_sprites.addChild(img1);
	container_sprites.addChild(img2);
			
	//container.addChild(container_sprites);
	
	img1.x =  50;	
	img2.x =  (img1.width +0);	//-35
	
	num = .9;
	img1.scale.y = num;
	img1.scale.x = -num;
	
	img2.scale.y = num;
	img2.scale.x = num;
	
	h = app.renderer.generateTexture(container_sprites);
	//h = PIXI.Texture.from('eyesback_'+gender+'_'+id);
	// change eyesback to match
	let eyesback = skin.skeleton.findSlot('eyesback');
	eyesback.sprites['eyesback'].texture = h;
	y = eyesback.sprites['eyesback']

	//debugging
	//eyesback.color.setFromString('#ffff00');

	//console.log('y anchor half '+ y.height/2)
	y.anchor.y = anchorNum
	y.y =  3.5 + y.height/2;
	y.scale.x = .95;
	y.scale.y = -.95;

	container_sprites.removeChildren();
	colorFace();
}

let changeClothes = () => {
console.log('changing Clothes')
/*
XX .c_tone		#dcdcdc
.c_sd1 		#B1E5FB => #cccccc
.c_hl1		#0BA6EA => #b3b3b3
XX .c_sd3		#9A9A9A

c_tone{fill:#dcdcdc;}.c_sd35{fill: #9A9A9A;}.c_1stepLighter{fill:#dedede;

*/

	//debugging
	/*
	skin.skeleton.setAttachment('faceshape', null);
	skin.skeleton.setAttachment('hairfront', null);
	skin.skeleton.setAttachment('hairback', null);
	skin.skeleton.setAttachment('eyesfront', null);
	skin.skeleton.setAttachment('ears', null);	
	skin.skeleton.setAttachment('body', null);
	*/
	// spine reverses these - use Y to scale x and vice versa
	let scalingX = 4;  
	let scalingY = 4;
	let yOffset = 0;
	let cur_gender = gender;

	let range = [];
	let lenny = 7;
	
	//this gives an array beginning with 0, ending on 15 for total of 16 entries
	for (let j = 0; j < lenny+1; j++) {
		range.push(j)
	}
	let i = characterIndices.clothes;
	
	if (i > lenny) {
		characterIndices.clothes = 0;
		i = 0;
	}
	characterIndices['clothes']++;
	let id = range[i];
	
	
	let h = PIXI.Texture.from('clothes_'+gender+'_'+id+ '.png');
	//console.log(h);
	//clothes.scale.set(1.5,1.5)
	let clothes = skin.skeleton.findSlot('clothes');
	clothes.sprites['clothes'].texture = h;
	let clothesBone = skin.skeleton.findBone('clothes')
	 
	let y = clothes.sprites['clothes']
	y.anchor.y = 0;
	y.x = 0;//-35;
	y.y = 10.5;
	       
	clothesBone.scaleX = scalingX;
	clothesBone.scaleY = scalingY;		
	
    //hideBodyparts(false);

//    let h = app.renderer.generateTexture(container_sprites);

//h = PIXI.Texture.from('clothes_bottom.png');
	//console.log(h);
	//clothes.scale.set(1.5,1.5)
	//clothes = skin.skeleton.findSlot('clothes_bottom');
	//clothes.sprites['clothes_bottom'].texture = h;
	let bottom = skin.skeleton.findBone('clothes_bottom');
		     
	bottom.scaleX = 2.2;
	bottom.scaleY = 2.5;
	bottom.y = -165;
    bottom.x = 60				
}

let changeHair = () => {

   // skin.skeleton.setAttachment('faceshape', null);

	// spine reverses these - use Y to scale x and vice versa
	let scalingX = 5;  
	let scalingY = 5;
	let yOffset = 0;
	let cur_gender = gender;

	let range = [0,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
	let lenny = range.length-1;

	let i = characterIndices.hair;
	
	if (i > lenny) {
		characterIndices.hair = 0;
		i = 0;
	}
	characterIndices['hair']++;
	let id = range[i];
	console.log('hair id is '+id)
    let t = '.svg'
	let girls = [21,22,23,24,25,26,27,28];
    //id = sample([21,22,23,24,25,26,27,28]);

	// I used pngs instead of svgs in the spritesheets
	if (girls.includes(id)) {
		t = '.png'
	}

	//id = 28;

	if (id == '21' && gender == 'male') {
		yOffset = -40;
		scalingY = 2.2;
	}
	if ([24,26].includes(id)) yOffset = -3;

	let h = PIXI.Texture.from('hair_'+cur_gender+'_shapes_front__'+id +t);
	 
	//hair.scale.set(1.5,1.5)
	let hairPalette = $characterColors[gender]['hair'];
	let hair = skin.skeleton.findSlot('hairfront');
	let color = sample(hairPalette);
	hair.color.setFromString(color);
	hair.sprites['hairfront'].texture = h;
	let hairBone = skin.skeleton.findBone('hairfront')
	 
	let y = hair.sprites['hairfront']
	y.anchor.y = 0;
	y.x = 1;//-35;
	y.y = 27 + yOffset;
	
	hairBone.scaleX = scalingX;
	hairBone.scaleY = scalingY;	
	
// hairback overrides for hair that doesn't have a back or has a bad one

    if ([21,24,26,28].includes(id)) id = 2;
    //if ([23].includes(id)) id = 9;
    if ([25].includes(id)) id = 23;
    if ([22].includes(id)) id = 27;
	if ([11].includes(id)) id = 13;

	
	h = PIXI.Texture.from('hair_'+cur_gender+'_shapes_back__'+id+'.svg');
	//console.log(h)
	//hair.scale.set(1.5,1.5)

	let hairBack = skin.skeleton.findSlot('hairback');
	hairBack.sprites['hairback'].texture = h;
	hairBone = skin.skeleton.findBone('hairback')
	 
	y = hairBack.sprites['hairback']
	y.anchor.y = 0;
	y.x = 0;//-35;
	y.y = 20;
	hairBone.scaleX = scalingX * 1.05;
	hairBone.scaleY = scalingY;	
	hairBack.color.setFromString(color);
}

let changeHairExternal = () => {
	// hideBodyparts('hairfront, gender is '+gender); 
	// spine reverses these - use Y to scale x and vice versa

	let scalingX = 1;  
	let scalingY = 1;
	let yOffset = 0;

	let j = 0;
	
	let range = [];
	
	if (gender == 'female') {
		j = 4;

		while (j < 21) {
			range.push(j)
			j++;
		}
	}
		
	let id = sample(range);

	//id = '21';
	if (id == '21' && gender == 'male') {
		yOffset = -40;
		scalingY = 2.2;
	}			
	
			
	let img1 = new PIXI.Texture.from('./sprites/hair_female/hair_female_front__'+id + '.png');			 

    setTimeout(() => {
	if (img1.baseTexture.hasLoaded) {
		img1.baseTexture.on('loaded', ready);
	} 
	else {
		ready();
	}
		},100);
	
	function ready() {	
		console.log(id+' female hair loaded')
		
		let h = img1;
		//console.log(h) 
		//hair.scale.set(1.5,1.5)
		let hairPalette = $characterColors[gender]['hair'];
		console.log(hairPalette);
		let hair = skin.skeleton.findSlot('hairfront');
		let color = sample(hairPalette);
		console.log('color is '+color);

		hair.color.setFromString(color);
		hair.sprites['hairfront'].texture = h;
		
		let hairBone = skin.skeleton.findBone('hairfront')
		 
		let y = hair.sprites['hairfront']
		//console.log('hairfront sprites obj');
		//console.log(y);
		y.anchor.y = 0;
		//y.x = 5;//-35;
		y.y = 20;
		
		hairBone.scaleX = scalingX;
		hairBone.scaleY = scalingY;
	}
	
}

let changeFace = () => {
	//console.log('changing face')

	let range = [];
	let lenny = 44;
	
	//this gives an array beginning with 0, ending on 15 for total of 16 entries
	for (let j = 0; j < lenny+1; j++) {
		range.push(j)
	}
	let i = characterIndices.face;
	
	if (i > lenny) {
		characterIndices.face = 0;
		i = 0;
	}
	characterIndices['face']++;
	let id = range[i];
	//id =  44;
    
	let h = PIXI.Texture.from('faceshape_'+id+'.png');

	let face = skin.skeleton.findSlot('faceshape');
	face.sprites['faceshape'].texture = h;

	let y = face.sprites['faceshape']
	y.anchor.y = 0;
	y.scale.x = 1.03;
	y.scale.y = -1.03;
	y.y = 90;
	colorFace();
}

let changeNose = () => {
	let lenny = 17;
	let id = getSampleFromRange(lenny)
	let h = PIXI.Texture.from('nose_'+id+'.png');
	let m = skin.skeleton.findSlot('nose');
	m.sprites['nose'].texture = h; 
	let y = m.sprites['nose'];
	y.anchor.y = 1;1
	y.scale.x = .2;
	y.scale.y = -.2;
	y.y =  -7// y.height * .65;
	colorFace();
}

let changeMouth = (wordy,rand) => {
	//console.log('rand '+rand);
	let mouth = 'a_6';

	let mouthSwaps = {
		a: sample(['a_1','a_2', 'a_3', 'a_4', 'a_5', 'a_6']),
		b: 'b_1',
		d: 'd_1',
		e: sample(['e_1', 'e_2']),
		f: 'f_1',
		m: 'm_1',
		o: sample(['o_1']), // o_2 sort of sucks
		p: 'b_1',
		t: 't_1',
		u: 'u_1',
		v: 'v_1'	
	}
	//console.log('change mouth for word '+wordy);
	let swappy = mouthSwaps[wordy[0]];
	 
	if (rand) {
		let keys = Object.keys(mouthSwaps);
		let lett = sample(keys);
		swappy = mouthSwaps[lett];
		if (swappy) mouth = swappy;
		//console.log('rand, swappy is now '+mouth)
	}
	// super naive method to just match mouth to first and last letters
	if (frame == 0 && swappy) mouth = swappy;
	
	if (numberPositions && frame == (numberPositions.length-1) || (frame == 1 && numberPositions.length < 1) ) {
		swappy = mouthSwaps[wordy[wordy.length-1]];
		if (swappy) mouth = swappy;
	}
	let h = PIXI.Texture.from(mouth+'.png');
	let m = skin.skeleton.findSlot('mouth');
	m.sprites['mouth'].texture = h; 
	let y = m.sprites['mouth'];
	y.scale.x = .9;
	y.scale.y = -.9;
}

let changeHand = (signdata, h, h2, noSwap) => {
	let pos = 'begin';
	if (frame > 0) pos = 'end';
	/* if opendata has nada, try aslLex */
	
	if (!h && aslLexData) h = aslLexData.handshapes[pos].d;
	if (!h2 && aslLexData) h2 = aslLexData.handshapes[pos].nd;
	//console.log(JSON.stringify(aslLexData))
	
	/* neither have data, try asl2English. May be better to always deafult to these */
	if (!h && asl2EnglishData) {
		h = asl2EnglishData.handshapes[pos].d; 
		noSwap = true;
	}
	if (!h2 && asl2EnglishData) {
		// this hand data is messy due to their inconsistent nested arrays system, so let's only add the ND hand if we're sure it's not a 1 handed sign
		if (asl2EnglishData.hands > 1) {
			h2 = asl2EnglishData.handshapes[pos].nd; 
			noSwap = true;
		}
		//console.log(JSON.stringify(asl2EnglishData.handshapes))
	}
	//console.log('dominant hand is '+h);
	//console.log('non dominant hand is '+h2);
		
	if (!h) {
		character.skeleton.setAttachment("hand_right",'23');
		// we don't return here because we need to look at the other hand
	}
	else {
		h = h.toString().toLowerCase().replace('_', '-');
		//console.log('dh is '+h)
		if (!noSwap) h = $handSwaps[h];
		if (h) character.skeleton.setAttachment("hand_right",h);
		if (!h) character.skeleton.setAttachment("hand_right",'23');
	}
	
	if (!h2) {
		character.skeleton.setAttachment("hand_left",'23');
		colorHands();
		return
	}
	h2 = h2.toString().toLowerCase().replace('_', '-');
	//console.log('nd2 is '+h2)
	if (!noSwap) h2 = $handSwaps[h2];
	if (h2) character.skeleton.setAttachment("hand_left",h2);
	if (!h2) character.skeleton.setAttachment("hand_left",'23');
	colorHands();
} 

/* end CHANGE */

let addHand = (event) => {
	let dir = selectedArm;
	//console.log('add this handshape! '+event.currentTarget.id)
	let id = event.currentTarget.id.split('_');
	id = id[1];
	character.skeleton.setAttachment("hand_"+dir, id);
/*
		asl2english structure needs ordered by hands: 
		[[dominantPos1, dominantPos2], [nonPos1, nonPo2]] 
*/
	let pos = 0; // right id dominant hand
	let alt = 1;
	let alt_dir = 'left';
	if (dir == 'left') {
		pos = 1;
		alt = 0;
		alt_dir = 'right';
	}
	
	signData.handshapes[pos][currentPosition] = id;
	
	//switch BOTH hands if checkbox selected
	if (bothHands) {
		signData.handshapes[alt][currentPosition] = id;
		character.skeleton.setAttachment("hand_"+alt_dir, id);
	}
}

let saveSignDataToSign = () => {
/* I'd rather do an object for $customSigns but Sveltes auto assign thing is too annoying to deal with plus arrays are iterable, arrghh */
		//console.log('got save custom data as sign for: '+word.sign);
	$customSigns[word.sign] = signData;
}

let resetPuppet = (resetData) => {
	if (!character) return
	
	if (resetData) {
		positionsSet = {};
		signData.regions['right'][currentPosition] =  null; 
		signData.regions['left'][currentPosition] =  null; 
		signData.hands = { pos0: {right: {}, left: {}}, 
		pos1: {right: {}, left: {} } }; 
		
		let innerObj = {
			arm: 0,
			arm_bottom: 0,
			hand: {
				flipX: false,
				flipY: false,
				palmfaces: {},
				rotation: false
			}
		};
		armData.left = innerObj;
		armData.right = innerObj; 
	}
	selectedArm = 'left';
	rotateArm('reset');
	rotateElbow('reset');
	resetHand();
	selectedArm = 'right';	
	rotateArm('reset');
	rotateElbow('reset');
	resetHand();	
} 

let rotateArm = (dir,arm,amount) => {

	if (!arm) arm = selectedArm;
	if (!amount) amount = 5;
	let initVal = {
		right: -117.05,
		left: -63.33
	}
	let opposite = 'left';
	if (selectedArm == 'left') opposite = 'right';
	var el = character.skeleton.findBone('arm_'+arm);
	//////console.log('initial rotation for arm is '+el.rotation)
	////////console.log('local rotation for arm is '+el.worldRotationX)
	if (dir == 'exact') {
		el.rotation = amount;
	}
	if (dir == 'right') {
		el.rotation += amount;
	}
	if (dir == 'left') {
		el.rotation -= amount;
	}		
	if (dir == 'reset') {
		el.rotation = initVal[arm];
		if (bothHands) {
			console.log('got reset for both hands')
			var el2 = character.skeleton.findBone('arm_'+opposite);
			el2.rotation = initVal[opposite];
			armData[opposite].arm = el2.rotation;
		}
	}
	if (dir == 'custom') {
		 el.rotation = armData[arm].arm;
	}
	if (dir == 'mirror') {
		let init = armData[selectedArm].arm;
		let currentVal = initVal[selectedArm]
		
		let difference = -(currentVal) - (-(init));
		////////console.log('currentVal is '+currentVal);
		////////console.log('init is '+init)
		////////console.log('difference is '+difference);
		
		if (currentVal > 0) {
			////////console.log('got a positive currentVAl '+currentVal)
			difference = -(currentVal) - init;
		}
		el.rotation = initVal[arm];
		el.rotation -= difference
	}	
	armData[arm].arm = el.rotation;
	character.skeleton.update();
	
	// try to get both arms to switch in realtime not just using mirror fn
	if (bothHands && dir != "mirror") {
		rotateArm('mirror',opposite)
	}
	//character.skeleton.updateWorldTransform();
	//console.log('rotation for arm is now : '+el.rotation)
}

let rotateElbow = (dir,arm,amount) => {
	if (!character) return
	
	if (!arm) arm = selectedArm;
	let opposite = 'left';
	if (selectedArm == 'left') opposite = 'right';

	if (!amount) amount = 5;

	let initVal = {
		right: 12.22,
		left: 12.22
	}
	
	var el = character.skeleton.findBone('arm_'+arm+'_bottom');
	//////console.log('bone data for arm_bottom is '+el.rotation)
	if (dir == 'right') {
		el.rotation += amount;
	}
	if (dir == 'left') {
		el.rotation -= amount;
	}
	if (dir == 'reset') {
		el.rotation = initVal[arm];
		if (bothHands) {
			console.log('got reset for both hands')
			var el2 = character.skeleton.findBone('arm_'+opposite+'_bottom');
			el2.rotation = initVal[opposite];
			armData[opposite].arm_bottom = el2.rotation;
		}
	}		
	if (dir == 'custom') {
		 el.rotation = armData[arm].arm_bottom;
	}	
	if (dir == 'mirror') {
		let currentVal = armData[selectedArm].arm_bottom;
		
		el.rotation = currentVal;
	}
	armData[arm].arm_bottom = el.rotation;
	character.skeleton.update();
	// try to get both arms to switch in realtime not just using mirror fn
	if (bothHands && dir != "mirror") {
		rotateElbow('mirror',opposite)
	}	
	//console.log('elbow rotation is now '+el.rotation);
	//character.skeleton.updateWorldTransform();
}

let rotateHand= (dir,arm,amount) => {
	let palmface = word.palmface || activePalmface || 'default';
	if (!arm) arm = selectedArm;
	var el = character.skeleton.findBone('hand_'+arm+ '_inner');
	//////console.log('bone data for arm_bottom is '+el.rotation)
	//console.log('rotateHand, got dir '+dir)
	if (dir == 'exact') {
		el.rotation = amount;
	}
	let num = 90;
	if (dir == 'incrright') dir = 'incrRight';
	if (dir == 'incrleft') dir = 'incrLeft';
	
	if (dir == 'incrRight') el.rotation += 5;
	if (dir == 'incrLeft') el.rotation -= 5;	

	if (dir == 'right') el.rotation += num; 
	if (dir == 'left') el.rotation -= num;
	if (dir != "exact") {
		armData[selectedArm].hand['palmfaces'][palmface] = el.rotation;
	}

		// try to get both arms to switch in realtime not just using mirror fn
	if (bothHands || dir == 'mirror') {
		let opposite = 'left';
		let el2 = character.skeleton.findBone('hand_'+opposite+ '_inner');
		if (selectedArm == 'left') opposite = 'right';
		el2.rotation = el.rotation;
		armData[opposite].hand.rotation = el.rotation;
	}
	
	character.skeleton.update();
	//character.skeleton.updateWorldTransform();
}

let flipHand= (dir, arm, once) => {
	if (!arm) arm = selectedArm;
	if (!arm) return
	let opposite = 'left';
	if (arm == 'left') opposite = 'right';	
	
	var el = character.skeleton.findBone('hand_'+arm+ '_inner');
//	//////console.log('bone data for hand is '+JSON.stringify(el.data))
    let xVal = el.scaleX;
    let yVal = el.scaleY;
    let truthy = false;
    
    //////console.log('flipHand dir is '+arm + ' dir '+dir);
 
    
	if (dir == 'y') {
		el.scaleX = -(xVal);
		if (el.scaleX > 0) truthy = true; 	
	}

	if (dir == 'x') {
		el.scaleY =  -(yVal);
		if (el.scaleY > 0) truthy = true; 			
	} 
	armData[arm].hand['flip'+dir.toUpperCase()] = truthy;
	character.skeleton.update();
	
	if (dir == 'both') {
		for (let val of ['X', 'Y']) {
		//check both x and y to see if we need to flip opposite
			if (armData[arm].hand['flip'+val] == true) {
				flipHand(val.toLowerCase(),opposite,true);
			}
		}
	}

	
		// for mirror fn we'll need to add an extra argument
	if (bothHands && dir != 'both' && !once) {
		flipHand(dir,opposite,true)
	}
	//////console.log('flipHand value is now '+truthy)
	//character.skeleton.updateWorldTransform();
}

let resetHand = () => {
	let arr = ['right', 'left'];
	
	if (!bothHands) {
		arr = [selectedArm]
	} 
	
	let scale = 0.85;
	let negScale = -0.85;
	
	let initVal = {
		right: {
			rotation:-9.53,
			scaleX: scale,
			scaleY:  negScale,
		},
		left: {
			rotation: -9.53,
			scaleX: scale,
			scaleY: negScale,
		}
	}
	
	for (let dir of arr) {
	
		var el = character.skeleton.findBone('hand_'+dir+ '_inner');

		el.rotation = initVal[dir].rotation;
		el.scaleX = initVal[dir].scaleX;
		el.scaleY = initVal[dir].scaleY;
		
		character.skeleton.update();
		armData[dir].hand['flipX'] = false;
		armData[dir].hand['flipY'] = false;	
	}
	
	//character.skeleton.updateWorldTransform();
}

let mirror = (mirrorRegion) => {
	console.log('trying to run mirror')
	let dir = selectedArm;
	let pos = 0;
	let pos1 = 1;
	let opposite = 'left';
	let offset;
	
	if (selectedArm == 'left') {
		opposite = 'right';
		pos = 1;
		pos1 = 0;
	}
	//////console.log('selectedArm is '+selectedArm)
	//////console.log('opposite is '+opposite)
	rotateArm('mirror',opposite);	
	rotateElbow('mirror', opposite);
	rotateHand('mirror', opposite);
	flipHand('both',dir)
	//TODO: we need a hand fn that mirrors too	
	
	selectedArm = opposite;
	if (bothHands) {
		let current_hand = signData.handshapes[pos][currentPosition];
		character.skeleton.setAttachment("hand_"+opposite, current_hand);
		//make sure the new shape gets put into the other hand's handshape array	
		signData.handshapes[pos1][currentPosition] = current_hand;
	}
	/* this is to create a new region for the opposite side automatically */
	
	if (mirrorRegion || bothHands) {
		if (!mirrorRegion) {
			mirrorRegion = signData.regions[pos][currentPosition]; 
		}
		
		if (dir == 'right') {
			mirrorRegion = mirrorRegion.replace('r-', 'l-');
		}
		else {
			mirrorRegion = mirrorRegion.replace('l-', 'r-');					
		}
		signData.regions[opposite][currentPosition] =  mirrorRegion; 
	}
}

let changePosition = (num) => {
	currentPosition = num;
	frame = num;
	getNewFrame();
	return
	if (open_pose.length > 0) {
		currentPosition = num;
		frame = num;
		getNewFrame();
		return
	}
}

let showShapegroups = () => {
	(!showHandshapes ? showHandshapes = true : showHandshapes = false);	
}

</script>
	

<svelte:head>
	<title>ASL Puppet ~ Flashcards, Letters and Word Maker</title>
</svelte:head>

<div class="toolbarHolder topNav">	
				
		<div class="pure-menu pure-menu-horizontal pad10 pad_top_bottom">
			<ul class="pure-menu-list">	
	
	
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite leftman { (selectedArm == 'right' ? 'active' : '') }" style="opacity:.75"  on:click={() => selectedArm = 'right' }  ></div>
						<div class="iconLabel">left</div>
					</div>       
				</li>
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rightman { (selectedArm == 'left' ? 'active' : '') }" style="opacity:.75"  on:click={() => selectedArm = 'left' }  ></div>
						<div class="iconLabel">right</div>
					</div>       
				</li>				
				
					
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite hair" style="opacity:.75"  on:click={() =>  {changeHair(); selectedPart = 'hairfront';} }  ></div>
						<div class="iconLabel">+hair</div>
					</div>       
				</li>


				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite clothes" style="opacity:.75"  on:click={() => {changeClothes();selectedPart = 'clothes';} }  ></div>
						<div class="iconLabel">+clothes</div>
					</div>       
				</li>

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite ears" style="opacity:.75"  on:click={() => {changeEars();selectedPart = 'ears';} }  ></div>
						<div class="iconLabel">+ears</div>
					</div>       
				</li>
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite eyebrows" style="opacity:.75"  on:click={() =>{ changeEyebrows();selectedPart = 'eyebrows';} }  ></div>
						<div class="iconLabel">+brows</div>
					</div>       
				</li>
								
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite nose" style="opacity:.75"  on:click={() => {changeNose();selectedPart = 'nose';} }  ></div>
						<div class="iconLabel">+nose</div>
					</div>       
				</li>				
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite mouth" style="opacity:.75"  on:click={() => {changeMouth('a',true);selectedPart = 'mouth'} }  ></div>
						<div class="iconLabel">+mouth</div>
					</div>       
				</li>					
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite eyesfront" style="opacity:.75"  on:click={() => {changeEyes(); selectedPart = 'eyesfront'}}  ></div>
						<div class="iconLabel">+eyes</div>
					</div>       
				</li>	

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite eyesiris" style="opacity:.75"  on:click={() => {changeEyesiris();selectedPart = 'eyesiris'} }  ></div>
						<div class="iconLabel">+iris</div>
					</div>       
				</li>					
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite faceshape" style="opacity:.75"  on:click={() => {changeFace();selectedPart = 'faceshape' }}  ></div>
						<div class="iconLabel">+face</div>
					</div>       
				</li>												
							
											
							
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite ColorWheel" style="opacity:.75"  on:click={() => randomizeKwippe() }  ></div>
						<div class="iconLabel">random</div>
					</div>       
				</li>												
																					
	
	{#if editingActive}
				<li class="pure-menu-item">
					<div class="iconTool">
						<!--on:click={ () =>  saveSignDataToSign() }-->
						<div class="sprite add_filled" style="opacity:.75"    ></div>
						<div class="iconLabel">+sign</div>
					</div> 
				</li>				

				<li class="pure-menu-item">
					<div class="iconTool">
						<!--on:click={ addCustomPosition(0) }-->
						<div class="sprite savepos1 { (currentPosition == 0 ? 'active' : '') }" style="opacity:.75"    ></div>
						<div class="iconLabel">save 1</div>
					</div>       
				</li>
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<!-- on:click={ addCustomPosition(1) } -->
						<div class="sprite savepos2 { (currentPosition == 1 ? 'active' : '')  }" style="opacity:.75"   ></div>
						<div class="iconLabel">save 2</div>
					</div>       
				</li>				
	{/if}

			{#if kwippeWordMenu.length > 0}
				<li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
				<span id="menuLink1" class="pure-menu-link">kwippe signs</span>
					<ul class="pure-menu-children">
						{#each kwippeWordMenu as s}
							<li on:click={ () => getKwippeSignData(s.url) } class="pure-menu-item">
								<a href="" class="pure-menu-link">{s.label} by {s.signer}</a>
							</li>
						{/each}

					</ul>
				</li>
			{/if}				
							
			 </ul>
	 
		 </div>   
	</div>					
			
<div class="pure-g pad_full10">
	<div class="pure-u-1-5">

		{#if  $words && $words.length > 0 }
			<AutoComplete  
			items="{$words}" 
			delay="500"
			bind:onChange="{getKwippeWordDirectory}" 
			bind:selectedItem="{word}" 
			sortByMatchedKeywords="false"
			minCharactersToSearch="1"
			/>
		{/if}	
		
			
	</div>
	<div class="pure-u-4-5">
	</div>
	
</div>


<div class="pure-g">
	<div class="pure-u-3-8">
		{#if numberPositions && numberPositions.length > 0}
			<div class="frameCount">frame {frame+1} of {numberPositions.length}</div>
		{/if}
		<div class="pure-g">

			<div class="pure-u-2-24">
				{#if numberPositions && numberPositions.length > 0 && frame > 0}
					<div class="frameNav frameNavR" on:click="{() =>changePosition(frame-1)}">←</div>
				{/if}
			</div>
			<div class="pure-u-20-24">
				<canvas id="canvas" />
			</div>
			<div class="pure-u-2-24">
				{#if numberPositions && numberPositions.length > 0 && frame < numberPositions.length-1 }
					<div class="frameNav frameNavL" on:click="{() =>changePosition(frame+1)}">→</div>
				{/if}
			</div>
		</div>
		
	</div>
	
	<div class="pure-u-5-8">		

		<div class="toolbarHolder">	
			<div class="title">controls</div>
			<div class="pure-menu pure-menu-horizontal">
				<ul class="pure-menu-list">	
					

					{#if bodyparts.length > 0}
						<li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
							<span id="menuLink1" class="pure-menu-link">{selectedPart.replace('faceshape', 'face').replace('eyesfront', 'eyes').replace('hairfront', 'hair')}</span>
								<ul class="pure-menu-children">
									<li on:click={ () => selectedPart = 'head' } class="pure-menu-item">
										<a href="" class="pure-menu-link">head</a>
									</li>
									{#each bodyparts as s}
									{#if !(['eyesback', 'hairback', 'clothes_bottom'].includes(s)) }
										<li on:click={ () => selectedPart = s } class="pure-menu-item">
											<a href="" class="pure-menu-link">{s.replace('faceshape', 'face').replace('eyesfront', 'eyes').replace('hairfront', 'hair')}</a>
										</li>
									{/if}
									{/each}
			
								</ul>
						</li>
					{/if}

	
					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite add_filled" style="opacity:.75"  on:click={() => scalePart('plus')}  ></div>
							<div class="iconLabel">bigger</div>
						</div>       
					</li>
	
					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite line" style="opacity:.75"   on:click={() => scalePart('minus')}  ></div>
							<div class="iconLabel">smaller</div>
						</div>       
					</li>	
					
					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite moveup" style="opacity:.75"   on:click={() => movePart('minus','y')}  ></div>
							<div class="iconLabel">up</div>
						</div>       
					</li>
	
					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite movedown" style="opacity:.75"   on:click={() => movePart('plus','y')}  ></div>
							<div class="iconLabel">down</div>
						</div>       
					</li>	

					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite moveleft" style="opacity:.75"   on:click={() => movePart('minus','x')}  ></div>
							<div class="iconLabel">right</div>
						</div>       
					</li>
	
					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite moveright" style="opacity:.75"   on:click={() => movePart('plus','x')}  ></div>
							<div class="iconLabel">left</div>
						</div>       
					</li>						

					<li class="pure-menu-item">
						<div class="iconTool">
							<div class="sprite reset" style="opacity:.75"   on:click={() => resetPart()}  ></div>
							<div class="iconLabel">reset</div>
						</div>       
					</li>						
	
				</ul>
		</div>
	</div>

	{#if controlsActive }
	<div class="toolbarHolder neg10">	
		<div class="title">elbow</div>
		<div class="title">forearm</div>		
				
		<div class="pure-menu pure-menu-horizontal">
			<ul class="pure-menu-list">	
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rotateleft" style="opacity:.75"  id="rotate_arm_left" on:click={() => rotateArm("left")}  ></div>
						<div class="iconLabel">left</div>
					</div>       
				</li>

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rotateright" style="opacity:.75"  id="rotate_arm_right" on:click={() => rotateArm("right")}  ></div>
						<div class="iconLabel">right</div>
					</div>       
				</li>

				

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite reset" style="opacity:.75"  id="reset_arm" on:click={() => rotateArm("reset")}  ></div>
						<div class="iconLabel">reset</div>
					</div>       
				</li>				

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rotateleft" style="opacity:.75"  id="rotate_elbow_left" on:click={() => rotateElbow("left")}  ></div>
						<div class="iconLabel">left</div>
					</div>       
				</li>
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rotateright" style="opacity:.75"  id="rotate_elbow_right" on:click={() => rotateElbow("right")}  ></div>
						<div class="iconLabel">right</div>
					</div>       
				</li>
			
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite reset" style="opacity:.75"   on:click={() => rotateElbow("reset")}  ></div>
						<div class="iconLabel">reset</div>
					</div>       
				</li>	
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite mirror lower" style="opacity:.75"  on:click={() => mirror()}  ></div>
						<div class="iconLabel">mirror</div>
					</div>       
				</li>	
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite add" style="opacity:.75"  on:click={() => getNewSignData(true)}  ></div>
						<div class="iconLabel">+ sign</div>
					</div>       
				</li>	
				
								
			 </ul>
	 
		 </div>   
	</div>




	
	<div class="toolbarHolder">	
		<div class="title">hand</div>	
				
		<div class="pure-menu pure-menu-horizontal">
			<ul class="pure-menu-list">	
				

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rotateleft" style="opacity:.75"  id="incr_hand_left" on:click={() => rotateHand("incrLeft")}  ></div>
						<div class="iconLabel">+ left</div>
					</div>       
				</li>

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite rotateright" style="opacity:.75"  id="incr_hand_right" on:click={() => rotateHand("incrRight")}  ></div>
						<div class="iconLabel">+ right</div>
					</div>       
				</li>

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite moveleft" style="opacity:.75"  id="_hand_left" on:click={() => rotateHand("left")}  ></div>
						<div class="iconLabel">turn l</div>
					</div>       
				</li>

				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite moveright" style="opacity:.75"  id="_hand_right" on:click={() => rotateHand("right")}  ></div>
						<div class="iconLabel">turn r</div>
					</div>       
				</li>
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite reset" style="opacity:.75"  id="reset_hand" on:click={resetHand}  ></div>
						<div class="iconLabel">reset</div>
					</div>       
				</li>				


				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite object_flip_horizontal" style="opacity:.75"  id="hand_flipx" on:click={() => flipHand("x")} ></div>
						<div class="iconLabel">flipX</div>
					</div>       
				</li>
				
				<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite object_flip_vertical" style="opacity:.75"  id="hand_flipy" on:click={() => flipHand("y")} ></div>
						<div class="iconLabel">flipY</div>
					</div>       
				</li>
				
				
			<li class="pure-menu-item">
					<div class="iconTool">
						<div class="sprite PanToolFilled" style="opacity:.75" on:click={showShapegroups} ></div>
						<div class="iconLabel">+ shape</div>
					</div>       
				</li>
				

				
			 </ul>
	 
		 </div>   
	</div>
	
	<label>
		<input type=checkbox bind:checked={bothHands}>
		change both arms
	</label>	

{/if}


	{#if showHandshapes}
		{#each shapegroups as group}
			<div  class="handshapeGroup">`
			{#each group as num }
				<img on:click={addHand} id=id_{num} class='handshapeImages' src='./images/handshapes/{num}.png' />
			{/each}
			</div>
		{/each}
	{/if}
		
			{#if curSigndata}
				<p><b>word: {curSigndata.sign} </b></p>
			
				<p>signer: {curSigndata.signer}</p>
				
				<!-- p>frame: {frame}</p>
				
				<p>totalFrames: {numberPositions.length-1} </p -->
			{/if}
			

			{#if $words && controlsActive }
				<hr />
				<div><strong>{$words.length} signs powered by Kwippe</strong></div>
			{/if}
	</div>


</div>

<style>
	.frameCount {
		font-size: 10px;
		color: grey;
		width: 100%;
		text-align: center;
	}
	.frameNav {
		font-size: 30px;
		background-color: lightgrey;
		border-radius: 8px;
		cursor: pointer;
		text-align: center;
		padding:5px;
	}
	.frameNav:hover {
		opacity: .7;
	}
	.inputy {
		width: 200px;
		font-size: small;
	}
	.pad_top_bottom {
		padding-top: 5px;
		padding-bottom: 5px;	
	}
	.lower {
		margin-top: 7px;
	}
	.smaller {
		scale: .8;
	}
	.neg10 {
		margin-top: -10px;
	}
	.pad_full10 {
		padding: 10px;
	}
	.pad10 {
		padding-left: 10px;
	}
.topNav {
	width: 100%;
	margin:0;

}
.page {
	width: 48%;
	display: inline-block;
}
.toolbarHolder {
	position: relative;
	
}
.title {
	width: 45%;
	display: inline-block;
	padding: 6px;
}
.reset {
	scale: .7;
}
:global(.handshapeGroup) {
	z-index: 100;
}

:global(.imageHolder) {
	width: 100%;
	height: auto;
	text-align: center;
	font-size: 20px;
	overflow-y: scroll;
}
:global(.handshapeImages) {
	  max-width: 75px;
	  max-height: 75px;
	  margin: 5px;
	  cursor: pointer;
}
.hide {
	visibility: hidden;	
}
.inactive {
	background-color: lightgrey;
}
.active {
	background-color: yellow;
}

button,select {
	z-index: 2;	
}


	
canvas {

	z-index: 1;

/* 	transform: translateX(50%); */
}
	:global(.stage) {  
		position: absolute;
	}
	.pDiv {
	  overflow-wrap: break-word; 
	  width: 500px;
	   word-break: break-all;	
	   height: auto;
	
	}


.pure-menu-horizontal {
    width: 100%;
    white-space: nowrap;
    background-color: #fafbfd;
    height: 72px;
}

.pure-menu-horizontal .pure-menu-list {
    display: inline-block;
}


.pure-menu-horizontal .pure-menu-item,
.pure-menu-horizontal .pure-menu-heading,
.pure-menu-horizontal .pure-menu-separator {
    display: inline-block;
    *display: inline;
    zoom: 1;
    vertical-align: middle;
}

/* Submenus should still be display: block; */
.pure-menu-item .pure-menu-item {
    display: block;
    cursor: pointer;
}

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
