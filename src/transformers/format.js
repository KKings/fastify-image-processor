const AutoTransformer = require("./auto");
const { getQuality, hasValue } = require('./utils');

const defaultOptions = {
    queryName: 'format',
    formatOptions: {
        jpeg: {
            progressive: true,
            mozjpeg: true,
        },
        png: {
            progressive: true,
        },
        webp: {
            effort: 1,
        },
        avif: {
            effort: 1,
        },
    },
    mappings: [
        {
            param: 'progressive',
            parse: (options, value) => {
                return {
                    ...options,
                    progressive: value?.toLowerCase() !== 'false' ? true : false,
                };
            }
        },
        {
            param: 'mozjpeg',
            parse: (options, value) => {
                return {
                    ...options,
                    mozjpeg: value?.toLowerCase() !== 'false' ? true : false,
                };
            }
        },
        {
            param: 'q',
            parse: (options, value) => {
                return {
                    ...options,
                    quality: getQuality(value),
                };
            }
        },
    ]
};

const autoTransformer = new AutoTransformer();

class FormatTransformer {
    constructor(options) {
        this.options = {
            ...defaultOptions,
            ...options
        };
    }

    canProcess(request) {
        const { query } = request;

        const format = query.get(this.options.queryName);

        if (autoTransformer.canProcess(request) && !hasValue(format)) {
            return true;
        }

        if (!hasValue(format)) {
            return false;
        }

        return this.options.formatOptions[format.toLowerCase()] !== undefined;
    }

    process(request, sharp) {
        const { query } = request;

        /**
         * We can assume format is available as canProcess should be called
         */
        const format = query.get(this.options.queryName);

        if (autoTransformer.canProcess(request) && !hasValue(format)) {
            return autoTransformer.process(request, sharp);
        }

        const formatOptions = this.options.formatOptions[format.toLowerCase()];

        if (formatOptions === undefined) {
            throw new Error(`Format ${format.toLowerCase()} is not supported as an output option. Supported options ['jpeg', 'png', 'webp', 'avif'].`);
        }

        const formatParams = this.options.mappings.filter(mapping => query.has(mapping.param))
            .map(mapping => {
                return {
                    mapping,
                    value: query.get(mapping.param)
                };
            });

        let options = { ...formatOptions };
        
        formatParams.forEach(param => {
            options = param.mapping.parse(formatOptions, param.value);
        });

        return sharp.toFormat(format, options);
    }
}

module.exports = FormatTransformer;