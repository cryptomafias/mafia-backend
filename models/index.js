const rooms = require('./rooms');
const threadLookUp = require("./threadLookUp");
const playerState = require("./playerState");
const game = require("./game");
const {createCollection} = require("./utils");

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
    initCollections,
    createCollection,
    Rooms: rooms.Rooms,
    threadLookUp,
    playerState,
    game
}