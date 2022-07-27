
const { BlobServiceClient } = require('@azure/storage-blob');
const { AbortController } = require("@azure/abort-controller");

const defaultOptions = {
    connectionString: '',
    ttl: 1 * 60 * 30,
    containerName: 'images',
};

class AzureStorage {
    constructor(options) {
        this.options = { ...defaultOptions, ...options };

        if (!this.options.connectionString || this.options.connectionString === '') {
            throw new Error('Azure ConnectionString configuration is missing, are you sure you have set it?');
        }
    }

    async onInit() {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(
            this.options.connectionString
        );

        this.containerClient = this.blobServiceClient.getContainerClient(this.options.containerName);
        const response = await this.containerClient.createIfNotExists();
        console.log(response);
    }

    async get(key) {
        const blockBlobClient = this.containerClient.getBlockBlobClient(key);

        try {
            return await blockBlobClient.download();
        } catch (error) {
            console.log(error);
        }
    }

    async set(key, value) {
        try {
            var stream = require('stream');
            var isStream = value instanceof stream.Readable;

            const buf = value.copy()

            const blockBlobClient = this.containerClient.getBlockBlobClient(key);
            const response = await blockBlobClient.uploadData(value, {
                abortSignal: AbortController.timeout(30 * 60 * 1000),
                onProgress: (ev) => console.log(ev),
            });

            console.log(`Upload block blob ${key} successfully`, response.requestId);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = AzureStorage;