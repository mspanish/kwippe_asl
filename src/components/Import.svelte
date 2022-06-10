<script>
 
import { fabric } from "fabric";
import { settings, onscreen } from '../store.js';
import { getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';
import { Toast, deleteAllToasts} from '../scripts/toaster-js/index.js';  
import { trimCanvas } from '../scripts/canvas_trimming.js';
import { onMount, onDestroy } from 'svelte';

export let canvas;
export let fileMenu;
 
$: if ($settings.pdfUnloadFlag) {
	console.log('### running pdffUnloadFlag')
    unload();
    load();
    $settings.pdfUnloadFlag = false;
}

$: if ($settings.pdfLayoutFlag) {
	console.log('>>> running pdfLayoutFlag')
    let add = false;
    if ($settings.pdfLayoutFlag == 'add') add = true;
    createNewPDF($settings.pdfLayout, add);
    $settings.pdfLayoutFlag = false;
}

$: if ($settings.preloadPDF) {
// lame needs better way to make sure pdfjs is loaded, we need  a proper script so if kids are loading homework it passes the URL from vars or db where teacher has set that
	setTimeout(() => {
		let url = $settings.preloadPDF;
		$settings.pdfStash = {};
		$settings.pdfStash.url = $settings.preloadPDF;
		loadPDF(url)
		loadJSON('page-1-canvas');
		$settings.preloadPDF = false;
	},2000);

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
    }
}

const saveJSON = () => {
    var json = JSON.stringify( canvas.toJSON() );
    console.log(json)
    saveToLocalStorage('canvas', json)
}

const createPDF = () => {
	let str = 'Choose layout for PDF';
    console.log(str)
	new Toast(str, 'modal','warning',0,[
		{text: 'landscape',action:'pdfLandscape'},
        {text:'portrait',action:'pdfPortrait'},
        {text: 'cancel', action: 'cancel'}
	]); 
}
const createNewPDF = (layout, add) => {
    console.log('creating new pdf '+layout)
    if (layout == 'portrait') {
        let url = $settings.rootURL + '/portrait.pdf';
        loadPDF(url, add);
    }
    else {
        let url = $settings.rootURL + '/landscape.pdf';
        loadPDF(url, add);  
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
            width = cnv2.width * .7120;
            height = cnv2.height * .7120;
        }
        ctx.beginPath();
        ctx.drawImage(n, 0, 0, width, height);
        e++;
    });

    return newCanvas.toDataURL();
};


const exportImage = () => {
    canvas.discardActiveObject().renderAll();
    let data;
    let canvas2 = document.getElementById('c');
    if ($settings.pdfLoaded) {
        let canvas1 = document.getElementById('page-'+$settings.pdfIndex+'-canvas');
        data = overlayCanvases(canvas1,canvas2);
    }
    else {
        let sourceCanvas = document.getElementById('c');
        let dc = document.createElement('canvas');
        
        dc.width = sourceCanvas.width;
        dc.height = sourceCanvas.height;
        //grab the context from your destination canvas
        var destCtx = dc.getContext('2d');

//call its drawImage() function passing it the source canvas directly
        destCtx.drawImage(sourceCanvas, 0, 0);  
        
        let trimmedCanvas = trimCanvas(dc);
        data = trimmedCanvas.toDataURL();
    }
    var save_link = document.createElement('a');
    save_link.href = data;
    save_link.download = 'download.png';
    
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);    
}
/* assumes each canvas has the same width 
var verticalCanvases = function(cnv1, cnv2) {
    var newCanvas = document.createElement('canvas'),
        ctx = newCanvas.getContext('2d'),
        width = cnv1.width,
        height = cnv1.height + cnv2.height;
        
    newCanvas.width = width;
    newCanvas.height = height;

    [{
        cnv: cnv1,
        y: 0
    },
    {
        cnv: cnv2,
        y: cnv1.height
    },
    {
        cnv: cnv3,
        y: cnv1.height + cnv2.height
    }].forEach(function(n) {
        ctx.beginPath();
        ctx.drawImage(n.cnv, 0, n.y, width, n.cnv.height);
    });

    return newCanvas.toDataURL();
};
*/


function savePDF(){
    let canvas1 = document.getElementById('page-1-canvas');
    let canvas2 = document.getElementById('c');
    
    canvas.discardActiveObject().renderAll();

/* USAGE */
    var dURL1 = overlayCanvases(canvas1,canvas2);
    //var dURL2 = verticalCanvases(canvas1,canvas2,canvas3);

    //var imgData = canvas.toDataURL("image/jpeg", 1.0);
    //var pdf = new jsPDF();
    let layout = 'p';
    if (canvas1.width > canvas1.height) {
        layout = 'l';
    }
    var pdf = new jsPDF(layout, 'in', 'letter');

    pdf.addImage(dURL1, 'JPEG', 0, 0);
    pdf.save("download.pdf");
}

const unload = () => {
    let pages = document.getElementsByClassName('pdf-canvas');
    //console.log('lenny pages '+pages.length);    
    for (let i = pages.length; i > 0; i--) {
       // console.log('iterating pages, i is '+i)
        let el = document.getElementById('page-'+i+'-canvas')
        el.remove();
    }
    $settings.pdfLoaded = false;
    $settings.pdfTotal = 0;
    let pdfs = getFromLocalStorage('pdfs')
    for (let pdf in pdfs) {
        window.localStorage.removeItem(pdf);
    }
    window.localStorage.removeItem('pdfs');    
}

const pdfUnloadWarning = () => {
    if ($settings.pdfLoaded) {
        let str = 'This action will remove the current PDF and all work!';
        
        new Toast(str, 'modal','warning',0,[
		{text: 'proceed',action:'pdfUnload'},
        {text:'cancel',action:'cancel'},
        ])
    }
    else {
        unload();
    }
}

const load = () =>  {
    
    if ($settings.pdfStash == false) return;
    
    let url = $settings.pdfStash.url;
    let add = $settings.pdfStash.add;
    var scale = 2;
    let resolution = 1.0;
    
    let inst = {};
    let pdf_pages = [];
    let loadingTask = PDFJS.getDocument(url);

    loadingTask.promise.then(function (pdf) {

        inst.pages_rendered = 0
        inst.number_of_pages = pdf.pdfInfo.numPages;
        console.log('how many pages? '+inst.number_of_pages)
        
        for (var i = 1; i <= pdf.pdfInfo.numPages; i++) {
            pdf.getPage(i).then(function (page) {
                console.log('getting pdf page '+i)
                var viewport = page.getViewport(scale);
                console.log('viewport is '+JSON.stringify(viewport))
                var canvas = document.createElement('canvas');
                document.getElementById('canvasDiv').parentNode.prepend(canvas);

                canvas.className = 'pdf-canvas';
              //  canvas.height = viewport.height;
              //  canvas.width = viewport.width;
                canvas.height = resolution*viewport.height; //actual size
                canvas.width = resolution*viewport.width;

                canvas.style.height = viewport.height + 'px'; //showing size will be smaller size
                canvas.style .width = viewport.width + 'px';
                
                
                
                let context = canvas.getContext('2d');
                
                let c = document.getElementById('c');

                let uc = document.getElementsByClassName('upper-canvas')[0];                
                c.style.height = viewport.height ;
                uc.style.height = viewport.height;
                
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.then(function () {
                    pdf_pages = document.getElementsByClassName('pdf-canvas');
                    let e = pdf_pages.length;
                // if (add) e = e + $settings.pdfTotal;
                    for (let i = 0; i < pdf_pages.length; i++) {
                    //  $('.pdf-canvas').each(function (index, el) {
                        let idy = 'page-' + (e) + '-canvas';
                        pdf_pages[i]['id'] = idy
                        e--;
                    //});
                    }
                    inst.pages_rendered++;
                    console.log('pages rendered = ')
                    console.log(inst.pages_rendered)
                    if (inst.pages_rendered == inst.number_of_pages) {
                        console.log('rendered your pdf!')
                        $settings.pdfLoaded = true;
                        if (add) {
                            inst.pages_rendered = $settings.pdfTotal + inst.pages_rendered;
                        }
                        $settings.pdfTotal = inst.pages_rendered;
                        // for now, DUMP localStorage entries. Later we'll add saving using a filename. So these values are only for our working pdf, we'll need another data structure to save previous pdfs and load them into memory
                        /*
						let pdfs = getFromLocalStorage('pdfs');
						
                        for (let pdf in pdfs) {
                            window.localStorage.removeItem(pdf);
                        }
                        window.localStorage.removeItem('pdfs');
						*/
                    }
                });
            });
        }
    })
}

const loadPDF = (url, add) => {
// need to verify url here
   // console.log('loadPDF val '+url);
    $settings.pdfStash = {
        url: url,
        add: add
    }   

    if (!url) return
    console.log('loading PDF, add value is '+add)
    if (!add && $settings.pdfLoaded) {
        pdfUnloadWarning();
    }
    else {
        load()
    }
} // end loadPDF()

function loadSVG(svgStr,url,pointer,origin,canvas) {
    var group = [];
    let loadedObjects;
    fabric.loadSVGFromString(svgStr, function(objects, options) {
        // Group elements to fabric.PathGroup (more than 1 elements) or
            // to fabric.Path
            loadedObjects = new fabric.Group(group);
            loadedObjects.set({
//                left: pointer.x -20, 
 //               top: pointer.y-100,
                type: 'group'
            })
            .center()
            loadedObjects.scaleToHeight(300)
            .setCoords();
            canvas.add(loadedObjects);
            console.log(loadedObjects);
            //loadedObjects.item(0).set('fill', 'red');
            canvas.renderAll();
        },
        function(item, object) {
            if (origin == 'math') {
                object.set('svgType','equation');
                object.set('fill', '#000000');
            }
            else {
                object.set('svgType','import');                
            }
            object.set('sourcePath',url);
            

            group.push(object);
        });
    
    // this is what you'd do to add svg items UNGROUPED, which is probably not a good default for our purposes - although it would allow the user to adjust elements quickly, so maybe you let that be a user setting...
    if (origin == 'math' && settings.equationsUngrouped) {
        group = loadedObjects;
        var items = group._objects;
        group._restoreObjectsState();
        canvas.remove(group);
        for (var i = 0; i < items.length; i++) {
            canvas.add(items[i]);
        }
        canvas.renderAll();
    }
}

const fetchText = async (url,pointer, origin, canvas) => {
//async function fetchText(url,pointer,origin) {
    const req = await fetch('/.netlify/functions/getsvg', {
    method:'POST',
    body: JSON.stringify({url: url})
    })
    const res = await req.text()
    //console.log('our svg is '+res)
    loadSVG(res,url,pointer,origin,canvas)
}

const imageSearch = (keyword, canvas) => {

}

    
const importImage = () => {
    let input = document.getElementById('import_url')
    let url = input.value.toLowerCase();
    console.log('url '+url)
    if (url.includes('.pdf')) {
        loadPDF(url, false);
    }
    if (url.includes('.svg')) {
        let pointer = {x: 100, y:100};
        let origin = 'import'
        fetchText(url, pointer, origin, canvas, $settings);
    }
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.gif') || url.includes('.jpeg')) {
        fabric.Image.fromURL(url, function(oImg) {
        // scale image down, and flip it, before adding it onto canvas
    //  oImg.scale(0.5).set('flipX', true);
            canvas.add(oImg);
        });   
    }
}

const uploadImage = (event) => {
    let fileinput = document.getElementById("upload");
    let url = fileinput.files[0].name;

    var reader = new FileReader();
    console.log(url);  
    
    reader.onload = function (event) { console.log('loading your uploaded image');      
        if (url.includes('.svg')) { 
            var svgData = event.target.result;
            //var parser = new DOMParser();
            //var doc = parser.parseFromString(svgData, "image/svg+xml");
            console.log(svgData)
            let pointer = {x: 100, y:100};
            let origin = 'upload'
            loadSVG(svgData,url,pointer,origin,canvas)
            return
        } 
        
        if (url.includes('.pdf')) {
			console.log('$$$$$ url has PDF')
            var typedarray = event.target.result //new Uint8Array(event.target.result);
            loadPDF(typedarray, false);
        }
        
//        reader.readAsText(fileinput.files[0]);
        var imgObj = new Image();
        imgObj.src = event.target.result;


        imgObj.onload = function () {
            // start fabricJS stuff

            var image = new fabric.Image(imgObj);
            image.set({
                padding: 10,
                cornersize: 10
            });
            //image.scale(getRandomNum(0.1, 0.25)).setCoords();
            canvas.add(image);
            image.center().setCoords();
            // end fabricJS stuff
        }
        
    }

    if (url.includes('.pdf')) {
        console.log('## reading as pdf')
        //reader.readAsArrayBuffer(event.target.files[0]);   
        reader.readAsDataURL(event.target.files[0]);
    }
    if (url.includes('.svg')) {
        console.log('## reading as pdf')
        reader.readAsText(event.target.files[0]);
    }
    if (!url.includes('.svg') && !url.includes('.pdf')) {
        console.log('## reading as image')
        reader.readAsDataURL(event.target.files[0]);
       // reader.readAsArrayBuffer(event.target.files[0]);    
    }
};

//export { fetchText, imageSearch, uploadImage, loadSVG, loadPDF }
</script>
<style>
.pure-button {
    background-color: rgb(97, 103, 108);
    color: #fff;
}
</style>
<div style="margin-top:10px;">
    {#if !fileMenu }
        <span class="slideTitle">Import Image/PDF</span>
    
        <div class="section" id="import_image_or_pdf">  
            {#if $onscreen.importImage}

                <div>
                    <input id="import_url" type="text" placeholder="paste url here" />
                </div>

                <div id="importImage">
                    <button on:click="{importImage}">import image</button>
                </div>        
            {/if}   
            <br>
            <div>upload image</div>
            <br>
            <div id="upImage">
                <input style="width: 99%;" class="pure-button" type="file" on:change="{uploadImage}"
                    id="upload" name="upload"
                    accept="image/png, image/jpeg, image/gif, image/svg+xml, application/pdf">
            </div>
            
        </div>
    {:else}

        <li class="pure-menu-item">
            <span on:click={createPDF} class="pure-menu-link">Create new PDF</span>
        </li>            

        <li class="pure-menu-item">
            <span on:click={saveJSON} class="pure-menu-link">Save to JSON</span>
        </li>
        <li class="pure-menu-item">
            <span on:click={exportImage} class="pure-menu-link">Export to Image</span>
        </li>

    {/if}
</div>
