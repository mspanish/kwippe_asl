<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
import { drawType, settings, currentPalette } from '../../store.js';
import { titleCase, sample } from '../../scripts/utilities.js';
import { hexToRgb } from '../../scripts/colorConverters.js';

export let canvas;

fabric.Object.prototype.transparentCorners = false;
/*
$: if ($settings.penFill) {

}
*/
onMount(() => {
let items = canvas.getActiveObjects();
    
    if (items.length == 1) {
        if (!items[0].fill) return
        let color = items[0].fill;

        $settings.objectFill = color;
    }


})
const updateRadius = () => {
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item && item.hasOwnProperty('rx') ) {         
            item.set({'rx': $settings.objectRadius, 'ry': $settings.objectRadius,})
        }    
    })
    canvas.renderAll();
}

const updateStroke = () => {
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'stroke': $settings.objectStroke})
        }    
    })
    canvas.renderAll();
}

const updateStrokeWidth = () => {
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'strokeWidth': $settings.objectStrokeWidth})
        }    
        console.log('objectStrokeWidth is now '+$settings.objectStrokeWidth)
    })
    canvas.renderAll();
    // you'll have to set this value from SELECTED item otherwise it will be wrong
}
const updateOpacity = () => {
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'opacity': $settings.currentObjectOpacity})
        }    
    })
    canvas.renderAll();
}
const recolorSelectedObjects = () => {
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
        if (item.fill) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'fill': $settings.objectFill})
        }    
    })
    canvas.renderAll();

}
const randomizeColor = () => {
    $settings.objectFill = sample($currentPalette);
    recolorSelectedObjects();
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
.info {
    margin-left: 0 !important;
    margin-right: 20px !important;
}
</style>

<div style="margin-top:10px;">

    <span  class="slideTitle">Shape Settings</span>
        
    <div class="section" id="shape_settings">  
 
        <label for="drawing-color">color</label>
        <input type="color" on:input={recolorSelectedObjects}  bind:value="{$settings.objectFill}" id="drawing-color"><br>

        {#if $settings.selectedHasRadius || $drawType == 'rectangle'}
            <label for="drawing-shadow-width">radius</label>
            <span class="info">{$settings.objectRadius}</span>
            <input type="range"  on:change={updateRadius}  bind:value={$settings.objectRadius} min="0" max="200" id="drawing-shadow-width"><br>	
        {/if}
        
        <label for="drawing-shadow-color">stroke color</label>
        <input type="color" on:input={updateStroke}  bind:value="{$settings.objectStroke}" id="drawing-shadow-color"><br>        

        <label for="drawing-shadow-width">stroke width</label>
        <span class="info">{$settings.objectStrokeWidth}</span>
        <input type="range"  on:change={updateStrokeWidth}  bind:value={$settings.objectStrokeWidth} min="0" max="200" id="drawing-shadow-width"><br>
        
        <label for="drawing-shadow-opacity">opacity</label>
        <span class="info">{$settings.currentObjectOpacity}</span>
        <input  on:change={updateOpacity}  type="range" min=".05" step=".05" max="1.0" bind:value="{$settings.currentObjectOpacity}" id="drawing-shadow-opacity"><br>
    </div>
</div>
