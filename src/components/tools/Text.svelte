<script>
import { fabric } from "fabric";
import { onMount } from 'svelte';

import { drawType, settings, onscreen } from '../../store.js';

export let canvas;

let coolfonts = ['kg_chasing_carsregular','janda_manatee_solidregular','janda_manatee_bubbleregular','kg_defying_gravityregular','kg_second_chances_solidRg','kg_second_chances_sketchRg','kg_summer_sunshine_shadowRg','kg_summer_sunshine_blackoutRg','kg_summer_sunshineregular','kg_red_handsregular','kg_red_hands_outlineregular','Arial','Helvetica','MyriadPro','Verdana','Georgia','Courier']

let textOutlineBackgroundColor = 'rgba(250, 250, 250, 0)';
let textBackgroundColor = 'rgba(250, 250, 250, 0)';
 

var main = function(id){return document.getElementById(id)};

onMount(() => {
    setTextTools()

    fabric.Object.prototype.padding = 5;
    
    var $ = function(id){return document.getElementById(id)};
    //setPickrs()
}) // end onMount()

const toggleFontList = () => {
	console.log('toggling fonts list');
	if ($onscreen.fontsList) {
		$onscreen.fontsList = false;
	}
	else {
		$onscreen.fontsList = true;	
	}
	//console.log('toggling $onscreen.palettesList, should be '+$onscreen.palettesList);
}
const palettesFocusOn = () => {
	//console.log('toggleForPalettes adding keydown !');
	//document.addEventListener("keydown", listKeyDown)
}

const palettesFocusOff = () => {
	//console.log('OFF toggleForPalettes');
	//document.removeEventListener("keydown", listKeyDown);
}
const changeFont = (e) => {
    let font = e.target.getAttribute('data-font');
    console.log('font family change, value is '+font)
    updateTextSetting({'fontFamily': font})
    $settings.fontFamily = font;
    $onscreen.fontsList = false;
}
const updateTextSetting = (obj) => {

    canvas.getActiveObjects().map(item => {
        //console.log(item)  
        if (['i-text'].includes(item.type)) {
            item.set(obj);        
        }
        if (item && item._objects) {
            for (var i = 0; i < item._objects.length; i++) {
                console.log(item._objects[i])
                // only apply to TEXT objects, other things can have unpredictable result like Rects - which all need their own panel
                if (['i-text'].includes(item.type)) {
                    item._objects[i].set(obj);
                }
            }
        }          
        //canvas.renderAll()
        canvas.requestRenderAll();
    });
}

const align = (e) => {
    let align = e.target.id;
    updateTextSetting({'textAlign': align, 'originX': 'center'});
    $settings.textAlign = align;
}

const style = (e) => {
    let style = e.target.id;
    let items = canvas.getActiveObjects();
    let item;
    if (items && items.length == 1) {
        item = items[0]
    }
    else {
        item = {
            fontWeight: $settings.fontWeight,
            fontStyle: $settings.fontStyle,
            underline: $settings.underline,
            overline: $settings.overline,
            linethrough: $settings.linethrough
        };
    }
    
    switch (style) {
        case 'bold':
            if (item.fontWeight) style = '';
            $settings.fontWeight = style;
            updateTextSetting({'fontWeight': style})
        break;
        case 'italic':
            if (item.fontStyle) style = '';
            $settings.fontStyle = style;        
            updateTextSetting({"fontStyle": style})        
        break;            
        case 'underline':
            style = true;
            if (item.underline) style =  '';
            $settings.underline = style;        
            updateTextSetting({"underline": style });
        break;
        case 'overline':
            style = true;
            if (item.overline) style = '';
            $settings.overline = style;          
            updateTextSetting({"overline": style });
        break;
        case 'linethrough':
            style = true;
            if (item.linethrough) style = '';
            $settings.linethrough = style;         
            updateTextSetting({"linethrough": style });
        break;
    }
}


function setTextTools() { 

    document.getElementById('text-stroke-width').onchange = function() {
        updateTextSetting({'strokeWidth': this.value})
        $settings.strokeWidth = this.value;
    };				

    //document.getElementById('font-family').onchange = function() {
   
  //  };
    
    document.getElementById('text-font-size').onchange = function() {
            updateTextSetting({'fontSize': this.value})
            $settings.fontSize = this.value;
    };
    
	document.getElementById('rounded-rect-radius').onchange = function() {
            updateTextSetting({'rx': this.value, 'ry': this.value})
    };
    document.getElementById('rounded-rect-height').onchange = function() {
            updateTextSetting({'yPadding': this.value})
    };
    document.getElementById('rounded-rect-width').onchange = function() {
            updateTextSetting({'xPadding': this.value})
    };    
    
    document.getElementById('text-line-height').onchange = function() {
            updateTextSetting({'lineHeight': this.value})
            $settings.lineHeight = this.value;
    };
    document.getElementById('text-char-spacing').onchange = function() {
            updateTextSetting({'charSpacing': this.value})
            $settings.letterSpacing = this.value;
    };    
}

const setTextFill = () => {
    let color = $settings.textFill;
    updateTextSetting({'fill': color})
}

const setTextStroke = () => {
    let color = $settings.textStroke;
    updateTextSetting({'stroke': color})
}

const setTextBackgroundRect = () => {
    let input = document.getElementById('backgroundRect');
    let color = input.value;
    updateTextSetting({'textBackgroundColor': color, 'origX': 'center'})    
}
const removeTextBackgroundRect = () => {
    updateTextSetting({'textBackgroundColor': null})    
}

const clickRectColor = () => {
    let input = document.getElementById('backgroundRect');
    input.click();
}

</script>

<style>
hr {
	margin: 15px;
}
input {
    padding:0;
}

#drawing-mode {
  margin-bottom: 10px;
  vertical-align: top;
}
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

#bd-wrapper {
  min-width: 1500px;
}
.box {
  float: left;
  margin: 1em;
}
.after-box {
  clear: left;
}

#fontList {
    cursor:pointer;
/*    transform: translateY(50%);
    position:absolute;*/

}
#fontList > li > span {
    background-color: #eee;
    text-decoration: none;
}
#fontList > li > span:hover {
    opacity:.6;
}
a {
    text-decoration: none;
}
.pure-menu-children {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    padding-top: 20px;
    margin-left: 0;
    left: 0;
    top: 50px;
}
.pure-menu-item {
    clear:both;
}
.chooseFont {
    font-size: 1.5rem;
    padding: .2em .4em;
    border: none transparent;
    background-color: rgb(97, 103, 108) !important;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
    margin-left: -5px;
    margin-bottom: 10px;
}
.iconTool {
    display: inline-block;
    margin-right: 20px;
    text-align: center;
    width: 18%;
}
.sprite {
    transform: scale(.75);
}
.styleLabel {
    display: none;
}
.styleIcon {
    width: 12%;
}
.sprite.active {
   background-color: #d1cfc8;
   pointer-events: all !important;
}
.iconTool.active {
   background-color: #d1cfc8;
   pointer-events: all !important;
}

.sub {
    display: inline-block;
    width: 40%;
}
.subtitle {
    font-size: 1rem !important;
    margin-bottom: 0px;
}
.firstsub {
    margin-left: 10px;
    margin-top: 20px;
}
.styleBar {
    margin-left: -20px
}
.strokeSub {
    margin-bottom: -10px;
    margin-top: 10px;
}
.strokeMe {
    font-size: 1.5rem;
    font-weight: bold;
}
.leftIcon {
    width: 20%;
    display: inline-block;
}
.rightIcon {
    width: 70%;
    display: inline-block;
}
.iconTool:hover {
    background: #f8fab2;
    box-shadow: 0px 0px 1px #988585;
}

</style>
<div style="margin-top:10px;" class="bottomSlide">

     <span class="slideTitle">Text Style</span>
     
     <div class="section" id="text_style">  
     
        <div class="styleBar">
            <div class="iconTool styleIcon ">
                <div class="sprite bold {$settings.fontWeight == 'bold' ? 'active' : ''}" id="bold" on:click="{style}"></div>
                <div class="iconLabel styleLabel">bold</div>
            </div>     
            <div class="iconTool styleIcon ">
                <div class="sprite italic {$settings.fontStyle == 'italic' ? 'active' : ''}" id="italic" on:click="{style}"></div>
                <div class="iconLabel styleLabel">italic</div>
            </div>     
            <div class="iconTool styleIcon ">     
                <div class="sprite underline {$settings.underline ? 'active' : ''}" id="underline" on:click="{style}"></div>
                <div class="iconLabel styleLabel">underline</div>
            </div>   
            <div class="iconTool styleIcon">
                <div class="sprite overline {$settings.overline ? 'active' : ''}" id="overline" on:click="{style}"></div>
                <div class="iconLabel styleLabel">overline</div>
            </div>     
            <div class="iconTool styleIcon">
                <div class="sprite strikethrough {$settings.linethrough ? 'active' : ''}" id="linethrough" on:click="{style}"></div>
                <div class="iconLabel styleLabel">linethrough</div>
            </div>     
        </div>
    
        <ul id="fontList" class="pure-menu-list">
            <li  on:mouseenter={palettesFocusOn} on:mouseleave={palettesFocusOff} id="paletteM" class="pure-menu-item pure-menu-has-children">
                <span style="font-family: {$settings.fontFamily || 'arial'}" on:click={toggleFontList} class="pure-menu-link chooseFont pure-button-primary">pick font</span>
                
                {#if $onscreen.fontsList}
                <ul id="fontsList" class="pure-menu-children wrap">
                                {#each coolfonts as font}
                    <li class="pure-menu-item block">
                        <div class="pHolder">
                            <a class="pure-menu-link"> 
            
                                <div on:click="{changeFont}" data-font="{font}" style="-moz-font-family: {font}; font-family:{font};font-size: 1.4rem">{font.replace('kg_', '').replace('summer', '').replace('_solid','').replace('regular', '').replace('Regular', ' ').replace('Rg','').replace(/_/g,' ')}</div>

                            </a>
                        </div>
                    </li>
                    {/each}      
                </ul>
                {/if}
            </li>
        </ul>   
    

        <div class="sub firstsub">
            <div>color</div>
            <input bind:value={$settings.textFill} on:input="{setTextFill}" id="pickr1" type="color" data-type="fill">
        </div>
        
        <div class="sub">
            <div>size<span class="info">{$settings.fontSize}</span></div>
            <input type="range" bind:value={$settings.fontSize} min="1" max="300" step="1" id="text-font-size">
        </div>
    
        <div class="subtitle strokeSub"><span class="strokeMe" style="-webkit-text-stroke: {$settings.strokeWidth}px {$settings.textStroke}; font-family: {$settings.fontFamily || 'arial'}; color: {$settings.textFill}">Stroke</span></div>
        
        <div class="sub firstsub">
            <div>color</div>
            <input id="pickr4" bind:value={$settings.textStroke} on:input="{setTextStroke}" type="color" data-type="stroke">
        </div>
        <div class="sub">
            <div>width<span class="info">{$settings.strokeWidth}</span></div>
            <input type="range" value="1" min="0" max="20" id="text-stroke-width">
        </div>
    </div>
    
    <br>

    <span class="slideTitle">Alignment/Spacing</span>
    
    <div class="section" id="text_align">  
    
        <div class="iconTool {$settings.textAlign == 'left' ? 'active' : ''}">
                <div class="sprite TextLeftJustify" id="left" on:click="{align}"></div>
            <div class="iconLabel">left</div>
        </div>  

        <div class="iconTool {$settings.textAlign == 'center' ? 'active' : ''}">
            <div class="sprite TextCenter" id="center" on:click="{align}"></div>
            <div class="iconLabel">center</div>
        </div>  
                
        
        <div class="iconTool {$settings.textAlign == 'right' ? 'active' : ''}">
            <div class="sprite TextRightJustify" id="right" on:click="{align}"></div>
            <div class="iconLabel">right</div>
        </div>  
        
        <div class="iconTool {$settings.textAlign == 'justify' ? 'active' : ''}">
            <div class="sprite TextJustify" id="justify" on:click="{align}"></div>
            <div class="iconLabel">justify</div>
        </div>      
            
    
        <br>
        <br>
                
        <div>
            <div class="iconTool leftIcon">
                <div class="sprite TextLineHeight"></div>
            </div>  
            <div class="rightIcon">
                <div class="iconLabel" style="margin-bottom: 15px;">line height</div>
                <span class="info" style="margin-right: 10px; margin-left: 0">{$settings.lineHeight}</span>
                <input type="range"  bind:value={$settings.lineHeight} min="0" max="10" step="0.1" id="text-line-height">
            </div>
        </div>
        
        <br>
        
        <div>
            <div class="iconTool leftIcon">
                <div class="sprite letterspacing"></div>
            </div>  
            <div class="rightIcon">
                <div class="iconLabel" style="margin-bottom: 15px;">letter spacing</div>
                <span class="info" style="margin-right: 10px; margin-left: 0">{$settings.lineHeight}</span>
                <input type="range"  bind:value={$settings.letterSpacing} min="-200" max="800" step="10" id="text-char-spacing" bind-value-to="charSpacing">
            </div>
        </div>

    </div>
    
    <br>
     
    <span class="slideTitle">Add Background</span>  

    <div class="section" id="add_background">  
        
        <div>
            <div class="iconTool leftIcon" on:click="{clickRectColor}">
                <div class="sprite rect_add"></div>
            </div>  
            <div class="rightIcon">
                <div class="iconLabel" style="margin-bottom: 15px;">color</div>
            <input id="backgroundRect" on:input="{setTextBackgroundRect}"  type="color" data-type="textBackgroundColor">
            </div>
        </div>   
        
        
        <div on:click={removeTextBackgroundRect} style="margin-bottom: 25px;">
            <div class="iconTool leftIcon">
                <div class="sprite rect_remove"></div>
            </div>  
            <div class="rightIcon" style="transform: translateY(-100%)">
                <div class="iconLabel">remove bg</div>
            </div>
        </div>         

        <div>                   
            <label for="rounded-rect-radius">radius</label>
            <input type="range" step="1" value="10" min="1" max="120" id="rounded-rect-radius">
        </div>
        <div>                   
            <label for="rounded-rect-width">width</label>
            <input type="range" step=".02" value="1.15" min="1" max="5" id="rounded-rect-width">
        </div>
        <div>       
            <label for="rounded-rect-height">height</label>
            <input type="range" step=".02" value="1.9" min="1.5" max="5" id="rounded-rect-height">
        </div>
    </div>
</div>
