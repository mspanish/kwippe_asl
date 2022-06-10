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

    <span  class="slideTitle">Controls</span>
        
    <div class="section" id="upper_arm">   
    </div>

   
</div>
