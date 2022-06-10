import { hexToRgb, rgbToHsl, fromHSL, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex } from './colorConverters.js';
import { splitPaths } from './pather.js';
import { recolorIcon, colorUpDown } from './coloring.js';
import { Toast, deleteAllToasts } from './toaster-js/index.js';
import { shuffle, saveToLocalStorage, sample, startCase } from './utilities.js';
//import { paletteName, paletteV, paletteBuilderColors, currentPalette, colorPalettes, iconsForPalette } from '../store.js';

	const characterColors = {
	male: {
		mouth: [ "#ff5027", "#fe856a", "#F18F77", "#e66638", "#e2a28c", "#e2a69a", "#E2929B", "#e28c7c", "#e0a4a0", "#dfb0b5", "#DA7C87", "#bd5c69", "#b8727b", "#ae8987", "#a96a47", "#A06B59", "#9D6D5F", "#9B565F", "#904539"],
		
		faceshape:// ["#f0c7b1","#F3D4CF","#FFD0BC","#D9B8AF"],
		["#D9A494","#E9B995","#F5AF95","#E19E95","#DAA488"],
		//,"#F2AA92","#ECC4B8","#F6E4E2","#EEAA83","#CDA184","#93614A","#764630","#753915","#582812","#B36A33","#4C2D18"],
		
		hair: ["#2a232b", "#080806", "#3b3128", "#4e4341", "#504543", "#6b4e40", "#a68469", "#b79675", "#decfbc", "#ddbc9b", "#a46c47", "#543c32", "#73625b", "#b84131", "#d6c4c4", "#fef6e1", "#cac1b2", "#b7513b", "#caa478", "#56342e" ],
		glasses: [ "#e05f48", "#da6972", "#97cf10", "#28be9c", "#107aa8", "#9b6db6", "#a90094", "#268135", "#c20b0b", "#2c2c2c", "#604ab3", "#092e0c", "#2e0914", "#edd218", "#210d34", "#153a4d", "#000000", "#130b3c", "#193d31", "#4d1f1f"],
		eyesiris: [ "#00f0f1", "#4DBCE9", "#ddb332", "#bd1c1b", "#8ab42d", "#7085b3", "#9fae70", "#4faaab", "#104BA9", "#4e60a3", "#9b1d1b", "#3c8d8e", "#284A7E", "#724f7c", "#7b5c33", "#282978", "#66724e", "#681711", "#4d3623", "#3e4442" ],
		eyes: [ "#000000", "#191c29", "#0f190c", "#09152e", "#302040", "#1b2a40", "#2c1630", "#2a150e", "#131111", "#1b1929", "#09112e", "#092e0c", "#2e0914", "#582311", "#210d34", "#153a4d", "#d6f7f4", "#5fa2a5", "#782c76", "#587d90"],
		},

	female: {
		mouth: [ "#ff5027", "#fe856a", "#F18F77", "#e66638", "#e2a28c", "#e2a69a", "#E2929B", "#e28c7c", "#e0a4a0", "#dfb0b5", "#DA7C87", "#bd5c69", "#b8727b", "#ae8987", "#a96a47", "#A06B59", "#9D6D5F", "#9B565F", "#904539"],
		
		faceshape: ["#f0c7b1","#F3D4CF","#FFD0BC","#D9B8AF","#D9A494","#E9B995","#F5AF95","#E19E95","#DAA488","#F2AA92","#ECC4B8","#F6E4E2","#EEAA83","#CDA184","#93614A","#764630","#753915","#582812","#B36A33","#4C2D18"],
		
		hair: ["#2a232b", "#080806", "#3b3128", "#4e4341", "#504543", "#6b4e40", "#a68469", "#b79675", "#decfbc", "#ddbc9b", "#a46c47", "#543c32", "#73625b", "#b84131", "#d6c4c4", "#fef6e1", "#cac1b2", "#b7513b", "#caa478", "#56342e" ],
		glasses: [ "#e05f48", "#da6972", "#97cf10", "#28be9c", "#107aa8", "#9b6db6", "#a90094", "#268135", "#c20b0b", "#2c2c2c", "#604ab3", "#092e0c", "#2e0914", "#edd218", "#210d34", "#153a4d", "#000000", "#130b3c", "#193d31", "#4d1f1f"],
		eyesiris: [ "#00f0f1", "#4DBCE9", "#ddb332", "#bd1c1b", "#8ab42d", "#7085b3", "#9fae70", "#4faaab", "#104BA9", "#4e60a3", "#9b1d1b", "#3c8d8e", "#284A7E", "#724f7c", "#7b5c33", "#282978", "#66724e", "#681711", "#4d3623", "#3e4442" ],
		eyes: [ "#000000", "#191c29", "#0f190c", "#09152e", "#302040", "#1b2a40", "#2c1630", "#2a150e", "#131111", "#1b1929", "#09112e", "#092e0c", "#2e0914", "#582311", "#210d34", "#153a4d", "#d6f7f4", "#5fa2a5", "#782c76", "#587d90"],
		
		},
	monster: {
		mouth: [ "#ff5027", "#fe856a", "#F18F77", "#e66638", "#e2a28c", "#e2a69a", "#E2929B", "#e28c7c", "#e0a4a0", "#dfb0b5", "#DA7C87", "#bd5c69", "#b8727b", "#ae8987", "#a96a47", "#A06B59", "#9D6D5F", "#9B565F", "#904539"],
		
		faceshape: ["#f0c7b1","#F3D4CF","#FFD0BC","#D9B8AF","#D9A494","#E9B995","#F5AF95","#E19E95","#DAA488","#F2AA92","#ECC4B8","#F6E4E2","#EEAA83","#CDA184","#93614A","#764630","#753915","#582812","#B36A33","#4C2D18"],
		
		hair: ["#2a232b", "#080806", "#3b3128", "#4e4341", "#504543", "#6b4e40", "#a68469", "#b79675", "#decfbc", "#ddbc9b", "#a46c47", "#543c32", "#73625b", "#b84131", "#d6c4c4", "#fef6e1", "#cac1b2", "#b7513b", "#caa478", "#56342e" ],
		glasses: [ "#e05f48", "#da6972", "#97cf10", "#28be9c", "#107aa8", "#9b6db6", "#a90094", "#268135", "#c20b0b", "#2c2c2c", "#604ab3", "#092e0c", "#2e0914", "#edd218", "#210d34", "#153a4d", "#000000", "#130b3c", "#193d31", "#4d1f1f"],
		eyesiris: [ "#00f0f1", "#4DBCE9", "#ddb332", "#bd1c1b", "#8ab42d", "#7085b3", "#9fae70", "#4faaab", "#104BA9", "#4e60a3", "#9b1d1b", "#3c8d8e", "#284A7E", "#724f7c", "#7b5c33", "#282978", "#66724e", "#681711", "#4d3623", "#3e4442" ],
		eyes: [ "#000000", "#191c29", "#0f190c", "#09152e", "#302040", "#1b2a40", "#2c1630", "#2a150e", "#131111", "#1b1929", "#09112e", "#092e0c", "#2e0914", "#582311", "#210d34", "#153a4d", "#d6f7f4", "#5fa2a5", "#782c76", "#587d90"],
		}		
};
  
const checkForPalettes = () =>{
		
	let localPalettes = $colorPalettes;	

	if (localPalettes) {
		// do nada, we should already have what we need
		//console.log('we already got some localPalettes, do nada!');

	}
	else {
		//console.log('we dont have localPalettes in storage...FETCH em...');
		let urly = '/data/json/palettes.json';

		fetch(urly)
			.then(res => res.json())
			.then(data => {
				//store.set({colorPalette: data[0].c, colorPalettes: data });
				//initDropdowns();
			});
	}	
}
     //COLOR TRANSFORMATION FUNCTIONS from https://github.com/DanielSoltis/color-contrast/blob/master/contrast.js
	 
	 // colorData needs to be an array that you're building fromm within your fn, looping through, then this will give you the obj you need to push to colorData which you'll feed to the paletteHelpers.js for ASE, Sketch, and CSV export
	 const getColorDataEntry = (rgb, hex) => { 
	  let obj = {
			name : hex,
			rgb : [rgb[0], rgb[1], rgb[2]],
			hex : hex
		}
	  return obj
	 }
	 
	 //takes a color as RGB array, step size (between 0 and 1) and direction (-1 or 1) and returns a color with a lighter or darker luminosity 
    const shiftColorLuminosity = function (color, step, direction) {
        var tempHSL, newRGB, roundedRGB;
        
        tempHSL = new RgbToHsl(color[0], color[1], color[2]);
        tempHSL[2] = Math.min(1, Math.max(0, tempHSL[2] + direction * step));
        
        newRGB = new HslToRgb(tempHSL[0], tempHSL[1], tempHSL[2]);
        roundedRGB = [Math.round(newRGB[0]), Math.round(newRGB[1]), Math.round(newRGB[2])];
		
		if (roundedRGB.toString() === "0,0,0" || roundedRGB.toString() === "255,255,255") {
			let str = 'sorry, you have reached the end!';
			new Toast(str, 'modal','error',0,[
					{text:'ok',action:'cancel'},
				]); 			
			return false	
		}

       //if the step size is very small, this makes sure that the RGB value changes by at least 1
        while (color.toString() === roundedRGB.toString() && roundedRGB.toString() !== "0,0,0" && roundedRGB.toString() !== "255,255,255") {
            tempHSL[2] = Math.min(1, Math.max(0, tempHSL[2] + direction * step));
            newRGB = new HslToRgb(tempHSL[0], tempHSL[1], tempHSL[2]);
            roundedRGB = [Math.round(newRGB[0]), Math.round(newRGB[1]), Math.round(newRGB[2])];
        }
        return roundedRGB;
    };
	 

    //takes in a valid hex value and updates tempColor with the hex and rgb values
    const updateTempColorFromHex = function (hex) {
        tempColor.hex = hex;
        tempColor.rgb = hexToRgb(hex).slice();
    };
    
    //takes in an array of r, g, b between 0 and 255 and updates tempColor with rgb and hex values
    const updateTempColorFromRgb = function (r, g, b) {
        tempColor.rgb = [r, g, b];
        tempColor.hex = rgbToHex([r, g, b]);
    };
    
    //takes an an array [r, g, b] and returns a 6-digit hex value
    const rgbToHex2 = function (rgb) {
		let value = {r: rgb[0], g:rgb[1], b:rgb[2]};
	 var r = Math.round(value['r']).toString(16)
		if (r.length === 1) {
		  r = '0' + r
		}
				//console.log('r:  => '+r)
		var g = Math.round(value['g']).toString(16)
		if (g.length === 1) {
		  g = '0' + g
		}
				  	//console.log('g:  => '+g)
		var b = Math.round(value['b']).toString(16)
		if (b.length === 1) {
		  b = '0' + b
		}
				  	//console.log(':b  => '+b)
		return   r + g + b
    };
    
    const hexToRgb2 = function (hex) {
        var m = null;
        if (hex.length === 3) {
            m = hex.match(/([0-9a-f]{3})$/i);
            if (m !== null) {
                return [parseInt(m[0].charAt(0), 16) * 0x11, parseInt(m[0].charAt(1), 16) * 0x11, parseInt(m[0].charAt(2), 16) * 0x11];
            } else {
                return null;
            }
        } else if (hex.length === 6) {
            m = hex.match(/([0-9a-f]{6})$/i);
            if (m !== null) {
                return [parseInt(m[0].substring(0, 2), 16), parseInt(m[0].substring(2, 4), 16), parseInt(m[0].substring(4, 6), 16)];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };
    
    const RgbToHsl = function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2, d = max - min;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }

        return [h, s, l];
    };
    
    const HslToRgb = function (h, s, l) {
        var r, g, b,
            q = l < 0.5 ? l * (1 + s) : l + s - l * s,
            p = 2 * l - q;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
        
        return [r * 255, g * 255, b * 255];
    };
    
    const hueToRgb = function (p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    };
    
    //takes in an array [r, g, b] and checks if every value is between 0 and 255
    const isValidRgb = function (rgb) {
        var valid = true;
        rgb.forEach(function (val) {
            if (val === "" || val < 0 || val >= 256) {
                valid = false;
            }
        });
        return valid;
    };
    
    //takes in a string and checks if it is a valid 3- or 6-digit hex string
    const isValidHex = function (hex) {
        var m = null;
        if (hex.length === 3) {
            m = hex.match(/([0-9a-f]{3})$/i);
            if (m !== null) {
                return true;
            } else {
                return false;
            }
        } else if (hex.length === 6) {
            m = hex.match(/([0-9a-f]{6})$/i);
            if (m !== null) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    
    const isValidColor = function (color) {
        var matchHexAndRgb = (color.hex === rgbToHex(color.rgb));
        return isValidRgb(color.rgb) && matchHexAndRgb;
    };
    
    //takes an RGB color array [r,g,b] (0-255 range) and returns its luminosity
   const evaluateLuminosity = function (c) {
        // http://www.w3.org/TR/WCAG20/#relativeluminancedef    
        var rgb, i, chan;
        rgb = [c[0], c[1], c[2]];
        for (i = 0; i < rgb.length; i = i + 1) {
            chan = rgb[i] / 255;
            rgb[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
        }
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    //takes 2 RGB color arrays [r,g,b] (0-255 range) and returns their contrast value
    const evaluateContrast = function (c1, c2) {
        // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
        var lum1 = evaluateLuminosity(c1),
            lum2 = evaluateLuminosity(c2);
        if (lum1 > lum2) {
            return (lum1 + 0.05) / (lum2 + 0.05);
        }
        return (lum2 + 0.05) / (lum1 + 0.05);
    };

    //takes a contrast value (0-21) and returns a text string corresponding to WCAG score
    const interpretContrast = function (ct) {
        if (ct < 3.1) {
            return "Fail";
        }
        if (ct < 4.5) {
            return "AA large";
        }
        if (ct < 7) {
            return "AA";
        }
        return "AAA";
    };
  
  
  
  
  const createFromAngles = function (color_val, angle_array,type) {
    //console.log('createfromAngles color '+color_val)
	if (!color_val) {
		console.log('no color_val');
		return		
	}
    color_val = color_val.toString();
    if (!type) type = 'hue';
    let cols = [], c = color_val, rgb, hsl;
    cols.push(c);
    /* we've moved to HSL to if already HSL, don't run this!! */
    if (c.includes('#')) {
	  
	  //console.log('running hexToRgb, color_val is '+c);
	  
// we seem to be getting back occasional unwanted digits that ruin our conversion...	 
	 color_val = color_val.substring(0, 7);
      rgb = hexToRgb(color_val)
    //console.log('rgb is now ' +JSON.stringify(rgb))
      hsl = rgbToHsl(rgb);
    }
    else {
      hsl = color_val.replace('hsl(', '').replace(')', '').replace(/\%/g, '')
      hsl = hsl.split(',');
      hsl = {
        h: hsl[0],
        s: hsl[1],
        l: hsl[2]
      }
    }
    //console.log('color_val now '+JSON.stringify(hsl))

    //console.log('hex is now an object '+JSON.stringify(hsl))
   // this.palette.push(color_val);
   //console.log('type is '+type)
   //console.log('angleArray is '+angle_array)
    for (var i in angle_array) {
      //if (angle_array.hasOwnProperty(i)) {
        
      //  //console.log('hsl.h is '+hsl.h)        
        let col, tempHue, tempSat;
       
        switch (type) {
          case 'lum':
          let tempLum =  ((hsl.l)  - angle_array[i]);
          if (tempLum >= 100) tempLum = 100;
          col = [hsl.h, hsl.s, tempLum];
          //console.log('lum col is '+col)
          break;

          case 'satStep':
		  //console.log('tempSat WAS '+hsl.s);
          tempSat =   hsl.s  + angle_array[i];
		  //console.log('tempSat is now '+tempSat);
          if (tempSat > 100) tempSat = 100;
          if (tempSat < 0) tempSat = 0;
		  col = [hsl.h, tempSat, hsl.l];
		  
          break;   

          case 'sat':
          tempSat =  ((hsl.s)  - angle_array[i]);
          col = [hsl.h, tempSat, hsl.l];
          break;    

          case 'hueStep':
		  //console.log('our angle_array is '+angle_array[i]);
          tempHue = hsl.h + angle_array[i];
			//console.log('our tempHue WAS ' + hsl.h);
			//console.log('our tempHue is now '+tempHue);
			
          col = [tempHue, hsl.s, hsl.l];
          break; 
		  
          case 'hue':
          
		  tempHue = ((hsl.h*100)  + angle_array[i]) % 360;
			
          col = [tempHue, hsl.s, hsl.l];
          break; 
          default:
          col = [tempHue, hsl.s, hsl.l];     
          break;
        }
		// ditch negative values, they screw up our conversion!!
		
		if (col[0] < 0) col[0] = 0;
		if (col[1] < 0) col[1] = 0;
	    if (col[2] < 0) col[2] = 0;
		
        
        col = 'hsl('+parseInt(col[0])+','+parseInt(col[1])+ '%,'+ parseInt(col[2])+ '%)';// 
		//console.log('running from HSL, col is now '+JSON.stringify(col));
		
		
		col = fromHSL(col);
        //console.log('hex is now '+col)
       // this.palette.push(col);
	 
        cols.push(col);
      //}
    }
    //console.log('color vals '+JSON.stringify(cols))
    return cols;
   // return this.palette;
  }; // createFromAngles


  const LighterSteps = function (hex,num, steps) {
    let arr = [];
    let i = 0; 
    let e = steps;
    let f = steps;
    while (i < steps) {
     arr[f] =  num*i;
     arr[e] = -num*i;
     i++;
     e++;
     f--;
    }
    let cols = createFromAngles(hex, arr, 'lum');
    cols = cols.reverse();
    cols.pop();
    cols.pop();
    return cols;
  };

  /* Complementary colors constructors */
  const Compl = function (color_val) {
    return createFromAngles(color_val, [180]);
  };

  /* Scheme - creating a light and dark from the base */
  const Scheme = function (color_val) {
  //  createFromAngles(hex, arr, 'lum');
    let temp = [color_val];
    let arr = createFromAngles(color_val, [-10,10], 'sat');
    for (var i = 0; i < arr.length-1; i++) {
      let lum = 30,hue = 1;
      if (i == 0) {
        lum = -30;
        hue = -1;
      }
       let col = arr[i];
      // col = createFromAngles(col, [hue],'hue');
      // col = col[1]
      col = createFromAngles(col, [lum],'lum');
      col = col[1]
      temp.push(col)
    }
   // arr = createFromAngles(color_val, [-10,10], 'hue');  
    return temp
    //createFromAngles(color_val, [-20,20], 'lum');
  };


  /* Triad */
  const Triad = function (color_val) {
    return createFromAngles(color_val, [120,240]);
  };

  /* Tretrad */
  const Tetrad = function (color_val) {
    return createFromAngles(color_val, [60,180,240]);
  };

  /* Analogous */
   const Analog = function (color_val) {
    return createFromAngles(color_val, [-45,45]);
  };

  /* Split complementary */
  const Split = function (color_val) {
    return createFromAngles(color_val, [150,210]);
  };

  /* Accented Analogous */
  const Accent = function (color_val) {
    return createFromAngles(color_val, [-45,45,180]);
  };

  
const addColors = (hex,variations,shades,leaveShades) => {
	let v = []
	let colors = [];
	let obj = {};
	if (!shades) shades = false;

	/*
	v.compl = Compl(hex);
	v.triad = Triad(hex);
	v.tetrad = Tetrad(hex);
	v.analog = Analog(hex);
	v.split = Split(hex);
	v.accent = Accent(hex);
	*/

	v.push({name: 'compl', colors: Compl(hex)});
	v.push({name: 'scheme', colors: Scheme(hex)});
	v.push({name: 'triad',  colors: Triad(hex)});
	v.push({name: 'tetrad',  colors: Tetrad(hex)});
	// v.push({name: 'analog', colors: Analog(hex)});
	v.push({name: 'split', colors: Split(hex)});
	v.push({name: 'accent', colors: Accent(hex)});

	 //colors = col;
	let num = 4;
	let cs = LighterSteps(hex, num, 11);
	colors = cs;
	if (variations) {
		// user has clicked on a secondary color, so we switch the variations!
		//store.set({ paletteV: v, shades: false});  
	}
	else {
		if (shades) {
			obj = {shades: colors};
		
		}
		if (!shades && !leaveShades) {
			obj = {paletteExpand: colors, paletteV: v, shades:false};
		}
	}
		return obj
}

const recolorPaletteIcons = (cur, iconsForPalette) => {
	//console.log('recolorP: cur is '+cur); 
	//console.log('recolorP: iconsForPalette is '+iconsForPalette);
	//console.log('recolorP: colorPalette is '+cur);
	
	let ics = iconsForPalette;

	//console.log('ics is '+ics)
	// this is REALLY Important in Svelte 2.0 - glitchy store behavior where adjusting CP fromm state, if you don't make a deep copy, actually CHANGES the store itself - really fubard
	//let cp = Array.from(colorPalette);
	//const range = Array.from({ length: cp.length  }, (val, key) => key);

	let palette = cur// range;
	let arr = [];

	//console.log('recolorP: palette is '+palette);

	if (ics[0].path) {
	  //console.log('splitting paths');
	  for (let i = 0; i < ics.length; i++) {
		   // (coll, name, path, icons, num, nosave)

			let ic =  splitPaths('pb', 'pb'+i, ics[i].path, false, i, true, palette)
			//console.log('splitPaths arr is '+JSON.stringify(ic));
			arr.push(ic);
	  }
		ics = arr;
	}
	else {
		//console.log('NOT splitting paths');
	  /* since we are using steps, unless we do this adding colors won't change images with less 
	  paths than the palette length */
	  
	  for (var i = 0; i < ics.length; i++) {
	  /* the last arg is 'stepped' which I think will give a better result here */
		 //console.log('palette is '+palette);
		  //console.log('ics[i] is '+JSON.stringify(ics[i]));
		 // icon, stepped, palette
		  let el = recolorIcon(ics[i], true, palette);
		  //console.log('el is '+JSON.stringify(el));
		  arr.push(el);
	  }
	}
	 return arr
 // saveToLocalStorage('state', JSON.stringify(state));
  //},3000)
}

const recolorIconArray = (color, iconArray) => {

 //console.log('iconArray is '+iconArray);
  
  if (!iconArray) return
  
  let arr = [];
  let ics = iconArray;

  for (let i = 0; i < iconArray.length; i++) {
      arr.push({ stroke: 0, color: color , name: 'pb'+i, path: iconArray[i], coll: 'pb'});
  }
  return arr;  
  //store.set({ iconsForPalette: ics});
 // state = store.get();
  //saveToLocalStorage('state', JSON.stringify(state));
}

const getMat = () => {
  return ['#ffffff', '#e84e40','#ec407a','#ab47bc','#7e57c2','#5c6bc0','#738ffe','#29b6f6','#26c6da','#26a69a','#2baf2b','#9ccc65','#d4e157','#ffee58','#ffa726','#ff7043','#8d6e63','#bdbdbd','#78909c', '#666666'];
}


function invertHex(hexnum){
  if (!hexnum) return
  hexnum = hexnum.toString();
  hexnum = hexnum.replace('#','');
  if(hexnum.length != 6) {
  //  alert("Hex color must be six hex numbers in length.");
    return false;
  }

  hexnum = hexnum.toUpperCase();
  
  //console.log('our hexnum is '+hexnum);
  
  var splitnum = hexnum.split("");
  var resultnum = "";
  var simplenum = "FEDCBA9876".split("");
  var complexnum = new Array();
  complexnum.A = "5";
  complexnum.B = "4";
  complexnum.C = "3";
  complexnum.D = "2";
  complexnum.E = "1";
  complexnum.F = "0";
  
  for(let i=0; i<6; i++){
    if(!isNaN(splitnum[i])) {
      resultnum += simplenum[splitnum[i]]; 
    } else if(complexnum[splitnum[i]]){
      resultnum += complexnum[splitnum[i]]; 
    } else {
    //  alert("Hex colors must only include hex numbers 0-9, and A-F");
      return false;
    }
  }
  //console.log(hexnum+ ' inverting: '+resultnum)
  return '#'+resultnum;
}

const setColorObjs = (palettes,len,charName,coll) => {
 //console.log('palettes:  '+JSON.stringify(palettes));
  let palettesArr = [];
  
  /* we can't  use palettes w/out at least 7 colors! */

  for (let e = 0; e < palettes.length; e++) {
      if (palettes[e].c && palettes[e].c.length > 6) {
          palettesArr.push(palettes[e].c)
      }
  }
  let overflow = 0;

  let arr = [];
 //console.log('palettesArr:  '+JSON.stringify(palettesArr));
  for (let i = 0; i < len+2; i++) {
      

	  
      let cols = palettesArr[i]
      if (!cols) cols = sample(palettesArr);
	  
	  // pick a random color and make a matching color object
	  let hex = sample[cols];
	  
      let colors = updateColorObject(false,false, hex)
	 //console.log('palettesArr:  '+JSON.stringify(colors));
      arr.push(colors);
//      //console.log('arr length is '+arr.length)
  }
  //console.log('arr 1 is '+JSON.stringify(arr[0]));
  //store.set({colorObjs: arr});  
};

/* set flag is used to update the store - beware means all things using colorObj will change! 
const updateColorObject = (colors, set) => {
   
  let inverted = invertHex(colors[3]);
  let colorObj = {
      'arr': colors,
      'tone': colors[3], 
      'halfstepLighter': colors[2], 
      '1stepLighter': colors[2], 
      '2stepsLigher': colors[1],
      '3stepsLighter': colors[0],
      '1stepDarker': colors[4], 
      '2stepsDarker': colors[5], 
      '3stepsDarker': colors[6],
      'hl05': colors[0],
      'hl1': colors[1],
      'hl2': colors[2],
      'sd1': colors[4],
      'sd2': colors[5],
      'sd3': colors[6],
      'sd35': colors[6],
      'wrinkles': colors[6],
      'inverse': inverted,
      'grey': '#a8a8a8',
      'none': 'none',
      'white': '#ffffff'
      }
  if (set) {
    //store.set({colorObj:colorObj})    
  }  
  return colorObj
};


*/

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
// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv2(rgb) {
	let r = rgb[0], g = rgb[1], b = rgb[2];

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

// Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a) {
    a = parseFloat(a);

    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }

    return a;
}
// Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

const colorIsLight = function (rgb) {
  let r = rgb[0], g = rgb[1], b = rgb[2];
  // Counting the perceptive luminance
  // human eye favors green color... 
  var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return (a < 0.4);
}

/* set flag is used to update the store - beware means all things using colorObj will change! */
const updateColorObject = (set, coll, hex, z) => {
  if (!hex) {
	  //console.log('got no color, trying to set object for '+coll + ' no '+z);
	  return false
  }
  let rgb = hexToRgb(hex.toString());
  //console.log('          $$$$$$$$$$$ rgb is now ' +JSON.stringify(rgb))
  
  let textContrast = colorIsLight(rgb) ? '#000000' : '#ffffff';

  
  let tone = rgbToHsl(rgb);	

  //console.log('>> starting hex is '+hex);
  
 // let rsvy = hsvToHex(tone);
  //let hexy = rgbToHex(rgb);
  
  
//console.log('hex: '+hex+ ' hexy should be same as hex: ' +rsvy)
 //console.log('          ##### tone is now '+JSON.stringify(tone));
  
  let inverted = invertHex(hex);

  let stepDarkerHalf = colorUpDown(tone, 3, 5)// colorUpDown(tone, .6*delta_sat,-.6*delta_val);
  let stepDarker1 = colorUpDown(tone, 3, 10)//colorUpDown(tone,-0.5*delta_sat,0.5*delta_val);
  let stepDarker2 = colorUpDown(tone, 3, 15)//colorUpDown(tone,2.5*delta_sat,-2.5*delta_val);
  let stepDarker3 =colorUpDown(tone, 3, 20) //colorUpDown(tone,3.5*delta_sat,-3.5*delta_val);
  let stepDarker4 =colorUpDown(tone, 3, 25) //colorUpDown(tone,3.5*delta_sat,-3.5*delta_val);

  let stepLighter1 =  colorUpDown(tone, 3, -10)
  let stepLighter2 = colorUpDown(tone, 3, -15)//colorUpDown(tone,-2*delta_sat,2*delta_val);
  let stepLighter3 = colorUpDown(tone, 3, -20)//colorUpDown(tone,-2*delta_sat,2*delta_val);
  let stepLighter4 = colorUpDown(tone, 3, -25)//colorUpDown(tone,-2*delta_sat,2*delta_val);

  let stepLighterHalf = colorUpDown(tone, 3, -5)//colorUpDown(tone, -1*delta_sat,1*delta_val);
  let textAdjust = colorIsLight(rgb) ? stepDarker4 : stepLighter4;
  
  let colorObj = {
      'tone': hex, 
      'halfstepLighter': stepLighterHalf,
      '1stepLighter': stepLighter1,
      '2stepsLighter': stepLighter2,
      '3stepsLighter': stepLighter3,
      '4stepsLighter': stepLighter4,
      '1stepDarker': stepDarker1,
      '2stepsDarker': stepDarker2,
      '3stepsDarker': stepDarker3,
      '4stepsDarker': stepDarker4,
      'hl05': stepDarker1,
      'hl1': stepLighter1,
      'hl2': stepLighter2,
	  'sd05': stepLighter1,
      'sd1': stepDarkerHalf,
      'sd2': stepDarker1,
      'sd3': stepDarker2,
      'sd35': stepDarker3,
      'wrinkles': stepDarker2,
      'inverse': inverted,
      'grey': '#a8a8a8',
      'none': 'none',
      'white': '#ffffff',
	  'textContrast': textContrast,
	  //::WHY:: this is how RECT gradients are colored, for now I set them to match
	  'gradient': [textContrast, textContrast],
	  'text': textAdjust
      };
      
  if (set) {
    //store.set({colorObj:colorObj})    
  }  
  /*
  // added to set color objects for specific body parts in avatar builder
  if (coll) {
	
	  let partColors = $partColors || {};
	  partColors[coll] = colorObj;
	  //store.set({partColors: partColors})
  }
  */
 //console.log('setting colorObj '+JSON.stringify(colorObj));
  return colorObj
};

const shiftColorTemperature = (rgb, dir) => {
	//console.log('rgb is '+JSON.stringify(rgb));

//rgb(23, 41, 111)
	let orig = rgb;
	
/* lowering RED while increasing GREEN slighly, keeping blue constant, actually seems to work best here , with the reverse for warming */
	
	const rgbCooler = (rgb) =>{

		rgb[0] = (rgb[0] - 7);
		
		rgb[1] = (rgb[1] + 3);
		//rgb[0] = parseInt(rgb[0] + (rgb[0] * .05));	
		//console.log('warmer, rgb is '+JSON.stringify(rgb));
		return rgb
	}
	const rgbWarmer = (rgb) =>{
		//rgb[2] = parseInt(rgb[2] + (rgb[2] * .05));
		rgb[0] = (rgb[0] + 7);
		
		rgb[1] = (rgb[1] - 3);
		//console.log('cooler, rgb is '+JSON.stringify(rgb));
		return rgb
	}

	if (dir == -1) {
		 rgb = rgbWarmer(rgb);
	}
	else {
		rgb =  rgbCooler(rgb);
	}
	
// throw out values that are too high or low
	if (rgb[0] < 0) rgb[0] = 0;	
	if (rgb[0] > 255) rgb[0] = 255;
	if (rgb[1] < 0) rgb[2] = 0;	
	if (rgb[1] > 255) rgb[2] = 255;	
	
	//console.log('rgb temp is now '+rgb);
	return rgb
	
}





function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

const adjustByType = (type, dir, rgb) => {
	let angles, hex, col, color;
	
	switch (type) {
		
		case 'lum':
			return shiftColorLuminosity(rgb, .05, dir);
		break;
		
		case 'hue':
			//console.log('rgby  '+rgb);
			angles = [15];
			if (dir === -1) {
				//console.log('NEGATIVE')
				angles = [-15];
			}
		 	hex = rgbToHex(rgb);
			//console.log('hexy '+hex);
			col = createFromAngles('#'+hex, angles, 'hueStep');  
			//let color = changeHue(rgb,angles[0]);
			//console.log('our col is '+JSON.stringify(color));
			
			// first is the original color so we need position 2
			color = col[1];
			return color
		break;
		
		case 'tem': 
			return shiftColorTemperature(rgb, dir);
		break;
		
		case 'sat':
			angles = [-10];
			if (dir === -1) {
				angles = [10];
			}
		 	hex = rgbToHex(rgb);
			col = createFromAngles('#'+hex, angles, 'satStep');  
			color = col[1];
			return color		
		break;
	}
}

const adjustPalette = (type,dir,palette) =>{
	if (dir == 'minus') {
		dir = 1
	}
	else { dir = -1 };
	
	//console.log('our cur palette is '+palette);
	let arr = [];
	for (let col of palette) {
		//console.log('co)l is '+col);
		col = hexToRgb(col);	
		//console.log('rgb is now '+JSON.stringify(col));

		col = adjustByType(type, dir, col); 
		
		if (col == false) return
		
		//console.log('new luminosity is '+JSON.stringify(col));

		// only convert if not already hex...
		if (col && !col.includes('#')) col = rgbToHex(col);
		//col = col.substring(0, 6);
		col = col.replace('#', '');
		//console.log('rgbToHex gave us '+col)

		arr.push('#'+col);
	}
	//console.log('arr '+arr);

	return arr
	
	//shiftColorLuminosity(color, step, direction)
}



export { hexToRgb, colorIsLight, characterColors, checkForPalettes, adjustPalette,  setColorObjs, updateColorObject, addColors, recolorPaletteIcons, recolorIconArray,  getMat, invertHex, getColorDataEntry, LighterSteps};