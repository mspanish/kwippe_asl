const createSpeechBubble = (canvas, msg, color, outlineColor,left,top) => {
    //configuration
    var boxPadding = 16;
    var arrowWidth = 16;
    var strokeWidth = 2;
    var handleSize = 20;
    let leftBox = 200,
        leftRect = 80,
        topBox = 80,
        topRect = 130;

        // fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
        
        
    //text
    var textbox = new fabric.Textbox(msg, {
        left: leftBox,
        top: topBox,
        width: 180,
        fontSize: 16,
        originY: 'center',
        originX: 'center',
        selected: true
    });

    //call setCoords whenever the textbox moved
    var setCoords = textbox.setCoords.bind(textbox);
    textbox.on({
        moving: setCoords,
        scaling: setCoords,
        rotating: setCoords
    });

    //to detect changes in the textbox position and update the handle when the textbox was moved, let's store the last known coords
    textbox.lastLeft = textbox.left;
    textbox.lastTop = textbox.top;

    //speech bubble tail handle
    var handle = new fabric.Rect({
        fill: 'transparent',
        left: leftRect,
        top: topRect,
        width: handleSize,
        height: handleSize,
        hasRotatingPoint: false,
        hasControls: false,
        originY: 'center',
        originX: 'center',
        selectable: false
    });

    //speech bubble background box
    var rect = new fabric.Rect({
        fill: '#ffffff',
        stroke: outlineColor,
        strokeWidth: strokeWidth,
        rx: 8,
        ry: 8,
        originX: 'center'
    });

    //speech bubble tail polygon
    var poly = new fabric.Polygon(
        [{x:0,y:0},{x:1,y:1},{x:1,y:0}],
        {
            fill: color,
            stroke: outlineColor,
            strokeWidth: strokeWidth,
            objectCaching: false,
            originX: 'center'

        }
    );

    //2nd tail poly to overlay the bubble stroke
    var poly2 = new fabric.Polygon(
        [{x:0,y:0},{x:1,y:1},{x:1,y:0}],
        {
            fill: 'white',
            objectCaching: false
        }
    );

    canvas.add(poly, rect, poly2, textbox);
    canvas.add(handle).setActiveObject(handle);
    canvas.on('after:render', updateBubble);
    updateBubble();

    function updateBubble() {
    
        //lets spare us some typing
        var x = textbox.left;
        var y = textbox.top;
        
        //update rect
        var bound = textbox.getBoundingRect();
        rect.left = bound.left - boxPadding;
        rect.top = bound.top - boxPadding;
        rect.width = bound.width + (boxPadding*2);
        rect.height = bound.height + (boxPadding*2);
        
        //if the textbox was moved, update the handle position too
        if(x !== textbox.lastLeft || 
            y !== textbox.lastTop) {
            handle.left += (x - textbox.lastLeft);
            handle.top += (y - textbox.lastTop);
            handle.setCoords();
        }
        
        //to support 360° thick tails we have to do some triangulation
        var halfPi = Math.PI/2;
        var angleRadians = Math.atan2(handle.top - y, handle.left - x);
        var offsetX = Math.cos(angleRadians + halfPi);
        var offsetY = Math.sin(angleRadians + halfPi);
        
        //update tail poly
        poly.points[0].x = handle.left;
        poly.points[0].y = handle.top;
        poly.points[1].x = x - (offsetX * arrowWidth);
        poly.points[1].y = y - (offsetY * arrowWidth); 
        poly.points[2].x = x + (offsetX * arrowWidth);
        poly.points[2].y = y + (offsetY * arrowWidth);
        
        //white overlay poly (prevent dividing line)
        var halfStroke = strokeWidth/2;
        poly2.points[0].x = handle.left;
        poly2.points[0].y = handle.top;
        poly2.points[1].x = x - offsetX * (arrowWidth - halfStroke);
        poly2.points[1].y = y - offsetY * (arrowWidth - halfStroke);
        poly2.points[2].x = x + offsetX * (arrowWidth - halfStroke);
        poly2.points[2].y = y + offsetY * (arrowWidth - halfStroke);
        
        //remember current position to detect further changes
        textbox.lastLeft = x;
        textbox.lastTop = y;
    }
}
export { createSpeechBubble }
