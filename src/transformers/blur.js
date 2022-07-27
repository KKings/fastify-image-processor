const { getBlur } = require('./utils');

const defaultOptions = {
  blurOptions: {

  },
  mappings: [
    {
      param: 'blur',
      parse: (options, value) => {
        return {
          ...options,
          sigma: value && value !== '' ? value : undefined
        };
      }
    },
  ],
};

class BlurTransformer {
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

    const blurParams = this.options.mappings.filter(mapping => query.has(mapping.param))
      .map(mapping => {
        return {
          mapping,
          value: query.get(mapping.param)
        };
      });

    if (!blurParams || blurParams.length === 0) {
      return sharp;
    }

    let options = this.options.blurOptions;

    blurParams.forEach(param => {
      options = param.mapping.parse(options, param.value);
    });

    return options.sigma
      ? sharp.blur(getBlur(options.sigma))
      : sharp.blur();
  }
}

module.exports = BlurTransformer;