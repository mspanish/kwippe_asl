var canvas = new fabric.Canvas('pdfcanvas');
canvas.selection = false;

canvas.setHeight(450);
canvas.setWidth(636);

//zoom function
canvas.on('mouse:wheel', function(opt) {
  var delta = opt.e.deltaY;
  var pointer = canvas.getPointer(opt.e);
  var zoom = canvas.getZoom();

  zoom = zoom - delta / 200;

  if (zoom > 10) zoom = 10;
  if (zoom < 1) {
    zoom = 1;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  }
  canvas.zoomToPoint({
    'x': opt.e.offsetX,
    'y': opt.e.offsetY
  }, zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
});

//pdf load
document.querySelector('#pdf-upload').addEventListener('change', function(e) {
  var pageEl = document.getElementById('page-container');
  var file = e.target.files[0];

  if (file.type == 'application/pdf') {
    var fileReader = new FileReader();
    fileReader.onload = function() {
      var typedarray = new Uint8Array(this.result);
      PDFJS.getDocument(typedarray).then(function(pdf) {
        //console.log('the pdf has ', pdf.numPages, 'page(s).');
        pdf.getPage(pdf.numPages).then(function(pageEl) {
          var viewport = pageEl.getViewport(2.0);
          var canvasEl = document.querySelector('canvas');
          canvasEl.height = viewport.height;
          canvasEl.width = viewport.width;
          pageEl.render({
            'canvasContext': canvasEl.getContext('2d'),
            'viewport': viewport
          }).then(function() {

            var bg = canvasEl.toDataURL('image/png');

            fabric.Image.fromURL(bg, function(img) {
              canvas.setBackgroundImage(img);
            });
          });
        });
      });
    };
    fileReader.readAsArrayBuffer(file);
  };
});
