const Transformer = require('../transformers/transformer');

/**
 * 
 */
const supportedFormats = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg',
  'image/gif'
];

/**
 * Approximately the equivalent of 10MB
 */
const defaultSizeLimit = 10 * 1024 * 1024;
const imageTransformer = new Transformer();

async function imageProxy(fastify, opts) {

  const sizeLimit = opts.sizeLimit || defaultSizeLimit;

  fastify.decorateReply('imageNotFound', imageNotFound);
  fastify.decorateReply('imageNotSupported', imageNotSupported);
  fastify.decorateReply('imageTooLarge', imageTooLarge);
  fastify.decorateReply('imageInfo', null);

  fastify.route({
    method: 'GET',
    url: '/:lookup/*',
    config: opts.config || {},
    constraints: opts.constraints || {},
    handler: onImageProxy,
  });

  async function onImageProxy(request, reply) {
    const { proxy } = this;
    const {
      status: upstreamStatus,
      headers: upstreamHeaders,
      body: upstreamBody
    } = await proxy(request);

    if (upstreamStatus !== 200) {
      return reply.imageNotFound();
    }

    const responseContentType = upstreamHeaders.get('Content-Type');

    if (!supportedFormats.includes(responseContentType)) {
      return reply.imageNotSupported();
    }

    const responseContentLength = upstreamHeaders.get('Content-Length');

    if (parseInt(responseContentLength) > sizeLimit) {
      return reply.imageTooLarge();
    }

    const { query, headers } = request;

    const transformStream = imageTransformer.processImage(
      { 
        query: new Map(Object.entries(query)), 
        headers: new Map(Object.entries(headers))
      }
    );  
      
    upstreamBody.pipe(transformStream);

    return transformStream
      .toBuffer({ resolveWithObject: true })
      .then(({ data: buffer, info }) => {
        reply.imageInfo = info;
        reply
          .type(`image/${info?.format}`)
          .send(buffer);
      });
  }

  async function imageNotFound() {
    this.statusCode = 404;
    return 'Image not available.';
  }

  async function imageNotSupported() {
    this.statusCode = 400;
    return 'Invalid image format found.';
  }

  async function imageTooLarge() {
    this.statusCode = 400;
    return 'Image size too large.';
  }
};

module.exports = imageProxy;