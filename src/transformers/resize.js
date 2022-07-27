const sharp = require("sharp");

const defaultOptions = {
    resizeOptions: {

    },
    mappings: [
        {
            param: 'w',
            parse: (options, value) => {
                return {
                    ...options,
                    width: parseFloat(value) ?? 0
                };
            }
        },
        {
            param: 'h',
            parse: (options, value) => {
                return {
                    ...options,
                    height: parseFloat(value) ?? 0
                };
            }
        },
        {
            param: 'f',
            parse: (options, value) => {
                const normalizedValue = value.toLowerCase();
                const found = ['cover', 'contain', 'fill', 'inside', 'outside'].includes(normalizedValue);

                return {
                    ...options,
                    fit: found ? sharp.fit[normalizedValue] : undefined
                };
            }
        },
        {
            param: 'p',
            parse: (options, value) => {
                const normalizedValue = value.toLowerCase();
                const found = ['entropy', 'attention'].includes(normalizedValue);

                return {
                    ...options,
                    position: found ? sharp.strategy[normalizedValue] : normalizedValue
                };
            }
        },
    ],
};

class ResizeTransformer {
    constructor(options) {
        this.options = {
            ...defaultOptions,
            ...options
        };
    }
    
    canProcess(request) {
        return true;
    }

    process(request, sharp) {
        const { query } = request;

        const resizeParams = this.options.mappings.filter(mapping => query.has(mapping.param))
            .map(mapping => {
                return {
                    mapping,
                    value: query.get(mapping.param)
                };
            });
        
        if (!resizeParams || resizeParams.length === 0) {
            return sharp;
        }

        let options = this.options.resizeOptions;

        resizeParams.forEach(param => {
            options = param.mapping.parse(options, param.value);
        });

        return sharp.resize(options);
    }
}

module.exports = ResizeTransformer;