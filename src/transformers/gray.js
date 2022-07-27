
const defaultOptions = {
    grayOptions: {

    },
    mappings: [
        {
            param: 'gray',
            parse: (options, value) => {
                return {
                    ...options,
                    gray: value === '' || value?.toLowerCase() === 'true' ? true : false,
                };
            }
        },
    ],
};

class GrayTransformer {
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

        const grayParams = this.options.mappings.filter(mapping => query.has(mapping.param))
            .map(mapping => {
                return {
                    mapping,
                    value: query.get(mapping.param)
                };
            });
        
        if (!grayParams || grayParams.length === 0) {
            return sharp;
        }
        
        let options = this.options.grayOptions;

        grayParams.forEach(param => {
            options = param.mapping.parse(options, param.value);
        });

        return options.gray ? sharp.grayscale() : sharp;
    }
}

module.exports = GrayTransformer;