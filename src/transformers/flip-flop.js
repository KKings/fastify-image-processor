const defaultOptions = {
  blurOptions: {

  },
  mappings: [
    {
      param: 'flip',
      process: (sharp) => sharp.flip()
    },
    {
      param: 'flop',
      process: (sharp) => sharp.flop()
    },
  ],
};

class FlipFlopTransformer {
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

    const mappings = this.options.mappings
      .filter(
        mapping => query.has(mapping.param) && query.get(mapping.param).toLowerCase() !== 'false');

    if (!mappings || mappings.length === 0) {
      return sharp;
    }

    return mappings.reduce(
      (instance, mapping) => mapping.process(instance), sharp);
  }
}

module.exports = FlipFlopTransformer;