import { fabric } from "fabric";

/* Do some initializing stuff
fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: 'rgba(102,153,255,0.5)',
    cornerSize: 12,
    padding: 5
});
*/
// initialize fabric canvas and assign to global windows object for debug

//canvas.setBackgroundColor({source: 'http://fabricjs.com/assets/escheresque_ste.png'}, canvas.renderAll.bind(canvas));
const setBackgroundImage = () => {
    
    
}

const setBackgroundColor = (canvas) => {
    if (canvas.backgroundColor instanceof fabric.Pattern) {
        canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
    }
    else {
        canvas.setBackgroundColor({source: 'http://fabricjs.com/assets/escheresque_ste.png'}, canvas.renderAll.bind(canvas));        
    }
}

const setBackgroundGradient = (canvas) => {
    console.log('trying to set gradient')
    var grad = new fabric.Gradient({
        type: 'linear',
        coords: {
            x1: 100,
        y1: 100,
        x2: canvas.width,
        y2: canvas.height,
        },
        colorStops: [
        {
            color: 'rgb(166,111,213)',
            offset: 0,
        },
        {    
            color: '#200772',
            offset: 1,
        }
        ]});
    canvas.setBackgroundColor(grad);
    canvas.renderAll();
}

export { setBackgroundColor, setBackgroundImage, setBackgroundGradient }
