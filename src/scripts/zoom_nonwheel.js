var src = "http://fieldbit.net/images/fieldbit_small_logo.png";

var SCALE_FACTOR = 1.3; //on clicking zoom, enlarge canvas in 30%. TBD

var zoomInByMouse = false;
var zoomOutByMouse = false;
var PanModeByMouse = false;

var zoomMax = 23;   //TBD
var mouseDown;

var canvasHeight = 480;
var canvasWidth = 640;


// canvas
var canvas = new fabric.Canvas('c');

var getFabricCanvases = (function () {
    var fabricCanvasCollection;
    return function getCanvases() {
        if (!fabricCanvasCollection) {
            fabricCanvasCollection = [];
            var fabricCanvas = $('.canvas-container canvas');
            fabricCanvas.each(function(index, item) {
                fabricCanvasCollection.push($(item));
            });
        }
        return fabricCanvasCollection;
    }
})();

canvas.on('mouse:down', function(e){
    if( zoomInByMouse ) {
        zoomByMouseCoords(e, "in");
    } else if( zoomOutByMouse ) {
        zoomByMouseCoords(e, "out");
    }
    else {
        mouseDown = true;
    }
});

canvas.on('mouse:up', function () {
    console.log("canvas.on(mouse:up):: up");
    mouseDown = false;
});

//canvas.backgroundColor = "#00fa00";
canvas.setBackgroundImage('https://fieldbit.s3.amazonaws.com/53/marker_image-33-4e5ee49e-35c5-4f8b-8431-1117ba51a9c4', canvas.renderAll.bind(canvas), {
    backgroundImageOpacity: 0.5,
    backgroundImageStretch: false
});

canvas.on('mouse:move', function (e) {
    if (PanModeByMouse && mouseDown){
        console.log("canvas.on(mouse:move):PanModeByMouse:: movementX: " + e.e.movementX +", " +e.e.movementY);
        panToByMouseCoords(e.e.movementX, e.e.movementY);
    }
});

// text
var text = new fabric.Text('Fieldbit Note', {
    left: 200,
    top: 50
});
text.hasRotatingPoint = true;
canvas.add(text);

// circle
var circle = new fabric.Circle({
    left: 200,
    top: 150,
    radius: 50,
    fill: "#dde000"
});
circle.hasRotatingPoint = true;
canvas.add(circle);

//image
fabric.util.loadImage(src, function(img) {
    var object = new fabric.Image(img);
    object.set({
        left: 200,
        top: 300
    });
    object.hasRotatingPoint = true;
    object.scaleX = object.scaleY = .25;
    canvas.add(object);
    canvas.renderAll();
});

canvas.renderAll();

// button Zoom In
$("#btnZoomIn").click(function(){
    zoomIn();
});
// button Zoom Out
$("#btnZoomOut").click(function(){
    zoomOut();

    getFabricCanvases().forEach(function(elementValue) {
        var currentTop = Number(elementValue.css("top").replace(/[^\d\.\-]/g, '') );
        var currentLeft = Number(elementValue.css("left").replace(/[^\d\.\-]/g, '') );

        currentTop = zoomCalcYpos(currentTop);
        currentLeft = zoomCalcXpos(currentLeft);

        elementValue.css("top", currentTop);
        elementValue.css("left", currentLeft);
    });

});

// button Reset Zoom
$("#btnResetZoom").click(function(){
    resetZoom();
});

// button Zoom To Right
$("#btnZoomToRight").click(function(){
    zoomToRight();
});
// button Zoom To Left
$("#btnZoomToLeft").click(function(){
    zoomToLeft();
});
// button Zoom To Up
$("#btnZoomToUp").click(function(){
    zoomToUp();
});
// button Zoom To Up
$("#btnZoomToDown").click(function(){
    zoomToDown();
});

// button Zoom To Down
$("#btnZoomInByMouse").click(function(){
    zoomInByMouse = !zoomInByMouse;
    zoomOutByMouse = PanModeByMouse = false;
    document.getElementById('zoomByMouseStatus').innerHTML = "zoomIn: " +zoomInByMouse;    //FOR QA ONLY
    zoomCanvasSelection(!zoomInByMouse);
    console.log("btnZoomInByMouse: " +zoomInByMouse);
});
// button Zoom To Down
$("#btnZoomOutByMouse").click(function(){
    zoomOutByMouse = !zoomOutByMouse;
    zoomInByMouse = PanModeByMouse = false;
    document.getElementById('zoomByMouseStatus').innerHTML = "zoomOut: " +zoomOutByMouse;    //FOR QA ONLY
    zoomCanvasSelection(!zoomOutByMouse);
    console.log("btnZoomOutByMouse: " +zoomOutByMouse);
});

// button Pan
$("#btnPanModeByMouse").click(function(){
    PanModeByMouse = !PanModeByMouse;
    zoomInByMouse = zoomOutByMouse = false;
    document.getElementById('zoomByMouseStatus').innerHTML = "panMode: " +PanModeByMouse;    //FOR QA ONLY
    zoomCanvasSelection(!PanModeByMouse);
    console.log("btnPanModeByMouse: " +PanModeByMouse);

});

createListenersKeyboard();

function createListenersKeyboard() {
    document.onkeydown = onKeyDownHandler;
    //document.onkeyup = onKeyUpHandler;
}

function onKeyDownHandler(event) {
    //event.preventDefault();

    var key;
    if(window.event){
        key = window.event.keyCode;
    }
    else{
        key = event.keyCode;
    }

    switch(key){
        //////////////
        // Shortcuts
        //////////////
        // Zoom In (Ctrl+"+")
        case 187: // Ctrl+"+"
            if(ableToShortcut()){
                if(event.ctrlKey){
                    event.preventDefault();
                    zoomIn();
                }
            }
            break;
        // Zoom Out (Ctrl+"-")
        case 189: // Ctrl+"-"
            if(ableToShortcut()){
                if(event.ctrlKey){
                    event.preventDefault();
                    zoomOut();
                }
            }
            break;
        // Reset Zoom (Ctrl+"0")
        case 48: // Ctrl+"0"
            if(ableToShortcut()){
                if(event.ctrlKey){
                    event.preventDefault();
                    resetZoom();
                }
            }
            break;
        default:
            // TODO
            break;
    }
}

function ableToShortcut(){
    /*
     TODO check all cases for this

     if($("textarea").is(":focus")){
     return false;
     }
     if($(":text").is(":focus")){
     return false;
     }
     */
    return true;
}
/********************************/

function zoomToRight() {
    zoomMoveStepToPosition('left', '+');
}
function zoomToLeft() {
    zoomMoveStepToPosition('left', '-');
}
function zoomToDown() {
    zoomMoveStepToPosition('top', '+');
}
function zoomToUp() {
    zoomMoveStepToPosition('top', '-');
}
/********************************/

//panToByMouseCoords
function panToByMouseCoords(xDelta, yDelta) {

    getFabricCanvases().forEach(function(elementValue) {
        var currentTop = Number(elementValue.css("top").replace(/[^\d\.\-]/g, '') );
        var currentLeft = Number(elementValue.css("left").replace(/[^\d\.\-]/g, '') );

        console.log("panToByMouseCoords:: (currentTop, yDelta): (" + currentTop + ", " + yDelta +")" +", (currentLeft, xDelta): (" + currentLeft + ", " + xDelta +")");

        currentTop = zoomCalcYpos(currentTop + yDelta);
        currentLeft = zoomCalcXpos(currentLeft + xDelta);
        elementValue.css("top", currentTop);
        elementValue.css("left", currentLeft);
    });
}

//Zoom By Mouse Coordinates
function zoomByMouseCoords(event, direction) {
    //if selectable element was clicked, don't zoom, just return:
    /*if (canvas.getActiveObject()) {
     return false;
     }*/

    if( !direction || !event.e ) return;

    var pointer = canvas.getPointer(event.e);
    console.log("zoomByMouseCoords: direction: " +direction +", p.x: " +pointer.x +", p.y:" + pointer.y +", canvas.width: " +canvas.getWidth());

    if( direction.toLowerCase() == "in" ){
        if(canvas.getZoom().toFixed(5) > zoomMax){
            console.log("zoomByMouseCoords: Error: cannot zoom-in anymore");
            return;
        }
        zoomIn();
    }
    if( direction.toLowerCase() == "out" ){
        if( canvas.getZoom().toFixed(5) <=1 ){
            console.log("zoomByMouseCoords: Error: cannot zoom-out anymore");
            return;
        }
        zoomOut();
    }
    zoomToPosition( zoomInCalcXpos(pointer.x), zoomInCalcYpos(pointer.y));
}

// Zoom In
function zoomIn() {
    if(canvas.getZoom().toFixed(5) > zoomMax){
        console.log("zoomIn: Error: cannot zoom-in anymore");
        return;
    }

    canvas.setZoom(canvas.getZoom()*SCALE_FACTOR);
    canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
    canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);
    canvas.renderAll();
}

// Zoom Out
function zoomOut() {
    if( canvas.getZoom().toFixed(5) <=1 ){
        console.log("zoomOut: Error: cannot zoom-out anymore");
        return;
    }

    canvas.setZoom(canvas.getZoom()/SCALE_FACTOR);
    canvas.setHeight(canvas.getHeight() / SCALE_FACTOR);
    canvas.setWidth(canvas.getWidth() / SCALE_FACTOR);
    canvas.renderAll();
}

// Reset Zoom
function resetZoom() {

    canvas.setHeight(canvas.getHeight() /canvas.getZoom() );
    canvas.setWidth(canvas.getWidth() / canvas.getZoom() );
    canvas.setZoom(1);

    canvas.renderAll();

    getFabricCanvases().forEach(function(item){
        item.css('left', 0);
        item.css('top', 0);
    });

}

function zoomCanvasSelection(isSelectable) {
    isSelectable = (isSelectable==true);
    canvas.selection = isSelectable;
    canvas.forEachObject(function(o) {
        o.selectable = isSelectable;
    });
}
function zoomInCalcXpos(xPos) {
    xPos *= canvas.getZoom();
    return zoomCalcXpos((canvasWidth/2) - xPos);
}
function zoomCalcXpos(xPos) {
    if (xPos>0){
        return 0;
    }
    if (xPos+canvas.getWidth() < canvasWidth){
        return canvasWidth - canvas.getWidth();
    }
    return xPos;
}

function zoomInCalcYpos(yPos) {
    yPos *= canvas.getZoom();
    return zoomCalcYpos( (canvasHeight/2) - yPos );
}
function zoomCalcYpos(yPos) {
    if (yPos>0){
        return 0;
    }
    if (yPos+canvas.getHeight() < canvasHeight) {
        return canvasHeight - canvas.getHeight();
    }
    return yPos;
}
function zoomToPosition(x,y) {
    zoomMoveToPosition('top', y);
    zoomMoveToPosition('left', x);
}
function zoomMoveToPosition(position, numericValue) {
    getFabricCanvases().forEach(function(elementValue) {
        elementValue.css(position, numericValue);
    });
}

function zoomMoveStepToPosition(position, operator) {
    getFabricCanvases().forEach(function(elementValue) {
        var current = Number(elementValue.css(position).replace(/[^\d\.\-]/g, '') );
        current = eval(current + operator + 20);

        if(position == "left" || position == "right" ) current = zoomCalcXpos(current);
        if(position == "top" || position == "bottom" ) current = zoomCalcYpos(current);

        elementValue.css(position, current);
    });
}
