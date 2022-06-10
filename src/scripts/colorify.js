const addColorify = () => {

'use strict';

var fabric  = global.fabric || (global.fabric = { }),
    filters = fabric.Image.filters,
    createClass = fabric.util.createClass;

/**
 * Colorify filter class
 * @class fabric.Image.filters.Colorify
 * @memberOf fabric.Image.filters
 * @extends fabric.Image.filters.BaseFilter
 * @see {@link fabric.Image.filters.Colorify#initialize} for constructor definition
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 * @example
 * var filter = new fabric.Image.filters.Colorify({
*   add here an example of how to use your filter
* });
 * object.filters.push(filter);
 * object.applyFilters();
 */
filters.Colorify = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Colorify.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Colorify',

    /**
     * Fragment source for the threshold program
     */
    fragmentSource: 'precision highp float;\n' +
    'uniform sampler2D uTexture;\n' +
    'uniform float uthreshold;\n' +
    'varying vec2 vTexCoord;\n' +
    'void main() {\n' +
    'vec4 color = texture2D(uTexture, vTexCoord);\n' +
    // add your gl code here
    'gl_FragColor = color;\n' +
    '}',

    /**
     * Colorify value, from -1 to 1.
     * translated to -255 to 255 for 2d
     * 0.0039215686 is the part of 1 that get translated to 1 in 2d
     * @param {Number} threshold
     * @default
     */
    threshold: 5,

    /**
     * Describe the property that is the filter parameter
     * @param {String} m
     * @default
     */
    mainParameter: 'oldRed',

    /**
     * Apply the Colorify operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Ui0=-[nt8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
        console.log('$$$$$$$$ oldRed: '+this.oldRed)
        var imageData = options.imageData,
            data = imageData.data, i, len = data.length,sublim = 255-this.threshold;

        for (var i = 0; i < imageData.data.length; i += 4) {
            // is this pixel the old rgb?
            if (imageData.data[i] == this.oldRed && imageData.data[i + 1] == this.oldGreen && imageData.data[i + 2] == this.oldBlue) {
                // change to your new rgb
                imageData.data[i] = this.newRed;
                imageData.data[i + 1] = this.newGreen;
                imageData.data[i + 2] = this.newBlue;
            }
        }       
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
        return {
            uMyParameter: gl.getUniformLocation(program, 'uMyParameter'),
        };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
        gl.uniform1f(uniformLocations.uMyParameter, this.threshold);
    },
});

/**
 * Returns filter instance from an object representation
 * @static
 * @param {Object} object Object to create an instance from
 * @param {function} [callback] to be invoked after filter creation
 * @return {fabric.Image.filters.Colorify} Instance of fabric.Image.filters.Colorify
 */
fabric.Image.filters.Colorify.fromObject = fabric.Image.filters.BaseFilter.fromObject;

}

export { addColorify }
