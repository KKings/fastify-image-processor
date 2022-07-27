const fp = require('fastify-plugin');
const { v5: uuid } = require('uuid');
const AzureStorage = require('./azure-storage');

const namespace = '6f08364c-a986-4a04-834c-946d771a7360';

async function cache(fastify, opts, done) {
    let { cache, storageOptions } = opts;

    cache = cache ?? new AzureStorage(storageOptions);
    cache.onInit();

    fastify.decorate('cache', cache);
    fastify.decorateRequest('generateCacheKey', generateCacheKey);

    function generateCacheKey() {
        const { url } = this;

        const cacheKey = url.toLowerCase();
        return uuid(cacheKey, namespace);
    }

    done();
}

module.exports = fp(cache, {
    name: 'cache'
});
