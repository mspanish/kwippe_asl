<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';

import { onscreen, drawType, settings } from '../../store.js';
import { copy, paste } from '../../scripts/copypaste.js';
import { Toast, deleteAllToasts} from '../../scripts/toaster-js/index.js';   

export let canvas;

$: if ($settings.toastAction == 'deleteObjects') {
    console.log('got toastAction '+$settings.toastAction)
    deleteObjects();
    $settings.toastAction = null;
}

const deleteLayerPopup = () => {
	/* you pass the fn to the Buttons.svelte component */
	
	let str = 'delete this object(s)?';
	new Toast(str, 'modal','warning',0,[
		{text:'cancel',action:'cancel'},
		{text: 'delete',action:'deleteObjects'}
	]); 
}

const setObjectsLock = (type) => {
    canvas.getActiveObjects().map(item => {
        if (type == 'lock') {
            item.set({'lockMovementX': true, 'lockMovementY': true });
            
            window.alert('this object will be unmovable unless you unlock it!')
        }
        else {
            item.set({'lockMovementX': false, 'lockMovementY': false });        
        }
    })
    canvas.renderAll();
}


const send = (e) => {
    let dir = e.target.id;
    console.log('dir is '+dir)
    var activeObject = canvas.getActiveObject();
    switch (dir) {
        case 'backwards':
            if (activeObject) {
            canvas.sendBackwards(activeObject);
            }        
        break;
        
        case 'back':
            if (activeObject) {
            canvas.sendToBack(activeObject);
            }        
        break;
        
        case 'forward':
            if (activeObject) {
            canvas.bringForward(activeObject);
            }        
        break;
        
        case 'front':
            if (activeObject) {
            canvas.bringToFront(activeObject);
            }       
        break;
        case 'lock':
            setObjectsLock('lock');
        break;
        case 'unlock':
            setObjectsLock('unlock');
        break;
        case 'duplicate':
            duplicate()
        break;
        case 'delete':
        //TODO: needs warning!
            deleteLayerPopup() 
            return;
        break;
    }
    canvas.discardActiveObject();
    canvas.renderAll();
} 
const deleteObjects = () => {
    var activeObjects = canvas.getActiveObjects();
    canvas.discardActiveObject()
    if (activeObjects.length) {
      canvas.remove.apply(canvas, activeObjects);
    }
    //canvas.renderAll();
    deleteAllToasts();
    
}
const duplicate = () => {
    copy(canvas)
    paste(canvas)
}

const makeGroup = () => {
    if (!canvas.getActiveObject()) {
          return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
        return;
    }
    canvas.getActiveObject().toGroup();
    canvas.requestRenderAll();
    $onscreen.breakGroup = true;
    $onscreen.makeGroup = false;
}

const breakGroup = () => {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'group') {
        return;
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
    $onscreen.breakGroup = false;
    $onscreen.makeGroup = true;
}

</script>


<style>
.iconLabel {
    font-size: .8rem;
}
.iconTool {
    display: inline-block;
    margin-right: 20px;
    text-align: center;
    width: 40%;
}
.iconTool:hover {
    background: #f8fab2;
    box-shadow: 0px 0px 1px #988585;
}

</style>
<div style="margin-top:10px;">

    <span class="slideTitle">Manage Objects</span>
        
    <div class="section" id="manage_objects">  
            
        <div>
            <div class="iconTool">
                <div class="sprite move_backward"  id="backwards" on:click="{send}"></div>
                <div class="iconLabel">move backwards</div>
            </div>  
        
            <div class="iconTool">
                <div class="sprite move_to_back"  id="back" on:click="{send}"></div>
                <div class="iconLabel">move to back</div>
            </div>   

        </div>
        <div style="margin-top:4px;">
            <div class="iconTool">
                <div class="sprite move_forward" id="forward" on:click="{send}"></div>
                <div class="iconLabel">move forward</div>
            </div>  
        
            <div class="iconTool">
                <div class="sprite move_to_front"  id="front" on:click="{send}"></div>
                <div class="iconLabel">move to front</div>
            </div>  

        </div>

        <div style="margin-top:4px;">
            <div class="iconTool">
                <div class="sprite lock" id="lock" on:click="{send}"></div>
                <div class="iconLabel">lock movement</div>
            </div>  
            
            <div class="iconTool">
                <div class="sprite unlock" id="unlock" on:click="{send}"></div>
                <div class="iconLabel">unlock movement</div>
            </div>      

        </div>

        <div style="margin-top:4px;">
            <div class="iconTool">
                <div class="sprite object_copy" id="duplicate" on:click="{send}"></div>
                <div class="iconLabel">duplicate object</div>
            </div>  
            
            <div class="iconTool">
                <div class="sprite no" id="delete" on:click="{send}"></div>
                <div class="iconLabel">delete object</div>
            </div>  
        </div>
    <br>
    <div>    
        {#if $onscreen.breakGroup}
        
            <div class="iconTool">
                <div class="sprite Ungroup" on:click="{breakGroup}"></div>
                <div class="iconLabel">ungroup</div>
            </div>  
        
        {/if}
        {#if $onscreen.makeGroup}
            <div class="iconTool">
                <div class="sprite Group" on:click="{makeGroup}"></div>
                <div class="iconLabel">group</div>
            </div>  
        {/if}       
    </div>    
        
    </div>
    
</div>
