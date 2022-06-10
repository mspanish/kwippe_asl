<script>
import { fabric } from "fabric";

async function fetchText(url,pointer) {
    const req = await fetch('/.netlify/functions/getsvg', {
    method:'POST',
    body: JSON.stringify({url: url})
    })
    const res = await req.text()
    //console.log('our svg is '+res)
    loadSVG(res,url,pointer,'math')
}
function loadSVG(svgStr,url,pointer,origin) {
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
            }
            else {
                object.set('svgType','import');                
            }
            object.set('sourcePath',url);
            object.set('fill', $fillCol || '#000000');
            group.push(object);
        });
    
    // this is what you'd do to add svg items UNGROUPED, which is probably not a good default for our purposes - although it would allow the user to adjust elements quickly, so maybe you let that be a user setting...
    if (origin == 'math' && $settings.equationsUngrouped) {
        group = loadedObjects;
        var items = group._objects;
        group._restoreObjectsState();
        canvas.remove(group);
        for (var i = 0; i < items.length; i++) {
            canvas.add(items[i]);
        }
        canvas.renderAll();
    }

/*
        var loadedObject = fabric.util.groupSVGElements(objects, options);
        // Set sourcePath
        //console.log('our loadedObject svg type (group or path) is  '+loadedObject.type)
        loadedObject.set('svgType','equation');
        loadedObject.set('sourcePath',url);
        canvas.add(loadedObject);
        if (loadedObject && loadedObject._objects) {
            for (var i = 0; i < loadedObject._objects.length; i++) {
                loadedObject._objects[i].set({
                    fill: $fillCol || '#000000'
                });
            }
        }
        loadedObject.set({left: pointer.x -20, top: pointer.y-100})
        loadedObject.scaleToHeight(300) // Scales it down to some small size
        //.center() // Centers it (no s**t, Sherlock)
        .setCoords();

        canvas.setActiveObject(loadedObject).renderAll();

        console.log(loadedObject);
 });
        */
   
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

</script>
