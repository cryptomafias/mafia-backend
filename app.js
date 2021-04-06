const express = require("express");
const hub = require('@textile/hub');
const bodyParser = require("body-parser");
const Graceful = require('@ladjs/graceful');
const Cabin = require('cabin');
const Bree = require('bree');

const getHub = require("./config/hub");
const modelsFactory = require(" ./models");

const app = express();
const identity = hub.PrivateKey.fromString(process.env.IDENTITY);
const gameThread = hub.ThreadID.fromString(process.env.GAME_THREAD);

const logger = new Cabin();
const bree = new Bree({
    logger,
});
const graceful = new Graceful({ brees: [bree] });

let hubConfig = {};
let models = {};

function errorHandler(callback) {
    if(hubConfig && models){
        return function (req, res, next) {
            callback(req, res, next)
                .catch(next)
        }
    }
}

app.use(bodyParser.json());

// Create new room
app.post("/rooms", errorHandler(async(req, res, next) => {
    const playerId = hub.PrivateKey.fromString(req.body.playerId);
    const roomInfo = await models.rooms.createRoom(playerId.public.toString());
    res.json(roomInfo);
}))

// Join an existing room
app.put("/rooms/:roomId", errorHandler(async(req, res, next) => {
    const playerId = hub.PrivateKey.fromString(req.body.playerId);
    const roomId = req.params.roomId;
    const roomInfo = await models.rooms.joinRoom(roomId, playerId);
    res.json(roomInfo);
}))

app.listen(5000, "0.0.0.0", async function(){
    hubConfig = await getHub(identity);
    await modelsFactory.initCollections(hubConfig.client, gameThread);
    models.rooms = new modelsFactory.Rooms(identity, hubConfig.client, gameThread);
    graceful.listen();
    bree.start();
});
