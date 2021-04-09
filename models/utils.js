const validators = require('../validators');
const schemas = require('../schemas');

async function createCollection(client, threadId, name){
    const schema = schemas[name]
    const writeValidator = validators[name].writeValidator
    await client.newCollection(threadId, { name, schema, writeValidator})
}

module.exports = {
    createCollection
}