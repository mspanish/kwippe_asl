const splitByNewLines = (split,value,fontSize,maxWidth) => {

	//this should catch both the ones users may enter manually and any created by hitting return in the textArea
	
	let rawText = JSON.stringify(value);
	// remove first and last which will be " quotation marks
	rawText = rawText.substring(1,((rawText.length)-1));
	
	if (rawText.includes("\\n") || rawText.includes("\n")  ) {
		//console.log('rawText has a line break...');
		rawText = rawText.replace(/\\\\n/g, "kwippe@$@$")
		rawText = rawText.replace(/\\n/g, "kwippe@$@$")
	}

	let valueStr  = rawText;
	
	//console.log('running splitByNewLines for '+valueStr);
	if (valueStr.includes('kwippe@$@$')) {
		
		let arr =  [];
	
		let vals = valueStr.split('kwippe@$@$');
		
		//console.table(vals);
		
		for (let val of vals) {
			//console.log('string val is '+val);
			if (val == '') continue;
			let thisLine = splitLines(val.trim(), fontSize, maxWidth);
			if (thisLine != '') {
				arr = [...arr,...thisLine]
			}
		}
		split = arr;
	}
	else {
		split = splitLines(valueStr,fontSize,maxWidth);
	}
	//console.log('split up is now '+JSON.stringify(split));
	return split
}

const createTspansArray = (split, fontSize, wordspacing) => {
	let wordsArray = [];	
	
	// k is our array of paragraphs 
	
	for (let k = 0; k < split.length; k++) {

	// k is our array of lines
	let lines = split[k].lines;
	
	  for (let f = 0; f < lines.length; f++) {
		
		//f is our individual line split into words
		
		let words = lines[f].split(' ');	
		
		for (let j = 0; j < words.length; j++) {
			
			let dx = 0;
			// if first word, dx must be 0
			
			if (j > 0) {
				dx = wordspacing + 'em';
				//console.log('MORE than 1 word, setting DX to .2em');
			}
		
			let dy = 0;
			let x,y;
			// first line has to have no spacing before is, so dx of 0 
			if (j == 0 && f != 0 ) { 
				dx = '0';
				dy = '1em';
			}
			if (j == 0)  {
				x = '50%';
			}

			if (k > 0 && j==0 && f ==0) dy = '1.5em';
			
			wordsArray.push({text: words[j], x: x, dy:dy, dx:dx, k: k, f:f, j:j, })
		}
		
	 }
	}	
	return wordsArray
}

const splitLines = (text,fontSize,maxTextWidth) => {
	// this fn is thanks to http://liza.io/splitting-text-into-lines-according-to-maximum-width-vertical-text-scroll-in-javascript-and-html5/
        // Split text into words by spaces
        let words = text.split(' ');
        let lastWord = words[words.length - 1];
        let lineWidth = 0;
        let wordWidth = 0;
        let thisLine = '';
        let allLines = new Array();
		let lineWidths = [];

        // For every element in the array of words
        for (let i = 0; i < words.length; i++) {
            let word = words[i];

            // Add current word to current line
            thisLine = thisLine.concat(word + ' ');
            // Get width of the entire current line
            lineWidth = thisLine.length*fontSize; //getWidth(thisLine);
			
            // If word is not the last element in the array
            if (word !== lastWord) {
                // Find out what the next upcoming word is
                let nextWord = words[i + 1];

                // Check if the current line + the next word would go over width limit
                if (lineWidth + nextWord.length*fontSize >= maxTextWidth) {
                    // If so, add the current line to the allLines array
                    // without adding the next word
					lineWidths.push(lineWidth);
                    addToAllLines(thisLine);

                } 

                // '~' indicates inserting a blank line, if required
                else if (word === '~') {
                    addToAllLines(' ');
                }

                // If the next word is a line break, end line now
                else if (nextWord === '~') {
					lineWidths.push(lineWidth);            
					addToAllLines(thisLine);
			
                }
            }

            // If this IS the last word in the array
            else {
                // Add this entire line to the array and return allLines
				lineWidths.push(lineWidth);
                addToAllLines(thisLine);

				//console.log('our lineWidths array is now '+JSON.stringify(lineWidths));
				let arr = [{lines: allLines, numberOfLines: lineWidths.length}]
                return arr
            }
        }

        // Function that adds text to the array of all lines
        function addToAllLines(text) {
            allLines.push(text.trim());
            thisLine = '';
            lineWidth = 0;
        }  
	// she had a reference to a fn not in her script, so I wrote this
		function getWidth(text) {
			let widdy = text.length*fontSize;
			console.log('getWidth is '+widdy);
			return widdy
		}
}

const fitFontToSpace = (textSize,layerId, e, lenny, mode, maxWidth, maxHeight) => {
	let t = document.getElementById('text_'+ layerId+'_' +e);
	//console.log(t+ ' el is '+'line'+ curLine+'_' +e);

	if (!t) {
		return [0];
	}
	else {
		//console.log('we have a T...');
	}
	
	if (!mode) mode = 'byWidth';

	//console.log('fitFont, mode is '+mode);
	
	let widdy = t.getBoundingClientRect().width;
	let h = t.getBoundingClientRect().height;  //left, top, right, bottom, x, y, width, height

	//console.log('widdy is '+w);
	let arr = [];

	let widthOffset = maxWidth/widdy;
	let heightOffset = maxHeight/h;
	
	let offset;
	
	/*::WHY::
	
	adjusting the offsets either byHeight or byWidth is really important, otherwise when you set something to scale to 150 pixels in height, it can overrun the width and look terrible, or vice versa. So user must choose to adjust by width or by height, and can set the values programatically, and these can be different for different memes to have variation. 
	
	Basically this looks at mode and says: make me as big in this direction as possible w/out overrunning your max in the OTHER direction. The max doesn't have to be our total width either = which is what I have set as the default. Plus we can easily factor in margins later
	*/
	//mode = 'byWidth';
	
	if (mode == 'byHeight') {
		offset = heightOffset;
		let widthEffectFromHeightChange = parseInt(widdy * heightOffset);
		
		//console.log('widthEffect > '+widthEffectFromHeightChange);
	//	console.log('maxWidth > '+maxWidth);
		let adjust = 1;
		
		if (widthEffectFromHeightChange > maxWidth) {
			adjust = maxWidth/widthEffectFromHeightChange;
			//console.log('$$$$$$$$$ byHeight: we need to reduce the width! Adjust by '+ adjust * 100+ '%');		
		}

		//console.log('adjust: '+adjust);
		// take away this as a PERCENT of the offset
		offset = (offset*100) * adjust;
		// turn back into decimals for late processing
		offset = offset/100;				
	}
	else {
		offset = widthOffset;
		
		let heightEffectFromWidthChange = parseInt(h * widthOffset);
		
		//console.log('heightEffect > '+heightEffectFromWidthChange);
		//console.log('maxHeight > '+maxHeight);

		let adjust = 1;
		
		if (heightEffectFromWidthChange > maxHeight) {
			adjust = maxHeight/heightEffectFromWidthChange;
			//console.log('************* byWidth: we need to reduce the height! Adjust by '+ adjust * 100+ '%');	
		}		
	
					//console.log('adjust: '+adjust);

		// update as PERCENT of the offset
		offset = (offset*100) * adjust;
		// turn back into decimals for late processing
		offset = offset/100;
		
	}
	
	//console.log('height offset is '+parseInt((heightOffset * 100 )) + '%');
	//console.log('width offset is '+parseInt((widthOffset  *100)) + '%');
	//console.log('adjusted offset is ' +parseInt(offset * 100) + '%');
	
	arr.push(offset)
	return arr
}
const getHeight = (t) => {
	//let padre = t.parentElement;
	let height = t.getBoundingClientRect().height

	console.log('height '+ height)
	return height;
}


const getRelativeY = (t) => {
	
	var extent = t.getExtentOfChar(0); 
	let padres = t.parentElement
	padres = padres.parentElement;
	padres = padres.parentElement;
	let parentPos = padres.getBoundingClientRect(),
		childrenPos = t.getBoundingClientRect();
	let relativePos = {
			top: (childrenPos.top - parentPos.top),
			right: (childrenPos.right - parentPos.right),
			bottom: (childrenPos.bottom - parentPos.bottom),
			left: (childrenPos.left - parentPos.left)
		};
	//console.log(JSON.stringify(relativePos));
	let top = relativePos.top;
	let yVal = - parseInt(top)
	let height = childrenPos.bottom - childrenPos.top;
	//console.log('height is '+height);
	return [yVal,height];
}

const setYValue = (layerId, prevId, num, prevY, type, maxHeight) => {
	
	let textId = 'text_'+ layerId +'_' +num;
	let textIdPrev = 'text_'+ prevId +'_' +num;

	//console.log('t: textId is '+textId);
	//console.log('p: textIdPrev is '+textIdPrev);

	let t = document.getElementById(textId);
	let p = document.getElementById(textIdPrev);
	if (!p)//console.log('got NO p!')
	if (!t) console.log('got NO t!')
	
	let boxHeightOffset = 1// 2;
	let lineHeight = 10; // vertical padding between lines should be set via ui or default elsewhere
	
	if (p) {
		//console.log('we have a PPPP!');
	}
	
	if (t) { 
		prevY = prevY * boxHeightOffset;
		let vals = getRelativeY(t)
		let yVal = vals[0];
		let height = vals[1];
		//console.log('our prevY is '+prevY)
		//console.log('our yVal from getRelativeY is '+yVal);
		
		yVal = prevY +  yVal;
		//console.log('our top is '+top);
		//console.log('setting yVal for layer '+layerId+ ' to '+yVal);
		return [yVal,height] //$memes['line'+line][i].y = 200// yVal //;+ lineHeight;
		
	}
	else {
		
		//console.log('NO T!!!!!!!!!!!!!!');
	}
}

const setDeepNested = (obj, keys, val) => {
	keys.split && (keys=keys.split('.'));
	var i=0, l=keys.length, t=obj, x;
	for (; i < l; ++i) {
		x = t[keys[i]];
		t = t[keys[i]] = (i === l - 1 ? val : (x == null ? {} : x));
	}
};

const uniq = (arrArg) => {
  return arrArg.filter((elem, pos, arr) => {
    return arr.indexOf(elem) == pos;
  });
};

const sample = (array) => {
  if (!array || array.length < 1) return [];
  array = shuffle(array);
  return array[0];
};

const shuffle = (array) => {
  var i = 0,
    j = 0,
    temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

const startCase = (str) => {
	return str.split(' ')
	.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
	.join(' ');	
}

const removeFrom = (array, element) => {
	const index = array.indexOf(element);
	
	if (index !== -1) {
			array.splice(index, 1);
	}
	return array
}
//moveTo($memes['layers'], id, dir);
const moveTo = (array, id, dir) => {
	console.log(JSON.stringify(array));
	let index;
	let temp;
	let newIndex;
	let e = 0;
	
	for (let l of array) {
		if (l.id == id) {
			index = e;
		}
		e++;
	}
	if (dir == 'up') {
		if (index ==  0) return array
		newIndex = index - 1;
		let prev = array[newIndex];
		let temp = array[index];
		array[newIndex] = temp;
		array[index] = prev;
	}
	else {
		if (index == array.length-1) return array
		newIndex = index + 1;
		let next = array[newIndex];
		let temp = array[index];
		array[newIndex] = temp;
		array[index] = next;		
	}
	return array
}

const removeFromIndex = (array, index) => {
	
	if (index !== -1) {
			array.splice(index, 1);
	}
	return array
}

const hasArrayBuffer = typeof ArrayBuffer === 'function';
const toString = Object.prototype.toString;

const isArrayBuffer = (value) => {
  return hasArrayBuffer && (value instanceof ArrayBuffer || toString.call(value) === '[object ArrayBuffer]');
}

const getDescendantProp = (obj, path) => (
  path.split('.').reduce((acc, part) => acc && acc[part], obj)
);


const getDeepNested = (obj, key, def, p) => {
	p = 0;
	key = key.split ? key.split('.') : key;
	while (obj && p<key.length) obj = obj[key[p++]];
	return obj===undefined ? def : obj;
};

const flattenObj = (obj, sep) => {
	var k, v, j, tmp, out={};
	sep = sep || '_';

	for (k in obj) {
		v = obj[k];
		if (v == null) {
			continue;
		} else if (Array.isArray(v)) {
			out[k] = v.map(o => flatObj(o, sep));
		} else if (typeof v === 'object') {
			tmp = flatObj(v, sep);
			for (j in tmp) {
				out[k + sep + j] = tmp[j];
			}
		} else {
			out[k] = v;
		}
	}
	return out;
};

const flat = (arr, res) => {
	var i=0, cur, len=arr.length;
	for (; i < len; i++) {
		cur = arr[i];
		Array.isArray(cur) ? flat(cur, res) : res.push(cur);
	}
	return res;
}

const flattenArray = (arr) => {
	return flat(arr, []);
};

const speedyTemplate = function(template) {
                
	let strFunc = "return ('" +

	template.replace(/[\r\t\n]/g, " ")
			.replace(/'(?=[^#]*#>)/g, "\t")
			.split("'").join("\\'")
			.split("\t").join("'")
			.replace(/<#=(.+?)#>/g, "' + $1 + '")
			.split("<#").join("');")
			.split("#>").join("p.push('")
			+ "');";

	return new Function("data", strFunc);
}

const range = function(num) {
	return Array.from({length: num}, (_, i) => i);
}


const removeFromLocalStorage = (str)=>{
	if (typeof(Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
	  localStorage.removeItem(str);
	} else {
		console.log('oops no localStorage available');
	  // Sorry! No Web Storage support..
	  return false
	}
}

const getFromLocalStorage = (str)=>{
	if (typeof(Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
	  let item = localStorage.getItem(str);
	  item = JSON.parse(item)
	  //console.log('we GOT from localStorage, '+ str);
	  return item
	} else {
		console.log('oops no localStorage available');
	  // Sorry! No Web Storage support..
	  return false
	}
}


const saveToLocalStorage = (str,obj)=>{
	if (typeof(Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
	  localStorage.setItem(str, JSON.stringify(obj));
	 // console.log('setting localStorage '+str);
	} else {
		console.log('oops no localStorage available');
	  // Sorry! No Web Storage support..
	}
}

const makeId = (length) => {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const isIterable = (obj) =>{
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

const contains = (value, arr) => {

  for (var i = 0; i < arr.length; i++) {
    if (value.indexOf(arr[i]) > -1) {
      return true;
    }
  }
  return false;
}

const listKeyDown = (e, listId) => {
	if (!listId) listId = 'palettesList';
	console.log('listKeyDown, listId is '+listId);
    const list = document.getElementById(listId); // targets the <ul>
	if (!list) {console.log('no list found'); return}
    const first = list.firstChild; // targets the first <li>
	//console.log('keydown: selected Layer '+$selectedLayer);
	let el = list.querySelector("li:focus");

	if (e.keyCode == 40) {      
		if (!el) { 
			first.focus();
			window.scrollTo(0, 0);
			first.click();			
			return
		}
		//console.log('got a NEXT arrow');

		let next = el.nextSibling
		//console.log('what is next? '+ next.tagName);
		if (!next || next.tagName != 'LI') { 
			window.scrollTo(0, 0);
			first.focus();
			first.click();			
			return
		} else {
			//console.log('we have a next it is '+next);
			next.focus()
			next.click();
		}
		//let text = next.innerText;
		//selectFont(e,text)
	}
	if (e.keyCode == 38) {      
		if (document.activeElement ==  first || !el || !el.previousSibling ) { return; }

		let prev = el.previousSibling;
		prev.focus();
		prev.click();
	}
}

//, setDeepNested, getDeepNested, flattenObj, flattenArray
export { getHeight, getRelativeY, listKeyDown, setYValue, splitByNewLines, createTspansArray, splitLines, fitFontToSpace, contains, isIterable, getFromLocalStorage, saveToLocalStorage, removeFromIndex, removeFrom, moveTo, sample, shuffle, uniq, startCase, speedyTemplate, range, makeId, removeFromLocalStorage };