import { sample } from './utilities.js'
import { absolutize, parse, normalize } from './svgHelpers.js';
import { colorPathsByYAxis } from './coloring.js';

let op = 0;

/* https://codepen.io/jakealbaugh/pen/GZwgzV?editors=0010 */

const convertPoly = function (string) {
	let converted = string
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

//splitPaths('pb', 'pb'+i, ics[i].path, false, i, true, palette)

const splitPaths = (coll, name, path, icons, num, nosave, colorPalette) => {
	//console.log('splitPath() original path is ' + path)
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
	//console.log('parts! '+parts)
	var partsArray = [];
	parts = parts.toString() 
	parts = parts.split(/Z/)

	const yObj = {};

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
			//console.log('getting bounds! '+ bounds);
			//console.log('partsObj is ' + JSON.stringify(partsObj))

			partsArray.push({ path: part, bounds:bounds })
		  //console.log(i+' bounds: '+bounds)
		}
	}
	//partsArray =
	if (coll == 'awe' || coll == 'cry' || coll == 'ibm') partsArray = partsArray.reverse(); 
	op = 0;
	partsArray =  popItToTheTopBubble(partsArray);
	//partsArray = popItToTheTopInsertion(partsArray);
	//console.log('parts len is '+partsArray.length)
	//console.log('yObj is '+JSON.stringify(yObj));
	buildYObj(partsArray,yObj);
	colorPathsByYAxis(partsArray,yObj,false,true,colorPalette)
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
		return {name: name, x:true, json:art, yObj: yObj, vb: '0 0 500 500', coll: coll}
	}

	if (icons) {
		let state = store.get();
		let icons = state.icons;
		icons[num] = {name: name, x:true, json:art, yObj: yObj, vb: '0 0 500 500', coll: coll}
		//store.set({ 'icons': icons});
	}
	else {
	 // store.set({ 'iconPaths': {name: name, x:true, json:art, vb: '0 0 500 500', coll: coll}});
	}
}

const buildYObjFromComplex = (json) => {
	let paths = [];
	for (let i = 0; i < json.length; i++) {
		let path = json[i];
		if (path.a.d) {
			//console.log('d '+path.a.d);
			const bounds = pathBounds(path.a.d);
			paths.push(bounds)
			//console.log(bounds);
		}
	}
	let obj = {};
	let yObj = buildYObj(paths,obj);
	return yObj
}
const buildYObj = (partsArray,yObj) => {
	/* this builds our yObj from the bounds */
	//console.log('lenny is '+partsArray.length);
	for (var i = 0; i < partsArray.length; i++ ) {
		let bounds = partsArray[i].bounds;
		//console.log('bounds are '+JSON.stringify(bounds));
		let y = bounds[1];
		//console.log('y is '+y);
		/* doing parseInt here will give you less variation but might catch layers that are just slightly different - in fact in the future we may  want to  have an adjustable variance level here so things even 1 or 2 pixels off still get pulled into the same color group...*/


		let yVal = parseInt(y.toString());
		let pathArr = yObj[yVal] || [];
		pathArr.push(i);
		yObj[yVal] = pathArr;  
	}
	return yObj
}

const buildXObj = (partsArray,xObj) => {
	/* this builds our yObj from the bounds */
	for (var i = 0; i < partsArray.length; i++ ) {
	  let bounds = partsArray[i].bounds;
	  let x = bounds[0];  // not sure but think left is what we need
	  let pathArr = yObj[x.toString()] || [];
	  pathArr.push(i);
	  yObj[x.toString()] = pathArr;  
	}
}


var popItToTheTopBubble = (parts) => {
//console.log('running bubbleL');
	let pops = 0;

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

    /* changing j to i+1 instead of 0 sliced our work in half */
    
      for (let j = i+1; j < p.length; j++) {
         
  
        let left2 = p[j].bounds[0],
        top2 = p[j].bounds[1],
        right2 = p[j].bounds[2],
        bottom2 = p[j].bounds[3], 
        pos2 = j
        op++
/* top is less than or equal to
   left is less than or equal to
   right is greater than or equal to
   bottom is greater than or equal to
   position is above the other
   */

        if (top2 <=top && left2 <=left && right2 >=right && bottom2 >=bottom && pos2 > pos) {
        /* this needs to be changed so that if 3 of 4 of these are EQUAL, the algo runs. But
        if all 4 are EQUAL, it needs to return null as we don't want an infinite  loop on 2 equals
        */ 

        let temp = p[i];
        
        p[i] = p[j];
        
        p[j] = temp;
        
        numbersSwapped = true;
        pops++;
      }
    }
   }

  return p;
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
	let bounds;
	for (let i = 0; i < paths.length; i++) {

		let bounds = pathBounds(paths[i]);
		if (bounds[0] > top ) top = bounds[0];
		if (bounds[1] > right ) right = bounds[1];
		if (bounds[2] > bottom ) bottom = bounds[2];
		if (bounds[3] > left ) left = bounds[3];
	}
	//x, y, width, height
	return left+ ' '+ top+ ' ' + ((left+ right)) + ' ' + ((top + bottom));
	//bounds[0] + ' '+ bounds[1] + ' '+ bounds[2] + ' '+ bounds[3];

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


export { buildYObjFromComplex, pathBounds, convertPoly, splitPaths, trimWhiteSpace }