module.exports = {
  type: 'object',
  required: ['PORT', 'AZURE_STORAGE_CONNECTION_STRING'],
  properties: {
    PORT: {
      type: 'string',
      default: 3000
    },
    AZURE_STORAGE_CONNECTION_STRING: {
      type: 'string',
    }
  }
};