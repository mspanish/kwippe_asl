import { shuffle, sample } from './utilities.js';
import { hexToRgb, rgbToHsl, fromHSL, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex } from './colorConverters.js';


 //(partsArray,partsObj,recolor,stepped, colorPalette)
const colorPathsByYAxis = (partsArray,partsObj,recolor,stepped, colorPalette) => {
  // //console.log('now I am coloring by yAxis stepped = '+stepped)
	//console.log('colorPalette is '+colorPalette);
    //['#00ffff', '#0000ff']//
    let colorObj = {
      indices: {},
      colorGroups: {}
    };
    let step_i = 0;
    // example {"indices":{"0":{"colorGroup":"400"},"1":{"colorGroup":"192"}},"colorGroups":{"192":"green","400":"red"}}
    // go through each y value grouping and add a color group, using c from the current colorPalette. This way items positioned at the same y value will shade together.
    for (var yVal in partsObj) {
     
      if (stepped) {
        let step = colorPalette[step_i];


        if (!step) {
          step_i = 0;
          step = colorPalette[0];
        }

        //console.log('step is '+step)
        //console.log('step_i is '+step_i)


        colorObj.colorGroups[yVal]  = step;
        step_i++;
      }
      else {
        colorObj.colorGroups[yVal] = sample(colorPalette)
      }

      let arr = partsObj[yVal];
      for (var i = 0; i < arr.length; i++) {
        let pathIndex = arr[i];
        colorObj.indices[pathIndex.toString()] = { colorGroup: yVal };
      }
    }
    // go back over our array of paths and apply the color group that corresponds
    // to its group which was set above via comparing y values.
    if (!recolor) {
      for (var e = 0; e < partsArray.length; e++) {
            let colorGroup = colorObj.indices[e.toString()].colorGroup;
          partsArray[e].color =  colorObj.colorGroups[colorGroup]; //sample(colorPalette)//
      }
  }
  else {
      return colorObj
  }
  // return partsArray;
    //console.log(JSON.stringify(colorObj))  
  }



const recolorIcon = (icon, stepped, palette) => {

// let's randomize it so our icons don't all look the same...
	if (!stepped) palette = shuffle(palette);
	//console.log('palette is '+palette);  
	//console.log('recoloring Icon, stepped is '+stepped);
	//console.log('recolorIcon: icon is '+JSON.stringify(icon));

	if (icon.json && icon.json.c) {
      let colorObj;
      
      if (icon.yObj) {
        colorObj =  colorPathsByYAxis(icon.json.c,icon.yObj, true,stepped, palette);
      };
      
      if (icon.colorObj) {
        colorObj =  colorPathsByYAxis(icon.json.c, icon.colorObj, true, stepped, palette);
      };

      let step_i = 0;
	  
//console.log('colorObj is '+JSON.stringify(colorObj));

      for (var i = 0; i < icon.json.c.length; i++) {
          //console.log(e+'icon '+i)
 
          let element = icon.json.c[i];
          if (element.a && element.a.f) {
              if (icon.yObj || icon.colorObj) {
                let colorGroup = colorObj.indices[i.toString()].colorGroup;

                if (colorGroup == 'none' || colorGroup == 'undefined') continue;
				//console.log('colorGroup is '+colorGroup+ ' i is '+i);
                element.a.f =  colorObj.colorGroups[colorGroup];
				//console.log('not going stepped route, colorObj');
              }
              else {
                if (stepped) {
                  let step = palette[step_i];
                  if (step_i > palette.length-1) {
                    step_i = 0;
					//console.log('steps: going back to ZERO!');
                  }
                  element.a.f =  step;
				  //console.log('setting element.a.f to '+step);
                  step_i++;
                }
                else {
					//console.log('random from palette');
                  element.a.f = sample(palette);
                }
              }
          }
      }
  } // end if icon.json.c
  return icon
};
// path array needed comes from the json.c for the icon

const layersColorObj = (pArray) => {
  let colorObj = {};
  
  for (let i = 0; i < pArray.length; i++) {
    let element = pArray[i];
    if (element.a && element.a.f) {
      let color = element.a.f;
      color = color.replace('#', '').toLowerCase();
      // if not exist, create array for this color
      colorObj[color] = colorObj[color] || [];
      // push this layer's index into the color's array of layers
      colorObj[color].push(i);
    }
  }
 // //console.log('our new colorObj is '+JSON.stringify(colorObj));
  return colorObj;
}

var trimLeft = /^\s+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    mathRound = Math.round,
    mathMin = Math.min,
    mathMax = Math.max,
    mathRandom = Math.random;
	
// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

// Take input from [0, n] and return it as [0, 1]
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}


// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
 function hsvToRgb2(h, s, v) {

    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return [ r * 255, g * 255, b * 255 ];
}

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}

function rgbToHex3(r, g, b, allow3Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}


const colorUpDown = (hsl, ds, dv) => {

	let col;
	let tempLum = ( (hsl.l) - dv )

	//console.log('tempLum is now '+tempLum);

	if (tempLum >= 100) tempLum = 100;

	col = [hsl.h, hsl.s, tempLum];
	
	//console.log('tempSat WAS '+hsl.s);
	// sat is plus		  
	let tempSat =   ( hsl.s  +  ds )

	//console.log('tempSat is now '+tempSat);
	
	if (tempSat > 100) tempSat = 100;
	if (tempSat < 0) tempSat = 0;
	col = [hsl.h, tempSat, tempLum];

	if (col[0] < 0) col[0] = 0;
	if (col[1] < 0) col[1] = 0;
	if (col[2] < 0) col[2] = 0;


	col = 'hsl('+parseInt(col[0])+','+parseInt(col[1])+ '%,'+ parseInt(col[2])+ '%)';// 
	//console.log('running from HSL, col is now '+JSON.stringify(col));


	col = fromHSL(col);
//	//console.log('hex is now '+col)

	return col
}

const getColorFromMode = (mode, color, currentPalette, i) => {

    let reversePalette = [];
    for (let c of currentPalette) {
        reversePalette.push(c)
    }
    reversePalette = reversePalette.reverse();    

    switch (mode) {
        case 'single':
            // for this to work we need to make sure objectFill is updated whenever a color is switched out via the quickColors
            color = color || currentPalette[0]
        break;
        
        case 'stepped':
            color = currentPalette[i]
        break;

        case 'stepped_reverse':
            color = reversePalette[i]
        break;

        case 'random':
            color = sample(currentPalette)
        break;
    }     

    return color
}

export { recolorIcon, colorPathsByYAxis, layersColorObj, colorUpDown, getColorFromMode };
