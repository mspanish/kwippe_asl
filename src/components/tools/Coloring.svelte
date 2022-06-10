<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
import { sample } from '../../scripts/utilities.js';
import { hexToRgb } from '../../scripts/colorConverters.js';
import { colorIsLight } from '../../scripts/colorHelpers.js';
import { getColorFromMode } from '../../scripts/coloring.js';
//import { addColorify } from '../../scripts/colorify';

import { fillCol, outlineCol, drawType, currentPalette, settings } from '../../store.js';

import { titleCase } from '../../scripts/utilities.js';

export let canvas;
let prevCols = $currentPalette;

$: { 
    if ($currentPalette != prevCols)  {
        colorizeObjects(canvas, $settings.coloringMode);
    }
}
$settings.selectedFilter = 'invert';
/* this should ONLY be briefly be activated for a color picker from image tool! way too costly to have on all the time, makes a pixel scan happen on selected object every time it's touched  */

$settings.getColorActive = true;

  var canvas2dBackend = new fabric.Canvas2dFilterBackend()

  fabric.filterBackend = canvas2dBackend;

let f = fabric.Image.filters;

const filters = ['grayscale', 'invert', 'remove-color', 'sepia', 'brownie',
                      'brightness', 'contrast', 'saturation', 'noise', 'vintage',
                      'pixelate', 'blur', 'sharpen', 'emboss', 'technicolor',
                      'polaroid', 'blend-color', 'gamma', 'kodachrome',
                      'blackwhite', 'blend-image', 'hue', 'resize'];

let blendModes = ['add', 'diff', 'subtract', 'multiply', 'screen', 'darken', 'overlay', 'exclusion', 'tint'];

let modes = [
			{name: 'single', checked: ''},
			{name: 'stepped', checked: 'stepped'},
			{name: 'stepped_reverse', checked: ''},
			{name: 'random', checked: ''}			
		];
		
onMount(() => {
   // addColorify();

  //  fabric.Image.filters.Colorify = //fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  
  /*

    fabric.Image.filters.Colorify = fabric.util.createClass({
        threshold: 5,
        type: 'Colorify',
        isNeutralState: () => false,
        applyTo: function(canvasEl) {
        console.log('canvasEl is ')
        console.log(canvasEl)
        
        console.log('this is ')
        console.log(this)
        
        console.log('oldRed is '+this.oldRed)

        var context = canvasEl.ctx,
            imageData = canvasEl.imageData,//context.getImageData(0, 0, canvasEl.width, canvasEl.height),
            data = imageData.data;

            
            
            for (var i = 0; i < imageData.data.length; i += 4) {
                // is this pixel the old rgb?
                if (imageData.data[i] == this.oldRed && imageData.data[i + 1] == this.oldGreen && imageData.data[i + 2] == this.oldBlue) {
                    // change to your new rgb
                    console.log('new rgb')
                    imageData.data[i] = this.newRed;
                    imageData.data[i + 1] = this.newGreen;
                    imageData.data[i + 2] = this.newBlue;
                }
            } 
        var ctx = canvas.getContext(); 
        ctx.putImageData(imageData, 0, 0);
            var obj = canvas.getActiveObject();
                    var img1 = document.getElementById("image_replacer");
            img1.src = c.toDataURL('image/png');
            obj.setSrc(c.toDataURL('image/png'));
        }
    });

   fabric.Image.filters.Colorify.fromObject = function(object) {
   return new fabric.Image.filters.Colorify(object);
   };
         */
  

})


const colorizeObjects = (canvas, mode) => {
    
   console.log('type is '+mode)

    let i = 0;
    let reversePalette = [];
    for (let c of $currentPalette) {
        reversePalette.push(c)
    }
    reversePalette = reversePalette.reverse();
    
    canvas.getActiveObjects().map(item => {
        let color;
   
        if (i > $currentPalette.length-1) i = 0;

       color = getColorFromMode(mode, $settings.objectFill, $currentPalette, i);
       $settings.objectFill = color;

        if (item.fill && item.fill.colorStops) {
            console.log('got a gradient')
            item.fill.colorStops[1].color = color;
            $settings.gradientColor2 = color;
            return
        }        
        
        if (!item.shadow) {
            if (item.type == 'group') {
                console.log(item)
                    if (item._objects) {
                        item._objects.map(subitem => {
                            subitem.set('fill', color)
                        })
                    }
            }   
        console.log('changing color, type is ' +item.type)
        item.set('fill', color)            
        }


        if (['lineArrow', 'line', 'dottedline'].includes(item.type) ) {
            item.set('stroke', color)
        }
        if (item.shadow) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'stroke': color})
        }        
        
        if (['i-text'].includes(item.type)) {
            console.log(item)
            if (item.textBackgroundColor) {
                let rgb = hexToRgb(color.toString());
                let textContrast = colorIsLight(rgb) ? '#000000' : '#ffffff';
                item.set({'textBackgroundColor':color, 'fill': textContrast})
            }
            else {
                item.set({'fill': color})
            }
        }
        i++;
    });  
    canvas.renderAll();
}
		
const colorize = (e) => {
    let mode = e.target.id;
    $settings.coloringMode = mode;
    colorizeObjects(canvas, mode)
}
const setOpacity = () => {
    let input = document.getElementById('opacityChanger');
    let value = input.value;
    canvas.getActiveObjects().map(item => {
        item.set({'opacity': value});
    })
    canvas.requestRenderAll();
}

const filter = () => {
    let input = $settings.selectedFilter;
    
    input = titleCase(input);
    (input ==  'Blackwhite' ? input = 'BlackWhite': '' )

    
    console.log('going for a filter now ' +$settings.selectedFilter)    
    var obj = canvas.getActiveObject();
    obj.applyFilters([new f[input]()]);
    //canvas.applyFilters([new Xpro()]);
    canvas.renderAll();
}
const blend = () => {
    var obj = canvas.getActiveObject();
    //blendColor: '#ff0000',
   // blendMode: 'tint',
   // blendAlpha: .8,
    obj.applyFilters([new f.BlendColor({
      color: $settings.blendColor,
      mode: $settings.blendMode,
      alpha: $settings.blendAlpha
    })]);
    canvas.renderAll();
}


// so we need some kind of dropper here and when that is active the cursor becomes a dropper, and when they click on a color in the activeObject, it releases and shows the color, then uses that as the "replace this color" box

const hue = () => {
    var obj = canvas.getActiveObject();
    obj.applyFilters([new f.HueRotation({
        rotation:  2 * Math.random() - 1
    })]);
    canvas.renderAll();
}

const recolor = () => {
/*
    var obj = canvas.getActiveObject();
    var ctx = canvas.getContext();
        
    let x = 0;//obj.aCoords.bl.x;
    let y = 0;//obj.aCoords.bl.y;
    let w = canvas.width;
    let h = canvas.height;
    console.log('x y w h '+ x + ' '+ y + ' '+ w + ' '+ h)
    
    let imageData = ctx.getImageData(x, y, w, h);
   // canvas.discardActiveObject().renderAll();
    
    if (!$settings.blendColor) $settings.blendColor = $settings.fillColor;
    let rgb = hexToRgb($settings.blendColor);
    
    console.log('rgb is '+rgb);
    console.log('oldRed is '+$settings.currentRed);
    
    let oldRed = $settings.currentRed, oldBlue = $settings.currentBlue, oldGreen = $settings.currentGreen, newRed = rgb[0], newBlue = rgb[1], newGreen = rgb[2];
    for (var i = 0; i < imageData.data.length; i += 4) {
        // is this pixel the old rgb?
        if (imageData.data[i] == oldRed && imageData.data[i + 1] == oldGreen && imageData.data[i + 2] == oldBlue) {
            console.log(i+' loop')
            // change to your new rgb
            imageData.data[i] = newRed;
            imageData.data[i + 1] = newGreen;
            imageData.data[i + 2] = newBlue;
        }
    }
        setTimeout(() => {
            console.log('rendering with new color')
            ctx.putImageData(imageData, x, y);
            // put the re-colored image back on the image
            var img1 = document.getElementById("image_replacer");
            img1.src = c.toDataURL('image/png');
            obj.setSrc(c.toDataURL('image/png'));
            //addImage(img1)

        },5000)
*/
/*
    let rgb = hexToRgb($settings.blendColor);
    
    var obj = canvas.getActiveObject();
    obj.applyFilters([new f.Colorify({
      oldRed: $settings.currentRed,
      oldBlue: $settings.currentBlue,
      oldGreen: $settings.currentGreen,
      newRed: rgb[0],
      newBlue: rgb[1],
      newGreen: rgb[2]
    })]);
    canvas.renderAll();
  */  
    
/*
    canvas.getActiveObject().filters.push(new fabric.Image.filters.Colorify({
      oldRed: $settings.currentRed,
      oldBlue: $settings.currentBlue,
      oldGreen: $settings.currentGreen,
      newRed: rgb[0],
      newBlue: rgb[1],
      newGreen: rgb[2]
    }));
    canvas.getActiveObject().applyFilters(canvas.renderAll.bind(canvas));

    canvas.renderAll();
  */
}

// function addImage(imgLink) {
//     var obj = canvas.getActiveObject()
//     console.log(obj)
//     let x = obj.aCoords.bl.x;
//     let y = obj.aCoords.bl.y;
//     
//     let imagy = new fabric.Image(img, {
//         left: x,
//         top: y,
//         width: obj.width,
//         height: obj.height
//     });
//     canvas.add(imgy);
//     canvas.renderAll();
// }


</script>


<style>

</style>

<div style="margin-top:10px;">

    <span class="slideTitle">Objects Coloring Mode</span>

    <div class="section" id="objects_coloring_mode">  
            
        {#each modes as mode}
            <p>
                <input id="{mode.name}" checked="{mode.checked}" on:click="{colorize}" type="radio" name="mode" value="{mode.name}"  />
                <label for={mode.name}>{mode.name}</label>
            </p>
        {/each}
    
        <div id="opacityWrapper">
            <label for="opacityChanger">opacity:</label>
            <input id="opacityChanger" bind:value="{$settings.currentObjectOpacity}" step="0.1" type="range" min="0" max="1" on:change={setOpacity}>
        </div> 
        

            <div class="iconTool">
                <!-- div class="iconLabel">change hue</div>
                <div class="sprite brush righty"  on:click={recolor}></div>
                <br -->
                 <div class="iconLabel">pick filter</div>               
                <select bind:value={$settings.selectedFilter} on:change="{() => filter() }"  id="filter-select">
                    {#each filters as f, y}
                        <option on:change="{() => $settings.selectedFilter = this.value }" value={f}>{f}</option>
                    {/each}
                <select>
            </div>
  
 
            <div class="iconTool">
                <label>mode</label>
                    <select on:change={blend} bind:value={$settings.blendMode} id="blend-mode" name="blend-mode">
                    {#each blendModes as b}
                        <option on:change="{() => { $settings.blendMode = this.value }}" selected value="{b}">{b}</option>
                    {/each}
                    </select>
            </div>

            <label>color <input on:change="{recolor}" type="color" id="blend-color" bind:value="{$settings.blendColor}">
            </label>        

            <label>alpha <input  on:input="{blend}" type="range" id="blend-alpha" min="0" max="1" bind:value="{$settings.blendAlpha}" step="0.01">
            </label>
        
        <img id="image_replacer" />
                
        
    </div>
  
</div>
