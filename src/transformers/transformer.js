const sharp = require('sharp');

const FormatTransformer = require("./format");
const ResizeTransformer = require("./resize");
const BlurTransformer = require("./blur");
const GrayTransformer = require("./gray");
const FlipFlopTransformer = require('./flip-flop');
const RotateTransformer = require('./rotate');

const defaultOptions = {
    /**
     * Image processing timeout
     */
    timeout: 1,
    /**
     * Image processing total max size. Easy formula is to multiple Pixel Width x Pixel Height.
     * These are not width or height constraints, simply total size constraints.
     */
    limitInputPixels: 4800 * 2700, // 12,960,000 pixels,
    processors: [
        new ResizeTransformer(),
        new FlipFlopTransformer(),
        new RotateTransformer(),
        new BlurTransformer(),
        new GrayTransformer(),
        new FormatTransformer(),
    ]
};

class Transformer {
    constructor(options) {
        this.options = {
            ...defaultOptions,
            ...options
        };
    }

    processImage = (request, sharpInstance) => {
        const sharpy = !sharpInstance 
            ? sharp({ timeout: this.options.timeout, limitInputPixels: this.options.limitInputPixels }) 
            : sharpInstance;

        return this.options.processors
            .filter(processor => processor.canProcess(request))
            .reduce(
                (instance, processor) => processor.process(request, instance), sharpy);
    }
}

module.exports = Transformer;