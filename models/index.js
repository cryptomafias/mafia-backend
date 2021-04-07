const rooms = require('./rooms');
const threadLookUp = require("./threadLookUp");
const playerState = require("./playerState");
const game = require("./game");
const validators = require('../validators');
const schemas = require('../schemas');

async function createCollection(client, threadId, name){
    const schema = schemas[name]
    const writeValidator = validators[name].writeValidator
    await client.newCollection(threadId, { name, schema, writeValidator})
}

async function initCollections(client, threadId){
    const collections = await client.listCollections(threadId)
    const collectionSet = new Set(collections.map((collection) => (collection.name)))
    const expectedCollections = ["rooms", "threadLookUp"]

    for(const collection of expectedCollections){
        if(!collectionSet.has(collection))
        {
            await createCollection(client, threadId, collection, validators[collection].writeValidator)
        }
    }
}

module.exports = {
    createCollection,
    initCollections,
    Rooms: rooms.Rooms,
    threadLookUp,
    playerState,
    game
}