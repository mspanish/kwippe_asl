let signData = {	
	handshapes: [[null,null],[null,null]],
	regions: {
		right:[null,null],
		left: [null,null]
	},
	hands: { 
		pos0: {right: {}, left: {}}, 
		pos1: {right: {}, left: {}} 
	}
}

//::DONE
let resetPuppet = (resetData, aslObj) => {
	let selectedArm, character, bothHands,armData;

	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;


	if (!character) return
	
	if (resetData) {
		positionsSet = {};
		//signData.regions['right'][currentPosition] =  null; 
		//signData.regions['left'][currentPosition] =  null; 
		//signData.hands = { pos0: {right: {}, left: {}}, 
		pos1 = {
			right: {}, 
			left: {}  
		}; 
		
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
	rotateArm('reset', false, false, aslObj);
	rotateElbow('reset', false, false, aslObj);
	resetHand(aslObj);
	selectedArm = 'right';	
	rotateArm('reset', false, false, aslObj);
	rotateElbow('reset', false, false, aslObj);
	//resetHand(aslObj);	
} 

//::DONE rotateArm(dir, arm, amount, selectedArm, character, bothHands, armData)
let rotateArm = (dir,arm,amount, aslObj) => {

	let selectedArm, character, bothHands,armData;

	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;


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

//::DONE
let rotateElbow = (dir,arm,amount,aslObj) => {

	let selectedArm, character, bothHands,armData;
	
	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;


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

//::DONE
let rotateHand = (dir,arm,amount,aslObj) => {

	let selectedArm, character, bothHands,armData;
	
	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;

	let palmface = aslObj.activePalmface || 'default';
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

//::DONE
let flipHand = (dir, arm, once, aslObj) => {

	let selectedArm, character, bothHands,armData;
	
	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;

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
				flipHand(val.toLowerCase(),opposite,true, aslObj);
			}
		}
	}
		// for mirror fn we'll need to add an extra argument
	if (bothHands && dir != 'both' && !once) {
		flipHand(dir,opposite,true, aslObj)
	}
	//////console.log('flipHand value is now '+truthy)
	//character.skeleton.updateWorldTransform();
}
//::DONE
let resetHand = (aslObj) => {
	let arr = ['right', 'left'];

	let selectedArm, character, bothHands,armData;
	
	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;
	
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

//::DONE
let mirror = (mirrorRegion, aslObj) => {
	console.log('trying to run mirror')

	let selectedArm, character, bothHands,armData;
	
	selectedArm = aslObj.selectedArm;
	character = aslObj.character;
	bothHands = aslObj.bothHands;
	armData = aslObj.armData;

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
	rotateArm('mirror',opposite, false, aslObj);	
	rotateElbow('mirror', opposite, false, aslObj);
	rotateHand('mirror', opposite, false, aslObj); 
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

/*  variables needed for fns:

 resetPuppet(resetData, character,signData,armData,selectedArm)

 rotateArm(dir, arm, amount, selectedArm, character, bothHands, armData)

 rotateElbow(dir,arm,amount,selectedArm,character,bothHands,armData)

 rotateHand(dir,arm,amount,activePalmface,selectedArm,character,armData,bothHands)

 flipHand (dir, arm, once, selectedArm, character, armData)

 resetHand (bothHands, selectedArm, character, armData)

 mirror (mirrorRegion, signData, selectedArm, character, currentPosition)

*/


export { resetPuppet, rotateArm, rotateElbow, rotateHand, flipHand, resetHand, mirror }