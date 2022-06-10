<script>

import { tooltipOffset, user, drawType, onscreen, settings, currentPalette } from '../store.js';
import { onMount, onDestroy } from 'svelte';
import { fabric } from "fabric";

//import { setBackgroundColor, setBackgroundImage, setBackgroundGradient } from '../scripts/background.js';
//mport { fetchText, imageSearch, uploadImage, loadPDF } from '../scripts/image.js';
import { jsonToFabric } from '../scripts/importer.js';
import { sample, getFromLocalStorage, saveToLocalStorage } from '../scripts/utilities.js';
import { hexToRgb, rgbToHex } from '../scripts/colorConverters.js';
import { colorIsLight } from '../scripts/colorHelpers.js';
import { getColorFromMode } from '../scripts/coloring.js';
import { copy, paste } from '../scripts/copypaste.js';


import ZIndex from '../components/tools/ZIndex.svelte';
import SymbolViewer from '../components/tools/SymbolViewer.svelte';
import Import from '../components/Import.svelte';
import PuppetPositions from '../components/tools/PuppetPositions.svelte';
import PuppetDesign from '../components/tools/PuppetDesign.svelte';
import NavbarPuppet from '../components/NavbarPuppet.svelte';
import NavbarSubPuppet from '../components/NavbarSubPuppet.svelte';
import Coloring from '../components/tools/Coloring.svelte';
import TextTools from '../components/tools/Text.svelte';
import DrawingTools from '../components/tools/Drawing.svelte';
import Objects from '../components/tools/Objects.svelte';
import Pattern from '../components/tools/Pattern.svelte';
import Line from '../components/tools/Line.svelte';
import Hamburger from '../components/Hamburger.svelte';
//import EquationEditor from '../components/EquationEditor.svelte';
import Navbar from '../components/Navbar.svelte';
import Gradient from '../components/tools/Gradient.svelte';
import Palettes from '../components/Palettes.svelte';
import KwippeLoader from '../components/KwippeLoader.svelte';

$drawType = 'text';
$onscreen.palettes = true;
$onscreen.palettesList = false;
$onscreen.showColors = true;
$onscreen.slideMenu = 'text';
$onscreen.mainNav = false;



let open = false;
let bgColor = '#E5E4E5';
$: { 
    if (['pen','select', 'text', 'math'].includes($drawType) ) {
        open = true;
    }
}

let mounted = false;

var mouseFrom = {x: 0, y: 0},
mouseTo = {x: 10, y: 10},
canvasObjectIndex = 0,
textbox = null,
origX, origY;


var line, isDown,mode;
mode = 'draw';
let lastSelection;

let canvas, opts;
var modifySize = 15, modifySmallSize = 10; 
var scale = 1.5;
var drawWidth = 0; 
var color = "#000000";
let outlineColor = 'rgba(202, 0, 69, 0.95)';
//"rgba(161, 112, 112, 0.23)"; 
var drawingObject = null; 
var moveCount = 1; 
var doDrawing = false; 
var theActiveObject = false; 

let tools = ['text', 'textbox', 'pen', 'select', 'graphics', 'import', 'right', 'wrong',  'arrow', 'speechbubble', 'asl', 'puppet', 'math', 'line','circle','ellipse','rectangle','equilateral','rightangle','clear']

let tooltipT = {
    gradient: 'add a gradient color to a shape or background',
    text: 'add text that you can style and position',
    textbox: 'add text that will wrap to the width of the box',
    pen: 'pencil, pen, and brush drawing',
    select: 'select objects to edit',
    graphics: 'search for fun and colorful graphics to add',
    import: 'import an image or PDF',
    right: 'checkmarks and other positive feedback',
    wrong: 'x marks and other negative feedback',
    arrow: 'insert arrows',
    speechbubble: 'add speech bubbles',
    puppet: 'ASL Puppet with over 2000 words',
    asl: 'American Sign Language alphabet',
    math: 'add math equation',
    line: 'add dashed and solid lines',
    circle: 'add a circle',
    ellipse: 'add an ellipse',
    rectangle: 'add a rectangle',
    equilateral: 'add a triangle',
    rightangle: 'add a right angle',
    clear: 'clear all drawings, graphics, and text'
}
onMount(() => {
	mounted = true;
	initFabric();
	//console.log('production check: '+__myapp.env.ROOT_URL)
    console.log('adding puppet')
	//$settings.rootURL = __myapp.env.ROOT_URL;
    //setMenu();
   // setPickrs();
    $onscreen.importImage = true;
        // set an initial color for our colorboxes
});

onDestroy(()=> {
    $onscreen.mainNav = true;
})

const initFabric = () => {
 
    canvas = new fabric.Canvas("c", {
    isDrawingMode: true,
    preserveObjectStacking:true, // since I had to turn off the opacity thing, this is best left true - having an opacity on selection messes up the idea of altering opacity as you can't tell what you are setting. Ideally the opacity thing would only be in play when 2 objects intersect
    //perPixelTargetFind : true,
    //targetFindTolerance: 4,
    //skipTargetFind: true,
    // selectable: true,
    // selection: true
    });
//     canvas.setWidth(1920);
//     canvas.setHeight(1080);
//     canvas.renderAll();
 
    canvas.selectionColor = "rgba(0,0,0,0.05)"
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    
//per https://stackoverflow.com/questions/56793737/fabricjs-canvas-memory-use-exceeds-the-maximum-limit-in-ipad
    fabric.Object.prototype.objectCaching = false;
    
    window.canvas = canvas;
    window.zoom = window.zoom ? window.zoom : 1;

    canvas.freeDrawingBrush.color = outlineColor; 
    canvas.freeDrawingBrush.width = drawWidth;
    
	// this isn't a good default it messes up PDFs
	
  //  let data = getFromLocalStorage('canvas')
   // jsonToFabric(canvas,data);
    


    canvas.on('mouse:down', function(o){
        isDown = true;
        if (['circle', 'rectangle', 'equilateral', 'ellipse'].includes($drawType)) {
            let col = $settings.objectFill;
            $settings.objectFill = getColorFromMode($settings.coloringMode,col,$currentPalette, $settings.coloringIndex)
            // $settings.objectFill = sample($currentPalette);
            console.log('switched objectFill to '+$settings.objectFill)
            $settings.coloringIndex++;
            $settings.activeColor = $settings.objectFill;
            let lenny = $currentPalette.length - 1;

            if ($settings.coloringIndex > lenny) {
                $settings.coloringIndex = 0;
            }
            console.log('coloringIndex is '+$settings.coloringIndex)
        }
        let scrollY = window.scrollY;
        let scrollX = window.scrollX;
        let pointer = canvas.getPointer(o.e);
        pointer.x = pointer.x + scrollX;
        pointer.y = pointer.y + scrollY;
        
        let points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
        mouseTo = {x: pointer.x, y:pointer.y}
        origX = pointer.x;
        origY = pointer.y;
        
        if ($drawType == "pen") {
            canvas.isDrawingMode = true;
            return
        } 
        canvas.isDrawingMode = false;
    
    if (mode == "draw") {

        var canvasObject = null;      
        opts = {
            fill: color,
            stroke: $settings.objectStroke,
            strokeWidth: $settings.objectStrokeWidth,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            selectable: true,
            selected: false,
            targetFindTolerance: true          
        }    
        let checkOpts = {
            stroke: 'red',
            strokeWidth: drawWidth,
            fill: 'transparent'        
        }
        if (['line'].includes($drawType)) {
			opts.stroke = $settings.lineStroke;
            opts.strokeWidth = $settings.lineStrokeWidth;
			opts.strokeDashArray = getStrokeDashArray()
            canvasObject = new fabric.Line(points, opts);        
        }

        switch ($drawType) {
            case "pen":
                canvas.isDrawingMode = true;
                return
            break;   
            case "line2":
                canvasObject.strokeWidth = 5;
                /*
                this is how to do a pattern filled line, super cool 
                fabric.util.loadImage('http://fabricjs.com/assets/escheresque_ste.png', function (img) {
                
                    canvasObject.stroke = new fabric.Pattern({
                        source: img,
                        repeat: 'repeat'
                    });
                });                
                */
            break;

            case "textbox":

                  canvasObject = new fabric.Textbox("", {
                    left:  pointer.x,
                    top: pointer.y - 10,
                    fontSize: $settings.fontSize,
                    fontFamily: $settings.fontFamily || 'helvetica',
                    fill: $settings.textFill || '#000000',
                    fontWeight: $settings.fontWeight,
                    originX: 'center',
                    width: 300,
                    stroke: $settings.textStroke,
                    strokeWidth:  $settings.strokeWidth,
                    hasRotatingPoint: true,
                    centerTransform: true
                })

                canvas.add(canvasObject)
                canvas.setActiveObject(canvasObject);
                canvasObject.enterEditing();
                canvasObject.hiddenTextarea.focus();            
                return
            break;
            case "text":
                canvasObject = new fabric.IText("", {
                    left:  pointer.x,
                    top: pointer.y,//- 10,
                    width: 200,
                    fontFamily: $settings.fontFamily || 'helvetica',
                    fontSize: $settings.fontSize,
                    fontWeight: $settings.fontWeight,
                    padding: 10,
                    originX: 'left',
                    textAlign: 'center',
                    stroke: $settings.textStroke,
                    strokeWidth: $settings.strokeWidth,
                    fill: $settings.textFill || '#000000',
                    
                })
                canvas.add(canvasObject)
                //canvas.setActiveObject(canvasObject);
                canvasObject.enterEditing();
                canvasObject.hiddenTextarea.focus();  
                return
            break;
            case "arrow": 
                if ($onscreen.draggedGraphic) return;
                console.log('got arrow')
                opts.strokeWidth = 5;
                canvasObject = new fabric.LineArrow(points, opts);         
            break;    
            case "circle": 
                canvasObject = new fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    stroke: $settings.objectStroke,
                    strokeWidth: $settings.objectStrokeWidth,
                    fill: $settings.objectFill,
                    originX: "center",
                    originY: "center",        
                    radius: 1,
                });                
            break;  
            case "rectangle":
                canvasObject = new fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    originX: 'left',
                    originY: 'top',
                    stroke: $settings.objectStroke,
                    strokeWidth: $settings.objectStrokeWidth,                   
                    width: pointer.x - origX,
                    height: pointer.y - origY,
                    angle: 0,
                    rx: $settings.objectRadius, 
                    ry: $settings.objectRadius,
                    fill: $settings.objectFill,
                });
            break;
            case 'equilateral':
                let height = pointer.y - origY;
                canvasObject = new fabric.Triangle({
                top: pointer.y,
                left: pointer.x,
                width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
                height: height,
                stroke: $settings.objectStroke,
                strokeWidth: $settings.objectStrokeWidth,
                fill: $settings.objectFill,
            });            
            break;
            case 'rightangle':
                opts = {
                    stroke: $settings.objectStroke,
                    strokeWidth: $settings.objectStrokeWidth,
                    fill: $settings.objectFill,
                    left: origX,
                    top: origY,
                    width: pointer.x - origX,
                    height: pointer.y - origY,
                }
                canvasObject = new fabric.RectangleTriangle(opts);
            break;
            case 'ellipse':
                canvasObject = new fabric.Ellipse({
                    left: pointer.x,
                    top: pointer.y,
                    stroke: $settings.objectStroke,
                    strokeWidth: $settings.objectStrokeWidth,
                    fill: $settings.objectFill,
                    originX: 'center', 
                    originY: 'center',
                    rx: 5,
                    ry: 1
                });            
            break;
            case 'right': 
                if ($onscreen.draggedGraphic) return;            
                canvasObject = new fabric.IText("4", {
                    left:  pointer.x,
                    top: pointer.y - 10,
                    width: 40,
                    fontSize: 50,
                    padding: 10,
                    originX: 'left',
                    textAlign: 'center',
                    borderColor: outlineColor,
                    fill: 'green',
                    //stroke: 'green',
                    selected: false,
                    fontFamily: 'checks'
                })
                //canvasObject = new fabric.Path(path,checkOpts);
            break; 
            case 'wrong':
                if ($onscreen.draggedGraphic) return;            
                canvasObject = new fabric.IText("R", {
                    left:  pointer.x,
                    top: pointer.y - 10,
                    width: 40,
                    fontSize: 50,
                    padding: 10,
                    originX: 'left',
                    textAlign: 'center',
                    borderColor: outlineColor,
                    fill: 'red',
                    //stroke: 'green',
                    selected: false,
                    fontFamily: 'cross'
                })         
            break;
            } // end switch

            if (!['text', 'textbox'].includes($drawType) && canvasObject) canvas.add(canvasObject);

            drawingObject = canvasObject;
            

            
        } // end if mode is draw and not select
    });
    
    canvas.on('mouse:move', function(o){

    /*
    if ($drawType == 'text' && isDown) {
        console.log('mouseMOVE on TEXT')
        $drawType = 'select';
        //drawingObject.exitEditing();
        //drawingObject.set({'selected': true});
        let selectBtn = document.getElementById('selectBtn')
        resetTools(selectBtn)
    }
      */   
    
    if (!isDown) return;
    let pointer = canvas.getPointer(o.e);
    mouseTo = {x: pointer.x, y:pointer.y}
    var left = pointer.x, top = pointer.y;

    if ($drawType == "textbox" || $drawType == 'text') return

    if (mode == "draw") {
        if (['line', 'arrow'].includes($drawType)){
            drawingObject.set({ x2: pointer.x, y2: pointer.y });
            drawingObject.setCoords();       
        }
        switch($drawType) {
            case "circle":
                drawingObject.set({
                    radius: Math.abs(origX - pointer.x)
                });
            break;

            case "rectangle":
                if (origX > pointer.x) {
                    drawingObject.set({left: Math.abs(pointer.x)});
                }
                if (origY > pointer.y) {
                    drawingObject.set({top: Math.abs(pointer.y)});
                }
                drawingObject.set({width: Math.abs(origX - pointer.x)});
                drawingObject.set({height: Math.abs(origY - pointer.y)});          
            break;
            case 'equilateral':
                drawingObject.set({ 
                    width: Math.abs(pointer.x - origX),
                    height: Math.abs(pointer.y - origY)
                });
            break;
            case 'rightangle':
                if (origX > pointer.x) {
                    drawingObject.set({left: Math.abs(pointer.x)});
                }
                if (origY > pointer.y) {
                    drawingObject.set({top: Math.abs(pointer.y)});
                }
                drawingObject.set({width: Math.abs(origX - pointer.x)});
                drawingObject.set({height: Math.abs(origY - pointer.y)});       
            break;
            case 'ellipse':
                drawingObject.set({ rx: Math.abs(origX - pointer.x),ry:Math.abs(origY - pointer.y) });            
            break;
        
        } // end switch
        canvas.renderAll();

    
    } // end if draw mode and not select
    });

    canvas.on('mouse:up', function(o){
        isDown = false;
       // canvas.isDrawingMode = false;
        //canvas.freeDrawingBrush.onMouseUp();
    });
    

    function updateOpacity(obj,val) {
        let lenny = canvas.getObjects().length;
        if(obj && lenny > 1) {
            obj.set('opacity', val);
            canvas.requestRenderAll();
        }
    }
    
    canvas.on('selection:created', function (o) {
        processSelection(o,'created')
        //updateOpacity(o.target, 0.7);
        //updateOpacity(lastSelection, 1);
        lastSelection = o.target;      
    });
    
    canvas.on('selection:updated', function (o) {
        processSelection(o,'updated') 
        //updateOpacity(o.target, 0.7);
       // updateOpacity(lastSelection, 1);
        lastSelection = o.target;        
    });
    
    canvas.on('selection:cleared', function (o) {
       // mode = 'draw'
        console.log('there is a selection cleared >>')
        $onscreen.breakGroup = false;
        $onscreen.makeGroup = false;
        //updateOpacity(lastSelection, 1);
        lastSelection = o.target;       
    });

    const processSelection = (o,type) => {
		//console.log('$$$$$ processingSelection...')
        console.log(o)
        if ($settings.getColorActive) {
          //  getColor(o)
        }

        //open = true;
        mode = 'select'
        if ($drawType == 'gradient') {
            return
        }
		
		$drawType = 'select';

		$settings.selectedHasRadius = false;
        
        let selectBtn = document.getElementById('selectBtn')
        resetTools(selectBtn)
        
        
        console.log('there is a selection '+type)
        let items = canvas.getActiveObjects();
        
        console.log('lenny of selected items is '+items.length);
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type == 'group'){
                console.log('we have a group at '+i);
                $onscreen.breakGroup = true;
            }
			if (items[i].hasOwnProperty('rx')) {
				$settings.selectedHasRadius = true;
			}

        }
        if (items.length > 1) {
            console.log('selected items are GREATER than 1')
            $onscreen.makeGroup = true;
            $onscreen.slideMenu = 'zindex' 


           // $onscreen.showColors = false;
                   console.log('selection, slideMenu is now '+$onscreen.slideMenu)
        }
        else {
		
            $onscreen.showColors = true;
            
            //$onscreen.slideMenu = 'text'
            $settings.objectStrokeWidth = items[0].strokeWidth || 0;
            $settings.currentObjectOpacity = items[0].opacity;
            
            
            // update for text controls
            if (items[0].lineHeight) $settings.lineHeight = items[0].lineHeight;
            if (items[0].charSpacing) $settings.letterSpacing = items[0].charSpacing;    
            if (items[0].fontFamily) $settings.fontFamily = items[0].fontFamily;
            if (items[0].fontSize) $settings.fontSize = items[0].fontSize; 
            if (items[0].fontStyle) $settings.fontStyle = items[0].fontStyle;             
            if (items[0].fontWeight) $settings.fontWeight = items[0].fontWeight; 
            if (items[0].underline) $settings.underline = items[0].underline; 
            if (items[0].overline) $settings.overline = items[0].overline; 
            if (items[0].linethrough) $settings.linethrough = items[0].linethrough;             
            if (items[0].stroke) $settings.textStroke = items[0].stroke; 
            if (items[0].strokeWidth) $settings.strokeWidth = items[0].strokeWidth;             
            if (items[0].textAlign) $settings.textAlign = items[0].textAlign;
            
            
            console.log('currentObjectOpacity is '+items[0].opacity)           
            if ($drawType == 'pen') {
                $onscreen.slideMenu = 'pen';
            }
                    console.log('selection, slideMenu is now '+$onscreen.slideMenu)
            let type = o.selected.type;
            switch(type) {
                case 'text':
                    
                break;
                case 'svg':
                
                break;
                case 'shape':
                
                break;
            }
        }

    }

    var deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    var img = document.createElement('img');
    img.src = deleteIcon;
    
    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        var size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(img, -size/2, -size/2, size, size);
        ctx.restore();
    }
    
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = 'blue';
    fabric.Object.prototype.cornerStyle = 'circle';

    
    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: 16,
        cursorStyle: 'pointer',
        mouseUpHandler: deleteObject,
        onMousedown: deleteObject,
        render: renderIcon,
        cornerSize: 24
    });

    // Extended fabric line class
    fabric.LineArrow = fabric.util.createClass(fabric.Line, {

        type: 'lineArrow',

        initialize: function(element, options) {
            options || (options = {});
            this.callSuper('initialize', element, options);
        },

        toObject: function() {
            return fabric.util.object.extend(this.callSuper('toObject'));
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);

            // do not render if width/height are zeros or object is not visible
            if (this.width === 0 || this.height === 0 || !this.visible) return;

            ctx.save();

            var xDiff = this.x2 - this.x1;
            var yDiff = this.y2 - this.y1;
            var angle = Math.atan2(yDiff, xDiff);
            ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
            ctx.rotate(angle);
            ctx.beginPath();
            //move 10px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
            ctx.moveTo(10, 0);
            ctx.lineTo(-20, 15);
            ctx.lineTo(-20, -15);
            ctx.closePath();
            ctx.fillStyle = this.stroke;
            ctx.fill();
            ctx.restore();
        }
    });

    fabric.LineArrow.fromObject = function(object, callback) {
    callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
    };
    fabric.LineArrow.async = true;
    
    fabric.RectangleTriangle = fabric.util.createClass(fabric.Rect, {
    type: 'rectangleTriangle',
    _render: function(ctx) {
        var w = this.width,
        h = this.height,
        x = -this.width / 2,
        y = -this.height / 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y);
        ctx.closePath();
        this._renderPaintInOrder(ctx);
    }
    });
    fabric.RectangleTriangle.fromObject = function(object, callback) {
        return fabric.Object._fromObject('RectangleTriangle', object, callback);
    };

    setTimeout(function(){
        //console.log('running setTimeout')
        var container = document.getElementsByClassName('canvas-container')[0]
        container.style.position = 'unset';
    },300)  

    document.onkeydown = e => {
        let key = window.event.keyCode;
        if (e.keyCode == 46) {
            deleteObj();
            canvas.discardActiveObject();
            canvas.renderAll(); 
        }
        if (e.keyCode == 90 && e.ctrlKey) {
            canvas.remove(
                canvas.getObjects()[canvas.getObjects().length - 1]
            );
            canvas.discardActiveObject();
            canvas.renderAll(); 
        }
        if (e.keyCode == 67 && e.ctrlKey) {
            copy(canvas);
            return
        }
        if (e.keyCode == 86 && e.ctrlKey) {
            paste(canvas);
            return
        }
        

    };   
    


    fabric.Text.prototype.set({
    _getNonTransformedDimensions() { // Object dimensions
    return new fabric.Point(this.width, this.height).scalarAdd(this.padding);
    },

        _calculateCurrentDimensions() { // Controls dimensions
        return fabric.util.transformPoint(this._getTransformedDimensions(), this.getViewportTransform(), true);
        }
    });



    // Extended fabric object class
    fabric.SpeechBubble = fabric.util.createClass(fabric.Object, {

        type: 'speechBubble',

        initialize: function(element, options) {
            options || (options = {});
            this.callSuper('initialize', element, options);
        },

        toObject: function() {
            return fabric.util.object.extend(this.callSuper('toObject'));
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);

            // do not render if width/height are zeros or object is not visible
            //  if (this.width === 0 || this.height === 0 || !this.visible) return;
        }
    });

    fabric.SpeechBubble.fromObject = function(object, callback) {
        callback && callback(new fabric.SpeechBubble([object.x, object.y], object));
    };
    //fabric.SpeechBubble.async = true;

    fabric.RectangleTriangle = fabric.util.createClass(fabric.Rect, {
    type: 'rectangleTriangle',
    _render: function(ctx) {
        var w = this.width,
        h = this.height,
        x = -this.width / 2,
        y = -this.height / 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y);
        ctx.closePath();
        this._renderPaintInOrder(ctx);
    }
    });
    fabric.RectangleTriangle.fromObject = function(object, callback) {
        return fabric.Object._fromObject('RectangleTriangle', object, callback);
    };

//fabric.Object.prototype.uid = ... ;

} //end of initFabric
const colorpick = () => {
    $settings.getColorActive = true;
    console.log('color picking active')
}

const getColor = (e) => {
    // fetch once canvas data     
    var ctx = canvas.getContext(); 
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var pointer = canvas.getPointer(e.e);
    var x = pointer.x;
    var y = pointer.y;
    // locate index of current pixel
    console.log('x and y are '+x + ' ,'+y)
    
    let index = (y * imgData.width + x) * 4;

    let red = imgData.data[index];
    let green = imgData.data[index+1];
    let blue = imgData.data[index+2];
    let alpha = imgData.data[index+3];
    // Output
    console.log('pix x ' + x +' y '+y+ ' index '+index +' COLOR '+red+','+green+','+blue+','+alpha);
    console.log('rgba(' +red+ ',' +green+ ',' +blue+ ','+alpha +')')
    $settings.currentRed = red;
    $settings.currentBlue = blue;
    $settings.currentGreen = green;
    
    $settings.getColorActive = false;
    
    //get hex of this color
    let arr = [red,blue,green];
    let cl = rgbToHex(arr);
    //push this color into current color and current colors array
    $settings.activeColor = cl;
    $settings.penFill = cl;
    $settings.objectFill = cl;
	$settings.lineStroke = cl;
	$settings.blendColor = cl;
	let arr2 = ['rgb(' +red+ ',' +green+ ',' +blue+')']
	for (let c of $currentPalette) {
        arr2.push(c)
	}
	console.log('color is '+cl)
	console.table($currentPalette);
	window.alert(cl);
	$currentPalette = arr2;
}   


function selectNow() {
    mode = "select";   
    canvas.selection=true;
    canvas.perPixelTargetFind = true;
    canvas.targetFindTolerance = 4;
    canvas.renderAll();
};

// select all objects
function deleteObjects(){
    if (confirm('Delete everything, are you sure?')) {
       canvas.clear();
       $drawType = 'text';
       let txtBtn = document.getElementById('textBtn')
       resetTools(txtBtn)
    }
}

function transformMouse(mouseX, mouseY) {
    return { x: mouseX / window.zoom, y: mouseY / window.zoom };
}

function toolClick(event) {
	console.log('toolClick running');
    open = true;
    let el = event.target;
    let dt = el.getAttribute('data-type')
    console.log('tool click '+dt)
    $onscreen.slideMenu = dt;

    if (dt != 'gradient') $settings.gradientActive = false;
    if (dt != 'pen') canvas.isDrawingMode = false;
    if (dt == 'text' || dt == 'textbox') $onscreen.slideMenu = 'text';
    if (dt == 'select') $onscreen.slideMenu = 'zindex';   
    if (dt == 'line') $onscreen.slideMenu = 'line';   	
    if (dt == 'graphics') $onscreen.slideMenu = 'graphics';   		
    
    if (dt == 'puppet') {
        $onscreen.slideMenu = 'puppetPositions';  
        tools = ['back', 'insert'];
        removeTooltip();
        tooltipT = {
            back: 'back to the regular editor',
            insert: 'insert this ASL design into the main editor'
        };
        $tooltipOffset = -50;
    } 		
    else {
        $tooltipOffset = 0;
    }

    if (el.id == 'clearBtn') {
        deleteObjects()
    }
    $drawType = el.getAttribute('data-type')
    resetTools(el, dt);
    if ($drawType == 'pen') {
        $onscreen.slideMenu = 'pen';
        canvas.isDrawingMode = true;
    }
    if (['circle', 'ellipse', 'equilateral', 'rightangle', 'rectangle'].includes($drawType) ) {
        $onscreen.slideMenu = 'objects';
    }
        
    
    if ($drawType == 'select') {
        mode = 'select'
    }
    else {
        mode = 'draw'
    }
} 

function resetTools(el, name) {
	//console.log('resetting Tools, el: '+el);
    if (name == 'gradient') {
        $settings.gradientActive = true;
        let lis = document.getElementsByClassName('tool');
        for (let d of lis) {
            d.classList.remove('active')
        }
    }
    el.classList.add('active')
        //console.log('$drawType is '+$drawType)
    let idiv = el.querySelector('i')
    

        //idiv.className = '';
       // idiv.classList.add('icon-tools')
        //idiv.classList.add('icon-'+$drawType+'-select')
    
    let sibs = getSiblings(el)
    for (let sib of sibs) {
        sib.classList.remove('active')
        let dType = sib.getAttribute('data-type')
        let idiv = sib.querySelector('i')
        //idiv.className = '';
        //idiv.classList.add('icon-tools')
        //idiv.classList.add('icon-'+dType+'-black')                
    }         
}

var getSiblings = function (elem) {
    var siblings = [];
    var sibling = elem.parentNode.firstChild;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== elem) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling
    }
    return siblings;
}; 

function deleteObject(eventData, target) {
    var activeObjects = canvas.getActiveObjects();
    console.log('trying to delete '+target)
    canvas.discardActiveObject()
    if (activeObjects.length) {
      canvas.remove.apply(canvas, activeObjects);
    }
}
 
function deleteObj() {
    var activeObjects = canvas.getActiveObjects();
    canvas.discardActiveObject()
    if (activeObjects.length) {
      canvas.remove.apply(canvas, activeObjects);
    }
};

const getStrokeDashArray = () => {
	  switch ($settings.lineType) {
		case 'solid':
			return [0,0]
		break;
		
		case 'dashed':
			return [$settings.lineStrokeWidth, $settings.lineStrokeWidth/3];   
		break;
		
		case 'dotted':
			return [$settings.lineStrokeWidth, $settings.lineStrokeWidth/6];  
		break;
	  }
}
 
//TODO: add a uniform stroke to selected objects button someplace in order to use this

fabric.Object.prototype.noScaleCache = false;
/*
	strokeUniform works better without scalingCache
	Objects in group are not scaled directly, so stroke uniform will not have effect.
*/
function toggleUniform() {
	var aObject = canvas.getActiveObject();
	if (aObject.type === 'activeSelection') {
		aObject.getObjects().forEach(function(obj) {
			obj.set('strokeUniform', !obj.strokeUniform);
		});
	} else {
		aObject.set('strokeUniform', !aObject.strokeUniform);
	}
	canvas.requestRenderAll();
}


// src="js/cheetahGrid.js"  on:load={mathjaxLoaded}


function pad(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

var getRandomInt = fabric.util.getRandomInt;

function getRandomColor() {
    let mode = $settings.coloringMode || 'stepped';
    console.log('type is '+mode)

    let reversePalette = [];
    for (let c of $currentPalette) {
        reversePalette.push(c)
    }
    reversePalette = reversePalette.reverse();
    
    let lenny = $currentPalette.length - 1;
        
    if ($settings.coloringIndex > lenny) {
        $settings.coloringIndex = 0;
    }
    console.log('$coloringIndex is '+$settings.coloringIndex)
    console.log('lenny is '+lenny)
    switch (mode) {
        case 'single':
            color = fillCol || $currentPalette[0]
        break;
        
        case 'stepped':
            color = $currentPalette[$settings.coloringIndex]
        break;

        case 'stepped_reverse':
            color = reversePalette[$settings.coloringIndex]
        break;

        case 'random':
            color = sample($currentPalette)
        break;
    }   
    $settings.coloringIndex++;
    return color;
    
    //(
//         pad(getRandomInt(0, 255).toString(16), 2) +
//         pad(getRandomInt(0, 255).toString(16), 2) +
//         pad(getRandomInt(0, 255).toString(16), 2)
    //);
}
let paletteButton = 'choose palette';

const objectQuickColor = (e) => {
    let color = e.target.id;
    $settings.activeColor = color;
    $settings.penFill = color;
    $settings.objectFill = color;
	$settings.lineStroke = color;
	$settings.blendColor = color;
    
    canvas.getActiveObjects().map(item => {
        console.log('changing color, type is ' +item.type)
        
      //  console.log(item)
        if (item.fill && item.fill.colorStops) {
            console.log('got a gradient')
            item.fill.colorStops[1].color = color;
            $settings.gradientColor2 = color;
            return
        }
        // you don't want to add a fill to strokes which have shadows, that creates that weird fill in between paths
        if (!item.shadow) {
            item.set('fill', color)
            if (item.type == 'group') {
                console.log(item)
                if (item._objects) {
                    item._objects.map(subitem => {
                        subitem.set('fill', color)
                    })
                }
            }
        }
        
        if (['lineArrow', 'line'].includes(item.type) ) {
            console.log('line setting stroke')
            item.set('stroke', color)
        }
        if (item.shadow) {
            console.log('strokeLineCap setting stroke')
            //we have a PEN stroke, there's no fill, we recolor the stroke:            
            item.set({'stroke': color})
        }
        if (['i-text'].includes(item.type)) {
            console.log(item)
            if (item.textBackgroundColor) {
                let rgb = hexToRgb(color.toString());
                let textContrast = colorIsLight(rgb) ? '#000000' : '#ffffff';
                item.set({'textBackgroundColor':color, 'fill': textContrast})
            }
            else {
                item.set({'fill': color})
            }
        }
    });  
    canvas.renderAll();
}

const searchForImage = () => {
    let input = document.getElementById('image_search');
    let keyword = input.value;
    if (keyword) imageSearch(keyword,canvas);
}

const setOpacity = () => {
    let input = document.getElementById('opacityChanger');
    let value = input.value;
    canvas.getActiveObjects().map(item => {
        item.set({'opacity': value});
    })
    canvas.requestRenderAll();
}
 
const addTooltip = (e) => {
    let el = e.target;
    let num  = 61;
    
    //console.log(e)
    let x = e.clientX;
    let y = el.getAttribute('data-y')
    let parent = document.getElementById('toolbar');
    let scrollY = parent.scrollTop + $tooltipOffset;
    //el.offsetTop //- document.body.scrollTop;

    let diff = ( (num * y) + num);
    let yPos  = diff - scrollY;
    //(scrollY - document.body.scrollTop)     
    //scrollY = e.clientY - 50;
    
    //console.log('scrollY '+scrollY);
    //console.log('yPos ' + yPos)
    
    // y spacing for tooltips

    let tooltip = document.getElementById('menu_tooltip');
    // Create tooltip element
    // Set tooltip text
    tooltip.textContent = el.getAttribute('data-tooltip');
    //console.log('adding tooltip')
    tooltip.style.left = num + 'px';
    tooltip.style.top =  yPos + 'px';
   // tooltip.style.display = 'inline';
    tooltip.style.opacity = 1;
    if (el.getAttribute('data-type') == 'gradient') {
        tooltip.classList.add('tooltip_top_left');
        tooltip.classList.remove('tooltip_left_center');
    }
    else {
        tooltip.classList.remove('tooltip_top_left');
        tooltip.classList.add('tooltip_left_center');
    }
  //  console.log('text for tt is '+el.getAttribute('data-tooltip'))

}
const removeTooltip = (e) => {
    let tooltip = document.getElementById('menu_tooltip');
    tooltip.style.opacity = 0;
    //tooltip.style.display = 'none';
}

</script>

<style> 


#menuWrapper {
    padding-left: 60px;
    height: 60px;
}
#colorBoxes {
    height: 60px;
    overflow-y: hidden;
    display: inline-block;
    width: calc(78% - 50px);
    vertical-align: top;
    cursor: pointer;
}
#wrapper {
/*    margin-top: -100px;*/
}
:global(.bottomSlide) {
    padding-bottom: 25% !important;
}
:global(.colorbox) {
    display: inline-block;
    border-radius: 90px;
    width: 38px;
    height: 38px;
    margin: 10px;
    margin-top: 5px;
}
:global(#paletteChooser) {
    display: inline-block;
    vertical-align: top;
}
.inline {
    display: inline-block;
}
.toolWrapper {
    display: inline-block;
    margin-top: 20px;
    pointer-events:none;
    transform: translate(-5px, -30px) scale(.7);
}
.toolGradient {
    display: inline-block;
    margin-top: 10px;
    transform: translate(10px, -27px) scale(.6);
    cursor: pointer;
}
#colorgrabber {
    display: inline-block;
    margin-top: 10px;
    transform: translate(10px, -27px) scale(.6);
    cursor: pointer;
}
.gradient {
    pointer-events: all !important;
}
.gradient.active {
    background-color: #add8e2;
}

.yellowHover:hover {
    background: #f8fab2;
}
.colorbox:hover {
    opacity: .7;
}
.colorbox.active {
    box-shadow: black 0px 0px 5px;
}
#menu_tooltip {
    background-color: rgb(97, 103, 108);
    color: white;
    padding: 2rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    font-size: 1.2rem;
    position: absolute;
    z-index: 2001;
    opacity: 0;
    pointer-events:none;
    border-radius: 10px;
    -webkit-transition: opacity .5s ease-in;
    -moz-transition: opacity .5s ease-in;
    -o-transition: opacity .5s ease-in;
    -ms-transition: opacity .5s ease-in;
    transition: opacity .5s ease-out;
    box-shadow: 1px 1px 1px black;
}
.tooltip_top_left:after {
    content: '';
    position: absolute;
    border-style: solid;
    border-width: 15px 15px 15px 0;
    border-color: transparent #000000;
    display: block;
    width: 0;
    z-index: 2000;
    left: calc(5% + 7.5px);
    top: -20px;
    transform: rotate(90deg);
}
.tooltip_left_center:after {
    content: '';
    position: absolute;
    border-style: solid;
    border-width: 15px 15px 15px 0;
    border-color: transparent #000000;
    display: block;
    width: 0;
    z-index: 2000;
    left: -15px;
    top: calc(50% - 7.5px);
}
#editor {
    overflow:hidden;
}
</style>
<svelte:head>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.3/jspdf.min.js"></script>
    <!-- on:load={fabricLoaded} src="js/fabric.min.js" -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/1.8.349/pdf.min.js"></script>
    <link rel="stylesheet" href="./editor.css">

</svelte:head>
 
<div id="editor" style="position: absolute; width: 100%; height:100%; margin-top:-60px; background-color:{bgColor}">
    {#if $onscreen.slideMenu == 'puppetPositions' || $onscreen.slideMenu == 'puppetDesign'}
        <NavbarPuppet bind:tools={tools} bind:tooltipT={tooltipT} bind:canvas={canvas}></NavbarPuppet>
        <NavbarSubPuppet bind:canvas={canvas}></NavbarSubPuppet>
    {:else}
        <Navbar bind:canvas={canvas}></Navbar>
        <div id="menuWrapper">
            <div  class="toolGradient yellowHover" id="gradientBtn">
                <i class="sprite icon-tools gradient {$settings.gradientActive ? 'active' : ''}" on:mouseover={addTooltip}  on:mouseout={removeTooltip} data-y="1" data-tooltip="{tooltipT['gradient']}" on:click={toolClick} data-type="gradient"></i>
            </div>
            {#if $onscreen.palettes}
                <div id="paletteChooser">
                    <Palettes {paletteButton}></Palettes>
                </div>
            {/if}

            <div id="colorgrabber">
                <div class="sprite icon-tools colorpick"  on:click={colorpick}></div>
            </div>

            {#if $onscreen.showColors && $currentPalette && $currentPalette.length > 0}
                <div id="colorBoxes">
                    {#each $currentPalette as color, y}
                        <div id={color} class="colorbox {($settings.activeColor == color || !$settings.activeColor && y == 0) ? 'active' : ''}" on:click={objectQuickColor} style="background-color:{color}"></div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
    <Hamburger bind:open={open} {$drawType}/>

    <aside class="slideIn { open ? 'open' : ''}" >
    
        {#if $onscreen.slideMenu == 'zindex'}
            <ZIndex bind:canvas={canvas} ></ZIndex>

            <Coloring bind:canvas={canvas} ></Coloring>


            <Pattern bind:canvas={canvas} ></Pattern>			
        {/if}
        
    
    <!--
        {#if $onscreen.slideMenu == 'math'}
            <EquationEditor bind:canvas={canvas} ></EquationEditor>
        {/if}
    -->
        {#if $onscreen.slideMenu == 'text'}
  
            <TextTools bind:canvas={canvas} ></TextTools>
        {/if}
        {#if $onscreen.slideMenu == 'pen'}
            <DrawingTools bind:canvas={canvas} ></DrawingTools>
        {/if}
        
        {#if $onscreen.slideMenu == 'objects'}
            <Coloring bind:canvas={canvas} ></Coloring>
            <Objects bind:canvas={canvas} ></Objects>
        {/if}  
        {#if $onscreen.slideMenu == 'line'}
            <Line bind:canvas={canvas} ></Line>
        {/if}  		

        {#if $onscreen.slideMenu == 'import'}
            <Import bind:canvas={canvas} ></Import>
         
        {/if}
        
        {#if $onscreen.slideMenu == 'right'}
            <SymbolViewer bind:canvas={canvas} symbolMode="checks" ></SymbolViewer>
        {/if}
        
        {#if $onscreen.slideMenu == 'wrong'}
            <SymbolViewer bind:canvas={canvas} symbolMode="crosses" ></SymbolViewer>
        {/if}    
        {#if $onscreen.slideMenu == 'arrow'}
            <SymbolViewer bind:canvas={canvas} symbolMode="arrows" ></SymbolViewer>
        {/if}            
        
        
        {#if $onscreen.slideMenu == 'speechbubble'}
            <SymbolViewer bind:canvas={canvas} symbolMode="callouts" ></SymbolViewer>
        {/if}    
                
        {#if $onscreen.slideMenu == 'asl'}
            <SymbolViewer bind:canvas={canvas} symbolMode="asl" ></SymbolViewer>
        {/if}     
        
        {#if $onscreen.slideMenu == 'puppetPositions'}
        
        <PuppetPositions bind:canvas={canvas} symbolMode="puppet" ></PuppetPositions>
        {/if}    

        {#if $onscreen.slideMenu == 'puppetDesign'}
        
        <PuppetDesign bind:canvas={canvas} symbolMode="puppet" ></PuppetDesign>
        {/if}              
                 
        
        {#if $onscreen.slideMenu == 'graphics'}
            <KwippeLoader bind:canvas={canvas} ></KwippeLoader>
        {/if}            
        		
		
        {#if $onscreen.slideMenu == 'gradient'}
             <Gradient bind:canvas={canvas}  ></Gradient>           
        {/if}
        
    </aside>

    <div id="wrapper">
       
        <div id="canvasWrapper">
            <div id="canvasDiv" class="canvasDiv" style="width:95%;">
                <canvas bind:this={canvas} id="c" width="1920" height="1080"></canvas>
            </div>
        </div>
        <div id="toolbar">                  
            <ul id="toolsul" class="tools">
                {#each tools as tool, y}
                    <li id="{tool}Btn" on:mouseover={addTooltip}  on:mouseout={removeTooltip} data-y={y}  data-tooltip="{tooltipT[tool]}" on:click={toolClick} data-type="{tool}" class="tool {tool == 'text' ? 'active' : ''}">
                        <div class="toolWrapper">
                            <i class="sprite icon-tools {tool} {tool == 'text' ? 'select' : 'black'}"></i>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
    <div id="menu_tooltip"></div>
</div>

