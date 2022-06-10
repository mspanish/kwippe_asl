<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';

import { drawType, settings } from '../../store.js';
import { Toast, deleteAllToasts} from '../../scripts/toaster-js/index.js';   

export let canvas;
//let el = document.getElementById('canvasDiv')
let el = document.getElementById('canvasWrapper')
//let el = document.getElementById('c')
//let el = document.getElementsByClassName('c')[0]

/*
$: if ($settings.toastAction == 'deleteObjects') {
 
}
*/


const send = (e) => {
    let dir = e.target.id;
    console.log('dir is '+dir)
    var activeObject = canvas.getActiveObject();
    switch (dir) {
        case 'create':
			create();
        break;
    }
    canvas.discardActiveObject();
    canvas.renderAll();
} 

 
const create = () => {
	//console.log('our pattern spacingX is '+$settings.patternSpacingX);
 // fabric.loadSVGFromURL('http://localhost:8888/img/colors.svg', function(objects, options) {
    //var obj = fabric.util.groupSVGElements(objects, options);
    var selection = new fabric.Group();
    selection.set({'isPattern': true})
 
    let obj = canvas.getActiveObject();
    canvas.discardActiveObject()

    if (!obj) {
		let str = 'Please select something for your pattern!';

			new Toast(str, 'modal','error', 0,[
				{text:'ok', action:'ok'}
			]); 
		return
    }
    // load shapes
    for (var i = 1; i < ($settings.patternRows +1); i++) {
      for (var j = 1; j < ($settings.patternCols +1); j++) {

        obj.clone(function(i, j) {
          return function(clone) {
            clone.set({
              left: i * ( (clone.width * clone.scaleY ) + $settings.patternSpacingX),
              top: j * ( (clone.height * clone.scaleY) + $settings.patternSpacingY),
             // evented: true,
              inPattern: true
            });
           // console.log(clone)
           //canvas.add(clone)
            selection.addWithUpdate(clone)

          };
        }(i, j));
      }
    }

    selection.setCoords()
    canvas.add(selection)
    selection.set({top:0,left:0})

    setTimeout(() => {

        canvas.requestRenderAll();
    
    },100)

}


</script>


<style>
.iconLabel {
    font-size: .8rem;
}
.iconTool {
    display: inline-block;
    width: 30%;
}
.iconTool:hover {
    background: #f8fab2;
    box-shadow: 0px 0px 1px #988585;
}
label {
    margin-top:20px;
    margin-bottom: 10px;
}
.info {
    margin-left: 0 !important;
    margin-right: 20px !important;
}
</style>

<div class="bottomSlide">
    <span class="slideTitle">Pattern Tool</span>
            
    <div class="section" id="pattern_tool">  

        <div class="iconTool">
            <div  class="sprite pattern" id="create"  on:click={send}></div>
        </div>
        <button style="display: inline-block; vertical-align: bottom;;" id="create" class="pure-button pure-button-primary" on:click="{send}">create pattern</button>

    <label for="spacingX">spacing x</label>
        <span class="info">{$settings.patternSpacingX}</span>
        <input type="range" bind:value={$settings.patternSpacingX} min="0" max="200" id="spacingX"><br>	
        
    <label for="spacingY">spacing y</label>
        <span class="info">{$settings.patternSpacingY}</span>
        <input type="range" bind:value={$settings.patternSpacingY} min="0" max="200" id="spacingY"><br>	
        
    <label for="rows">rows</label>
        <span class="info">{$settings.patternRows}</span>
        <input type="range" bind:value={$settings.patternRows} min="1" max="20" id="rows"><br>	
        
    <label for="cols">columns</label>
        <span class="info">{$settings.patternCols}</span>
        <input type="range" bind:value={$settings.patternCols} min="1" max="20" id="cols"><br>	    
        
    </div>
</div>
