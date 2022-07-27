const proxies = {
    /**
     * Example objects that can be used to proxy incoming 
     * image requests from
     */
    'splash': {
        secure: true,
        domain: 'images.unsplash.com',
        setHostHeader: true,
    },
};

const fastify = require('fastify')({
    logger: true,
    level: 'debug',
});

const schema = require('./env.schema');
const options = {
    confKey: 'config',
    schema,
    dotenv: true,
    data: process.env
};

const inititalize = async () => {
    fastify.register(require('fastify-env'), options);
    await fastify.after();
    
    fastify.register(require('./plugins/proxy'), { proxies });

    const cacheOptions = {
        storageOptions: {
            connectionString: fastify.config.AZURE_STORAGE_CONNECTION_STRING
        }
    };

    // fastify.register(require('./plugins/cache'), cacheOptions);
    fastify.register(require('./routes/healthcheck'));
    fastify.register(require('./routes/image-proxy'));
};

inititalize();

(async () => {
    try {
        await fastify.ready()
        await fastify.listen(process.env.PORT)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
})()