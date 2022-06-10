<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
import { settings } from '../../store.js';
import { titleCase } from '../../scripts/utilities.js';
import { hexToRgb } from '../../scripts/colorConverters.js';

export let canvas;

fabric.Object.prototype.transparentCorners = false;

$: if ($settings.penFill) {
    updateMode()
}

onMount(() => {

    canvas.on('path:created', function(opt) {
    //opt.path.globalCompositeOperation = 'xor';
        canvas.renderAll();
    });

    /*
    var img = new Image();
    img.src = 'images/honey_im_subtle.png';

    var texturePatternBrush = new fabric.PatternBrush(canvas);
        texturePatternBrush.source = img;
    */    
}) // end onMount()
/*
const updateDrawingShadowOffset = () => {

    canvas.freeDrawingBrush.shadow.offsetX = parseInt($settings.drawingShadowOffsetX, 10) || 0;
    canvas.freeDrawingBrush.shadow.offsetY = parseInt($settings.drawingShadowOffsetY, 10) || 0;
 
    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = parseInt($settings.drawingBrushWidth, 10) || 1;
        canvas.freeDrawingBrush.shadow = new fabric.Shadow({
            blur: parseInt($settings.drawingShadowWidth, 10) || 0,
            offsetX: 0,
            offsetY: 0,
            affectStroke: true,
            color: $settings.penFill,
        });
    }
}
*/
const getPenColor = () => {
    let penColor = $settings.penFill;
    if ($settings.penFill.includes('#')) {
        let rgb = hexToRgb($settings.penFill);
        penColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${$settings.penOpacity})`
       // console.log('rgb is '+penColor)
    }
    return penColor;
} 
const createDiamondBrush = () => {

    let penColor = getPenColor();
    var diamondPatternBrush = new fabric.PatternBrush(canvas);
    diamondPatternBrush.getPatternSrc = function() {

        var squareWidth = 10, squareDistance = 5;
        var patternCanvas = fabric.document.createElement('canvas');
        var rect = new fabric.Rect({
            width: squareWidth,
            height: squareWidth,
            angle: 45,
            fill: penColor,
        });

        var canvasWidth = rect.getBoundingRect().width;

        patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
        rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

        var ctx = patternCanvas.getContext('2d');
        rect.render(ctx);

        return patternCanvas;
    };
    return diamondPatternBrush;
}


const createHlineBrush = () => {
    let penColor = getPenColor();
    var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = penColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    };
    return hLinePatternBrush;
}

const createSquareBrush = () => {
    let penColor = getPenColor();
    var squarePatternBrush = new fabric.PatternBrush(canvas);
    squarePatternBrush.getPatternSrc = function() {

        var squareWidth = 10, squareDistance = 2;

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
        var ctx = patternCanvas.getContext('2d');

        ctx.fillStyle = penColor;
        ctx.fillRect(0, 0, squareWidth, squareWidth);

        return patternCanvas;
    };
    return squarePatternBrush;
}


const createVlineBrush = () => {}
    let penColor = getPenColor();
    //if (fabric.PatternBrush) {
        var vLinePatternBrush = new fabric.PatternBrush(canvas);
        vLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = penColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    //};
    return vLinePatternBrush
}

const updateMode = () => {
    let penColor = getPenColor();
    if ($settings.drawingBrush === 'hline') {
        canvas.freeDrawingBrush = createHlineBrush();
    }
    else if ($settings.drawingBrush === 'vline') {
        canvas.freeDrawingBrush == createVlineBrush();
    }
    else if ($settings.drawingBrush === 'square') {
        canvas.freeDrawingBrush = createSquareBrush()
    }
    else if ($settings.drawingBrush === 'diamond') {
        canvas.freeDrawingBrush = createDiamondBrush();
    }
    /*
    else if (this.value === 'texture') {
        canvas.freeDrawingBrush = texturePatternBrush;
    }
    */
    else {
        canvas.freeDrawingBrush = new fabric[titleCase($settings.drawingBrush) + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
    
        var brush = canvas.freeDrawingBrush;
        brush.color = penColor;
        if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
        }
        canvas.freeDrawingBrush.width = parseInt($settings.drawingBrushWidth, 10) || 1;
        canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: parseInt($settings.drawingShadowWidth, 10) || 0,
            offsetX: 0,
            offsetY: 0,
            affectStroke: true,
            color: $settings.penShadow
        });
    }
}
const updateShadowObjects = () => {
    canvas.getActiveObjects().map(item => {
       // console.log(item)
        if (item.shadow) {
            let obj = item.shadow;
            obj.color = $settings.penShadow;
            console.log('obj w/ new color is now '+JSON.stringify(obj))
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set(obj)
        }    
    })

    canvas.renderAll();
}
/* this doesn't work - you'd have to actually redraw the whole thing, too much work for now 
const updateShadowWidthObjects = () => {
    canvas.getActiveObjects().map(item => {
        console.log(item)
        let w = item.width;
        if (item.shadow) {
            let obj = item.shadow;
            obj.width = $settings.drawingShadowWidth;
            console.log('obj is now '+JSON.stringify(obj))
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set(obj)
        }    
        item.set({'width': w})
    })

    canvas.renderAll();
}
*/
const updateColorObjects = () => {
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item.strokeLineCap) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'stroke': $settings.penFill})
        }    
    })
    canvas.renderAll();
}


const updateOpacityObjects = () => {
    let penColor = getPenColor();
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item.strokeLineCap) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'stroke': penColor})
        }    
    })
    canvas.renderAll();
}



</script>
<style>

#drawing-mode-options {
  display: inline-block;
  vertical-align: top;
  margin-bottom: 10px;
  margin-top: 10px;
  background: #f5f2f0;
  padding: 10px;
}
label {
  display: inline-block; width: 130px;
}

[type="color"] {
    padding: 0;
    vertical-align: top;
}
/*         
<option>texture</option>
*/
</style>

<div>
    <span  class="slideTitle">Drawing Settings</span>
            
    <div class="section" id="drawing_settings">

        <div>
            <label for="drawing-mode-selector">mode</label>
            <select bind:value={$settings.drawingBrush} id="drawing-mode-selector" on:change="{updateMode}">
            
            <option>pencil</option>
            <option>circle</option>
            <option>spray</option>
            <option>pattern</option>
            <option>hline</option>
            <option>vline</option>
            <option>square</option>
            <option>diamond</option>
            
            
            </select><br>

            <div>line width<span class="info">{$settings.drawingBrushWidth}</span></div>

            <input type="range" bind:value={$settings.drawingBrushWidth} min="0" max="150" id="drawing-line-width"><br>

            <div>line color</div>
            <input type="color" on:input="{updateColorObjects}" bind:value="{$settings.penFill}" id="drawing-color"><br>

            <div>shadow color</div>
            <input type="color"  on:input="{updateShadowObjects}" bind:value="{$settings.penShadow}" id="drawing-shadow-color"><br>

            <div>shadow width            <span class="info">{$settings.drawingShadowWidth}</span></div>

            <input type="range" bind:value={$settings.drawingShadowWidth} min="0" max="50" id="drawing-shadow-width"><br>

            
            <div>opacity<span class="info">{$settings.penOpacity}</span> </div>
           
            <input  on:change="{updateOpacityObjects}" type="range" min=".05" step=".05" max="1.0" bind:value="{$settings.penOpacity}" id="drawing-shadow-opacity"><br>

            
        <!--
            <div for="drawing-shadow-offset">Shadow offset:</div>
            <span class="info">{$settings.drawingShadowOffsetX}</span>
            <input type="range" bind:value={$settings.drawingShadowOffsetX} on:change="{updateDrawingShadowOffset}" min="0" max="50" id="drawing-shadow-offset"><br>
            
            <div for="drawing-shadow-offset-y">Shadow offset:</div>
            <span class="info">{$settings.drawingShadowOffsetY}</span>
            <input type="range" bind:value={$settings.drawingShadowOffsetY} on:change="{updateDrawingShadowOffset}" min="0" max="50" id="drawing-shadow-offset-y"><br>       
    -->        
        </div>
    </div>
</div>
