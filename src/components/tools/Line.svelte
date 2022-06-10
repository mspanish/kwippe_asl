<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
import { settings, currentPalette } from '../../store.js';
import { titleCase, sample } from '../../scripts/utilities.js';
import { hexToRgb } from '../../scripts/colorConverters.js';

export let canvas;
let linetypes = ['solid', 'dashed']; //'dotted'

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
const lineDash = () => {
    canvas.getActiveObjects().map(item => {
        item.set({'strokeDashArray': [$settings.lineDash1, $settings.lineDash2] });
    })
    canvas.renderAll();
}

const lineUpdate = (e) => {
	$settings.lineType = e.target.value;
	//console.log('updating line to '+$settings.lineType);
    canvas.getActiveObjects().map(item => {
      //  console.log(item)
	  switch ($settings.lineType) {
		case 'solid':
			item.set({'strokeDashArray': [0,0] });
		break;
		
		case 'dashed':
			item.set({'strokeDashArray': [$settings.lineDash1, $settings.lineDash2] });   
		break;
/*		
		case 'dotted':
			item.set({'strokeDashArray': [$settings.lineStrokeWidth, $settings.lineStrokeWidth/6], 'cornerStyle': 'circle'  });  
		break;*/
	  
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
            item.set({'strokeWidth': $settings.lineStrokeWidth})
        }    
     //   console.log('objectStrokeWidth is now '+$settings.lineStrokeWidth)
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
        if (item.stroke) {
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'stroke': $settings.lineStroke})
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
.inline {
	display: inline-block;
}
</style>

 <div style="margin-top:10px;">

 <span class="slideTitle">Line Settings</span>
        
    <div class="section" id="line_settings" >  
    
        <p>type of line</p>
            {#each linetypes as type}
                <p>
                    <input name="line_type" type="radio" on:change="{lineUpdate}" value="{type}" checked="{$settings.lineType == type ? 'checked' : ''}" id="choose_{type}">
                    <label  for="choose_{type}">{type}</label>
                </p>    
            {/each}	
        {#if $settings.lineType == 'dashed'}
        
            <label for="dash1">dash width</label>
            <span class="info">{$settings.lineDash1}</span>
            <input type="range"  on:change={lineDash}  bind:value={$settings.lineDash1} min="0" max="100" id="dash1"><br>
    
            <label for="dash2">dash spacing</label>
            <span class="info">{$settings.lineDash2}</span>
            <input type="range"  on:change={lineDash}  bind:value={$settings.lineDash2} min="0" max="100" id="dash2"><br>  

        {/if}
            
        <div>line color</div>
        <input type="color" on:input={recolorSelectedObjects}  bind:value="{$settings.lineStroke}" id="drawing-color"><br>

        <span class="info">{$settings.lineStrokeWidth}</span>
        <div>line width</div>
        <input type="range"  on:change={updateStrokeWidth}  bind:value={$settings.lineStrokeWidth} min="0" max="200" id="drawing-shadow-width"><br>
        

        <span class="info">{$settings.currentObjectOpacity}</span>        
        <div>opacity</div>
        <input  on:change={updateOpacity}  type="range" min=".05" step=".05" max="1.0" bind:value="{$settings.currentObjectOpacity}" id="drawing-shadow-opacity"><br>
    </div>

</div>
