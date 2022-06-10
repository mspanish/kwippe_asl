<script>
// our $avatar replacement to make this component extensible!!
export let pic;
let currentCollLength;
let currentColl;

import PartsChooser from './PartsChooser.svelte';
import IconsExplorer from './IconsExplorer.svelte';

import { onMount } from 'svelte';

import { saveIt } from '../scripts/consolesave.js';

import { binaryXhr, abortSilently } from '../scripts/xhttp/xhttp-browser.js';
import { decode } from '../scripts/cbor.js';
import { decompressFromUTF16 } from '../scripts/lz-string';
import { fitToView  } from '../scripts/svgHelpers.js';

import { buildYObjFromComplex, convertPoly, splitPaths } from '../scripts/pather.js';
import { queryJson } from '../scripts/queryJson.js'; 

import { getPosition } from '../scripts/positions.js';
//import { clearHTTPRequests } from '../scripts/fileFetching.js';
import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js';   

import { isIterable, uniq, sample, makeId, range, removeFromIndex, getFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '../scripts/utilities.js';

import { layersColorObj } from '../scripts/coloring.js';
import { updateColorObject, characterColors } from '../scripts/colorHelpers.js';
import { graphicControls, textControls } from '../scripts/controls.js';

import { runMeNowFlag,licensing, controls, selectedLayer, currentIcons, currentCollection, xhrArray, searchMode, search, currentPalette, memes, avatar, runFiles, runPartsFlag, onscreen, rightParts, avatarColors, qty, cols, groupName, fileMode, colorModes, currentParts, character, colorsForParts, selectedParts, characterDefinition, partsIndices, bodypartsRetrieved, icons, iconPaths, iconFiles, avatarIcons, kd, reRunPartsFlag, reRunFiles, partsChooser, colorObj, filtersActive, tempIcons } from '../store.js'

  
onMount(() => {
	if ($onscreen.iconsExplorer) {
		currentColl = 'knl';
		openCollection(currentColl);
	}
})
const runFileSave = (svg,filename,i) => {

	setTimeout(() => {
		//saveIt(svg.toString(),filename +'.svg');
	},i*300);	
}

const runMeNow = () => {
	let coll = $runMeNowFlag;
  /* initial run if we are in iconsExplorer mode */
	//saveIt('testy','testy.txt')
	//loop through and get this art! 
	let iconsArray = document.getElementsByClassName('icon');
	//for (let icon of iconsArray) {
	//console.log('iconsArray lenny is '+iconsArray.length);
	
	for (let i = 0; i < iconsArray.length; i++) {
		let icon = iconsArray[i];
		//if (i > 10) return
		let filename = '@'+ coll + '@' + icon.getAttribute('data-filename');
		let svg = icon.getElementsByTagName('svg')[0];
		svg = svg.innerHTML;
		svg = svg.toString();
		svg = svg.replace(/xlink:href="none"/g, '');
		svg = `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`
	//	if (filename.includes('ant') ){
			runFileSave(svg,filename,i);
	//	}
	}
};

$: {
	if ($runMeNowFlag) {
		if ($runMeNowFlag == 'runMeNow') {
			
		}
		else {
			openCollection($runMeNowFlag);
		}
	}

}
/*
$: {
	if ($onscreen.iconSearch == false) {
		//console.log('YIKES changed iconSearch!')
	}
}
*/

//::LISTENER #2::
$: { 
	if ($reRunPartsFlag) {
		$reRunPartsFlag = false;
		//console.log('reRun, flag now  '+ $reRunPartsFlag);
		reRunParts($reRunFiles);
	} 
}

//::LISTENER #5::
$: { 
	if ($runPartsFlag) {
		$runPartsFlag = false;
		//console.log('run, flag now  '+ $runPartsFlag);
		runParts($runFiles);
	}
}

//::LISTENER #3::
$: { 
	if ($partsChooser && $partsChooser.files && $partsChooser.files.length > 0) {
		//window.alert($partsChooser.part +' partsChooser is active');
		
		let array = $partsChooser.files;
		let coll = $partsChooser.part;
		let name = coll;
		
		// set ears and nose to same color as faceshape
		if (['ears', 'nose'].includes(coll)) name = 'faceshape'; 
		// add a colorObject for this section
		let charName = $character.charName;
		
		let hex = characterColors[charName][name];
		
		// use first color as default, otherwise default to black
		if (hex) {
			hex = hex[0];
		}
		else {
			hex = '#000000';
		}
		$colorObj = updateColorObject(false, coll, hex);
		getPartChooserFiles(coll,array);
	}
}

//::LISTENER #9::
$: { 
	if ($onscreen.iconsChooser && typeof $onscreen.iconsChooser === 'string') {
		//console.log('kw parts should be loading now');
		let keyword = $onscreen.iconsChooser;
		if (typeof keyword === 'string') {
				
			if (keyword.includes('coll:')) {
				keyword = keyword.replace('coll:','');
				openCollection(keyword);
			}
			else {
				checkIfKeywordExists(keyword);			
			}
			$onscreen.iconsChooser = false;
			// zero out the keyword so this shiz wont run again
		}
	}
}
//::LISTENER #10
$: {
	if ($onscreen.loadIcon) {
		let icon = $onscreen.loadIcon;
		//console.log('we need to try and load this icon: '+JSON.stringify(icon));
		let type = 'svg';
		params.url = '/data/art/' + icon.coll + '/' + icon.name;
		xhrRequest(params,icon.coll,icon.name,0,false, type);	
		$onscreen.loadIcon = false;
	}
}

const displayKeywordArt = () => {

	let part = $selectedLayer;
	// this is for Toolbar to pass to Controls
	$memes.selectedLayer = part //'bgImage';		

	$currentIcons = []
	$selectedParts = $selectedParts || {};
	// this seems really hacky, but for now it's too big a hassle to keep $avatarIcons data so we can match these back up. Maybe later!
	
	//$selectedParts['bgImage'] = [];
	
	$fileMode = $fileMode || {
		bgImage: 'single',
		bg: 'single'
	};
	// color hack for now!
	$colorObj = $memes['bg'][0].colorObj;		

	$controls = [];
	$onscreen.partsLoader = true;
	$onscreen.bgImageChooser = true;
	$onscreen.partsChooser = true;
	$onscreen.partAdjuster = false;
	$onscreen.iconsChooser = true;	
	$onscreen.iconSearch = true;
	$onscreen.modes = true;
	
	$partsChooser =  {
		files: $bodypartsRetrieved[part],
		part: part,
		modes: [
			{name: 'single', checked: 'checked'},
			{name: 'stepped', checked: ''},
		],
		single: '',
		stepped: '',
		random: ''
	};	
	$fileMode[$selectedLayer] = $fileMode[$selectedLayer] || 'single';
	
	if ($onscreen.avatarBuilder) {
		$partsChooser.modes.push({name: 'random', checked: ''});
	}
}

$xhrArray = [];
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

const getPartChooserFiles = (coll,array) => { 
    //clear out iconsData
	//console.log('getting partChooserFiles for '+coll);
    $avatarIcons = [];
	//console.log('part files are '+JSON.stringify($bodypartsRetrieved[coll]));
	// what we need now is to get the category file with the positions for the spritesheet for this part
	
	
	

    type = 'avatarArt';
   // //console.log('getting files for avatar partChooser '+coll)//+JSON.stringify(array));

    for (var i = 0; i < array.length; i++) {
        let name = array[i];
        params.url = '/kwippe_output_cbor/' + coll + '/' + name;
        xhrRequest(params,coll,name,i,false,type);
    }   
	
}

const processBinary = (decoded, coll, name, i, kw, type, category) => {
    //console.log('got process binary '+type)
    let reload = false;
	

    const switcher = {
		'avatarPart': () => {
            let art = decompressFromUTF16(decoded.p);
            processAvatarArt(art,coll,name,i,true);
        },        
        'avatarArt': () => {
            let art = decompressFromUTF16(decoded.p);
            processAvatarArt(art,coll,name,i);
        },
        'avatarPartDirectory': () => {
            processAvatarDir(decoded,coll);
        },
        'reload': () => {
           // //console.log('got switcher, reload')
            reload = true; 
            switcher['art']();
        },
        'coll': function() {
            processColl(decoded,coll);
        },
        'colls': function() {
            //console.log('colls')
            processColls(decoded);
        },
        'svg': function(){
           // //console.log('processBinary, case art:')
            let art = decompressFromUTF16(decoded.p);
               processColor(art,coll,name,i,kw,reload,category)	
		},
        'art': function(){
           // //console.log('processBinary, case art:')
            let art = decompressFromUTF16(decoded.p);
            if (decoded.x) {
                processColor(art,coll,name,i,kw,reload,category)
            }
            else {
				//console.log('BW: art is '+JSON.stringify(art));
                processBW(art,coll,name,i,kw,reload);
            }        
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
			//console.log(kw+ ' getting kwFiles array is '+content);
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
			//console.log(kw+ ' getting kwFiles array is '+content);
			getKeywordArtArray(kw, array, img, pos, category, category);
		}
    };
    switcher[type]();
};

let subNames = [];

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
	add	//console.log('this folder has NO root files...');
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


const processColl = (decoded,code) => {
   // //console.log('got decoded for '+code+ ' '+ JSON.stringify(decoded))
    let content = decompressFromUTF16(decoded.f);
    content = content.split(',');
    content = uniq(content);
	
    if (!content) {
        //console.log('sorry we dont have this pack!' + code)
        return
    }
	
    let collLoaded = $currentCollection;
    changeCollection(code,collLoaded,content)    
	if ($onscreen.iconSearch) {
		displayKeywordArt();
	}
};

const processColls = (decoded) => {
	//console.log('processColls');
    let collsArray = decompressFromUTF16(decoded);
    collsArray = JSON.parse(collsArray)
    /* TODO: this cleans up our names to add them to the list, but 
    we need to put these in actually categories later */
    
    for (var i = 0; i < collsArray.length; i++) {
        let name = collsArray[i].name;
        if (name.includes('-')) {
            name = name.split('-')
            collsArray[i].name = name[1]
        }
        //console.log('name of coll is '+collsArray[i].name)
    }
    //console.log('colls are '+collsArray);

	
	//::TODO:: add    $collections = collsArray;
   
   
   // //console.log('got all the colls')
    //   connect(this, store, mapToProps);
    // the first coll 'imp' is reserved for imports
    //this.set({ collections: collsArray })
    //  store.setState({ collections:collections, fetched: true });
    //store.setState({colls:colls, licenseGroups:licenseGroups})
};

const addCollectionsData = () => {

    let colls = ['imp', 'sko',
        'lor', 'del', 'win',
        'kwi', 'awe', 'ion',
        'chr', 'emo', 'osm',
        'mat', 'pic',
        'web', 'vaa', 'not',
        'fir', 'noc', 'xei',
        'lug', 'met', 'wav',
        'pap', 'ibm', 'bri',
        'sli', 'roc', 'jqu',
        'cry', 'lib', 'map',
        'mon', 'gue', 'mul',
        'ara', 'bat', 'io2',
        'ele', 'lin', 'ico',
        'typ', 'the', 'em2',
        'twe', 'ore',
        'her', 'ofl', 'kal',
        'rob', 'icf', 'oa1',
        'jqe', 'tw2', 'knl',
        'gli', 'ga2', 'opg',
        'pat', 'aac'
    ];  //'ssj', 'ope'
    //vex.defaultOptions.className = 'vex-theme-flat-attack'
    /* this object is so we can stop stuff loading once it's already been
    fired by the lazy loader - but it's already in the pipeline of retrieving teh binary, etc
    if the keyword has been kaboshed we can check this object to see and cancel at
    a later stage in the process */
    // App.lazyQueue = {};
    let licenseObj = {};
    let licenseGroups = {};
    // careful with this! make sure the user sets this manually, and has an easy way to UNSET it, as well as a reminder that they are excluding certain collections...
    let licensesProhibited = [];
    let licensesActive = true;
    let licensesColorActive = false;

    /* this specifies whether or not you vary the colors so you have more variety when clicking through
    to designer on a complex piece, or whether you only take from the color palette at hand */
    let useItemColors = true;

    licenseGroups.pd = ['nog', 'opg', 'ga2', 'ico', 'ope', 'ore', 'osm', 'ssj', 'ofl', 'oa1', 'gli', 'knl','aac'];
    licenseGroups.cc = ['str', 'icf', 'fir', 'tw2', 'jqe', 'twe', 'del', 'sko', 'lor', 'emo', 'em2', 'gue', 'her', 'ibm', 'lin', 'mul', 'pap', 'roc', 'web', 'win'];

    for (var i = 0; i < colls.length; i++) {
        let i_coll = colls[i];
        if (licenseGroups['cc'].includes(i_coll)) {
            // we have a CC licensed coll push to licenseObj
            licenseObj[i_coll] = 'cc';
        }
        if (licenseGroups['pd'].includes(i_coll)) {
            // we have a PD licensed coll push to licenseObj
            licenseObj[i_coll] = 'pd';
        }
        if (!licenseGroups['pd'].includes(i_coll) && !licenseGroups['cc'].includes(i_coll)) {
            // we have an open source licensed coll push to licenseObj
            licenseObj[i_coll] = 'os';
        }
    } // end for    

	$licensing = {licenseObj: licenseObj, licenseGroups: licenseGroups, useItemColors: useItemColors, licensesColorActive: licensesActive, licensesProhibited: licensesProhibited};
}; 

addCollectionsData(); 

const reformatWhiteArt = (art,coll) => {
	let arr = art.c;
   // //console.log('recursing group, arr len is '+arr.length)
	let newPaths = [];

	
	for (var i = 0; i < arr.length; i++) {

        let child = arr[i];
		//console.log('child.n is '+child.n);
        if (child.n == "p") {
            //if we have a group attributes, pass them along
			if (coll == 'ssj')  {
			
				// get rid of white bg;
				if (child.a.f == 'none' && child.a.s == '#fff') {
				 //   continue;
				}
				if (child.a.f == '#fff') {
					child.a.s = '#000000';
					child.a.sWidth = 2;
				}
				if (child.a.f == '#fff' && child.a.fRule == 'evenodd') {
					//console.log('got white w/ fRule');
					child.a.f = '#000';
					child.a.sWidth = 2;
				}		
				if (child.a.s == '#000000' && child.a.sWidth == '0') {
				
					child.a.sWidth = 2;
				}
				if (child.a.s == '#000' && !child.a.sWidth) {
					child.a.sWidth = 2;
					
				}
				if (child.a.s == '#fff' || child.a.s == '#ffffff') {
					child.a.s = '#000'
					child.a.sWidth = 2;
				}
				if (child.a.s == '#000000' && !child.a.sWidth) {
					child.a.sWidth = 2;
				}
				if (child.a.s == '#000' && child.a.f == 'none') {
					child.a.sWidth = 2;
				}
			}
			if (child.a.f == '#fff' && child.a.s) {
				//console.log('got white w/ fRule');
				//child.a.f = 'black';
				child.a.stroke = '#999999';
				child.a.sWidth = 2;
				child.a.class = 'tone';
				child.a.f = '#000';
			}	
			child.a.sWidth = 3;
			newPaths.push(child);
		}
	}
	
	let yObj = buildYObjFromComplex(newPaths);
	/* go through each number in our yObj, which is formatted like
	{0:[0,2,4],4:[1,3,5]} - and match that key (or number) to its path - so the path will know it should be colored along w/ the group */
	let pNum = 0;
	//console.log('no original paths '+art.c.length)
	for (let num in yObj) {
		
		let array = yObj[num];
		
		for (let i = 0; i < array.length; i++) {
			let index = array[i];
			newPaths[index].a.yLayer = num;
			pNum++;
		}
	}
    //console.log('no paths '+pNum)
	
	//console.log('no new paths '+newPaths.length)
	art.c = newPaths;
	//console.log('newPaths is '+JSON.stringify(newPaths));
	return [art,yObj]
}

const reformatByColors = (art,coll) => {
	let arr = art.c;
   // //console.log('recursing group, arr len is '+arr.length)
	let newPaths = [];

	for (var i = 0; i < arr.length; i++) {

        let child = arr[i];
		//console.log('child.n is '+child.n);
        if (child.n == "p") {
            //if we have a group attributes, pass them along
			if (child.a.f == '#fff' && child.a.s) {
				//console.log('got white w/ fRule');
				//child.a.f = 'black';
				child.a.sWidth = 1;
				child.a.class = 'tone';
			}	
			newPaths.push(child);
		}
	}
	
	let yObj = buildYObjFromComplex(newPaths);
	/* go through each number in our yObj, which is formatted like
	{0:[0,2,4],4:[1,3,5]} - and match that key (or number) to its path - so the path will know it should be colored along w/ the group */
	let pNum = 0;
	//console.log('no original paths '+art.c.length)
	for (let num in yObj) {
		
		let array = yObj[num];
		
		for (let i = 0; i < array.length; i++) {
			let index = array[i];
			newPaths[index].a.class = num;
			pNum++;
		}
	}
    //console.log('no paths '+pNum)
	
	//console.log('no new paths '+newPaths.length)
	art.c = newPaths;
	//console.log('newPaths is '+JSON.stringify(newPaths));
	return [art,yObj]
}	

	
//::TODO:: refactor this entire section for new app!!!!!!!

const addGradients = (art,coll,namey) => {
	//console.log(namey);  // all to troubleshoot 1 piece of art... some of the nog have gradient references, but NO actual gradients, arrghh!

    if (namey == '@a40387@nog@alembic_objects_k7r0y') {
		//console.log(JSON.stringify(art));
		//console.log('\n\n\n$$$$$$$$$$$$$$$$$$$$$ got yer art!');
		//if (namey != 'ship-travel-places') return
		//console.log('addGradients: art\n' + JSON.stringify(art));
	} 
	//else return
	//loop through children to see what we've got...
	let index = 0;
	let g = [];
	let stopColors = [];
	let grads = [];

	for (let child of art)  {	
		//console.log('looking at art, child is '+JSON.stringify(child) );
		//if (child.a) //console.log('looking at child, fill is '+child.a.f);
		//console.log('stopColors are now '+stopColors);
		//console.log('our child.n is '+child.n)
		let name = child.n;
				
		//console.log(JSON.stringify(child))
		
		if (child.a && child.a.f && child.a.f.includes('url')  ) {
			//console.log('we got a gradient ref! '+ child.a.f);
			//console.log('we got a gradient ref! '+ JSON.stringify(child));
			let gradientId = child.a.f;
			gradientId = gradientId.replace('url(#', '').replace(')', '');
			child.a.f = gradientId;
			child.a.g = true;
		}
		if (name == 'defs') {
			//console.log('got defs');
			let grandkids = child.c;
			for (let gradient of grandkids) {
				let name = gradient.n;
				//console.log('got grandkid, name is '+name);
				grads = processGradient(gradient,name,grads);
			}
		} // if name == defs
		else {
			let gradient = child;
			grads = processGradient(gradient,name,grads);
		}
	  index++;
	} // end children of loop
	//console.log('grads is '+JSON.stringify(g) )
	return grads
  // //console.log('new data.c should be '+JSON.stringify(children))
}

const processGradient = (gradient,name,grads) => {
	if ( ['linearGradient', 'radialGradient'].includes(name) ) {
		//console.log('got a GRADIENT ' +JSON.stringify(gradient));

	//console.log('got xlink? '+gradient.a['xlink:href'])
	
//{"type":"element","n":"radialGradient","a":{"id":"o","cx":14.6854,"cy":127.9117,"gradientTransform":"matrix(.9996 -.00029738 .00029738 .9996 -.131 -98.6505)","gradientUnits":"userSpaceOnUse","r":0.5217,"xlink:href":"#i"},"c":[]}

	
		let d = true;
		
		//console.log('got gradient, def is '+JSON.stringify(gradient))
			
		let attributes = gradient.a; // our gradient object atrributes		
		//gradient.n = child.n; //  should be the name, linearGradient || radialGradient
		
		let stops = gradient.c;
		
		// ::IMPORTANT::  gradient ID's MUST BE UNIQUE to the stage!!!  Otherwise they are fubard.
	
		// loop over stops and push into gradients, or 'g' array. These just need to have stop-colors added from the stop colors above
		let x = 0;
		if (stops != undefined && isIterable(stops)) {
			for (let stop of stops ) {
				//console.log('stop is '+JSON.stringify(stop) );
				if (stop.n !== 'stop') continue
			//	//console.log('changing stop colors')
				stop.a['stop-color'] = stop.a['stop-color']
				stop.a['offset'] = stop.a['offset']
				stop.a['stop-o'] = stop.a['stop-opacity'];
				
				// process stops defined as strings inside a style: key, solves nog and other problem with art
				if (stop.a.style) {
					let attrs = stop.a.style.split(',');
					//"style": "stop-color:#8d6e63"
				
					for (let attr of attrs) {
						let s = attr.split(':');
						stop.a[s[0]] = s[1];
					}
					//console.log('attrs are now '+JSON.stringify(attrs));
				}
				
				x++;
			}
		}
		// okay done processing gradient, push to g array
		grads.push(gradient);	
	}
	return grads
}
const removeRects = (art) => {

	for (let child of art)  {	
		if (child.n == 'p' && child.a.d == 'M99.2 82.8v-10H27.7v10c11 6.5 23.1 10.1 35.7 10.1s24.8-3.6 35.8-10.1z') {
			//console.log('got nog rect');
			child.a.d = false;
		}
	}
	return art
}
const convertStyle = (art, name) => {
	for (let child of art.c)  {	
	
		if (child.a && child.a.style) {
			let style = child.a.style.split(';');
		
			//console.log('style is '+style);
			let obj = {};
			for (let s of style) {
				//console.log('s '+s);
				s = s.split(':');
				let key = s[0], value = s[1];
				obj[key] = value;
			}
			//console.log('obj is now '+JSON.stringify(obj));
			child.a = Object.assign(child.a, obj);
			delete child.a.style;
		}
	}
	//console.log('art now '+JSON.stringify(art));
	return art
} 
const processColor = (art,coll,name,i,kw,reload,category) => {

	//console.log('processing image, '+name+ ' category is '+category);
	let existGradients = false;
	
// this should ALL be done server side in art.js, not here...

	art = art.replace(/tagName/g, 'n').replace(/properties/g, 'a').replace(/f-rule/g,'fRule').replace(/s-width/g, 'sWidth');
	if (art.includes('Gradient')) existGradients = true;

    let complexElements = false;
	let g = false;
	let defs = false;
	
	//if (name == '@a40384@nog@alembic-objects') {
		//console.log(art);
	//}
	
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
	
	// any coll that should be colored based on y values should be here - you'll need to split the paths of compound art first however
/*
	if (coll == 'ssj') {
		//console.log('ssj, processColor');
		art.a.viewBox = '0 0 580 580 '
	}
	*/
	let stylesByLayer = '<style>';
	/*
	if (['ssj','ope'].includes(coll)) {
		let temp = reformatWhiteArt(art,coll,name);
		art = temp[0] 
		yObj = temp[1];
		for (let group in yObj) {	
			stylesByLayer += ` .${group}_@@@$ {fill: ${sample( $currentPalette)} ; }`
		}
	}
	*/
	//
	//else {
		
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
		//let temp = reformatByColors(art,coll,name);
		//art = temp[0] 
		//yObj = temp[1];
	   /*
		for (let group in yObj) {
			stylesByLayer += ` .style_${group}_${name}_${i} {fill: ${sample( $currentPalette)} ; }  `
		}	
		*/		
		
	}
	//}
	
	
	let colorObj =  layersColorObj(art.c);
	
	for (let color in colorObj) {
		//stylesByLayer += `.c_${color} { fill: #${color} }`;
		colorObj[color] = color;
	}
	
	
	// experimental: try adding styles by color groups
	/*
	if (stylesByLayer == '<style>') {
		for (let color in colorObj) {
			stylesByLayer += `.c_${color} { fill: #${color} }`;
		}
	
	}
	*/
	stylesByLayer += '</style>';
	
	//if (coll == 'ssj') //console.log(JSON.stringify(art));


	
	//if (['ssj','ope'].includes(coll)) 
	//console.log('colorObj =>>>')
	//console.log(JSON.stringify(colorObj));
	
	// if this image is compound path, process now...
	// x is for complex versus compound path, true means complexElements
	let x = true;
	//console.log('our json is '+JSON.stringify(art));
	if (art.c.length == 1) {
		x = false;
	}
	if (art.c.length == 100) {
		console.log('we got a compound path');	
		console.log(JSON.stringify(art));
		let ic =  splitPaths(coll, coll+i, art.c[0].a.d, false, i, true, $currentPalette)
		console.log('splitPaths arr is '+JSON.stringify(ic));
		art.c = ic.json.c;
		art.yObj = ic.yObj;
	  }

	//console.log('stylesByLayer =>>>')
	//console.log(JSON.stringify(stylesByLayer));
	
	   
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
	
	/*
    else {
        icon.vb = '0 0 500 500';
    }
	*/
    if (kw) icon.kw = kw;

    //console.log('icon is now '+JSON.stringify(icon)) 

// we need this or our stroke-widths are all 1...
	icon.pos.sf = 1;

	addIconToStage(name, icon);

    if (reload) {
       // iconsD = $icons;
       // //console.log('iconsD length is '+iconsD.length)
       // iconsD[i] = icon;
       // $icons = iconsD;
	//	$iconPaths = icon;
        return
    }
/* we are no longer using this for SVGs but rather or pngs
    iconsData.push(icon);
    $icons = iconsData;
    if (i==0) {
		$iconPaths = iconsData[0];
	}
*/
	
    //console.log('reloaded your icon '+name)
}

const addGraphicLayer = () => {
	$tempIcons = {};
	/* this added the holder for the graphic layer, but doesn't add any SVGs
	*/
	let id = 'graphics_'+makeId(4);
	
	$memes[id] = [];
	//console.log('memes is now '+JSON.stringify($memes));
	
	$selectedLayer = id;
	$selectedParts = $selectedParts || {};
	
	$selectedParts[id] = [];
	
	$fileMode = $fileMode || {};
	
	// this is weird doesn't work that well as it doesn't change our mode changer, but it does affect our pattern settings so I'll use stepped as default here!

	if (!$fileMode[id]) {
		$fileMode[id] = $onscreen.fileMode || 'single'
	}
	
	console.log('fileMode[id] is '+JSON.stringify($fileMode));
	
	let arr = $memes['layers'] || [];
	
	arr.push({id: id, type: 'graphic', displayName: id});
	
	$memes['layers'] = arr;
	
	//return id;
	//console.log('meme graphics is now '+JSON.stringify($memes['graphics']));
}

const closeAllPopovers = () => {	
	$onscreen.popover = false;
	
	$onscreen.textPositionPopover = false;
	$onscreen.opacityPopover = false;
	$onscreen.patternPopover = false;
	$onscreen.rectSettingsPopover = false;
	$onscreen.sizePopover = false;
	$onscreen.positionPopover = false;
}

const graphicLayerCheck = () => {

	// if there is no graphic layer yet, create one
	
	let graphicLayer;
	let textLayer = false;
	
	for (let layer of $memes['layers']) {
		if (layer.id == $selectedLayer) {
			if (layer.type == 'graphic') graphicLayer = layer.id;
			if (['text', 'lines', 'paragraph'].includes(layer.type)) textLayer = true;
		}
	}
		
	//if ($onscreen.memeBuilder && ['backs', 'patterns'].includes(part)) 
	
	// if $selectedLayer is no a graphic layer or is 'bg', add one now
	if (!graphicLayer || $selectedLayer == 'bg' || textLayer) {
		addGraphicLayer();
	// this is for Toolbar to pass to Controls
		$memes.selectedLayer = $selectedLayer;
		//console.log('ok we need to add a graphicLayer, now its '+$selectedLayer);
		//console.log("$memes['layers']  is now  "+JSON.stringify($memes['layers']));
		return true
	}
	return false;
}

const adjustThumbs = (part,mode,icon) => {
	let name = icon.name;
	$onscreen.selectedIcons = $onscreen.selectedIcons || [];
	//console.log('adjusting thumbs, adding icon named '+name);
	let current = $onscreen.selectedIcons;// document.getElementsByClassName('top') || [];
	//console.log('got single, removing glows from '+current.length);
	// there really should only be one selected, and this should be handled when they change modes, but just in case something slips by and there are more than one, we'll deselect ALL here
	let temp = [];
	let index;
/*
	if (mode == 'stepped') {
		if ($onscreen.selectedIcons && $onscreen.selectedIcons.length > $qty.length-1) {
			let removeIcon = $onscreen.selectedIcons[0];
			//$onscreen.selectedIcons.shift();
		//	removeThumb(0,removeIcon.name);
		}
		temp = $onscreen.selectedIcons || [];
	}
*/
	let names = [];
	let u = 0;
	let indexLoadingZone;
	
	for (let n of $onscreen.selectedIcons) {
		names.push(n.name);
		if (n.name == name) indexLoadingZone = u;
		u++
	}

	// they've clicked from the loading zone! So we need to move this to front, first we get rid of it to re-add below...
	
	//console.log('before, selectedIcons is now ')
	//console.table($onscreen.selectedIcons);	
	if (names.includes(name)) {
		let el = $onscreen.selectedIcons.splice(indexLoadingZone, 1);
		//console.log('spliced is '+JSON.stringify(el));
		$onscreen.selectedIcons.unshift(el[0]);
		//console.log('after, selectedIcons is now ')
		//console.table($onscreen.selectedIcons);			
		return
	}

	for (let i = 0; i < $icons.length; i++) {
		//console.log('loop adjusting thumbs, icon name '+$icons[i].name); 
		if ($icons[i].name == name) {
			$icons[i].selected = true;
			index = i;
			let el = $icons[index];
			$onscreen.selectedIcons.unshift(el);
		}
	}
/*
	function removeThumb(indexy,name) {
		console.log('$icons[indexy].selected is '+$icons[indexy].selected);
		console.log('name is '+name);
		//$icons[indexy].selected = false;
		let tempNames = Object.keys($tempIcons);
		// really important, must also remove from tempIcons which I use to apply stepped and random! 
		
		for (let n of tempNames) {

			//console.log('name: '+name+' n: '+n);
			if (n == name) {
				//console.log('n MATCH '+n)
				//console.log('tempIcon keys ' +Object.keys($tempIcons));
				//console.log('orig is '+orig);
				delete $tempIcons[n];
				//console.log('$tempIcon keys '+Object.keys($tempIcons));
			}
		}		
	}
	*/
}

const addIconToStage = (name,icon) => {
	
	//console.log('icon.coll is '+icon.coll);
	let timer = 0;
	graphicLayerCheck();
	
	// add THUMB for this icon to layer!
	for (let i = 0; i <  $memes['layers'].length; i++) {
		//console.log('l.id is '+l.id);
		let l = $memes['layers'][i];
		if (l.id == $selectedLayer) {
			let ic = $icons || [];
			let sel = $onscreen.selectedIcons || [];
			let arr = [...ic, ...sel];
			for (let icony of arr) {
				//console.log('icony.name is '+icony.name);
				if (name == icony.name) {
					//console.log('we got a thumb, its '+JSON.stringify(icony));
					$memes['layers'][i].thumb = icony;
				}
			}
		}
	}
	
		
	//console.log('addIconToStage, selectedLayer is '+$selectedLayer);
	if ($search) {
		$search.minimized = true;
	}
	
	//console.log('ti: '+JSON.stringify(tempIcons));
	
	/* lets see how we can transition to pngs by moving to PartsLoader.svelte...*/
	//console.log('running addIconToStage for '+name);
    if (!icon) {
		console.log('uh oh something is seriously messed up you have no ICON!');
		return
	}
	let part = $selectedLayer;
	let actualPart;
	
	//console.log(name+ ' icon json is \n'+JSON.stringify(icon));
	//console.log('colorObj is '+ JSON.stringify(icon.colorObj));
	
	//name = icon.coll + '_'+name;
		
	//::WIP:: testing icon loading
	if ($onscreen.memeBuilder) {
		actualPart = part;
		part = $selectedLayer;
	}
	$selectedParts = $selectedParts || {};
	if (!$selectedParts[part]) $selectedParts[part] = [];
	
	// this sob of a setting for first time runs gave me a 2 hour headache...
	let mode = $fileMode[$partsChooser.part]  ||  'single';
	
	//console.log('filemode for this layer is '+JSON.stringify($fileMode));
	//console.log('part is '+part);
	
	//if (mode != 'random') {
	adjustThumbs(part,mode,icon)
	//}	
	
		//console.log('the part should now be '+$selectedLayer);
	//console.log('mode is '+mode);

	let pattern = false;
	$onscreen.selectedThumbs = true;
	//let arr = [];
	
	//console.log(index + ' > addToSelected, mode: '+mode+ ' name: '+name + ' index: '+index);

	//console.log('part is '+part);

// remove selected from any other elements if the mode is single!!

	// this should cover us for selectedParts. Now create a new array matching the names with index numbers so you can match that up with the pic entry
	let files = $selectedParts[part] || [];
	files.push(name)
	$selectedParts[part] = files;	
	
	//buildSelectedFilesIndex(part, false, icon.coll);
	
	if (mode == 'single') {
		//$tempIcons = {};
		//console.log('mode is single, $tempIcons: '+JSON.stringify($tempIcons));
	}

	// I'm adding the icon to the $tempIcons AFTER getting the keys so that I can mimic unshift() if it were an array, shifting everything 1 over...
	let tempNames = []//

	
	for (let selIc of $onscreen.selectedIcons) {
		//console.log('selIc: '+JSON.stringify(selIc));
		tempNames.push(selIc.name);
	}
	//console.log('tempNames is now '+tempNames);
	//console.table(tempNames);
	$tempIcons[name] = icon;

	//tempNames = tempNames.reverse()
	
	//tempNames.unshift(name);
	//console.table(tempNames);
	
	//console.log('tempNames are '+JSON.stringify(tempNames));
	
	//console.log('tempIcons keys are '+ Object.keys($tempIcons));
	// for icons, this layer needs to be CREATED in the memes!
	
	if (!$memes[part]) $memes[part] = [];
	
	for (let i = 0; i < $qty.length; i++) { 

		// for icons, if not exist, create!
		if (!$memes[part][i]) $memes[part][i] = {};
			
			//console.log(i+' part is '+part);
			//console.log('adding '+name+ ' to avatar '+i);

			//console.log('our fileIndex is '+JSON.stringify(fileIndex));
			//we have no pic array, that is the problem here. Should be icons?
			//let pic = $icons;  
			
			let tempName = tempNames[0];
			
			if (mode == 'random') tempName = sample(tempNames);
			if (mode == 'stepped') tempName = tempNames[i];
			if (!tempName) tempName = tempNames[0];
			
			//console.log('tempName is '+tempName);
			//console.log('icon.name is '+$tempIcons[tempName].name);
			//console.log('icon.coll is '+$tempIcons[tempName].coll);
					
			icon = $tempIcons[tempName];
			
			//console.log(i+' tempName should match: '+tempName);
			//console.log('icon from $tempIcons is now '+JSON.stringify(icon));;
			
			if (!icon) {
				//console.log('@@@@@ YO theres no icon here at index '+index)
				return
			}

		// FIXED: you cannot, I repeat: cannot - just assign "icon" to the $memes['bgImage][i] = or this single icon will be the only variation in your memes array (part of Svelte's auto-magical updating of assigned variables I think...)
		
		let obj = {				
			vb: icon.vb,
			pos: icon.pos || {},
			vb2: icon.vb2
		};
		if ($onscreen.avatarBuilder) {
			//console.log('coll: '+icon.coll+ ' name: '+icon.name);
			obj = getPosition(obj, icon.coll, icon.name);  
			//console.log('our obj is '+JSON.stringify(obj));
			icon = Object.assign(icon, obj);
			$avatar[part][i] = Object.assign($avatar[part][i],icon);
		}
		/*::IMPORTANT:: this is where we actually add the svg to the stage */
		
		if ($onscreen.memeBuilder) {
			//console.log('our icon is color?? '+icon.x);
			// reasonable default for patterns tab	
			//if (!icon.json) $memes[part][i].json = false;
		//	$memes[part][i].vb = icon.vb;
			// keep styles!
			//icon.styleObj = $memes[part][i].styleObj
		 
			
			//$memes[part][i] = icon;
			
			$memes[part][i].x = icon.x || false;
			$memes[part][i].json = icon.json || false;
			$memes[part][i].vb = icon.vb;
			$memes[part][i].name = icon.name
			//$memes[part][i].path = icon.path
			$memes[part][i].type = 'graphic';
			$memes[part][i].coll = icon.coll;
			$memes[part][i].pos = icon.pos;
			$memes[part][i].g = icon.g;
			$memes[part][i].defs = icon.defs;
			$memes[part][i].grads = icon.grads;
			$memes[part][i].stylesByLayer = icon.stylesByLayer;
			
			//experimental
			$memes[part][i].colorObj = icon.colorObj;//$memes['bg'][i].colorObj;
			
			if (icon.path) $memes[part][i].path = icon.path;
			
			//$memes[part][i] = Object.assign($memes[part][i],icon);

			//console.log(i+' our coll in the ' + $memes[part][i].coll);
			//console.log('json is '+ JSON.stringify($memes[part][i].json));
			//console.log(i+' part: '+part+ ' $$$ our template name should be '+$memes[part][i].name);
			//console.log('icon is '+JSON.stringify(icon.pattern));
		}
			//$avatar[part][i].colorObj = icon.colorObj//$avatar['bg'][i].colorObj;
			
	}		

// very sweet, no need to look up the element and manually change the glow, as Svelte handles this with a simple update to the underlying data...
	//pic[index].selected = true;
	if ($onscreen.memeBuilder) {
	
		$controls = graphicControls;
	}
	saveToLocalStorage('tempIcons', $tempIcons);
	saveToLocalStorage('selectedIcons', $onscreen.selectedIcons);
	saveToLocalStorage('memes', $memes);	
	//console.log('memes should be updated!! '+JSON.stringify($memes[part][0]));
}

const parseArt = (json,index, coll) => {
    //console.log(index +'parsing art...'+JSON.stringify(json));
	//console.log('parsing art, coll is '+coll);
  if (!json.c) {
    //console.log('cant recurse, got no json.c');
    return json
   }

   let children = [];
   /* loop through children, if we have a group, add each element to the parent
   this is simplistic, doesn't add the group color which is necessary for some elements -
   but it will do for now until */

   recurseChildren(json);

   function recurseChildren(data,attrs) {
    let arr = data.c;
   // //console.log('recursing group, arr len is '+arr.length)

    for (var i = 0; i < arr.length; i++) {

        let child = arr[i] 
       
        if (child.n == "g") {
            //if we have a group attributes, pass them along
            let attrs = {};
            if (child.a) {
                attrs = child.a;
            }
            recurseChildren(child,attrs)
        } 
        else {
            /* duplicates data but we have to put the group attributes into each path in order to flatten!! */
            if (attrs) {
                //console.log('we have attrs! '+JSON.stringify(attrs))
			//	//console.log('our old attrs are '+JSON.stringify(child.a));
                Object.assign(child.a, attrs);
			//	//console.log('our NEW attrs are '+JSON.stringify(child.a));
			}

            children.push(child);
        }
     }
   }  
   json.c = children;
  // //console.log('new data.c should be '+JSON.stringify(children))
   return json
};

const processBW = (art,coll,name,i,kw,reload, vb) => {
	if (!vb) vb = '0 0 500 500';
    //console.log('got decoded'+JSON.stringify(decoded))
    //console.log('processing b&w')
    // //console.log(JSON.stringify(art))
//
	if (coll == 'ssj') {
		//console.log('BW: ssj');
	}
    if (coll == 'xei') {
        //console.log('got xei')
		
        art = fitToView({
          viewBox: '0 0 2 2',
          path: art,
          min: 0,
          max: 1,
          asList: false
        })
		
      }

    let icon = { name: name, path: art, index:i, coll: coll, pos: {}, vb: vb };
	
	icon.license = $licensing.licenseObj[coll];
		
    if (kw) {
        icon.kw = kw;
    }

    if (reload) {
    
        iconsD = $icons;
        //console.log('iconsD length is '+iconsD.length)
        iconsD[i] = icon;
        $icons = iconsD;
		$iconPaths = icon;
        return
    }

    if (art && art.length>1) {

        iconsData.push(icon) 

        $icons = iconsData;
		
        if (i==0) {
			$iconPaths = iconsData[0];
		}

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
//let zzz = 0;
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

const pushArrToSearch = (arr) => {
	$search = $search || {};
	$search.filesArray = [];
	$search.filesArray.push(arr);
}

const loadCSS = (kw) => {
	let letter = kw[0];
	$onscreen.css = 'data/textures/'+letter+'/'+kw+'/0.css'
}

const processKeyword = (kw,json) => {

	subNames = [];
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
		//console.log('we got cats! '+cats);
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
						//console.log('\n $$$ parent path NOT FOUND '+JSON.stringify(parentPath));
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
		//console.log('kw processed! image len is '+array.length);
	 
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

const changeCollection = (coll,collLoaded, array) => {
    if (coll == collLoaded) {
        new Toast('Collection already loaded! Do you want to  reload?','modal','warning',0,['cancel', 'reload!']);
        return 
    }
    else {
      // $coll = coll;
    }
	//console.log('loading array for '+coll + 'array: '+array);
    clearHTTPRequests();
    getCollectionArray(coll, array);
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
function getFile(coll,name,i,category) {
	setTimeout(function(){  
   // //console.log('grabbing art for coll: '+coll+ ' name: '+name);
		if (name && coll) {
			params.url = '/data/art/' + coll + '/' + name;
			xhrRequest(params,coll,name,i,kw,type,category)
		}
	},i*5)
}
 
const runCollFile = (coll, name, i, type) => {
	setTimeout(() => {
		params.url = '/data/art/' + coll + '/' + name;
		xhrRequest(params,coll,name,i,false, type);
	},i*10)
}
const getCollectionArray = (coll,array) => { 
    //clear out iconsData
    iconsData = [];
    type = 'art';
    //console.log('getting collectionsArray! ')//+JSON.stringify(array));
	let limit = array.length; //100
	currentCollLength = limit;
    for (var i = 0; i < limit; i++) {
		//if (!array[i].includes('australia')) continue
	 if (i > 25 )continue
	  //if (i > 600)continue
	  //if (i < 965) continue
	//	if (i < 790 || i > 1500 ) continue
		//if (i < 1000 || i > 1999) continue
		//	if (i < 1500) continue
		//if (i != 301) continue;
	   // if (i > 300) continue
		//if (i < 301) continue; 
	//	if (i < 301 || i > 600) continue
	//	if (i < 601 || i > 1100) continue
	//	if (i < 1101 || i > 1600) continue
	//	if (i < 1601) continue
	if (i > array.length-1) return;
        let name = array[i];
        if (!name) break;
		runCollFile(coll, name, i, type);
    }     
}



//::VITAL:: this is our main art processing file for all avatar parts

const processAvatarArt = (art,coll,name,i, part) => {
    /* part is a true/false flag for loading multiple parts at once, 
	we need to set this part in the store, won't 
    be one of similar array, but rather the unique part 
	among a variety of parts to build the avatar */
    
	//console.log('processing avatar art '+name)
   
	//console.log('processingAvatarArt for '+name)
    
    let cat = $avatarIcons || [];

	let charName = $character.charName;
		 
	//console.log('$ is '+JSON.stringify($));
	  //  //console.log(art);
    //art = art.replace(/c_/g, '');
    art = JSON.parse(art)
    let s = false, d = false, g = [];
	let stopColors = [];
	
	// loop through children to see what we've got...
		let index = 0;

		for (let child of art.c)  {
				
		//console.log('looking at art, child is '+JSON.stringify(child) );
		
		/* move classnames from our component attributes back to class where they belong!!! For other data attributes, we can just use the myns: prefix in our svelte template */
		
		if (child.n == 'p') {
			
			//console.log('got path ' +JSON.stringify(child));
			if (child.a['myns:classn']) {
				child.a['class'] = child.a['myns:classn'];
				
				// add eyeliner of it is set to true in store!
				//if ($eyeliner)  {
					if (coll == "eyes" && child.a['myns:classn'] == 'tone' && index == (art.c.length-1) ) {
						child.a['class'] = 'eyeliner';
					}
			//	}
			}
		}
		
		if (['myns:linear', 'myns:radial'].includes(child.n)  ) {
				let index = child.a['index']
				let vals = child.a['stop-colors'].split(',');
				stopColors = stopColors.concat(vals) // should be 
		}
		//console.log('stopColors are now '+stopColors);
		
		//console.log('our child.n is '+child.n)
		let name = child.n;
		//console.log(JSON.stringify(child))
		if (name == 'p' && child.a && child.a.f && child.a.f.includes('url')  ) {
			
			//console.log('we got a gradient ref! '+ child.a.f);
			let gradientId = child.a.f;
			gradientId = gradientId.replace('url(#', '').replace(')', '');
			child.a.f = gradientId;
		}
		
		if ( ['linearGradient', 'radialGradient'].includes(name) ) {
			
			//console.log('got a GRADIENT ');
		
		/*  .n is the top level name
			.a is the gradient attributes
			.c are the stops
		*/
			d = true;
			let gradient = child;
			
			//console.log('got gradient, def is '+JSON.stringify(gradient))
				
			let attributes = gradient.a; // our gradient object atrributes		
			gradient.n = child.n; //  should be the name, linearGradient || radialGradient
			
			let stops = gradient.c;
			
			// ::IMPORTANT::  gradient ID's MUST BE UNIQUE to the stage!!!  Otherwise they are fubard.
			
		//  I'm going to replace this template sidebar
			//child.a.id 
			
			// loop over stops and push into gradients, or 'g' array. These just need to have stop-colors added from the stop colors above
			let x = 0;
			
			for (let stop of stops ) {
				//console.log('stop looping '+JSON.stringify(stop) );
					
				if (stop.n !== 'stop') continue
			//	//console.log('changing stop colors')
				stop.a['stop-color'] = stopColors[x];
				let styleDef = stop.a['style'];
				let opacity = styleDef.split(';')
				opacity = opacity[1];
				if (opacity) {
					opacity = opacity.replace('stop-o:', '');
				}
				styleDef = styleDef.replace('stop-o', 'stop-opacity');
				stop.a['stop-o'] = opacity;//stop.a['style']['stop-o'];
				
				stop.a['style'] = undefined //styleDef;
				x++;
			}
			
			// only remove these settings on the "around the eye" gradients that came in totally fubard from the old Kwippe and as of now cant be salvaged...
				if (coll == "eyes" && stops[0].a['offset']===0) {
				
				gradient.a.cx = undefined;
				gradient.a.cy = undefined;
				//gradient.a.gradientTransform = undefined;
				gradient.a.fx = undefined;
				gradient.a.fy = undefined;
				gradient.a.r = undefined;
				
				stops[0].a['stop-color']="sd3"
				stops[1].a['stop-color']="tone"
				stops[2].a['stop-color']="sd1"
			}
		// okay done processing radient, push to g array
		g.push(gradient);	
		} // who the f knows
	  index++;
    } // end children of loop
  //  //console.log('grads is '+JSON.stringify(g) )

  // let's see if this part has been selected by user as one to use...
	let x = true;
	
	if (['backs', 'patterns'].includes(coll)) x = false;
  
    let icon = { name: name, grads: g, defs: d, index:i,  x:x, json:art, coll: coll };
	
	icon.avatar = true;
	icon.license = $licensing.licenseObj[coll];
	
	// for partsChooser!!
	//console.log('$selectedParts is '+JSON.stringify($selectedParts));
	//console.log('name is '+name);
	if ($selectedParts[coll]) {
		if ($selectedParts[coll].includes(name)) {
			icon.selected = 'true';
		}
	}

	//else {
		//::UPDATE:: no I don't think this is a good idea, we may have 200 parts, gives wrong impression...
		//the user didn't select it, but all parts are in fact selected by default in that case...
		//icon.selected = 'true';
//	}
	
    if (art.a && art.a.viewBox) {
        icon.vb = art.a.viewBox;
    }
    else {
        icon.vb = '0 0 200 200';
    }
	icon.pos = {};
	icon.pos.translate = [0,0]; // x, and y for our bodypart <svg>
	icon.pos.sf = 1; //scale factor, used to keep strokes correct
    icon.pos.scale = '1,1'; // used for transform scale for our <g>
	icon.vb2 = ['0', '0'] // used for transform translate our <g>


	// this flag is the last argument passed to our base fn
	if (part) {
	  
	 // console.log('got part '+part)

       icon = getPosition(icon, coll, name);	
	   
	   //if (i == 1) {
		//console.log('avatar is '+JSON.stringify(pic[coll][i]));
	   //}
	   
       pic[coll] = pic[coll] || [];
	
	   if (!icon) {
		console.log('no icon for '+name);
		return
		}
	   	//::VITAL:: if we don't add any existing data from Controls, the part will reset completely when you load a new file
	
		icon = addDataFromControls(icon,coll,i);
	   	icon.index = i;
		icon.license = $licensing.licenseObj[coll];
		
		//console.log('i - 1  is now '+(i-1));
		//console.log('colorObj is now ' + JSON.stringify(icon.colorObj));

       // pic[coll][(i-1)] = (icon);
		 
		// i could do an uber hacky workaround to select either $memes or $avatars depending on onscreen...
		if ($onscreen.memeBuilder) {
		
		/* this is unecessary if the selection is chosen by the UI  - this would load EVERY file into the memes, which we absolutely don't need */
		
			// $memes[coll][(i-1)] = (icon);
		}
		else {
			 $avatar[coll][(i-1)] = (icon);
		}
		 
		//$avatar[coll][(i-1)] = (icon);
		
		$onscreen.partsLoaded = true;
		
		// this should trigger an update to the dom and the SVG's paths, so now we can wait a sec then grab what we need here, and reset any data for the Controls.
		if (icon.styleObj && icon.styleObj != '') {
			setOrigin(coll, i);
		}
		
		
       // //console.log('avatar '+coll+ ' length is now '+ avatar[coll].length)
	   // avatar.pos = 0;
      // //console.log('colorObj for this avatar part is '+JSON.stringify(avatar[co]
	   //store.set({avatar:avatar})
       // let av = $avatar;
       // //console.log('we set the avatar, is now '+JSON.stringify(av))
    }
    else {
		//console.log('no part');
        cat.push(icon);
        $avatarIcons = cat;
    }
	//console.log('store is now '+JSON.stringify(cat));
  //  if (i==0) //store.set({iconPaths: iconsData[0]});
    //console.log('reloaded your icon '+name)
	
	
}

/* mostly a duplicate from Controls.svelte, but since components can't share fns, and module scripts cannot access the store, I had to re-add it here. Refactor when possible! */

const setOrigin = (part, x) => {
	
	x = x-1;

	let dir = '';
	if (['ears', 'eyes', 'eyesback', 'eyesiris', 'eyebrows'].includes(part)) {
		dir = '_left';
	} 
	
	let ele = document.getElementById(part+dir+'_'+x)// you'll have to get this from the dom...
	
	let w = pic[part][x]['w'] || ele.getBoundingClientRect().width/2;
	let h = pic[part][x]['h'] || ele.getBoundingClientRect().height/2;
	w = parseInt(w);
	h = parseInt(h);
	
	console.log('setOrigin, w is now '+w);
	console.log('setOrigin, h is now '+h);

	pic[part][x]['w'] = w;
	pic[part][x]['h'] = h;

	pic[part][x].styleObj = pic[part][x].styleObj || {};		
	
	let origin = pic[part][x].styleObj.origin || `; transform-origin: ${w}px ${h}px; transform-box: fill-box;`;
	
	let move = pic[part][x].styleObj.move || '';
	let scaling = pic[part][x].styleObj.scale || '';
	let opacity = pic[part][x].styleObj.opacity || '';
	let rotate = pic[part][x].styleObj.rotate || '';
				
	pic[part][x].styleObj.origin = origin;
	pic[part][x].style = `transform: ${opacity} ${rotate} ${move} ${scaling} ${origin} `;
	
	//::TODO:: I'm not readjusting the rightParts - which would matter if we had varying heights and widths - right now with just ears and eyebrows it doesn't seem to matter much - and heck maybe these are updating when the other values update - svelte's automagic data binding can be confusing at times
}	

const addDataFromControls = (icon,part, x) => {
	x = x-1;

	if (!pic[part][x]) return icon;
	//console.log(x+' addingDataFromControls '+JSON.stringify(pic[part][x]))
	
	icon.xPos = pic[part][x]['xPos'] || undefined;	
	icon.yPos = pic[part][x]['yPos'] || undefined;
		
	icon.deg = pic[part][x]['deg'] || undefined;		
	icon.flipX = pic[part][x]['flipX'] || undefined;	
	icon.flipY = pic[part][x]['flipY'] || undefined;	
	icon.scaleX = pic[part][x]['scaleX'] || undefined;		
	icon.scaleY =  pic[part][x]['scaleY'] || undefined;	

	icon.move =  pic[part][x]['move'] || undefined;	
	icon.scale =  pic[part][x]['scale'] || undefined;		
	icon.rotate =  pic[part][x]['rotate'] || undefined;	
	
	icon.styleObj = pic[part][x]['styleObj'] || '';
	
	return icon
}

const processAvatarDir = (decoded,coll) => {
    let files = decompressFromUTF16(decoded.f);

    //console.log('processing dir '+coll)
    files = files.split(',');
	// do I get all the files in the dir? That would be really stupid...
	
	/* ::IMPORTANT TODO:: rewrite this mofo, you should parse through the filenames FIRST, only grab wat you actual need.... 
	
	0- get bodypart model where we figure out which files we need for this avatar...Actually this would be problematic as it can't run asyncronously. Actually, we could set a default colorObject for each avatar - since we aren't setting based on any info from the CBOR anyway! Create color models BEFORE you fetch the files for the avatar, then parse & fill in values so you can update the Svelte template. May even be faster... 
	
	1- build a filemodel for each number in qty of avatars needed. When you parse through the filenames is when you'll be able to see if a specific file is set for something  like mouth or eyes, and if you are just randomizing you can exclude files. Filemodel FIRST, then grab actual CBOR for those specific files.
	
	2- run the colorObjUpdate fn by GROUP (not for each bodypart), grabbing all necessary colors -  this enables us to  control better whether we are stepping, randomizing, drawing from a palette, etc. Right now the colorObj updates for each bodypart which is a huge waste.  So groups would be:
	
	let skin  = ["faceshape", "ears", "nose", "humanbody", "chinshadow", "facehighlight", "antlers"]
	let hair  = ["hair", "hairback", "eyebrows", "mustache", "beard"]
	let eyes = ["eyes", "eyebacks"]
	let eyesiris = ["eyesiris"]
	let mouth = ["mouth"]
	let clothes = ["clothes"]
	let glasses = ["glasses"] 
	let backs = ["backs"]
	
	3- run each avatar at a time, with all its bodyparts
	
	*/

	let charName = $character.charName;
	let bodyparts = $currentParts;
	let quantity = $character.qty;
	//console.log('bodyparts from store are '+JSON.stringify($currentParts));
	//console.log('qty: '+ quantity);
	//console.log('charName '+charName);
	
	if (!$bodypartsRetrieved) $bodypartsRetrieved = {};
	
	$bodypartsRetrieved[coll] = files;
	
	//store.set({bodypartsRetrieved: bodypartsRetrieved})
	
	let len = bodyparts.length;
	let lenny = Object.keys($bodypartsRetrieved).length;
	
	//console.log('len: '+len+ ' got dir for '+coll);
	//console.log('dir files are: '+JSON.stringify(files));
	//console.log('retrieved len: '+lenny);

	if (lenny == len) {
		//console.log('$$$$$$$$$$$$$$ all done, got all yer bodyparts! '+len);
		 for (let key in $bodypartsRetrieved) {
			let files = $bodypartsRetrieved[key];
	   		files = filterFiles(files, key, charName);
			$bodypartsRetrieved[key] = files;
			//console.log('dir files are: '+JSON.stringify(files));			
		 } 
		////store.set({bodypartsRetrieved: bodypartsRetrieved})
		// sweet we did a really preliminary filter (that needs to be rewritten!) = but now we can loop through and create a filesObject for each character or avatar 
		let characterDefinition = {};
		
		// this array of index numbers will allow us to cycle through parts based on where we left off 		
		if (!$partsIndices) $partsIndices = {};
		
		for (let part of bodyparts) { 
			//console.log('$fileMode obj: '+JSON.stringify($fileMode));	
			let mode = $fileMode[part];

			let files = $bodypartsRetrieved[part];
			let selectedPart = $selectedParts[part];
			// I don't think I have to return characterDefinition or partsIndices, the fn will mutate the existing objects...
			characterDefinition[part] = characterDefinition[part] || [];
			partsIndices[part] = $partsIndices[part] || 0;		

			addFileToCharacterDef(part, files, characterDefinition, $partsIndices, quantity, mode, selectedPart)
		}

		getAvatarFilesForCharacterDef(characterDefinition, $partsIndices, quantity);
		
		//console.log('characterDef is now '+JSON.stringify(characterDefinition));
	} //  end if lenny == len
	
};

function getAvatarFilesForCharacterDef(characterDefinition, partsIndices, quantity) {
	//console.log('gettingAvatarFiles '+JSON.stringify(characterDefinition));
	
	//store.set({characterDefinition: characterDefinition, partsIndices: partsIndices})
		
	// now loop through and actually retrieve the correct file for each character
	let type = 'avatarPart';

	//console.log('our charDef is '+JSON.stringify(characterDefinition));
	for (let i = 0; i < quantity+1; i++) {
		for (let bodypart in characterDefinition) {
			
				let name = characterDefinition[bodypart][i];
				
				// NOW we can actually get the correct bodypart file!!
				getAvatarFile(bodypart,name,i,type);
		}
	}	
	
}

function addFileToCharacterDef(part, files, characterDefinition, partsIndices, quantity, mode, selectedPart) {
	
	//console.log('addFileToCharacterDef mode: '+ mode+ ' part' + part+ ' bodypart files are '+files);
	
	// now we have to pick a bodypart for each of our quantities
	let index = partsIndices[part];
	
	for (let i = 0; i < quantity+1; i++) {
		let file;
		if (part != 'eyesback') {
			let fileReturn = getFileByMode(files, file, part, index,mode, selectedPart);
			file = fileReturn[0];
			index = fileReturn[1];
			partsIndices[part] = index;
			//console.log('addFileToCharacterDef file is '+JSON.stringify(fileReturn));
			characterDefinition[part][i] = file;
		}
		// we have eyesback, must match eye. It's a waste to pull that dir file, but for now I'll leave it rather than look for where to add the if/then!!
		else {
			//console.log(i+' addFilesToChar: charDef is '+JSON.stringify(characterDefinition));
			
			file = characterDefinition['eyes'][i];
			//console.log('file for eyes is '+file);
			//console.log('file for eyes is '+file);
			file = file.replace('eyes', 'eyesback').replace('left', 'right');
			characterDefinition['eyesback'][i] = file;
		}
	}
	return characterDefinition	
} 

const reRunParts = (parts) => {
	//console.log('got reRun, parts is '+JSON.stringify(parts));
	
	if (!$partsIndices) $partsIndices = {};

	let len = 0;
	let characterDefinition = {};
	
	for (let part of parts) {
		len++;
		//console.log('RErunning '+part);
		let selectedPart = $selectedParts[part];

		let mode = $fileMode[part];

		characterDefinition[part] = [];
	
		let files = $bodypartsRetrieved[part];
		
		
		let qty = $character.qty;
		
		//console.log('##part ' +part+ ' ## Files '+files);

		characterDefinition = addFileToCharacterDef(part, files, characterDefinition, $partsIndices, qty, mode,selectedPart);

		//	//console.log('charDef from reRun: '+JSON.stringify(characterDefinition));

		if (len == parts.length) {
			//console.log('should be running avatar fls');
			getAvatarFilesForCharacterDef(characterDefinition, $partsIndices, qty);
		}
	}
}

const runParts = (parts) => {
	
	for (let i = 0; i < parts.length; i++) {
		let coll = parts[i];
		//console.log('runParts() running parts for '+coll);
		params.url = '/kwippe_output_cbor/'+coll+'_directory';
		let type = 'avatarPartDirectory';
		xhrRequest(params,coll,false,false,false,type);  
	}
	
	//checkIfKeywordExists('tiger');	
}

function getFileByMode(files, file, part, index, mode, selectedPart) {

	//console.log('getting files, mode is '+mode);
	switch (mode) {
		case 'stepped':
		// filter files to only in include ones that are selected... I should double check and make sure they actually exist first, but as the user can only set this via the UI, for now I'll go the lazy route and assume all is good here...
			
			files = $selectedParts[part];
			
		// this var has to control the index, otherwise we have no way to reset it if we hit the end of the files available for that part
				index++;
				file = files[index];
				if (!file) {
					index = 0;
					file = files[index];
				}
			break;
		case 'random':
				let arr = $selectedParts[part] || files;
				file = sample(arr);
		break;
		case 'single':
			// selectedPart is the first in the array
			// so we use the selected part if it's been set in the store, and if it actually exists in the files!
			if ( selectedPart && selectedPart[0] && files.includes(selectedPart[0]) ) {
				file = selectedPart[0];
			}
			// otherwise fall back to a random file
			else {
				file = sample(files)
			}
		break;
		case 'fromArray':
		// this we could do random OR stepped, right now I'll just do random, but stepped really needs to be here too as an option
				// $selectedParts must be an ARRAY
				let array = $selectedParts[part];
				if (array) {
					file = sample(array);
					// naive but for now we'll just check ONE, if the first one we draw is not actually in files, fallback to random. Should probably recurse but for now this is fine!
					if (!files.includes(file) ) {
						file = sample(files);
					}
				}
	} // end switch for sorting for files	
	
	return [file, index]	
}

function filterFiles(files, coll, charName) {
	
	//console.log('filtering, coll is '+coll+ ' charName is '+charName);
	let filesArr = [];
	
    // we need to get rid of some parts of we are doing specific characters, so let's do that here
    for (let filename of files)  {

       if (coll != "mouth" && coll != "eyesiris" && coll != "backs")  {
		   
		   // this artwork does NOT have charNames (monster/male/female) in the filenames
            if (filename.includes(charName) || ['glasses', 'nose', 'mustache', 'beard'].includes(coll) ) {
			
			 if (charName == "female" && filename.includes("_male")) continue;			
			 if (charName == "male" && filename.includes("female")) continue;
			// if (coll == "eyes" && filename.includes('right')) continue;
             filesArr.push(filename)
            }
       }
        else {
			if (coll == "mouth") {
				if (filename.includes('monster')) continue;
				filesArr.push(filename)
				//filesArr.push('mouth_11');
			}
        }
		if (coll == "eyesiris") {
			if (filename.includes("monster") && charName != "monster") continue
			if (filename.includes("aliens") && charName != "aliens") continue
			filesArr.push(filename)
		  // //console.log(filename);
		}
		if (coll == "backs") {
			filesArr.push(filename);
		}
		if (coll == "patterns") {
			filesArr.push(filename);
		}		
    }
	//console.log('filesArr is '+JSON.stringify(filesArr));
	return filesArr
}

const getAvatarFile = (coll,name,i,type) => {
    setTimeout(function(){  
   // //console.log('grabbing art for coll: '+coll+ ' name: '+name);
        if (name && coll) {
            params.url = '/kwippe_output_cbor/' + coll + '/' + name;
            xhrRequest(params,coll,name,i,false,type)
        }
    },i*10)
}

const openCollection = (coll) => {

//   //  new Toast('got '+code,'modal','error'); //console.log('code is now ' + code)
//  // our color image sets: // i added 'lin' because this is LINE art so needs special processing!
//     let colorSets = ['ssjb', 'opg', 'lin', 'gli', 'ga2', 'jqe', 'twe', 'tw2', 'em2', 'fir', 'noc', 'mul', 'her', 'oa1', 'knl', 'ope', 'ofl']
//     if (colorSets.includes(code)) {
//         //console.log('sorry, set is color so nada can load yet')
//        // return
//     }
	//console.log('trying to open '+coll);
	params.url = '/data/art_directory/' + coll + '_directory'
	let type = 'coll';
	xhrRequest(params,coll,false,false,false,type);
	// clear out keywords and search box
	$searchMode = 'reg';
	$search = {terms: [], index:-1, keyword: '',related: []};
} // end open()

const openCollectionsMenu = () => {
	params.url = '/data/colls';
	let type = 'colls';
	xhrRequest(params,false,false,false,false,type);
}

const checkIfKeywordExists = (kw, silent) => {
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

    const kd = $kd;

    /*key:  kw = keyword  kd = keywordsDirectory fl = firstLetter */

    let fl = kw.charAt(0);
    
    if (!kd) {
        const type = 'dir';
        let coll = '';
        params.url = '/data/kws/'+fl+'_directory';
        xhrRequest(params,coll,false,false,kw,type);
        return;
    }

    let possibleKeywords = kd[fl];

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

const filterByCat = (word,type) => {
	let searchy = word[0][1]
	let s = word[0][0]

	let path = word[1]

	clearHTTPRequests();
	//console.log('filtering => SEARCH, word is '+s);
	$search.subFolders = [];
	checkIfKeywordExists(s);

}

const openCategory = (kw, catPath, num, emptySubs, subNav) => {

	//console.log('catPath is '+catPath);
	let upOneLevel = catPath.split(/[~\/]+/);
	upOneLevel.pop();
	let base = upOneLevel.shift();
	upOneLevel = upOneLevel.join('~');
	//console.log('base is '+base);
	
	if (upOneLevel) {
		upOneLevel = base + '/' + upOneLevel;
	}
	else {
		upOneLevel = base + '/' + base;
	}
	//console.log('upOneLevel = ' +upOneLevel);
	//console.log('$search.category is '+ $search.category);
	//console.log('catPath is '+catPath);
	
	if ($search.category != catPath) {		
		$search.navigated = upOneLevel;
	}
	let parts = catPath.split('/');
	if (parts[0] == parts[1]) {
		$search.navigated = false;
	}	
	if (emptySubs) $search.subFolders = [];
	
//console.log('num '+num + ' openCategory, kw is '+kw);
	
	let subs = document.getElementsByClassName('sub');
	let i = 0;
	if ($search.subFolders) {
		for (let entry of $search.subFolders) {
			//console.log('this entry '+JSON.stringify(entry));
			$search.subFolders[i][2] = 'sub'
			i++
		}
	}
	//console.log('change folders, num is '+num);
	if (typeof num == 'number' && $search.subFolders[num]) {
		$search.subFolders[num][2] = 'sub selected';
	}
	
	clearHTTPRequests();
	$iconFiles = [];
	//$icons = [];
	//$search = {};
    iconsData = [];
	
	getCategoriesFromPaths(kw,catPath,true,true);
	
	/*
	if (pathee.includes(mainCat)) {
		//console.log('catPath has no ~ '+catPath);	
		let newP = mainCat + '/'+ pathee.replace(mainCat + '~','');
		//catPath = newP;
		pathy = newP;
	}
	*/

	//getCategoriesFromPaths(kw,pathy,true);
	/* nope this is clunky and worse than adding kw, pollutes the search and since it doens't call subcats, misses some of the files. 
	// dont grab kw files for folders that are just classifiers or have way too many things 
	if (['states','saint','suit', 'traffic', 'bicycle','park','water','mask','nose','slice','wife','santa','school', 'cap', 'round', 'calendar', 'blue', 'green', 'orange', 'open', 'closed', 'multiple','off', 'arrow', 'person', 'on', 'symbol','icon','house', 'silhouette', 'outline', 'head','alternative'].includes(kw)) return;
	
	setTimeout(()=> {
	// the true flag is so we dont get a popup saying no kw found in case of no exist...in fact since all cats should be kws, this should not even be necessary...
		//checkIfKeywordExists(kw, true);
		
		type = 'kwFiles';
		let letter = kw[0];
		params.url =  '/data/kws/'+letter+ '/' +kw;
		let coll = '';
		xhrRequest(params,coll,false,false,kw,type,pathy)
		
	},1000)
	*/
	
}
const toggleCats = (type) => {
	if (type == 'open') {
		$search.minimized = false;
		closeAllPopovers();
	}
	else {
		$search.minimized = true;
	}
}
</script>

<style>

:global(.sub) {	
	word-break: break-word;
}

:global(.relatedKeywords) {
    position: absolute;
	top: 5px;
    left: 28%;
	z-index:10000;
	padding-top: 10px;
    z-index: 10000;
    overflow-x: auto;
    width: 40%;
    height: 48px;
}
:global(.relatedKeywords > span) {
	background-color: #E6E6E6;
	border-radius: 10px;
	padding: 7px;
	margin-right: 10px;
	cursor: pointer;
}
:global(.sub.selected) {
    box-shadow: none !important;
    background-color: aliceblue;
    border-radius: 8px;	
}
:global(.sub:hover) {
    background-color: #fdfdc8;
    border-radius: 8px;	
}


:global(.expandoMin) {
    height: 40px !important;
    overflow: hidden;
    width: 220px !important;
}
:global(.expandoMin .title) {
	text-align:left !important;
	padding-left:10px;
}
:global(.expando) {
	height: 100%;
    position: absolute;
    top: 92px;
	width: 450px;
    top: 15px;
    right: .85%;
	z-index:10000;
    box-shadow: rgba(31,53,78,.11) 0 0 0 1px, rgba(0,0,0,.05) 0 2px 5px;
    display: block;
    background: #fff;
    border-radius: 10px;
    z-index: 10200;
    display: block;
    transition: opacity .2s ease,transform .2s ease;
    /*transform-origin: 50% 0%;*/
    display: flex;
    flex-flow: row wrap;	
   /* transform: scale(.9) translate3d(0,0,0); */
}  
:global(.expando:before) {
    content: '';
    position: absolute;
    top: -9px;
    left: 50%;
    margin-left: -8px;
    border-radius: 0 0 5px 0;
    width: 17px;
    height: 17px;
    opacity: .1;
    background: #0b0c0e;
    transform: rotate(-135deg);
}

:global(.expando:after) {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    margin-left: -8px;
    border-radius: 0 0 5px 0;
    width: 17px;
    height: 17px;
    background: #fff;
    transform: rotate(-135deg);
}
:global(.subCol) {
	display: inline-block;
	width:200px;
	margin: 3px;
	cursor: pointer;
	color:black;	
}
i {
	display: inline-block;
	vertical-align:middle;
}

:global(.relatedCategories) {
	width: 100%;
	height: 100%;
}
:global(.folders) {
	overflow-y: auto;
	height: 85%;
    padding-bottom: 50px;
	padding-top: 20px;
}
:global(.categories) {
	/*overflow-x: scroll;*/
    width: 100%;
    padding-bottom: 4px;
    padding-top: 4px;	
	padding-top: 10px;
    padding-bottom: 10px;
    background-color: whitesmoke;
}
:global(.categoryToolbar) {
    position: relative;
	width: 100%;
	margin-left:4px;
	margin-top:5px;
    font-style: italic;
    font-weight: bold;
    color: #2d3e50;	
	padding-bottom:10px;
	padding-top:5px !important;
    background-color: #eee;
}
:global(.catTools) {
	display: inline-block;
    width: 100%;
}
:global(.zoomed) {
    transform: scale(.3) translateY(-100%);	
    position: absolute;
    right: 0;
}
:global(.cats) {
	display: inline-block;
	padding: 7px;
	margin-right: 10px;
	cursor: pointer;
	border-right: #c8bdbd solid 1px;	
}
:global(.cats0) {
	padding-left:50px;
}
:global(.thumbImage) {
	filter: drop-shadow(-1px 1px 2px #c9c4c4);
	text-align: center;
}
:global(.catThumb) {
	margin-left: 10px;
	margin-right: 10px;
	width: 35px;
	height: 35px;
}
:global(.thumbText) {
	vertical-align:super;
	display: inline-block;
}
:global(.catTools.close) {
    margin-top: 5px !important;
}
:global(.relatedKeywords::-webkit-scrollbar) {
	height: 6px;
}
:global(.relatedKeywords::-webkit-scrollbar-track) {
	background: transparent !important;
}
:global(.topbar) {
    width: 100%;
    margin-bottom: 20px;
    background: transparent !important;
}
</style>

{#if $onscreen.iconsExplorer }
	<IconsExplorer coll={currentColl} lenny={currentCollLength} />
{/if}

{#if $onscreen.partsLoader}
	{#if $search.cats}
	<div class="expando {$search.minimized ? 'expandoMin' : ''}">
	
		<div class="relatedCategories">
			<div class="categoryToolbar topbar">
				{#if !$search.minimized}
					<div class="catTools filter zoomed" style="left: 15px; width: 73px; height: 75px; background-position: -225px -148px; background-image: url('data/textures/f/filter/0.png')" ></div>
				{/if}
				<div class="catTools title" style="text-align:center">
				{$search.minimized ? 'categories' : 'matching categories'}</div>
				{#if !$search.minimized}
					<div on:click="{() => toggleCats('close')}" class="catTools open zoomed" style="width: 75px; height: 75px; background-position: -75px 0px; background-image: url('data/textures/cats/symbols-icons/math-punctuation~cross-delete-remove/0.png')"></div>	
				{:else}
					<div on:click="{() => toggleCats('open')}" class="catTools close zoomed" style="width: 75px; height: 51px; background-position: -75px 0px; background-image: url('data/textures/cats/symbols-icons/arrows~chevron_down/0.png')"></div>					
				{/if}
			</div>
		 
		
			{#if $search && $search.cats}
			
				{#if $search.navigated}
					<i on:click="{() => openCategory(false, $search.navigated)}" class="catTools zoom" style="left: 10px;top:140px; vertical-align: text-top; width: 75px; height: 55px; background-position: -159px -938px; background-image: url('data/textures/b/back/2.png')" />				
				{/if}
			
				<div class="categories">
			
				{#each $search.cats as word, x}
					<div class="cats cats{x}">
					{#if word[0][1]}
						<span id="cat{x}" on:click="{() => filterByCat(word,'search')}">{word[0][0] || ''}/</span>
					{:else}
						<span id="cat{x}" on:click="{() => openCategory(word[0][0],word[1])}">{word[0][0] || ''}</span>				
					{/if}
					<span id="cat{x}" data-word={JSON.stringify(word)} on:click="{() => openCategory(word[0][1],word[1],false)}">{word[0][1] || ''}</span>
					</div>
				{/each}
				</div>
		  
			{/if}
		
			{#if $search && $search.subFolders && $search.subFolders.length > 0}
			<div class="folders">
				{#each $search.subFolders as word, x}
					<div class="subCol">
						
						<div class="{word[2]}" on:click="{() => openCategory(word[0],word[1],x, false, true )}">
							<div class="thumbImage catThumb">
							<i style="width:{word[3][0]}px; height: {word[3][1]}px; background-position: {word[3][2]}px {word[3][3]}px; background-image:url(data/textures/cat_icons/{word[4]}.png" /></div>
							<div class="thumbText">	{word[0].replace(/_/g, ' ')}
							</div>
						</div>
					</div>
				{/each}
			</div>	
			{/if}
		
		</div>
	</div>
	{/if}	
	
	{#if $search && $search.related}
		<div class="relatedKeywords">
			{#each $search.related as word}
				{#if word.length > 0}
					<span on:click="{() => checkIfKeywordExists(word)}">{word}</span>
				{/if}
			{/each}
		</div>
	{/if}
{/if}

{#if $onscreen.avatarBuilder}

  <PartsChooser bind:pic={$avatarIcons} />

{/if}

{#if $onscreen.partsChooser && !$onscreen.avatarBuilder}

  <PartsChooser bind:pic={$icons} />

{/if}
