
const { getQuality } = require('./utils');

const defaultOptions = {  
    headerName: 'accept',
    queryName: 'auto',
    mappings: [
        {
            values: ['image/avif'],
            process: (sharp, quality) => quality !== -1 ? sharp.avif({ quality: parseInt(quality) }) : sharp.avif()
        },
        {
            values: ['image/webp'],
            process: (sharp, quality) => quality !== -1 ? sharp.webp({ quality: parseInt(quality), effort: 1 }) : sharp.webp()
        },
    ],
};

class AutoTransformer {
    constructor(options) {
        this.options = {
            ...defaultOptions,
            ...options
        };
    }
    
    canProcess(request) {
        const { query } = request;

        const auto = query.get(this.options.queryName);

        return auto === undefined || auto?.toLowerCase() !== 'false';
    }

    process(request, sharp) {
        const { query, headers } = request;

        if (!headers || !sharp) {
            return sharp;
        }

        const quality = getQuality(query.get('q'));
        const acceptHeader = headers.get(this.options.headerName)?.toLowerCase();

        if (!acceptHeader) {
            return sharp;
        }

        const mapping = this.options.mappings.find(
            (mapping) => mapping.values.find(
                (value) => acceptHeader.includes(value.toLowerCase())));

        return !mapping ? sharp : mapping.process(sharp, quality);
    }
}

module.exports = AutoTransformer;