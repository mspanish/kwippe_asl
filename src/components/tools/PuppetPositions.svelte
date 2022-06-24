<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';
import { aslObj, drawType, settings, currentPalette } from '../../store.js';
import { titleCase, sample } from '../../scripts/utilities.js';
import { hexToRgb } from '../../scripts/colorConverters.js';
import { resetPuppet, rotateArm, rotateElbow, rotateHand, flipHand, resetHand, mirror } from '../../scripts/puppet_movement.js';

export let canvas;

fabric.Object.prototype.transparentCorners = false;
/*
$: if ($settings.penFill) {

}
*/


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

    <span  class="slideTitle">Hand</span>
        
    <div class="section">   
    </div>

    <span  class="slideTitle">Lower Arm</span>
        
    <div class="section">   
        <div class="pure-menu pure-menu-horizontal">
            <ul class="pure-menu-list"> 

                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite rotateleft" style="opacity:.75"  id="rotate_elbow_left" on:click={() => rotateElbow("left", false, false, $aslObj)}  ></div>
                        <div class="iconLabel">left</div>
                    </div>       
                </li>
                
                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite rotateright" style="opacity:.75"  id="rotate_elbow_right" on:click={() => rotateElbow("right", false, false, $aslObj)}  ></div>
                        <div class="iconLabel">right</div>
                    </div>       
                </li>
            
                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite reset" style="opacity:.75"   on:click={() => rotateElbow("reset", false, false, $aslObj)}  ></div>
                        <div class="iconLabel">reset</div>
                    </div>       
                </li>   
                
                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite mirror lower" style="opacity:.75"  on:click={() => mirror(false, $aslObj)}  ></div>
                        <div class="iconLabel">mirror</div>
                    </div>       
                </li>

            </ul>
        </div>
    </div>  
    
    <span  class="slideTitle">Upper Arm</span>
        
    <div class="section" >   
        <div class="pure-menu pure-menu-horizontal">
            <ul class="pure-menu-list"> 
                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite rotateleft" style="opacity:.75"  id="rotate_arm_left" on:click={() => rotateArm("left", false, false, $aslObj)}  ></div>
                        <div class="iconLabel">left</div>
                    </div>       
                </li>

                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite rotateright" style="opacity:.75"  id="rotate_arm_right" on:click={() => rotateArm("right", false, false, $aslObj)}  ></div>
                        <div class="iconLabel">right</div>
                    </div>       
                </li>

                

                <li class="pure-menu-item">
                    <div class="iconTool">
                        <div class="sprite reset" style="opacity:.75"  id="reset_arm" on:click={() => rotateArm("reset", false, false, $aslObj)}  ></div>
                        <div class="iconLabel">reset</div>
                    </div>       
                </li>               
            </ul>
        </div>
    </div>     
</div>
