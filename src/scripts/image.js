import { fabric } from "fabric";
let ungrouped = false;

const loadPDF = (url, canvas, mode) => {
    var scale = 1.5;
    let inst = {};
    let pdf_pages = [];
// need to verify url here
   // console.log('loadPDF val '+url);
    if (!url) return

    let loadingTask = PDFJS.getDocument(url);

    loadingTask.promise.then(function (pdf) {

    inst.pages_rendered = 0
    inst.number_of_pages = pdf.pdfInfo.numPages;
    console.log('how many pages? '+inst.number_of_pages)
    
    for (var i = 1; i <= pdf.pdfInfo.numPages; i++) {
        pdf.getPage(i).then(function (page) {
            console.log('getting pdf page '+i)
            var viewport = page.getViewport(scale);
            //console.log('viewport is '+JSON.stringify(viewport))
            var canvas = document.createElement('canvas');
            document.getElementById('canvasDiv').parentNode.prepend(canvas);

            canvas.className = 'pdf-canvas';
            canvas.height = viewport.height;
            canvas.width = viewport.width;
  
            let context = canvas.getContext('2d');
            
            let c = document.getElementById('c');
            let uc = document.getElementsByClassName('upper-canvas')[0];                
            c.style.height = viewport.height;
            uc.style.height = viewport.height;                

            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.then(function () {
                pdf_pages = document.getElementsByClassName('pdf-canvas');
                
                for (let i = 0; i < pdf_pages.length; i++) {
                //  $('.pdf-canvas').each(function (index, el) {
                    let idy = 'page-' + (i + 1) + '-canvas';
                    pdf_pages[i]['id'] = idy
                //});
                }
                inst.pages_rendered++;
                console.log('pages rendered = ')
                console.log(inst.pages_rendered)
                if (inst.pages_rendered == inst.number_of_pages) {
                    console.log('rendered your pdf!')
                    return 'pdfLoaded'
                }
            });
        });
      }
    })

} // end loadPDF()

function loadSVG(svgStr,url,pointer,origin,canvas) {
    var group = [];
    let loadedObjects;
    fabric.loadSVGFromString(svgStr, function(objects, options) {
        // Group elements to fabric.PathGroup (more than 1 elements) or
            // to fabric.Path
            loadedObjects = new fabric.Group(group);
            loadedObjects.set({
               left: pointer.x -20, 
                top: pointer.y-100,
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
    if (origin == 'math' && ungrouped) {
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
/*
 this code would load a bitmap image to the canvas
    // console.log('event: ', e);
    var ext = currentlyDragging.src.substr(-3);
    if (ext === 'svg') {
      fabric.loadSVGFromURL(currentlyDragging.src, function(objects, options) {
        var svg = fabric.util.groupSVGElements(objects, options);
        svg.left = e.layerX;
        svg.top = e.layerY;
        canvas.add(svg); 
      });
    } else {
       var newImage = new fabric.Image(currentlyDragging, {
          width: currentlyDragging.width,
          height: currentlyDragging.height,
          // Set the center of the new object based on the event coordinates relative
          // to the canvas container.
          left: e.layerX,
          top: e.layerY
      });
      canvas.add(newImage);
    }
    return false;


*/
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
            var typedarray = event.target.result //new Uint8Array(event.target.result);
            loadPDF(typedarray, canvas, 'file');
        }
        
        reader.readAsText(fileinput.files[0]);
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
        reader.readAsArrayBuffer(event.target.files[0]);     
    }
    else if (url.includes('.svg')) {
        reader.readAsText(event.target.files[0]);
    }
    else {
        reader.readAsDataURL(event.target.files[0]);
    }
};


export { fetchText, imageSearch, uploadImage, loadSVG, loadPDF }
