<script>
import { onMount } from 'svelte';
import { fabric } from "fabric";
import { fetchText } from '../scripts/image.js';
import { getLatex } from '../scripts/mml_to_latex.js';

import { settings } from '../store.js';
import MathJaxEditorKeyboard from '../scripts/MathJaxEditorKeyboard.js'; 

let mathjaxReady = false;
let mounted = false;
let mathimageLoaded = false;
let currentlyDragging;

let keyboardReady = false;
let mounted2 = false;
let image;
let begun = false;

const begin = () => {

      setTimeout(()=>{
    console.log('running begin for math keyboard')
    const editor = new MathJaxEditorKeyboard('#myEditor', {
        allowNewlines: true
    }) 
    setTimeout(()=>{
        let ip = document.getElementsByClassName('mathjax-editor-input')[0];
        ip.focus();
    },200)
    let mathboard = document.getElementsByClassName('mathboard')[0];
    let equationEditor = document.getElementById('MathJax-Element-1');
    let hidden = document.getElementById('hidden')
    let mathimg = document.getElementById('mathimage');
    mathboard.addEventListener('mouseleave', function() {
        //el = document.getElementById('equationEd')
        if (!equationEditor) return
        let mathml = equationEditor.innerHTML;
        //console.log('mathml is '+mathml)

        hidden.innerHTML = mathml;
        let latexOutput = getLatex();  
        if (latexOutput.length > 0) {
            console.log('LATEX >> ' +latexOutput)
            let url = `https://math.now.sh/?from=${latexOutput}`;
            mathimg.src = url;

            setTimeout(()=> {
                mathimageLoaded = true;
            },300)
        }
	})
    },500)
    //},1000)
}

onMount(()=>{

	mounted = true;
	mounted2 = true;
    begin();


    image = document.getElementById('mathimage')
    image.addEventListener('dragstart', handleDragStart, false);
    image.addEventListener('dragend', handleDragEnd, false);
    // Bind the event listeners for the canvas
    var canvasContainer = document.getElementsByClassName('canvas-container')[0];
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);

   
});  // end onMount()

function handleDragStart(e) {

    image.classList.remove('img_dragging');
   
    image.classList.add('img_dragging');
    currentlyDragging = e.target;
    e.dataTransfer.setData('text/plain', currentlyDragging.src);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDragEnd(e) {

}

function handleDrop(e) {
    if (e.preventDefault) {
      e.preventDefault(); 
    }
    
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    var pointer = {x: e.clientX, y: e.clientY}
    console.log('equation dropping, pointer is '+JSON.stringify(pointer))
    fetchText(currentlyDragging.src, pointer,'math',canvas,$settings)

 return
 
}

  //  if (Modernizr.draganddrop) {
        // Browser supports HTML5 DnD.

        // Bind the event listeners for the image elements

   // } else {
        // Replace with a fallback to a library solution.
   //     alert("This browser doesn't support the HTML5 Drag and Drop API.");
   // }
        
    
/*
      on:load={mathjaxLoaded} src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="equation-editor.css">
    
*/
</script>

<style>
:global(.dragMsg) {
    margin-top: 280px;
    padding-top: 20p;
    text-align: center;
    color: #8c002c;
}
:global(.dragImg) {
    height: 120px !important;
    width: 100%;
    padding-top: 15px;
}
:global(.mathboard) {
  /*  position: absolute !important;
    top: 50px !important;*/
}
:global(.mathboard-icon-enter) {
    display: none;
    pointer-events:none;
}
:global(annotation) {
}
:global(.mathjax-editor-display) {
    font-size: 40px;
}
:global(button.mathboard-key) {
    height: 50px !important;
    width: 50px !important;
    font-size: 24px !important;
}
:global(.mathjax-editor-input) {
    left: -200% !important;
    top: -200% !important;
}
:global(.mathboard-keyboard) {
    margin-top:20px;
    position: absolute;
    left: 0px;
    margin-left: 0;
}
:global(.slideWrapper > textarea) {

    visibility: hidden;
    height: 0;
}
:global('.hideme') {
    visibility: hidden;
}
.slideWrapper {
    height: 2500px;
    overflow-y: scroll;
    font-size: 26px;
}
.CtxtMenu_MenuFrame {
/* display:none !important;*/
}
.equation-editor-toolbar {
    margin-top:20px !important;
}
#structureEd {
    margin-left: 34px;
}
#upperTools {

}
#upperTools > div {
    display: inline-block;
}
button {
    padding: 0; 
    border: 0;
    width: 40px !important;
    height: 40px !important;
    border-width: 0;
    line-height: 2;
    font-size: .6rem !important;
    margin: 1px;
}
#upperTools > div > button, #mainSymbols > button {
    width: 40px;
    height: 40px;
    border-width: 0;
    line-height: 3;
    font-size: .6rem;
    margin: 1px;
}
.toolbarBtn {
    font-size: .8rem !important;
    line-height: 1 !important;
}
.export{
    margin-top:20px;
}
#latexO, #mathO {
    margin-top:20px;
    background-color: #e0f4fb;
    border-radius: 10px;
    padding: 15px;
}
.hiddenImg {
	height: 80px;
    border: solid 2px black;
    border-style: dashed;
    border-radius: 10px;
    padding-top: 20px;
    padding-bottom: 20px;  
    background-color: #ebd2dd75;
}

    .mathjax-editor-display {
      border: 1px solid #ccc;
    }
    
    .mathjax-editor-display.is-focused {
      border-color: #007fff;
    }
/*type="text/javascript" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js*/
#myEditor {
    visibility: hidden;
}
.imageZone {
    bottom: 0;
    position: absolute;
}
</style>

<svelte:head>

   <!-- script type='text/x-mathjax-config'>
    MathJax.Hub.Config({
      showMathMenu: false,
      messageStyle: 'none',
      ignoreClass: "button"
    });
  </script>

    <script on:load={mathjaxLoaded}  type="text/javascript"
    src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"  crossorigin="anonymous"></script>
    <script on:load={keyboardLoaded} src="js/MathJaxEditorKeyboard.js"></script-->

</svelte:head>

<div style="margin-top:10px;">

    <span class="slideTitle">Equation Editor</span>
        
    <div class="section" id="equation_editor"> 
            
        <textarea id="myEditor"></textarea>

        <div class="imageZone">
            {#if mathimageLoaded}
                <div class="dragMsg">
                Drag your equation to insert
                    <img alt="drag your equation to the canvas on the left to insert" class="dragImg" src="images/drag2.svg" />
                </div>
            {/if}

            <img draggable="true" id="mathimage" class="hiddenImg {mathimageLoaded ? '' : 'hideme'}" />

            <div id="hidden"></div>
        </div>
    </div>
</div>
