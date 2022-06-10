<script>
import { fabric } from "fabric";
import { settings } from '../../store.js';
import { onMount } from 'svelte';

export let canvas;


/* Do some initializing stuff
fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: 'rgba(102,153,255,0.5)',
    cornerSize: 12,
    padding: 5
});
*/
onMount(() => {
// look for selected objects, if only 1, set that as our base color
   let items = canvas.getActiveObjects();
    
    if (items.length == 1) {
        if (!items[0].fill) return
        let color = items[0].fill;
        if (items[0].fill.colorStops) color = items[0].fill.colorStops[1].color;

        $settings.gradientColor2 = color;
    }

})


const setBackgroundImage = () => {
 
}

const setBackgroundColor = () => {
    if (canvas.backgroundColor instanceof fabric.Pattern) {
        canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
    }
    else {
        canvas.setBackgroundColor({source: 'http://fabricjs.com/assets/escheresque_ste.png'}, canvas.renderAll.bind(canvas));        
    }
}

const setGradient = () => {
    if ($settings.gradientTarget == 'canvas') {
        setBackgroundGradient(canvas)
    }
    else {
        setGradientObjects()
    }
}

const setGradientObjects = () => {
    let items = canvas.getActiveObjects();
    
    console.log('lenny of selected items is '+items.length);
    
    for (let i = 0; i < items.length; i++) {
        let grad = setBackgroundGradient(items[i])
        if (items[i].fill && !items[i].fill.stopColors) {
            let prevColor = items[i].fill;
            items[i].set({'fill': grad, 'prevColor': prevColor }); 
        }
        else {
            items[i].set({'fill': grad });
        }
    }
    canvas.renderAll();
}

const removeGradient = () => {
    
    let type = $settings.gradientTarget;
    let el;
    if (type == 'canvas') {
        console.log('removing gradient from canvas')
        canvas.setBackgroundColor(null);
    }
    else {
        console.log('removing gradient from objects')
        canvas.getActiveObjects().map(item => {
            let color = $settings.gradientColor2;
            if (item.fill && item.fill.colorStops) {
                color = item.fill.colorStops[1].color;
            }
            if (item.prevColor) color = item.prevColor;
            if (item.fill && item.fill.colorStops) {
                item.set({'fill': color});
            }
        })
    }
    canvas.renderAll();
}

const setBackgroundGradient= (el) => {
//http://jsfiddle.net/21sLk84f/
    let colorStops; 
    let angle = $settings.linearAngle;
    let color1 = $settings.gradientColor1;
    let color2 = $settings.gradientColor2;

    const shapeColorStops = {};
    var anglePI = (-parseInt(angle, 10)) * (Math.PI / 180);
    if (!el) el =  canvas;
    
    let coords;
    let size = {width: el.width, height: el.height}
    let num = size.height/2;
    let radius = num + size.width/4;

    
    if ($settings.gradient == 'radial') {
        color1 = $settings.gradientColor2;
        color2 = $settings.gradientColor1;
        console.log('trying to set radial gradient, size is '+JSON.stringify(size))
       // the numbers for my canvas are  width="1920" height="1080"
        coords = {
        r1: radius + $settings.gradientRadiusInner,
        r2: size.width *.01 + $settings.gradientRadius,
       
        x1: size.width/2,
        y1: size.height/2, 
        
        x2: size.width/2,
        y2: size.height/2,
        }
    }
    else {
        console.log('trying to set linear gradient')
        coords = {
            x1: (Math.round(50 + Math.sin(anglePI) * 50) * el.width) / 100,
            y1: (Math.round(50 + Math.cos(anglePI) * 50) * el.height) / 100,
            x2: (Math.round(50 + Math.sin(anglePI + Math.PI) * 50) * el.width) / 100,
            y2: (Math.round(50 + Math.cos(anglePI + Math.PI) * 50) * el.height) / 100,
        }
    }

    
    var grad = new fabric.Gradient({
        type:  $settings.gradient,
        coords: coords,
        colorStops: [
        {
            color: color1,
            offset: 0,
        },
        {    

            color: color2,
            offset: 1,
        }
        ]});
    if (el == canvas) {
        canvas.setBackgroundColor(grad);
    }
    else {
        return grad
    }
    canvas.renderAll();
}

const gradientUpdate = (e) => {
    let type = e.target.value;
    $settings.gradient = type;
    console.log('updating gradient to '+type);
    setGradient();
}

const gradientTargetUpdate = (e) => {
    let type = e.target.value;
    $settings.gradientTarget = type;
    console.log('updating gradientTarget to '+type);
    setGradient();
}

</script>

<style>
[type="color"] {
    height: 30px;
    padding: 0;
    vertical-align: top;
}
#gradientsWrapper {
    padding: 20px;
}
</style>

<div class="gradientsWrapper">
   
    <div>gradient colors:
        <p>
            <span>color 1</span>
            <input bind:value={$settings.gradientColor1} on:input="{setGradient}" type="color">
        </p>  
        <p>
            <span>color 2</span>
            <input bind:value={$settings.gradientColor2} on:input="{setGradient}" type="color">
        </p>  

    </div>

    <hr>

    <div> where to apply:
        <p>
            <input name="gradient_target" type="radio" on:input="{gradientTargetUpdate}" value="canvas" checked="{$settings.gradientTarget == 'canvas' ? 'checked' : ''}" id="choose_canvas">
            <label for="choose_canvas">canvas background</label>
        </p>    
            
        <p>
            <input name="gradient_target" type="radio" on:input="{gradientTargetUpdate}" value="objects" checked="{$settings.gradientTarget == 'objects' ? 'checked' : ''}"  id="choose_objects">
            <label for="choose_objects">selected object(s)</label>
        </p>
    </div>

    <hr>
    
    <div> Type of gradient:
        <p>
            <input  name="gradient_type" type="radio" on:input="{gradientUpdate}" value="radial" checked="{$settings.gradient == 'radial' ? 'checked' : ''}" id="choose_radial">
            <label  for="choose_radial">radial</label>
        </p>    
            
        <p>
            <input  name="gradient_type" type="radio" on:input="{gradientUpdate}" value="linear" checked="{$settings.gradient == 'linear' ? 'checked' : ''}"  id="choose_linear">
            <label for="choose_linear">linear</label>
        </p>
    </div>

    
    {#if $settings.gradient == 'linear'} 
        <div> set angle manually
            <p>
                <input id="linear_angle" bind:value={$settings.linearAngle} step="10" min="-180" max="180" type="range" on:input="{setGradient}">
                <label  for="linear_angle">angle</label>
            </p>    

        </div>

        or pick a direction:
         <p>
            <input name="gradient_dir" type="radio" on:input="{setGradient}" value="up" checked="{$settings.gradientDirection == 'up' ? 'checked' : ''}" id="up">
            <label for="up">up</label>
        </p>    
         <p>
            <input name="gradient_dir" type="radio" on:input="{setGradient}" value="down" checked="{$settings.gradientDirection == 'down' ? 'checked' : ''}" id="down">
            <label for="down">down</label>
        </p>  
         <p>
            <input name="gradient_dir" type="radio" on:input="{setGradient}" value="left" checked="{$settings.gradientDirection == 'left' ? 'checked' : ''}" id="left">
            <label for="left">left</label>
        </p>          
         <p>
            <input name="gradient_dir" type="radio" on:input="{setGradient}" value="right" checked="{$settings.gradientDirection == 'right' ? 'checked' : ''}" id="right">
            <label for="right">right</label>
        </p>          
    {/if}

    {#if $settings.gradient == 'radial'} 
        <div> 
            <p>
                <input id="radius" bind:value={$settings.gradientRadius} step="1" min="0" max="500" type="range" on:input="{setGradient}">
                <label  for="radius">outer radius</label>
            </p>    

            <p>
                <input id="radius" bind:value={$settings.gradientRadiusInner} step="1" min="0" max="1000" type="range" on:input="{setGradient}">
                <label  for="radius">inner radius</label>
            </p>    

        </div>    
    {/if}

    <hr>
    
    <button class="pure-button pure-button-primary" on:click="{setGradient}">set gradient</button>

    <button class="pure-button pure-button-danger" on:click="{removeGradient}">remove gradient</button>

</div>
