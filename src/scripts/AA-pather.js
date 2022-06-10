import { sample, uniq} from './utilities.js'
import { absolutize, parse, normalize } from './svgHelpers.js';
import { colorPathsByYAxis } from './coloring.js';

let op = 0;


/* https://codepen.io/jakealbaugh/pen/GZwgzV?editors=0010 */

var convertPoly = function (string) {
var converted = string
  // close path for polygon
  .replace(/(<polygon[\w\W]+?)points=(["'])([\.\d, ]+?)(["'])/g, "$1d=$2M$3z$4")
  // dont close path for polyline
  .replace(/(<polyline[\w\W]+?)points=(["'])([\.\d, ]+?)(["'])/g, "$1d=$2M$3$4")
  .replace(/poly(gon|line)/g, "path")
;
return converted;
}     
/* thing I found onlinle to get the value from a object's string path...
like c.0.n - they kind queryJson returns...
https://gist.github.com/jasonrhodes/2321581
*/


const mergeAxes = (xObj, yObj,shapes) => {
	console.log('mergeAxes, shapes are '+JSON.stringify(shapes));
	//console.log('xObj: '+JSON.stringify(xObj));
//	console.log('yObj: '+JSON.stringify(yObj));
	
	const checkOtherArray = (obj,num, arr) => {
		for (let key in obj) {
			let layers = obj[key];
			//console.log(takenLayers);
			if (layers.includes(num)){// || layers.includes(num-1) || layers.includes(num+1)) {
				let newLayers = uniq([...layers, ...arr]);
				obj[key] = newLayers;
				// check to see if we need to combine any others...
				for (let key2 in obj) {
					if (key2 == key) continue;
					let layers2 = obj[key2];
					const found = layers2.some(r=> newLayers.indexOf(r) >= 0)
					if (found) {
						obj[key] = uniq([...newLayers, ...layers2]);
						delete obj[key2]
					}
				}
			}
		}
		return false
	}
	
	for (let key in xObj) {
		// for each number in array, see if it is found in another array in the yObj. 
		// if so, move all items to yObj, and delete
		let arr = xObj[key];
		for (let i = 0; i < arr.length; i++) {
			let num = arr[i];
			let inOtherArray = checkOtherArray(yObj,num,arr);
		}	
	}
	/*
	for (let key in yObj) {
		// for each number in array, see if it is found in another array in the yObj. 
		// if so, move all items to yObj, and delete
		let arr = yObj[key];
		for (let i = 0; i < arr.length; i++) {
			let num = arr[i];
			let inOtherArray = checkOtherArray(xObj,num,arr);
		}	
	}
	*/
    let obj = yObj;
	//let obj = Object.assign(yObj, xObj);
	//console.table('our new obj is '+JSON.stringify(yObj));
	return obj;
}

const splitPaths = (coll, name, path, icons, num, nosave, vb) => {
	if (!vb) vb = '0 0 500 500';
  //console.log('original path is ' + path)
  // var svga = new SVGPath()
  // svga.import(path)
  // let obj = svga.exportlist();
  // svga.absolute(path)
  // let parts = svga.export();
  let parts = parse(path);
  parts = absolutize(parts);
  parts = parts.join(',');
  //parts = normalize(parts);

 //console.log('type: '+typeof parts);
  // let parts = [];
  parts = parts.replace(/,/g, ' ');
 // console.log('parts! '+parts)
  var partsArray = [];
  parts = parts.toString() 
  parts = parts.split(/Z/)

  let yObj = {};
  let xObj = {};
 

  for (var i = 0, il = parts.length; i < il; i++) {
    if (parts[i].trim() != '') {
      // if parts[i+1] exists return 'Z' otherwise return nothing or '';
      let part = parts[i] + (parts[i + 1] ? 'Z' : '')
      part = part.trim()
      //	console.log('origin: '+path) 
      //	console.log( 'part is '+part); 
      const bounds = pathBounds(part);
     // partsObj = processPath(part, xObj, yObj, bounds, i);
      //partsObj = processBounds(bounds, yObj, i)
   //   console.log('getting bounds! '+ bounds);
      //console.log('partsObj is ' + JSON.stringify(partsObj))
     
      partsArray.push({ path: part, bounds:bounds })
      //console.log(i+' bounds: '+bounds)

    }
}
//partsArray =
if (coll == 'awe' || coll == 'cry' || coll == 'ibm') partsArray = partsArray.reverse(); 
op = 0;
let sameShapes = {};
partsArray = popItToTheTopBubble(partsArray,sameShapes);
partsArray = partsArray//[0];
//sameShapes = partsArray[1];
//console.log('sameShape '+JSON.stringify(sameShapes));
//partsArray = popItToTheTopInsertion(partsArray);
//console.log('parts len is '+partsArray.length)
yObj = buildYObj(partsArray,yObj);
xObj = buildXObj(partsArray,xObj);

let combinedObj = sameShapes //mergeAxes(xObj, yObj, sameShapes);

colorPathsByYAxis(partsArray,combinedObj, false, false, xObj)
//partsArray = popItToTheTop(partsArray);
/* we have to mimic the same structure as our color art */
const art = {
    c: []
};
 
for (let i = 0; i < partsArray.length; i++) {
  const element = {
    a:{
      d: partsArray[i].path,
      f: partsArray[i].color
      }
}
  art.c.push(element)
}

//console.log('setting new iconPath '+JSON.stringify(art));
//console.log('this graphic ' + name + ' has ' + partsArray.length + ' paths')

// added when you just need to return these values BACK, like for our icons in the palette builder
if (nosave) {
 return {name: name, x:true, json:art, yObj: yObj, vb: vb, coll: coll}
}

if (icons) {
  let state = store.getState();
  let icons = state.icons;
  icons[num] = {name: name, x:true, json:art, yObj: yObj, vb: vb, coll: coll}
  store.setState({ 'icons': icons});
}
else {
  store.setState({ 'iconPaths': {name: name, x:true, json:art, vb: vb, coll: coll}});
}

}


const runVariance = (obj,key) => {
	// this number should be a percentage of the viewBox - the fonts are huge, 8000 - so 10 pixels is really more like 1 for another image!
	let num = 10; 
	let done = false;
	for (let i = 0; i > num; i--) {
		if (obj[key+i]) key = key+i;
		let done = true;
	}
	if (done) return key
	
	for (let i = 0; i < num; i++) {
		if (obj[key+i]) key = key+i;		
	}

	return key
}

const buildYObj = (partsArray,yObj) => {
      /* this builds our yObj from the bounds */
      for (var i = 0; i < partsArray.length; i++ ) {
        let bounds = partsArray[i].bounds;
        let y = parseInt(bounds[1]);
	
		let key =  y;
	
		key = runVariance(yObj, key);
		
		key = key.toString();
		  
        let pathArr = yObj[key] || [];
        pathArr.push(i);
        yObj[key] = pathArr;  
	  }
	return yObj
}

const buildXObj = (partsArray,xObj) => {
/* this builds our yObj from the bounds */
for (var i = 0; i < partsArray.length; i++ ) {
  let bounds = partsArray[i].bounds;
  let x = parseInt(bounds[0]);  // not sure but think left is what we need
  let key =  x;
  
  key = runVariance(xObj, key);
 
  key = key.toString();
  let pathArr = xObj[key] || [];
  pathArr.push(i);
  xObj[key] = pathArr;  
}
return xObj
}

function between(x, min, max) {
  return x >= min && x <= max;
}


var popItToTheTopBubble = (parts, shapes) => {
//console.log('running bubbleL');
let pops = 0;
let shapesKeys = [];
 
function bubbleSort(p) {
 
  if(arguments.length !== 1 || !Array.isArray(p)) {
    return p
  }
  
  let numbersSwapped;

    
    for(let i = 0; i < p.length; i++) {
          
      numbersSwapped = false;

      let left = p[i].bounds[0],
      top = p[i].bounds[1],
      right = p[i].bounds[2],
      bottom = p[i].bounds[3],
      pos = i;
	  
	  // shape matching!
	  
	  let width = right - left;
	  let height = bottom - top;
    /* changing j to i+1 instead of 0 sliced our work in half */
    
      for (let j = i+1; j < p.length; j++) {
         
  
        let left2 = p[j].bounds[0],
        top2 = p[j].bounds[1],
        right2 = p[j].bounds[2],
        bottom2 = p[j].bounds[3], 
        pos2 = j
        op++;
		
		// shape matching!
		let width2 = right2 - left2;
		let height2 = bottom2 - top2;
		
       //console.log('w1 = '+width+ ' w2 = '+width2);
	   /*
	   if (width == width2) {
	    console.log('#######  h1 = '+height+ ' h2 = '+height2);
	   }
	   */
	 /* function to group by SHAPE!  this should be run for all art offline, as doing this at runtime for more than a couple of graphics could pretty much crash your app. But it will be just a small bit of data for each image, along with bounds and x, y, and both x,y groups = will make the art way easier to manipulate */ 
	   
		// first we set our variance number. For most art 1 or 2 is probably enough, but some stuff is really big and could use more - so this will have to be finessed some.
		let v = 10;
		
		// now we ask if the current piece's width or height is between the variance of the OTHER pieces width and height - for a match.
		
		if (between(width2, width-v, width+v ) && between(height2, height-v, height+v ) ) {
			//console.log('MATCH! #######  h1 = '+height+ ' h2 = '+height2);
			//console.log('MATCH! #######  w1 = '+width+ ' w2 = '+width2);
			// sweet you have a match! this is the same shape as the parent
			let widdy = width2, heighty = height2;
			let match = false;
			
			// if we don't have this combination of [width, height] in our shape keys, go ahead and push the numbers
			if (shapesKeys.length < 1) {
				shapesKeys.push([widdy,heighty])
			}
			// if not, YIKES but loop through all shapesKeys and see if we have something that is within our variance. here I also look for stuff that is flipped - and you could also check stuff rotated right or left, would be a good idea
			else {
				for (let i = 0; i < shapesKeys.length; i++) {
					
					let nums = shapesKeys[i];
					
					if ( between(nums[0], widdy-v, widdy+v) && between(nums[1], heighty-v, heighty+v) || between(nums[1], widdy-v, widdy+v) && between(nums[0], heighty-v, heighty+v)    ) {
						//console.log('match: new widdy: '+nums[0]+ ' new heighty: '+nums[1]);
						// if we found something w/in our variance, change the key to these so we make sure the shapes actually stay together instead of having stuff  like {500_300: [0,2], 501_301: [1,3]}
						
						widdy = nums[0]; heighty = nums[1];
						match = true;
					}
				};
			}
			// if looping over the shapesKeys found no match, we have a NEW key to add...
			if (!match) shapesKeys.push([widdy,heighty])
				
			// see if this key already exists, if not make it
			shapes[widdy+'_'+heighty] = shapes[widdy+'_'+heighty] || [];
			// push this layer to the group
			shapes[widdy+'_'+heighty].push(j);
			// make sure we don't have duplicates
			shapes[widdy+'_'+heighty] = uniq(shapes[widdy+'_'+heighty]);
		}
		
		
        if (top2 <=top && left2 <=left && right2 >=right && bottom2 >=bottom && pos2 > pos) {
        

        let temp = p[i];
        
        p[i] = p[j];
        
        p[j] = temp;
        
        numbersSwapped = true;
        pops++;
      }
    }
   }

  //console.log('shapes: '+JSON.stringify(shapes));
  return p
}
  
// Array elements are outputted from smallest to highest numbers
bubbleSort(parts);

//console.log('ops: '+op + ' pops: '+pops)

return parts; //arr.concat(parts);
// if (top2 <=top && left2 <=left && right2 >=right && bottom2 >=bottom && pos<pos2) {
}



//m 475 256

const pathBounds = (path) => {
// ES6 string tpl call
// if (Array.isArray(path) && path.length === 1 && typeof path[0] === 'string') path = path[0]

path = parse(path)
// path = abs(path)

path = normalize(path)

if (!path.length) return [0, 0, 0, 0]

var bounds = [Infinity, Infinity, -Infinity, -Infinity]

for (var i = 0, l = path.length; i < l; i++) {
  var points = path[i].slice(1)

  for (var j = 0; j < points.length; j += 2) {
    if (points[j + 0] < bounds[0]) bounds[0] = points[j + 0]
    if (points[j + 1] < bounds[1]) bounds[1] = points[j + 1]
    if (points[j + 0] > bounds[2]) bounds[2] = points[j + 0]
    if (points[j + 1] > bounds[3]) bounds[3] = points[j + 1]
  }
}

return bounds
}



const trimWhiteSpace = (paths, i)  => {
/* these bit make everything UNIFORM - all black icons are the same size, cant see any reason to run most of our stuff
through this though, but it's a way to get at resizing the artwork from the bounds - which we'll need later
for adding and removing PADDING */

let top = 0, right = 0, bottom = 0, left = 0, vb = '';

for (let i = 0; i < paths.length; i++) {
let bounds = pathBounds(paths[i]);
if (bounds[0] > top ) top = bounds[0];
if (bounds[1] > right ) right = bounds[1];
if (bounds[2] > bottom ) bottom = bounds[2];
if (bounds[3] > left ) left = bounds[3];
}

return bounds[0] + ' '+ bounds[1] + ' '+ bounds[2] + ' '+ bounds[3];

//     let parts = parse(art);
//     parts = absolutize(parts);
//     parts = parts.join(',');
//     //parts = normalize(parts);
//     parts = parts.replace(/,/g, ' ');
//    // console.log('parts! '+parts)
//     parts = parts.toString() 

//     const bounds = pathBounds(parts);

//     let vb = bounds.join(" ");
  //console.log('vb is '+vb )

}


export { pathBounds, convertPoly, splitPaths }