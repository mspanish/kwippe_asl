<script>

let pic = [];
let currentCollLength;
let currentColl;
let subNames = [];
let currentlyDragging = false;
let svgString = false;
let dragId = false;
let dragColl = false;
let dragFilename = false;
let dragIcon = false;
let dragUrl = false;

import { onMount, onDestroy } from 'svelte';

import { loadSVG } from '../scripts/image.js';

import { binaryXhr, abortSilently } from '../scripts/xhttp/xhttp-browser.js';
import { decode } from '../scripts/cbor.js';
import { decompressFromUTF16 } from '../scripts/lz-string';


//import { buildYObjFromComplex, convertPoly, splitPaths } from '../scripts/pather.js';
//import { queryJson } from '../scripts/queryJson.js'; 

//import { getPosition } from '../scripts/positions.js';
//import { clearHTTPRequests } from '../scripts/fileFetching.js';
import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js';   

import { isIterable, uniq, sample, makeId, range, removeFromIndex, getFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '../scripts/utilities.js';

//import { layersColorObj } from '../scripts/coloring.js';
//import { updateColorObject, characterColors } from '../scripts/colorHelpers.js';
//import { graphicControls, textControls } from '../scripts/controls.js';

import { settings, onscreen, icons, iconPaths, iconFiles, tempIcons, search, xhrArray, searchMode, currentPalette, filtersActive, kd, colorsForParts, licensing } from '../store.js';

$xhrArray = [];
$search = {};
$icons = []

let iconsData = [];

var params = {
    method: 'get',
    headers: {
        "Content-Type": "application/cbor"
    }
};
let type;


const clearHTTPRequests = () => {
    //console.log('existing $xhrArray length is '+$xhrArray.length)
    if ($xhrArray.length > 0) {
        //  //console.log('destroying previous Xhttp req')
        for (var i=0; i < $xhrArray.length; i++) {
            let req = $xhrArray[i];
            const index = $xhrArray.indexOf(i);
            if (index > -1) {
              $xhrArray.splice(index, i);
            }
            abortSilently(req,i)
        }
    }       
}

const xhrRequest = (params,coll,name,i,kw,type,category) => {
   // //console.log('xhrRequest type is '+type)
    const url = params.url;
    //console.log('file request url '+url);

   // const xhr = binaryXhr({url: '/'}, ({ok, body}) => {/* ... */})

    $xhrArray.push(binaryXhr(params, ({ok, status, reason, headers, body}) => {
		
        if (!ok) {
            console.warn(name +' Failure:', body)
            return;
        }
        if (!body) return;

        let buffer = body;
		
		//console.log('got binary for '+coll+ ' ' +JSON.stringify(name));
		//console.log('type of is '+ typeof name);
		
		if (typeof name == 'object') return
        
		//console.log('our url is '+url)
		//console.log(name)
	//	//console.log('buffer is '+JSON.stringify(buffer));
		if (name != 'playground') {
			// //console.log('typeof =>  '+typeof buffer);
			 let decoded = decode(url, buffer);
			 processBinary(decoded,coll,name,i,kw,type,category)
		}

       
    })); // end Xttp and push

// remove from array 
        const index = $xhrArray.indexOf(i);
        if (index > -1) {
        $xhrArray.splice(index, i);
        } 
};

const processBinary = (decoded, coll, name, i, kw, type, category) => {
    //console.log('got process binary '+type)
    let reload = false;
	
    const switcher = {
        'svg': function(){
           // //console.log('processBinary, case art:')
            let art = decompressFromUTF16(decoded.p);
               processColor(art,coll,name,i,kw,reload,category)	
		},
        'dir': function(){
           // //console.log('processing dir')
            processDirectory(decoded,kw);
        },
        'kw': function(){
			//console.log('processBinary, case: kw, '+kw);
            processKeyword(kw,decoded);
        },
        'kwFiles': function(){
			let array = decompressFromUTF16(decoded.k);
			let img = decoded.i;
			let pos = decoded.p;
			//array = array.split(',');
			console.log(kw+ ' getting kwFiles array is '+content);
			getKeywordArtArray(kw, array, img, pos, category);
        },		
		'catFiles': function() {
			addCategoryFiles(kw, decoded, name,category, true);
		},
		'catFilesPassThrough': function() {
			addCategoryFiles(kw, decoded, name,category,true,true);
		},
		'catFilesNoLoadingFiles': function() {
			addCategoryFiles(kw, decoded, name,category,false,false);
		},
		'catSubRootPassThrough': function() {
			let array = decompressFromUTF16(decoded.k);
			let img = decoded.i;
			let pos = decoded.p;
			//array = array.split(',');
			//console.log(kw+ ' catSub launch => getting kwFiles array is '+content);
			getKeywordArtArray(kw, array, img, pos, category, category);
		}
    };
    switcher[type]();
};

const loadCSS = (kw) => {
	let letter = kw[0];
	$onscreen.css = 'data/textures/'+letter+'/'+kw+'/0.css'
}

const pushArrToSearch = (arr) => {
	$search = $search || {};
	$search.filesArray = [];
	$search.filesArray.push(arr);
}
 

const processKeyword = (kw,json) => {

	let subNames = [];
	$filtersActive = false;
	$search = {};
    iconsData = [];
	$iconFiles = [];
	loadCSS(kw);
	
	if (typeof $iconFiles != 'array') $iconFiles = [];
	let waitTime = 0;
	
	//console.log(json)
	
	// these 3 arrays should be in sync: the filenames, the image number for the spritesheet, and the position (width height x y, in string format with space as delimiter) 
	
	let array = decompressFromUTF16(json.k);
	//console.log('what is the json here? '+JSON.stringify(json));
	//console.log('tracking array for kw, decompressed is '+JSON.stringify(array))
	let pos = json.p;
	let img = json.i;
    let related = json.r;
    let rel = [];
	let cats = json.cats ||  false;
	let categories = [];
    let colors = json.cx;   
    //array = array.split(',');
	//console.log('kw '+kw + ' our json is '+JSON.stringify(array));
	
	if (colors) {
		 let cols = decompressFromUTF16(colors);
		 cols = cols.split(','); 
	// //console.log('got cols from cbor! '+cols)
	//TODO: process related and colors  addColorsToPalette(kw,cols)
	}
	if (related) {
		rel = decompressFromUTF16(related);
		rel = rel.split(',');
		//console.log('we have relatedFound '+rel);
		$search.related = rel;
	}
	
	let catAdditions = {
		border: ['0_4_world_insignia-flags-armorial~americas~north_america~united_states~border_patrol'],
	};
	
	if (cats) {
		cats = decompressFromUTF16(cats);
		cats = cats.split(','); 
		//curation of some kws' cats...
		if (catAdditions[kw]) {
			cats = catAdditions[kw].concat(cats);
		}
		console.log('we got cats! '+cats);
	// if we have categories, that art should load BEFORE the keyword art, as its hand picked and higher quality
		pushArrToSearch(array);
		waitTime = 1000;
		let catPaths = [];
		let j = 0;
		let primaryPath; 
		
		for (let cat of cats) {
			
			// base level cats are inside folders 
			// :: I've prepended the qty of subFolders and the qty of root files to the cat name - we parse that out here, and can use to deal with folders that have no root files...
			let splits = cat.split('_');
			
			let sub_qty = splits[0];
			let file_qty = splits[1];
			
			splits.splice(0,2);
			
			let strip = splits.join('_');
			
			cat = strip;
			
			if (cat.includes('%')) {
				cat = cat.split('%%');
				cat = cat[cat.length-3].slice(0, -1); // remove the trailing ~
			}
			
			let word = cat.split('~');
			let wordArr = [];
			let w1 = word[word.length-1];
			let w2 = word[word.length-2];
			//console.log('w2 is '+w2);
			w1 = w1.split('-');
			w1 = w1[0];
			if (w2) {
				w2 = w2.split('-');
				w2 = w2[0];
				wordArr.push(w2);
			}
			wordArr.push(w1);	
			if (!cat.includes('~')) {
				cat = cat + '/' + cat;	
				primaryPath = cat;
				continue;
			}
			
			let catPath = cat.replace('~', '/'); // only replace first one
			
			/*
			bad_habits
			bad_habits~alcohol
			bad_habits~smoking
			bad_habits~alcohol~wine
			bad_habits~alcohol~beer
			bad_habits~smoking~pipe
			bad_habits~smoking~no_smoking
			*/
			//get rid of the final variable so we know what the parent directory is, as we're trying to get rid of these extra cats 
			let parentPath = catPath.split('/');
			parentPath = parentPath[0]//.splice(0,1);
			//parentPath = parentPath.join('~');
			//console.log('YO catpath0 '+catPaths[0]);
			//console.log('YO catPath '+catPath);
			//console.log('YO parentPath '+parentPath);
			//console.log('YO catPaths '+JSON.stringify(catPaths));

// lame hack these files should be moved in kwippArt
			let includes = ['world_cultures/mexico', 'foggy'];
			let pushed = false;
			for (let entry of includes) {
				if (catPath.includes(entry)){
					categories.push([wordArr,catPath]);	
					catPaths.push(parentPath);	
					pushed = true;
					//return
				}
			}
			if (!pushed) { 
			// ::TODO:: this is a shitty system. Excludes too much. Need to rethink.
				if (!catPaths.includes(catPath) ) {
					if (!catPaths.includes(parentPath) ) {
						console.log('\n $$$ parent path NOT FOUND '+JSON.stringify(parentPath));
						categories.push([wordArr,catPath]);	
						catPaths.push(parentPath);
					}
				}
			}
			
			//console.log('catPath is '+catPath);
			j++;
		}
		 
		//console.log('@@@ we have PRIMARY cat in processKeyword, getting '+primaryPath);
		// so we will only use the first path if we have no root folder listing..
	
		if (!primaryPath) primaryPath = categories[0][1];
		
		//console.log('processKeyword: primaryPath is now '+primaryPath);
		
		//passThrough has to be set to true in order for subcats to load
		// last var is to indicate NOT to load files, we moved files to spritsheets loaded from keyword, merging initial cat with the keyword files
		//console.log('processKeyword, running getCategoriesFromPaths');
		getCategoriesFromPaths(kw,primaryPath,true,false);
		
		$search.cats = categories;
	}

	//else {
	
   //::we need to exclude things that have way too many results from displaying anything but their first category...
   
	setTimeout(()=> { 
		//console.log('main keyword fn, calling getKeywordArtArray \n kw processed! image len is '+array.length);
		
		getKeywordArtArray(kw,array,img,pos);
	
	},waitTime);

	
	 
     let terms = $search.terms || [];
     let index =  terms.length;

    
     if ($search.mode == 'forw') {
         index = $search.index + 1;
         if (index > terms.length) {
             //console.log('sorry, no more forward history!');
             index = terms.length-1;
         }
     }
     if ($search.mode == 'back') {
         index = $search.index - 1;
         if (index < 0) {
             //console.log('sorry, no more back $search history!')
             index = 0;
         }
     }
     if ($search.mode == 'reg') {
        terms.push(kw);
     }

    // //console.log('$search is '+JSON.stringify($search));
     
      $search.terms = terms;
	  $search.index = index;
	  $search.keyword = kw;

    // //console.log('search is now '+JSON.stringify(s))

    
     if (rel.length > 0) {
        $searchMode = 'reg';
     //  //console.log('for keyword '+kw+' we have related '+JSON.stringify(rel));
     }
     else {
        $searchMode = 'reg';
      }
    
   
  // else for if cats }
};


const getKeywordArtArray = (kw, array, img, pos, category, catTexture) => {
    
	//console.log('getKWA: '+JSON.stringify(array)+ ' img: '+JSON.stringify(img) + ' pos: '+JSON.stringify(pos));
	//console.log('category? '+category + ' getting images for kws!')// images are '+array); 

	/* this is how we highlight the current folder if it is actually loaded */
	if (category) {

		if ($search.subFolders) {
			
			let c = category.toString().replace(/([0-9]*)_([0-9]*)_/,'');
			//console.log('sweet, category! '+c)// images are '+array); 
			let words = c.split(/[^0-9a-z_-]/);
			let s = $search.subFolders;
			let word = words[words.length-1];
			let dashed = word.split('-');
			//console.log('dashed: '+JSON.stringify(dashed));
			let folder = dashed[0];
			let i = 0;
			for (let subby of s) {
				if (subby[0] == folder) {
					//console.log('BINGO');
					//subby[2] = 'sub selected';
					$search.subFolders[i] = subby;
					// move to front of array. I'm not sure I completely like this behavior, but if you don't do this - and the loaded folder is NOT at position 0 - the user may not even be able to see it...
					//::UPDATE this is weird and looks bad, ditch
					//$search.subFolders.unshift($search.subFolders.splice(i, 1)[0]);
				}
				i++;
			}
		}
	} 
	type = 'art';
	
	if ($onscreen.iconSearch) {
		displayKeywordArt();
	}	
	/*
	let i = files.img;
	let p = files.pos;
	let f = LZString.compressToUTF16(files.files.toString());
	let obj = {
		k: f,
		i: i,
		p: p
	}	
	*/
	//console.log('weird: typeof is '+ typeof array);
	
	if (typeof array != 'array') array = array.split(',');
	
	//console.log('weird: array is '+JSON.stringify(array));
	/*
	if (catTexture) {
		//console.log('we have a catTexture');
		//console.log('arr '+JSON.stringify(array));
		//console.log('lenny  arr len: '+array.length);
		//console.log('vb arr len: '+pos.length);
	}
	*/
    for (var i = 0; i < array.length; i++) {
		if (array[i] == undefined) continue;
		//console.log('array.len is '+array.length);
		//if (i > array.length-1) return;
		let vb = pos[i]
		//console.log('i : '+i+ ' pos '+JSON.stringify(pos) + ' is '+vb);

		let art = array[i];
		//console.log('for art '+art+ ' vb? '+vb);
		
		if (vb) vb = vb.split(' ');

		let image = img[i];
		
		let url = kw[0]+'/'+ kw + '/'+image;
		
		// change url if we are referencing a category texture and NOT a keyword one...
		if (catTexture) {
			catTexture = catTexture.replace(/([0-9]*)_([0-9]*)_/,'');
			//console.log('we have a catTexture, path is '+catTexture);
			url = 'cats/'+ catTexture+ '/'+image;
		}
		
	//	//console.log('running art for '+art);
		//why:: this 'vb' is crucial data tells our spritsheet where to find this image, via [width, height, x, y]
	
		// //console.log('art is '+art)
		art = art.split('@');
		let coll = art[art.length-2];
		let name = art.join('@');
		/* any bad coll, root out NOW! */
		if (coll == 'undraw') continue;

		// my attempt to root out duplicates that were saved to numerous cats...

		let rootName = art[art.length-1];

		// crappy overrides - but these 2 colls have duplicates
		if (coll == 'bon') {
			rootName = rootName.replace(/[^a-z-_]/gi, '');		
			//rootName = rootName.split('-');
			//rootName = rootName.splice(0, rootName.length-1);
			//rootName = rootName.join('-');
		}

		if (coll == 'solver') {
			rootName = rootName.replace(/[-0-9]/g, '');
		}
				
		let actualName = coll + '_' + rootName;

		if (coll == 'baianet') {
			actualName = name;
		}	
		//console.log('actualName is '+actualName);

		if (!$iconFiles.includes(actualName) && (!name.includes('checkCats')) && coll) {

			$iconFiles.push(actualName);
			
			//console.log('$iconFiles is '+JSON.stringify($iconFiles));
			/* we are moving all icon thumb images to PNG, should have a dramatic effect on memory and loading time for thumbs, but is experimental... */
			
			//getFile(coll,name,i,category);
			$onscreen.pngThumbs = true;
			//setTimeout(()=> {
			let type = 'kw';

			// as we're about to add thumb, let's make sure coloring panel is closed;
			getPNG(coll,name,i,category, vb, image, kw, type,url);
			//},i*5)
		}
	}   // end for in arr
};

function getPNG(coll,name,i,category,pos,img,keyword, type,url) {
	//console.log('getPng! '+name);
//	"css": "display:inline-block; overflow: hidden; background-repeat: no-repeat;",
	let icon = {cat: category, url:url, index: i, coll:coll, name:name, pos: pos, img: img, kw: keyword, type:type};
	iconsData.push(icon);
	if ($colorsForParts) {	
		$colorsForParts = false;
	}
	$icons = iconsData;
}

const checkIfKeywordExists = (event, silent) => {
    let kw = $search.keyword
    
    console.log('our search keyword is '+kw)
    
	kw = kw.replace(/ /g, '_');
	//console.log('running checkIfKeywordExists for '+kw);
/* we need to override some stuff, for example numbers inside kws which we dont allow in our category or kw system 
::UPDATE these need to be moved into the Autocomplete if you want them to work
*/
	let swaps = {
		'ak47': 'ak_forty_seven',
		'3d': 'three_d',
		'playground': 'park',
		'kill': 'violence',
	}
	let swapKeys = Object.keys(swaps);
	
	if (swapKeys.includes(kw)) kw = swaps[kw];

		let kd2 = $kd;

    /*key:  kw = keyword  kd = keywordsDirectory fl = firstLetter */

    let fl = kw.charAt(0);
    
    if (!kd2) {
        const type = 'dir';
        let coll = '';
        params.url = '/data/kws/'+fl+'_directory';
        xhrRequest(params,coll,false,false,kw,type);
        return;
    }

    let possibleKeywords = kd2[fl];

    if (!possibleKeywords) {
        const type = 'dir';
        let coll = '';
        params.url = '/data/kws/'+fl+'_directory';
        xhrRequest(params,coll,false,false,kw,type);
      return;
    }
    if (possibleKeywords.includes(kw))  {
       //console.log('GOT THE KEYWORD!! in our letter directory! '+kw);
      //  getKeywordArray(kw,fl);
      type = 'kw';
      params.url =  '/data/kws/'+fl+'/'+kw;
      let coll = '';
      xhrRequest(params,coll,name,false,kw,type);
    }
     else {
       kw = kw.replace(/-/g,' ');  
	   
		let str = 'Sorry! Cannot find the word "'+kw.replace(/_/g, ' ')+ '"';
		//::TODO:: this should be a toast, but our CSS for toasts is messed up - so switch after you fix the css for toast
		if (!silent) {
			new Toast(str, 'modal','error', 0,[
				{text:'ok', action:'ok'}
			]);        
		}
		//console.log('Sorry! Cannot find the word '+kw);   
	}
   
};
const processDirectory = (decoded,kw) => {
    let kwArray = decompressFromUTF16(decoded.f);
    let fl = kw.charAt(0);
	
    $kd = $kd || {};  
    $kd[fl] = kwArray.split(',');
    /* I HATE to do this but if we don't delay this it conflicts with
    setting our keyword in the store and causes a brief flash of the previous kw for
    any new lettered word! */
    
    setTimeout(function(){
		//console.log('$kd is '+JSON.stringify($kd));
	},100)
    
	//console.log('kd lenny is '+$kd[fl].length);

    //now we have the letter directory, see if this word is here or not!
    if ($kd[fl].includes(kw))  {
      // //console.log('GOT THE KEYWORD!! in our letter directory! '+kw)
       type = 'kw';
       params.url =  '/data/kws/'+fl+'/'+kw;
       let coll = '';
       xhrRequest(params,coll,false,false,kw,type)
	   if ($onscreen.iconSearch) {
		displayKeywordArt();
	   }
     }  
	else {
		//console.log('sorry man, cannot find '+kw);
		let str = 'Sorry, cannot find the keyword "'+kw.replace(/_/g, ' ')+ '"';
		new Toast(str, 'modal','error', 0,[
			{text:'ok', action:'ok'}
		]);        
	
	}
};

const getCategoriesFromPaths = (kw,catPath,passThrough,getFiles) => {
// this is a little tricky - you'll need to create some temp var to hold the running array of files, and keep piling on as you return a new cat - as there could be 2 or 3, plus the keyword files. Need a var to indicate last one as well so the xhrRequest pass through script will know to go ahead and load it all;
	//zzz++;
	//console.log(zzz+ ' running getCategoriesFromPaths')
	catPath = catPath.replace(/([0-9]*)_([0-9]*)_/,'');
	
	type = 'catFiles';
	$search.category = catPath;
	if (passThrough) type = 'catFilesPassThrough';
	if (!getFiles) type = 'catFilesNoLoadingFiles';
	if (!passThrough && !getFiles) type = 'catSubRootPassThrough';
	params.url =  '/data/category_files/'+catPath;
	let coll = '';
	xhrRequest(params,coll,false,false,kw,type,catPath)
}

const displayKeywordArt = () => {

}

const addCategoryFiles = (kw, decoded, name, category, passThrough, getFiles,type) => {
/* passThrough is for categories that might be empty, where we need to pass through to their subfolders, navigating 1 level deeper */
	
	//console.log('addCategoryFiles from binary call');
	//console.log('addCatF, decoded is '+JSON.stringify(decoded));
	if (typeof $search != 'object') {
		$search = {};
	}
	let content = decompressFromUTF16(decoded.k);
	
	let subCatToLoad = addSubCategoryFiles(kw, decoded, name, category);
	
	if (content) {
		//console.log('content! we have root files, path is '+category);
		iconsData = [];
		$icons = [];
		$iconFiles = [];
		$filtersActive = false;
		//if (!path.includes('~'));			
	}

	//console.log('adding some category files! ' + category )//+content);
	//console.log('does our category have subFolders? '+subs);
	//console.log('does our cat have root files? '+JSON.stringify(decoded));
	if (content) {
		//console.log('we have content for this category.. '+JSON.stringify(decoded));
	//::TODO:: you'll have to redo all of these files with pos and img, so this no longer works at all 
		let array = content;
		let img = decoded.i;
		let pos = decoded.p;
	
		//let array = content.split(',');
		// last var is set to the cat texture path to indicate this is a cat & not a keyword texture
		//console.log('calling gkwa: arr.lenny: '+array.length+ 'img: '+img+ ' pos: '+pos);
		if (getFiles) {
			getKeywordArtArray(kw,array, img, pos,category,category);
		}
	}
	else {
//	add	//console.log('this folder has NO root files...');
		//console.log('subCatToLoad is '+subCatToLoad);
		// let's get the subcats
		$search.files = false;
		if (subCatToLoad) {
			//console.log('trying to load subCat! '+subCatToLoad);
			// leave off last 2 vars replace root files ONLY, no loading more cats...
			getCategoriesFromPaths(kw, subCatToLoad);
		}
	}
}
const addSubCategoryFiles = (kw, decoded, name, category) => {
	//console.log('adding subs, category is '+category);
	let subData = false;
	//console.log('content is '+JSON.stringify(content));
	//console.log('passThrough is '+passThrough);
	let path = '';
	let subs = false;
	let subCatToLoad = false;
	
	//console.log('decoded is '+JSON.stringify(decoded));
	
	if (decoded.subs) {
		subs = decompressFromUTF16(decoded.subs);
		subData = decoded.sd;
	}
	//console.log('do we have subData? '+JSON.stringify(subData));
	
	if (!subs) return;
	
	subs = subs.split(',');
	
	// this is our area where we are loading the category navigation like people/teachers
	
	$search.cats = $search.cats || [];
	
	let parseCats = category.split('/');
	let mainCat = parseCats[0];
	let mainCatStatic = parseCats[0];
	let mainCatText = mainCat.split('-');
	mainCatText = mainCatText[0];
	
	// this helps us handle subcats
	let next = parseCats[1] || '';
	if (next) {
		if (next.includes('~')) {
			next = next.split('~');
			mainCat = next[next.length-2];

			mainCatText = mainCat.split('-');
			mainCatText = mainCatText[0];
			next = next[next.length-1]
		}
		next = next.split('-');
		next = next[0];
	}
	/* make sure we don't already have the root category for this folder in our menu (we don't list folders with no subFolders - only ones that we have navigated to already, so the user can navigate BACK  */
	
	let pathNav = [mainCatText,next];
	let current = [pathNav,category];
	let pathExists = false;
	
	//console.log('$search cats is '+JSON.stringify($search.cats));
	//console.log('pathNav[0] is '+pathNav[0]);
	//console.log('pathNav[1] is '+pathNav[1]);
	
	for (let cat of $search.cats) {
		let m = cat[0][0].toString();
		let x = cat[0][1].toString();

		if ( m == x || m == pathNav.toString() || m + ','+ m == pathNav.toString() || pathNav[0] == pathNav[1] || cat[0].toString() == pathNav.toString()) {
			pathExists = true;
			//console.log('these paths are same, NO PASS! '+pathNav);
		}
	}
	
	if (mainCat != next && pathExists == false) {
		$search.cats.push(current);
	}
	//console.log('UPDATED $search.cats** '+JSON.stringify($search.cats));
	
	//clear out existing subFolders so we don't have uber clutter!!
	$search.subFolders = [];
	//console.log('subs are '+JSON.stringify(subs));

/* now we add the subFolders that go above, and drill down by loading 
	1- the first subfolder[0] files
	2- the entire array of subfolders 
*/
	let subIndex = 0;
	
	for (let sub of subs) {
		if (sub.includes('%%')) continue;
		
		let n = sub;
		
		// for now we'll just strip the variables that indicate how many subfolders and svgs each sub contains
		let variables = sub.split('_');
		let qty_subs = variables[0];
		let qty_files = variables[1];
		
		//console.log('for sub '+n+ ' qty_subs: '+qty_subs + ' qty_files: ' +qty_files);
		
		n = n.replace(/([0-9]*)_([0-9]*)_/,'');
		
		let pos = [];
		let url = 'placeholder';
		if (subData && subData[n] && subData[n][0]) {
			pos = subData[n][0];
			pos = pos.split(' ');
			//console.log('writing url =>')
			//console.log('mainCat: '+mainCatStatic);
			//console.log('subData[n][1]: ' + subData[n][1]);
			url = mainCatStatic + '/'+ subData[n][1];
		}

		n = n.split('-');
		n = n[0];
		
		// only allow subs that are 1 level below the category...
	
		path = mainCat + '/' + sub;
		//console.log('mainCat is '+mainCat);
		//console.log('category is '+category);
		
		let categoryParsed = category.split('/');
		let cat1 = categoryParsed[0].split('-')[0];
		let cat2 = categoryParsed[1].split('-')[0];
		categoryParsed = cat1 + '/' + cat2;
		
		//console.log('categoryParsed: '+categoryParsed);
		
		if (category == mainCat + '/' + mainCat) {
			//console.log('we have a mainCat!! ' + mainCat);
		}
		else {
			path =  category + '~' + sub;
		}
		//if (!subNames.includes(n)) {
		if (!subCatToLoad && qty_files > 0) {
			subCatToLoad = path;
		}
		
		let styleName = 'sub';
		
		$search.subFolders.push([n,path,styleName,pos,url]);
		subNames.push(n);
		subIndex++;
	}
	return subCatToLoad;
}


const changeGraphics = (e) => {
    let graphics = e.target.getAttribute('data-graphics');
    console.log('graphics change, value is '+graphics)
    symbolMode = graphics;
    switchSymbolMode();
    $onscreen.graphicsList = false;	
}
//console.log(fractions)


const processColor = (art,coll,name,i,kw,reload,category) => {
    console.log('kwippe art: >> '+JSON.stringify(art))
    return
	//console.log('processing image, '+name+ ' category is '+category);
	let existGradients = false;
	
// this should ALL be done server side in art.js, not here...

	art = art.replace(/tagName/g, 'n').replace(/properties/g, 'a').replace(/f-rule/g,'fRule').replace(/s-width/g, 'sWidth');
	if (art.includes('Gradient')) existGradients = true;

    let complexElements = false;
	let g = false;
	let defs = false;
	
 /* convert any polygons or polylines to paths - easier via regex than searching json first */

    art = convertPoly(art);
       //console.log(art);
    art = JSON.parse(art);
// using the Rich's npm parse fn, this has to be boosted up a level
	art = art.c[0]
	
	art = convertStyle(art, name);

	//console.log(JSON.stringify(art));

    //|"circle"|"line"|"square"|"ellipse"|"polygon"|"polyline"/
    const regex = new RegExp(/"g"/, 'i'); // get groups
    const result = queryJson(art, regex);

    if (result.length > 0) {
       //console.log(i+' we found regex group ! '+coll+ '_'+name+ ' ' +result);
       // //console.log(JSON.stringify(art));
        art = parseArt(art,i, coll);
    }
 // need to only run if exist gradients
	if (existGradients) {
		g = addGradients(art.c, coll, name);
		defs = true;
		//art.c = removeRects(art.c)
	}
    //if we don't have paths no reason to continue
    if (!art.c) {
		//console.log('we have no art.c, return');
		return
	}    
	let yObj = {};
	
	let stylesByLayer = '<style>';

		//console.log(name+ '\n'+JSON.stringify(art));
		if (art.c && art.c[0] && art.c[0].c && art.c[0].c[0]) {
		let styles = art.c[0];
		
//	{"type":"text","value":".st0{f:#CFD8DC;}.st1{f:#7E57C2;}"}
		//console.log(name +' parsing styles, '+JSON.stringify(styles));
	
		if (styles && styles.n == 'style') {
			let style = styles.c[0].value;
			if (style) {
				style = style.split('}');
				for (let s of style) {
				//.cls-1{f:#f0f0f0}
					let arr = s.split('{');
					let className = arr[0]
					let className2 = false;
					let className1 = className.replace('.','');
					
					if (className.includes(',')) {
						className = className.split(',');
						className1 = className[0].replace('.','');
						className2 = className[1].replace('.','');
					}
					let fill; 
					let styles = '';
					//console.log('arr '+arr);
					if (arr[1]) styles  = arr[1].replace('f:','fill:').replace('s:', 'stroke:').replace('sWidth:','strokeWidth:').replace(/s-/g,'stroke-');
					
					if (className2) {
						className2 = `,.${className2}_@@@`;
					}
				
					stylesByLayer += ` .${className1}_@@@${className2 ? className2 : ''}  { ${styles} ; }  `
				}			
			}
		}

		
	}

	if (art.c.length == 100) {
		console.log('we got a compound path');	
		console.log(JSON.stringify(art));
		let ic =  splitPaths(coll, coll+i, art.c[0].a.d, false, i, true, $currentPalette)
		console.log('splitPaths arr is '+JSON.stringify(ic));
		art.c = ic.json.c;
		art.yObj = ic.yObj;
	  }

    let icon = { coll: coll,  name: name, index:i, x: x, grads: g, defs: defs, stylesByLayer: stylesByLayer, yObj: yObj, colorObj: colorObj,  pos: {}, json:art };
	
	icon.license = $licensing.licenseObj[coll];
	//console.log('name is '+name);

	if (art.a && art.a.width) {
		icon.vb = '0 0 '+art.a.width+ ' ' + art.a.height;
	}
    if (art.a && art.a.viewBox) {
        icon.vb = art.a.viewBox;
    }
	/* add tag for category so we can FILTER by cats */
	if (category) {
		icon.cat = category;
	}

}

onMount(() => {
    $onscreen.draggedGraphic = false;
    $onscreen.graphicsList = false;
    // Bind the event listeners for the canvas
    var canvasContainer = document.getElementsByClassName('canvas-container')[0];
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);
})

onDestroy(() => {
    var canvasContainer = document.getElementsByClassName('canvas-container')[0];
    if (canvasContainer) {
        canvasContainer.removeEventListener('dragenter', handleDragEnter, false);
        canvasContainer.removeEventListener('dragover', handleDragOver, false);
        canvasContainer.removeEventListener('dragleave', handleDragLeave, false);
        canvasContainer.removeEventListener('drop', handleDrop, false);
    }
})
const submitInput = (event) => {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("searchBtn").click();
    }
}

function handleDragStart(e) {

    console.log('starting drag')
    currentlyDragging = e.target;
    dragColl = e.target.getAttribute('data-coll');
    dragFilename = e.target.getAttribute('data-filename')
    dragId = e.target.id;
    dragIcon = JSON.parse(e.target.getAttribute('data-icon'));
    dragUrl = e.target.getAttribute('data-url');
    console.log('dragIcon is :')
    console.log(dragIcon);
    
    e.dataTransfer.setData('text/plain', dragUrl);
    e.dataTransfer.dropEffect = 'copy';
    //console.log('we need to try and load this icon: '+JSON.stringify(icon));
    let type = 'svg';
    params.url = '/data/art/' + dragColl + '/' + dragFilename;
   // xhrRequest(params,dragColl,dragFilename,0,false, type);	
    //e.dataTransfer.setData("color", e.target.getAttribute('data-color'));
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDragEnd(e) {

}

function handleDrop(e) {
    if (e.preventDefault) {
      e.preventDefault(); 
    }
    $onscreen.draggedGraphic = true;

    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    /* if you don't have this and user has scrolled, graphics are in wrong place */
    let canvasHolder = document.getElementById('canvasWrapper')
    let scrollY = canvasHolder.scrollTop;
    let scrollX = canvasHolder.scrollLeft

    let pointer = {x: e.clientX, y: e.clientY}
    pointer.x = pointer.x + scrollX;
    pointer.y = pointer.y + scrollY;


    let origin = 'kwippe_graphic'
    let url = dragUrl;
    
//    style="width:{icon.pos[0]}px; height: {icon.pos[1]}px; background-position: {icon.pos[2]}px {icon.pos[3]}px; background-image:url(data/textures/{icon.url}.png"
    
    //console.log('got the dropped image id: '+dragId);
    fabric.Image.fromURL(dragUrl, function(img) {
        canvas.add(img)
        },{
        scaleX: .666,
        scaleY: .666,
        left: pointer.x - 150,
        top: pointer.y - 150,
        width: 300,
        height: 300,
        svgType: 'kwippe_bitmap',
        keyword: $search.keyword
    });  

    //let img = document.getElementById(dragId);
    /*
    let newImage = new fabric.Image(img, {
        width: 150,
        height: 150,
        left: pointer.x,
        top: pointer.y
    });
    canvas.add(newImage);
    canvas.requestRenderAll();
    */
    dragFilename = false;
    dragId = false;
    dragColl = false;
    //loadSVG(svg,url,pointer,origin,canvas)
   // canvas.renderAll();
    var dataList = e.dataTransfer.items;
//     for (var i = 0; i < dataList.length; i++) {
//         dataList.remove(i);
//     }
    // Clear any remaining drag data
    dataList.clear();
 return
 
}


</script>

<style>
.icons {
	display: flex;
	overflow-y: auto;
}
.bottom {
	order: 2;
}
:global(.icon) {
    width: 65px;
    height: 65px;
    margin: 10px;
}
:global(.thumbImage) {
    pointer-events:none;
}

</style>

<div style="margin-top:10px;">

    <span class="slideTitle">Add a Graphic</span>
        
    <div class="section" id="add_a_graphic">  
    
        <input id="kwippe_input" on:keyup={submitInput} type="text" bind:value={$search.keyword} placeholder="search for graphic...">
        <button id="searchBtn" on:click={checkIfKeywordExists} class="pure-button">search</button>


        <div class="icons flex-grid">
            
            {#each $icons as icon, y}

                <div id="{icon.coll}_{icon.name}" on:dragstart="{handleDragStart}" on:dragend="{handleDragEnd}" draggable="true"  data-cat={icon.cat || 0} style="{(icon.selected == true ? ' display: none': '' )}" class="icon bottom" data-license={icon.license} data-url="data/colls_pngs_300/{icon.coll}/{icon.name}.png" data-icon={JSON.stringify(icon)} data-coll={icon.coll} data-selected={icon.selected || ''} data-filename={icon.name} data-index={icon.index} data-y={y} >	

                    <div class="thumbImage" style="width:{icon.pos[0]}px; height: {icon.pos[1]}px; background-position: {icon.pos[2]}px {icon.pos[3]}px; background-image:url(data/textures/{icon.url}.png" > 
                    </div>				
                </div>
                    
            {/each}
            
        </div>
    </div>
</div>
