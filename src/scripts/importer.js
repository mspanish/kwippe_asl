let str2 = '{"objects":[{"type":"rect","left":50,"top":50,"width":20,"height":20,"fill":"green","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"rx":0,"ry":0},{"type":"circle","left":100,"top":100,"width":100,"height":100,"fill":"red","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"radius":50}],"background":"rgba(0, 0, 0, 0)"}'


const jsonToFabric = (canvas, data) => {
    // we have to do this in order to render the FONTS, a quick select and deselect of all objects on the stage
    canvas.loadFromJSON(data);
    canvas.renderAll();
    setTimeout(() => { 
        var objs = canvas.getObjects().map(function(o) {
            return o.set('active', true);
        });
        canvas.renderAll();
    },500)


  //  getFile(canvas)
    
}

const getFile = (canvas) => {
    let url = 'fabric_json_schema.json';
    fetch(url)
      .then(response => response.json())
      .then(data => {
          //console.log(data)
          canvas.loadFromJSON(data);
    });
}


export { jsonToFabric }
