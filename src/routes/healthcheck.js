const schema = require('fluent-json-schema');

async function healthcheck(fastify, opts) {

  fastify.route({
    method: 'GET',
    path: '/healthz/live',
    handler: onHealthCheck,
    description: 'Simple health check of the application to verify that is responding to requests.',
    response: {
      200: schema.object()
        .prop('status', schema.string())
    }
  });

  fastify.route({
    method: 'GET',
    path: '/healthz/ready',
    handler: onHealthCheck,
    description: 'Health check of the application to verify all dependencies.',
    response: {
      200: schema.object()
        .prop('status', schema.string())
    }
  });

  async function onHealthCheck(request, reply) {
    return { status: 'healthy' };
  }
}

module.exports = healthcheck;