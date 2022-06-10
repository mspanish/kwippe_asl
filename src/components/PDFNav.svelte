 <script>
import { fabric } from "fabric";
import { onMount } from 'svelte';

import { getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';
import { settings, drawType } from '../store.js';
import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js';  
export let canvas;

const addPage = () => {
    console.log('adding page now')
    $settings.pdfLayoutFlag = 'add';
}

const removePage = () => {
    // I use parseInt to avoid Svelte auto updating the var on change
    let removeMe = parseInt($settings.pdfIndex)
    
    console.log('page to remove: '+removeMe);
    let ely = document.getElementById('page-'+$settings.pdfIndex+'-canvas')
    ely.remove();
    window.localStorage.removeItem('page-'+removeMe+'-canvas');
    
    let pages = document.getElementsByClassName('pdf-canvas');
  //  console.log('lenny pages '+pages.length);    
    let e = pages.length;
    $settings.pdfTotal = $settings.pdfTotal - 1;
    
    if ($settings.pdfIndex > $settings.pdfTotal) {
        $settings.pdfIndex = $settings.pdfIndex - 1;
    }
    
    let pdfs = {};
    let pdfObj = {}
    
    for (let page of pages) {
        let name = 'page-' +e+ '-canvas';
        let obj = getFromLocalStorage(page.id)
        
        // stash the data and remove from localStorage
        pdfObj[name] = obj;
        window.localStorage.removeItem(page.id);
        //console.log('iterating pages, i is '+i)
        page.id = name;
        if (e == $settings.pdfIndex) {
            page.style.display = 'inline';  
        }
        pdfs[name] = '1';
        e--;
    }
    // save BACK using the correct name
    for (let key in pdfObj) {
      saveToLocalStorage(key, pdfObj[key]);
    }
    loadJSON('page-'+ $settings.pdfIndex+'-canvas'); 
    saveToLocalStorage('pdfs', pdfs);

    /*
        XX 1. get rid of canvas element
        XX 2. re-id existing canvas elements
        XX 3. set the current index's canvas to display: inline
        XX 4. adjusting the localStorage array with ids
        XX 5. adjust the any localStorage value whose id has changed
        XX 6. reset the $settings pdfTotal
        XX 7. load JSON for current page
    */
}

const unloadPDF = () => {
    $settings.pdfStash = false;
    let str = 'This action will remove the current PDF and all work!';
    
    new Toast(str, 'modal','warning',0,[
    {text: 'proceed',action:'pdfUnload'},
    {text:'cancel',action:'cancel'},
    ])
}

const savePDFData = () => {
	//TODO: this script should ask the user for a NAME first, appending a var if that name is already taken - and save to localStorage plus maybe download a JSON file (for now)
	console.log('savePDFData');
	let master = {};
	master.settings = {};
    master.settings.pdfUrl = $settings.pdfStash.url;
	let pdfs = getFromLocalStorage('pdfs');
	if (pdfs && Object.keys(pdfs).length < 1) {
		console.log('no PDF to save...')
		return
	}
	else {
        if (pdfs) {
            console.log('we got pdfs! '+Object.keys(pdfs));
            for (let pdf of Object.keys(pdfs)) {
                master[pdf] = getFromLocalStorage(pdf);
            }
		}
		else {
            console.log('no pdf data to sve')
		}
	}
	
	//var data = "text/json;charset=utf-8," + encodeURIComponent(JSON. stringify(master)); 
	
	download_file('lumen.json', JSON.stringify(master));
	//$('<a href="data:' + data + '" download="data. json">download JSON</a>').
	
	function download_file(name, contents, mime_type) {
		mime_type = mime_type || "text/plain";

		var blob = new Blob([contents], {type: mime_type});

		var dlink = document.createElement('a');
		dlink.download = name;
		dlink.href = window.URL.createObjectURL(blob);
		dlink.onclick = function(e) {
			// revokeObjectURL needs a delay to work properly
			var that = this;
			setTimeout(function() {
				window.URL.revokeObjectURL(that.href);
			}, 1500);
		};

		dlink.click();
		dlink.remove();
	}
	
}

const saveJSON = (page) => {
    console.log('saving json for '+page)
    var json = canvas.toJSON();
    let pdfs = getFromLocalStorage('pdfs') || {};
    pdfs[page] = 1;
    let settings2 = {};

    if ($settings.pdfStash && $settings.pdfStash.url != false) {
		//console.log('our pdfStash url is '+JSON.stringify($settings.pdfStash));
		
        settings2.pdfUrl = ($settings.pdfStash.url).replace('"','').replace('"','');
        //console.log('pdf url is '+settings2.pdfUrl)
    }
    saveToLocalStorage('pdfs', pdfs);
    saveToLocalStorage(page, json);
    saveToLocalStorage('settings', settings2)
}
const loadJSON = (page) => {
    let json = getFromLocalStorage(page);
    if (json && json.objects.length > 0) {
       // console.log('we have saved data for '+page)
        //console.log(json)
        canvas.loadFromJSON(json);
    }
    else {
        console.log('no saved data for '+page + ' clearing canvas')
        canvas.clear();
    }
}

const initial = () => {
    let pages = document.getElementsByClassName('pdf-canvas'); 
    for (let page of pages){
        page.style.display = 'none';
        let id = page.id;
        let index = id.split('-');
        index = index[1];
        if (index == ($settings.pdfIndex) ) {
            page.style.display = 'inline';
            loadJSON('page-'+index+'-canvas');
        }
    }
}

const go = (e) => {
    let pages = document.getElementsByClassName('pdf-canvas'); 
    let mode = e.target.id;
    
    let curIndex = parseInt($settings.pdfIndex);
    

    if (mode == 'forward') $settings.pdfIndex = $settings.pdfIndex + 1;
    if (mode == 'backward') $settings.pdfIndex = $settings.pdfIndex -1;
    if (mode == 'exact') // do nada
    
    console.log('nav pages lenny is '+pages.length)
    console.log('nav index is '+$settings.pdfIndex)
    
    if ($settings.pdfIndex > pages.length) {
        $settings.pdfIndex = pages.length;
        return
    }
    if ($settings.pdfIndex < 1) {
        $settings.pdfIndex = 1;
        return
    }
    
    for (let page of pages){
        page.style.display = 'none';
        let id = page.id;
        let index = id.split('-');
        index = index[1];
        if (index == ($settings.pdfIndex) ) {
            page.style.display = 'inline';
            console.log('curIndex is '+curIndex+ ' index is '+index);
            saveJSON('page-'+curIndex+'-canvas');
            loadJSON('page-'+index+'-canvas');
        }
    }
}

var overlayCanvases = function(cnv1, cnv2) {

    // deselect all from fabric canvas first
        
    var newCanvas = document.createElement('canvas'),
        ctx = newCanvas.getContext('2d'),
        width = (cnv1.width)/1.125,
        height = (cnv1.height)/1.125;

    newCanvas.width = width;
    newCanvas.height = height;
    let e = 0;
    
    //I had to change cnv2 to its own w/h. This does cut it off but thats OK, the user can pretty much assume when printing to PDF that anything outside the PDF is outside printable area. This makes a pretty much pixel perfect PDF from the original, w/ the graphics sized and positioned exactly where the user put them. 
    
    [cnv1, cnv2].forEach(function(n) {
        if (e == 1) {
            width = cnv2.width * .7120; //.85;
            height = cnv2.height * .7120; //.85;			
        }

        ctx.beginPath();
        ctx.drawImage(n, 0, 0, width, height);
        e++; 
		//console.log('e is '+e);
    });

    return newCanvas.toDataURL();
};

function savePDF(){

    canvas.discardActiveObject().renderAll();

    // first we need to save the data and remember the page the user is on now, as maybe they will hit "print" when they are on page 10 and don't want to lose their place
    
    let curIndex = parseInt($settings.pdfIndex);
    saveJSON('page-'+curIndex+'-canvas');

    /* USAGE */
    let canvas1;
    let canvas2 = document.getElementById('c');
    
    let pages = document.getElementsByClassName('pdf-canvas');   
    let pdf = new jsPDF('p', 'in', 'letter', true);
    
    let arr = [];
    
    if (pages.length == 1) {
        canvas1 = pages[0];
        let dURL1 = overlayCanvases(canvas1,canvas2);
        pdf.addImage(dURL1, 'png', 0, 0,'','','','FAST');
        pdf.save("download.pdf");
        return
    }
    
    
    for (let page of pages){
        page.style.display = 'none';
        arr.unshift(page.id)
    }
    
    var iterator = arr[Symbol.iterator]();
    let e = 0;
    function loadPage() {
    
        let p = iterator.next().value;
        if (!p) {
            pdf.save("download.pdf");
            initial();        
            return
        }
        console.log(p)
        let el = document.getElementById(p)
        canvas1 = el
        let id = p;
        el.style.display = 'inline'
        canvas.clear();
        loadJSON(id);
        let json = getFromLocalStorage(id) || {}

        canvas.loadFromJSON(json, function(){
            let dURL1 = overlayCanvases(canvas1,canvas2);
            
            // it already adds a page for the first one, so we only need this for pages larger than index 1
            if (e > 0) {
                pdf.addPage()
            }
            e++;

            pdf.addImage(dURL1, 'jpg', 0, 0,'','',id, 'FAST');
            
            if (!p.done) {
                loadPage();
            }        
            
        });
    }
    loadPage();
}

</script>

<style>
/* Submenus should still be display: block; */
.pure-menu-item .pure-menu-item {
    display: block;
    cursor: pointer;
}

.pure-menu-children {
    display: none;
    position: absolute;
    left: 100%;
    top: 0;
    margin: 0;
    padding: 0;
    z-index: 3;
}

.pure-menu-link {
    cursor: pointer;
}
.pure-menu-horizontal .pure-menu-children {
    left: 0;
    top: auto;
    width: inherit;
}

.pure-menu-allow-hover:active > .pure-menu-children,
.pure-menu-active > .pure-menu-children {
    display: block;
    position: absolute;
}

.pure-menu-allow-hover:hover > .pure-menu-children,
.pure-menu-active > .pure-menu-children {
    display: block;
    position: absolute;
}


/* Vertical Menus - show the dropdown arrow */
.pure-menu-has-children > .pure-menu-link:after {
    padding-left: 0.5em;
    content: "\25B8";
    font-size: small;
}

/* Horizontal Menus - show the dropdown arrow */
.pure-menu-horizontal .pure-menu-has-children > .pure-menu-link:after {
    content: "\25BE";
}
span {
    padding: 10px;
    line-height: 2;
}
.iconTool {
    margin-top: -10px;
    pointer-events: all;
    margin-left: 10px;
    margin-right: 10px;
    padding: 3px;
    cursor: pointer;
}
.iconLabel {
    width: 60px;
    margin-top: 43px;
    top: 0;
    position: absolute;
    font-size: .8rem;
    color: #666666;
    text-align: center;
    /* margin-top: -20px; */
    overflow: visible;
}
.iconTool:hover {
    background: #f8fab2;
    box-shadow: 0px 0px 1px #988585;
}
.sprite {
    transform: scale(.63);
}

</style>
    {#if $settings.pdfTotal > 1}
       <li class="pure-menu-item" style="margin-left: 20px; border-left:1px solid #fefefe; height:50px"></li>
        <li class="pure-menu-item">
        
            <div class="iconTool">
                <div class="sprite back_filled"  id="backward" on:click={go}></div>
                <div class="iconLabel">back</div>
            </div>

        </li>
        <li class="pure-menu-item">
            <span>page {$settings.pdfIndex} of {$settings.pdfTotal}</span>
        </li>
        <li class="pure-menu-item">
            <div class="iconTool">
                <div class="sprite forward_filled" id="forward" on:click={go} ></div>
                <div class="iconLabel">forw</div>
            </div>        

        </li>
    {/if}

        <li class="pure-menu-item">

            <div class="iconTool">
                <div class="sprite add_filled" style="opacity:.75"  id="add" on:click={addPage}></div>
                <div class="iconLabel">add</div>
            </div>       
        </li>
        
        {#if $settings.pdfTotal > 1}
            <li class="pure-menu-item">
                <div class="iconTool">
                    <div class="sprite remove_filled"  style="opacity:.7" id="unload" on:click={removePage}></div>
                    <div class="iconLabel">remove</div>
                </div>     
            </li>
        {/if}

        
        <li class="pure-menu-item">

                <div class="iconTool">
                    <div class="sprite unload" id="unload" on:click={unloadPDF}></div>
                    <div class="iconLabel">unload</div>
                </div>  
                </li>
        
        <li class="pure-menu-item">
        
            <div class="iconTool">
                <div class="sprite document_print" id="print" on:click={savePDF} ></div>
                <div class="iconLabel">print</div>
            </div>          
        </li>

        <li class="pure-menu-item">
        
            <div class="iconTool">
                <div class="sprite save" id="save" on:click={savePDFData} ></div>
                <div class="iconLabel">save</div>
            </div>          
        </li>		
