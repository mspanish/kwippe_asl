const setPickrs = () => {
    let opts =     {
        default: $fillCol || color,
        swatches: [
            'rgba(244, 67, 54, 1)', 'rgba(233, 30, 99, 0.95)', 'rgba(156, 39, 176, 0.9)', 'rgba(103, 58, 183, 0.85)', 'rgba(63, 81, 181, 0.8)', 'rgba(33, 150, 243, 0.75)', 'rgba(3, 169, 244, 0.7)', 'rgba(0, 188, 212, 0.7)', 'rgba(0, 150, 136, 0.75)', 'rgba(76, 175, 80, 0.8)', 'rgba(139, 195, 74, 0.85)', 'rgba(205, 220, 57, 0.9)', 'rgba(255, 235, 59, 0.95)', 'rgba(255, 193, 7, 1)'
        ],
        components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
                save: true
            }
        }
    }

    // Simple example, see optional options for more configuration.
    const pickr1 = Pickr.create({
        el: '#pickColor',
        theme: 'nano', // or 'monolith', or 'nano'
        default: opts['default'],
        components:opts['components'],
        swatches: opts['swatches'] 
    });
    const pickr2 = Pickr.create({
        el: '#pickColor2',
        theme: 'nano', // or 'monolith', or 'nano'
        default: $outlineCol || outlineColor,
        components:opts['components'],
        swatches: opts['swatches']
    });
    pickr1.on('save', (col, instance) => {
        //console.log('save', col, instance);
        color = col.toHEXA().toString();
        //console.log('color is '+color);
        pickr1.hide()
            $fillCol = color;
            canvas.getActiveObjects().map(item => {
                console.log(item)
                item.set({'fill': color});


                if (item && item._objects) {
                    for (var i = 0; i < item._objects.length; i++) {
                        item._objects[i].set({
                        fill: color
                        });
                    }
                }  
                canvas.renderAll()
            });
    })
    
    pickr2.on('save', (col, instance) => {
    // console.log('save', col, instance);
        outlineColor = col.toHEXA().toString();
        //console.log('color is '+color);
            pickr2.hide()
            $outlineCol = outlineColor;
            canvas.getActiveObjects().map(item => {
            console.log(item)
            item.set({'stroke': outlineColor});
            item.set({'borderColor': outlineColor});
            if (item && item._objects) {
                for (var i = 0; i < item._objects.length; i++) {
                    item._objects[i].set({
                        'stroke': outlineColor,
                        'sborderColor': outlineColor
                    });
                }
            }   
            canvas.renderAll()
            });
    })
} //end setPickers()
 
export { setPickers }
