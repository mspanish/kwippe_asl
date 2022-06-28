import { sample } from './utilities.js';

let randomizeKwippe = (firstRun, characterColors, aslObj) => {
	console.log('randomizing kwippe');
	let skinArr = characterColors[aslObj.gender]['faceshape'];
	aslObj.bodyColor = sample(skinArr);	
	
	colorHands(aslObj.bodyColor, aslObj);
	/*
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
	*/
}

let changeHand = (signdata, h, h2, noSwap, aslObj, handSwaps) => {

	if (!aslObj.character) return
	let pos = 'begin';
	if (aslObj.frame > 0) pos = 'end';
	/* if opendata has nada, try aslLex */
	
	if (!h && aslObj.aslLexData) h = aslObj.aslLexData.handshapes[pos].d;
	if (!h2 && aslObj.aslLexData) h2 = aslObj.aslLexData.handshapes[pos].nd;
	//console.log(JSON.stringify(aslLexData))
	
	/* neither have data, try asl2English. May be better to always deafult to these */
	if (!h && aslObj.asl2EnglishData) {
		h = aslObj.asl2EnglishData.handshapes[pos].d; 
		noSwap = true;
	}
	if (!h2 && aslObj.asl2EnglishData) {
		// this hand data is messy due to their inconsistent nested arrays system, so let's only add the ND hand if we're sure it's not a 1 handed sign
		if (aslObj.asl2EnglishData.hands > 1) {
			h2 = aslObj.asl2EnglishData.handshapes[pos].nd; 
			noSwap = true;
		}
		//console.log(JSON.stringify(asl2EnglishData.handshapes))
	}
	//console.log('dominant hand is '+h);
	//console.log('non dominant hand is '+h2);
		
	if (!h) {
		aslObj.character.skeleton.setAttachment("hand_right",'23');
		// we don't return here because we need to look at the other hand
	}
	else {
		h = h.toString().toLowerCase().replace('_', '-');
		//console.log('dh is '+h)
		if (!noSwap) h = handSwaps[h];
		if (h) aslObj.character.skeleton.setAttachment("hand_right",h);
		if (!h) aslObj.character.skeleton.setAttachment("hand_right",'23');
	}
	
	if (!h2) {
		aslObj.character.skeleton.setAttachment("hand_left",'23');
		colorHands(false, aslObj);
		return
	}
	h2 = h2.toString().toLowerCase().replace('_', '-');
	//console.log('nd2 is '+h2)
	if (!noSwap) h2 = handSwaps[h2];
	if (h2) aslObj.character.skeleton.setAttachment("hand_left",h2);
	if (!h2) aslObj.character.skeleton.setAttachment("hand_left",'23');
	colorHands(false, aslObj);
} 

let colorHands = (color, aslObj) => {
	if (!color) color = aslObj.bodyColor;
	var slot = aslObj.character.skeleton.findSlot('hand_right');
	slot.color.setFromString(color);	
	slot = aslObj.character.skeleton.findSlot('hand_left');
	slot.color.setFromString(color);	
}

/*  variables needed for fns:

	randomizeKwippe(firstRun, $characterColors)
	changeHand(signdata, h, h2, noSwap, aslObj,handSwaps)
	colorHands(color, aslObj)


*/


export { randomizeKwippe, changeHand, colorHands }