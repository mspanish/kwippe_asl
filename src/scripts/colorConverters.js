

const rgbToHsl = function (rgb) {
	
	//console.log('rgbToHsl, rgb '+JSON.stringify(rgb));
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return {h:h, s:s * 100, l:l * 100};
};


const hexToRgb = function (colour) {
  colour = colour.toString();
  var r,g,b;
    if ( colour.charAt(0) == '#' ) {
        colour = colour.substr(1);
    }
    if ( colour.length == 3 ) {
        colour = colour.substr(0,1) + colour.substr(0,1) + colour.substr(1,2) + colour.substr(1,2) + colour.substr(2,3) + colour.substr(2,3);
    }
    r = colour.charAt(0) + '' + colour.charAt(1);
    g = colour.charAt(2) + '' + colour.charAt(3);
    b = colour.charAt(4) + '' + colour.charAt(5);
    r = parseInt( r,16 );
    g = parseInt( g,16 );
    b = parseInt( b ,16);
    return [r,g,b]
};


// convert 0..255 R,G,B values to a hexidecimal color string
const rgbToHex = (rgb) => {
	
	let r = rgb[0], b = rgb[1], g = rgb[2];
		
		var red = r;
        var green = b;
        var blue = g;
        var alpha = '1';
        var rgb = ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1);

        // parse alpha value into float
        if(alpha.substr(0,1) === '.') {
            alpha = parseFloat('0' + alpha);
        }

        // limit alpha value to 1
        if(alpha > 1) {
            alpha = 1;
        }

        // cut alpha value after 2 digits after comma
        alpha = parseFloat(Math.round(alpha * 100)) / 100;

        return rgb.toString(16).toLowerCase();
};

/*
var rgbToHex = function (rgb) { 
let r = rgb[0], b = rgb[1], g = rgb[2];
let hexValue = '';
rgb.toString().replace(/rgb|\(|\)|\s/g, "").replace(/\d\d\d/g, function(match){
		match = parseInt(match, 10);
		hexValue += (match < 16 ? "0" : "") + match.toString(16);
	})
	return hexValue.toLowerCase();

};
*/
/*

const rgbToHex = function (rgb) {
	let r = rgb[0], b = rgb[1], g = rgb[2];
	var integer = ((Math.round(r) & 0xFF) << 16)
		+ ((Math.round(b) & 0xFF) << 8)
		+ (Math.round(g) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	string = '000000'.substring(string.length) + string;
	if (string.length > 6 ) {
		console.log('############ MORE THAN 6 HEX!!! >>>'+string);
	}
	console.log('hex is '+string);
	return string
};
*/
//   const hslToHex = (h, s, l) => {
 
//         var h = h / 360;
//         var s = s / 100;
//         var l = l / 100;
//         var t1;
//         var t2;
//         var t3;
//         var rgb;
//         var val;
    
//         if (s === 0) {
// 			val = l * 255;
// 			let hex = rgbToHex(val, val, val);
// 			return '#'+hex;
//             //return [val, val, val];
// 		}
		

    
//         if (l < 0.5) {
//             t2 = l * (1 + s);
//         } else {
//             t2 = l + s - l * s;
// 		}
	
    
//         t1 = 2 * l - t2;
    
//         rgb = [0, 0, 0];
//         for (var i = 0; i < 3; i++) {
//             t3 = h + 1 / 3 * -(i - 1);
//             if (t3 < 0) {
//                 t3++;
//             }
//             if (t3 > 1) {
//                 t3--;
//             }
    
//             if (6 * t3 < 1) {
//                 val = t1 + (t2 - t1) * 6 * t3;
//             } else if (2 * t3 < 1) {
//                 val = t2;
//             } else if (3 * t3 < 2) {
//                 val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
//             } else {
//                 val = t1;
//             }
    
//             rgb[i] = val * 255;
// 		}
		
    
//     let hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
// 	return '#'+hex;
// }


const rgbToH = function(v) {
	v = parseInt(v, 10).toString(16);
    return v.length === 1 ? '0' + v : v;
}

// from HSL
const fromHSL = function(color) {
	// if we have a hex, skip
	if (color.includes('#')) return color;
	
	var hsl, h, s, l;
	if (/hsl\(([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})\)/.exec(color) !== null) {
		hsl = color.substring(4, color.length-1).split(',');
	} else if (/hsl\(([0-9]{1,3}),([0-9]{1,3}%),([0-9]{1,3}%)\)/.exec(color) !== null) {
		hsl = color.substring(4, color.length-1).split(',');
		hsl[1] = hsl[1].substring(0, hsl[1].length-1);
		hsl[2] = hsl[2].substring(0, hsl[2].length-1);
	} else if (/^([0-9]{1,3}),([0-9]{1,3}%),([0-9]{1,3}%)$/.exec(color) !== null) {
		hsl = color.split(',');
		hsl[1] = hsl[1].substring(0, hsl[1].length-1);
		hsl[2] = hsl[2].substring(0, hsl[2].length-1);
	}

	h = hsl[0];
	s = hsl[1];
	l = hsl[2];

	if ((h > 359) || ((s && l) > 100)) colorError();
	else {

		// setting HSL
		var new_hsl = "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)"
	//	document.getElementById("result-hsl").value = new_hsl;

		// setting RGB
		var r, g, b;
		if (h == 0 && s == 0) r = g = b = Math.round(l / 100 * 255);
		else {
			h = h / 360;
			s = s / 100;
			l = l / 100;
			
			var t1, t2;
			if (l < 0.5) t1 = l * (1 + s);
			else t1 = l + s - l * s;

			t2 = 2 * l - t1;

			let check1 = function(v) {
				if 		(v < 0) return v + 1;
				else if (v > 1) return v - 1;
				else return v;
			}

			let check2 = function(t, t1, t2) {
				if 		(6 * t < 1) 	return t2 + (t1 - t2) * 6 * t;
				else if (2 * t < 1) 	return t1;
				else if (3 * t < 2) 	return t2 + (t1 - t2) * (0.666 - t) * 6;
				else 					return t2;
			}

			r = Math.round(check2(check1(h + 0.333), t1, t2) * 255);
			g = Math.round(check2(check1(h), t1, t2) * 255);
			b = Math.round(check2(check1(h - 0.333), t1, t2) * 255);
		}

	//	document.getElementById("result-rgb").value = "rgb(" + r + ", " + g + ", " + b + ")";

		// setting HEX
	
    var hex = '#' + rgbToH(r).toUpperCase() + rgbToH(g).toUpperCase() + rgbToH(b).toUpperCase();
	
    //	document.getElementById("result-hex").value = hex;

    return hex
	//	colorSuccess(new_hsl);
	}
}

const rgbToCMYK = (value) => {
	console.log('rgbToCMYK for '+JSON.stringify(value));
    var tempR = value[0] / 255
    var tempG = value[1] / 255
    var tempB = value[2] / 255
    var k = 1 - (Math.max(tempR, tempG, tempB))
    if (k !== 1) {
      return {
        c: ((1 - tempR) - k) / (1 - k),
        m: ((1 - tempG) - k) / (1 - k),
        y: ((1 - tempB) - k) / (1 - k),
        k
      }
    } else {
      return {
        c: 0,
        m: 0,
        y: 0,
        k
      }
    }
 }
 
 const rgbToHsv = (rgb) => {
  let r = rgb[0], g = rgb[1], b = rgb[2];
  	
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  
  return { h:h, s:s, v:v };
}

 /*
 const hsvToRgb = (hsv) => {
 
  let h = hsv.h, s = hsv.s, v = hsv.v;
	
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}
*/

  const hsbToRgb = function (hsv) {
	  
	let h = hsv.h, 
	s = hsv.s, 
	v = hsv.v;
	
    var r, g, b, i, f, p, q, t;

    // h = h / 360;
    if (v === 0) { return [0, 0, 0]; }

    s = s / 100;
    v = v / 100;
    h = h / 60;

    i = Math.floor(h);
    f = h - i;
    p = v * (1 - s);
    q = v * (1 - (s * f));
    t = v * (1 - (s * (1 - f)));

    if (i === 0) {
      r = v; g = t; b = p;
    } else if (i === 1) {
      r = q; g = v; b = p;
    } else if (i === 2) {
      r = p; g = v; b = t;
    } else if (i === 3) {
      r = p; g = q; b = v;
    } else if (i === 4) {
      r = t; g = p; b = v;
    } else if (i === 5) {
      r = v; g = p; b = q;
    }

    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);

    return [r, g, b];
  };


const hsvToRgb = (hsv) => {
	let h = hsv.h, s = hsv.s, v = hsv.v;
    
	var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

const hsvToHex = (hsv) => {

	let rgb = hsvToRgb(hsv);

 //let rgb = [r,g,b]
	let hex = rgbToHex(rgb);
	return '#'+hex;
 }
 
export {rgbToCMYK, hexToRgb, rgbToHsl, fromHSL, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex, hsbToRgb };