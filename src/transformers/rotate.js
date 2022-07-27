const { isNumber } = require('./utils');

const defaultOptions = {
  rotateOptions: {
    background: '#000000',
  },
  queryName: 'r',
  mappings: [
    {
      param: 'r',
      parse: (options, value) => {
        return {
          ...options,
          angle: value && value !== '' && isNumber(value) ? parseInt(value) : undefined
        };
      }
    },
    {
      param: 'bg',
      parse: (options, value) => {
        return {
          ...options,
          background: value && value !== '' ? value : undefined
        };
      }
    }
  ],
};

class RotateTransformer {
  constructor(options) {
    this.options = {
      ...defaultOptions,
      ...options
    };
  }

  canProcess(request) {
    const { query } = request;
    return query.has(this.options.queryName);
  }

  process(request, sharp) {
    const { query } = request;

    const rotateParams = this.options.mappings.filter(mapping => query.has(mapping.param))
      .map(mapping => {
        return {
          mapping,
          value: query.get(mapping.param)
        };
      });

    if (!rotateParams || rotateParams.length === 0) {
      return sharp;
    }

    let options = this.options.rotateOptions;

    rotateParams.forEach(param => {
      options = param.mapping.parse(options, param.value);
    });

    return options.angle
      ? sharp.rotate(options.angle, options)
      : sharp.rotate(90, options);
  }
}

module.exports = RotateTransformer;