    saveFile(data, filename){
      var save_link = document.createElement('a');
      save_link.href = data;
      save_link.download = filename;
    
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      save_link.dispatchEvent(event);
    };
    uploadImg() {
      document.getElementById("imgInput").click();
    };
    loadExpImg() {
      var imgElement = document.getElementById("expImg"); //声明我们的图片
      var imgInstance = new fabric.Image(imgElement, {
        selectable: false
        // zIndex:-99,
      });
      this.canvas.add(imgInstance);
    };
    uploadImgChange() {
      var eleImportInput = document.getElementById("imgInput");
      this.imgFile = eleImportInput.files[0];
      var imgSrc = "",
        imgTitle = "";
      if (/\.(jpe?g|png|gif)$/i.test(this.imgFile.name)) {
        var reader = new FileReader();
        var _this = this;
        reader.addEventListener(
          "load",
          function() {
            imgTitle = _this.imgFile.name;
            _this.imgSrc = this.result;
          },
          false
        );
        reader.readAsDataURL(this.imgFile);
      }
      var imgElement = document.getElementById("img"); //声明我们的图片
      
      imgElement.onload = () => {
        this.width = imgElement.width
        this.height = imgElement.height
        var imgInstance = new fabric.Image(imgElement, {
          zIndex: -1,
          selectable: false
        });
        this.canvas.add(imgInstance);
      };
    };

    
fabric.Object.prototype.setOriginToCenter = function() {
	this._originalOriginX = this.originX;
	this._originalOriginY = this.originY;
	var center = this.getCenterPoint();
	this.set({
		originX: 'center',
		originY: 'center',
		left: center.x,
		top: center.y
	});
};

fabric.Object.prototype.setCenterToOrigin = function() {
	var originPoint = this.translateToOriginPoint(
	this.getCenterPoint(),
	this._originalOriginX,
	this._originalOriginY);
	this.set({
		originX: this._originalOriginX,
		originY: this._originalOriginY,
		left: originPoint.x,
		top: originPoint.y
	});
};

fabric.Object.prototype.getZIndex = function() {
	return this.canvas.getObjects().indexOf(this);
}

fabric.Canvas.prototype.addToPosition = function(object,position) {
	this.add(object);
	while(object.getZIndex() > position) {
		this.sendBackwards(object);
	}
}

fabric.Object.prototype.hide = function() {
	this.set({ hidden:true, opacity: 0, selectable: false });
};

fabric.Object.prototype.show = function() {
	this.set({ hidden:false, opacity: 1, selectable: true });
};


var TextboxWithPadding = fabric.util.createClass(fabric.Textbox, {
  _renderBackground: function(ctx) {
    if (!this.backgroundColor) {
      return;
    }
    var dim = this._getNonTransformedDimensions();
    ctx.fillStyle = this.backgroundColor;

    ctx.fillRect(
      -dim.x / 2 - this.padding,
      -dim.y / 2 - this.padding,
      dim.x + this.padding * 2,
      dim.y + this.padding * 2
    );
    // if there is background color no other shadows
    // should be casted
    this._removeShadow(ctx);
  }
});

var gCanvas = new fabric.Canvas('canvDraw');
gCanvas.setWidth(500);
gCanvas.setHeight(500);

// add some shapes - these are examples, others should work too
var myRectangle = new fabric.Rect({
	left: 100,
	top: 100,
	fill: '#999999',
	width: 50,
	height: 50,
    strokeWidth: 1,
    stroke: '#000000'
});
gCanvas.add(myRectangle);

var thesePoints = [ {x:-50,y:-25},{x:50,y:-25},{x:70,y:25},{x:-70,y:25} ];
var myPolygon = new fabric.Polygon(thesePoints, {
    top: 100,
    left: 250,
    fill: '#999999',
    stroke: '#000000',
    strokeWidth: 1,
});
gCanvas.add(myPolygon);

var myEllipse = new fabric.Ellipse({
    top: 250,
    left: 100,
    rx: 75,
    ry: 50,
    fill: '#999999',
    stroke: '#000000',
    strokeWidth: 2
});
gCanvas.add(myEllipse);

var myText = new fabric.Text("Some text", {
    top: 250,
    left: 250,
});
gCanvas.add(myText);


// set up a listener for the event where the object has been modified
gCanvas.observe('object:modified', function (e) {
    e.target.resizeToScale();
});

// customise fabric.Object with a method to resize rather than just scale after tranformation
fabric.Object.prototype.resizeToScale = function () {
    // resizes an object that has been scaled (e.g. by manipulating the handles), setting scale to 1 and recalculating bounding box where necessary
    switch (this.type) {
        case "circle":
            this.radius *= this.scaleX;
            this.scaleX = 1;
            this.scaleY = 1;
            break;
        case "ellipse":
            this.rx *= this.scaleX;
            this.ry *= this.scaleY;
            this.width = this.rx * 2;
            this.height = this.ry * 2;
            this.scaleX = 1;
            this.scaleY = 1;
            break;
        case "polygon":
        case "polyline":
            var points = this.get('points');
            for (var i = 0; i < points.length; i++) {
                var p = points[i];
                p.x *= this.scaleX
                p.y *= this.scaleY;
            }
            this.scaleX = 1;
            this.scaleY = 1;
            this.width = this.getBoundingBox().width;
            this.height = this.getBoundingBox().height;
            break;
        case "triangle":
        case "line":
        case "rect":
            this.width *= this.scaleX;
            this.height *= this.scaleY;
            this.scaleX = 1;
            this.scaleY = 1;
        default:
            break;
    }
}

// helper function to return the boundaries of a polygon/polyline
// something similar may be built in but it seemed easier to write my own than dig through the fabric.js code.  This may make me a bad person.
fabric.Object.prototype.getBoundingBox = function () {
    var minX = null;
    var minY = null;
    var maxX = null;
    var maxY = null;
    switch (this.type) {
        case "polygon":
        case "polyline":
            var points = this.get('points');

            for (var i = 0; i < points.length; i++) {
                if (typeof (minX) == undefined) {
                    minX = points[i].x;
                } else if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (typeof (minY) == undefined) {
                    minY = points[i].y;
                } else if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (typeof (maxX) == undefined) {
                    maxX = points[i].x;
                } else if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (typeof (maxY) == undefined) {
                    maxY = points[i].y;
                } else if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }
            break;
        default:
            minX = this.left;
            minY = this.top;
            maxX = this.left + this.width; 
            maxY = this.top + this.height;
    }
    return {
        topLeft: new fabric.Point(minX, minY),
        bottomRight: new fabric.Point(maxX, maxY),
        width: maxX - minX,
        height: maxY - minY
    }
}

