const fp = require('fastify-plugin');
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');

/**
 * Simple param matching to remove from upstream request.
 * Todo: Expose params from transformers
 */
const imageParams = [
    'w', 'h', 'f', 'bg', 'progressive', 'q', 'blur', 'gray', 'auto', 'format', 'flip', 'flop', 'r', 'p'
];

function requestProxy (fastify, opts, done) {
    const { proxies } = opts;

    if (!proxies || proxies.length === 0) {
        throw new Error('No image proxies configured, please configure a minimum of 1.')
    }

    fastify.decorate('proxy', proxy);
    fastify.decorateRequest('proxyInfo', null);

    async function proxy(request) {
        const { 
            protocol,
            hostname,
            url: requestUrl,
            method,
            headers,
            params,
            query
        } = request;

        const { lookup, '*': source } = params;
        const proxyInfo = proxies[lookup];

        if (!proxyInfo) {
            throw new Error(`The parameter, ${lookup}, is not configured.`)
        }

        let upstreamUrl = new URL(`${protocol}://${hostname}/${source}`);

        let ogHost = upstreamUrl.hostname;
        let ogProtocol = upstreamUrl.protocol;
        let ogMethod = method;
        let ogHeaders = headers;

        for (const [key, value] of Object.entries(query)) {
            if (!imageParams.includes(key)) {
                upstreamUrl.searchParams.set(key, value);
            }
        }

        upstreamUrl.port = 80;
        upstreamUrl.protocol = proxyInfo.secure ? 'https' : 'http';
        upstreamUrl.host = proxyInfo.domain;

        let proxyHeaders = new Headers(ogHeaders);
        //proxyHeaders.set('Referer', ogProtocol + '//' + ogHost);
        
        if (proxyInfo.setHostHeader) {
            proxyHeaders.set('Host', proxyInfo.domain);
        }

        request.proxyInfo = {
            from: requestUrl,
            to: upstreamUrl,
        };

        console.log(`${upstreamUrl}`)
        request.log.debug(`[PROXY] Proxy ${requestUrl} to ${upstreamUrl}`);
        
        return await fetch(upstreamUrl.href, {
            method: ogMethod,
            headers: proxyHeaders
        });
    }

    done();
}

module.exports = fp(requestProxy, {
    name: 'requestProxy'
});