const { parentPort } = require('worker_threads');
const hub = require('@textile/hub');

const models = require("../models");
const getHub = require("../config/hub");

const roomId = require('worker_threads').workerData.roomId;
const threadsInfo = require('worker_threads').workerData.threads;
const config = require('worker_threads').workerData.config;

const identity = hub.PrivateKey.fromString(config.identity);
const threadId = hub.ThreadID.fromString(config.threadId);
const threads = {
    villagerThread: hub.ThreadID.fromString(threadsInfo.villagerThread),
    gameStateThread: hub.ThreadID.fromString(threadsInfo.gameStateThread)
}

let isCancelled

if (parentPort){
    parentPort.once('message', message => {
        if (message === 'cancel') {
            isCancelled = true;
        }
    });
}

const updater = async () => {
    if (isCancelled) return;
    const hubConfig = await getHub(identity)
    const room = await hubConfig.client.findByID(threadId, 'rooms', roomId)
    console.log("update phase job running!")
    let message, winner
    switch (room.phase) {
        case "WAITING":
            room.phase = "NIGHT"
            room.currentDay = 1
            await models.initCollections(
                hubConfig.client,
                threads.gameStateThread,
                [{name: `NIGHT-${room.currentDay}`, type: "game"}]
            )
            break
        case "NIGHT":
            room.phase = "DISCUSSION"
            const nightResult = await models.game.nightResult(
                hubConfig.client,
                threads.gameStateThread,
                `NIGHT-${room.currentDay}`
            )
            if(nightResult.deadPlayer !== "none"){
                await models.playerState.markPlayerDead(
                    hubConfig.client,
                    threads.gameStateThread,
                    nightResult.deadPlayer
                )
            }
            message = {
                subject: "DEAD_PLAYER",
                message: nightResult.deadPlayer,
                to: "ALL",
                from: identity.public.toString(),
                type: "SYSTEM"
            }
            await hubConfig.client.create(threads.villagerThread, 'chat', [message])
            break
        case "DISCUSSION":
            room.phase = "VOTING"
            await models.initCollections(
                hubConfig.client,
                threads.gameStateThread,
                [{name: `DAY-${room.currentDay}`, type: "game"}]
            )
            break
        case "VOTING":
            room.phase = "NIGHT"
            console.log("day result calculation...")
            const dayResult = await models.game.dayResult(
                hubConfig.client,
                threads.gameStateThread,
                `DAY-${room.currentDay}`
            )
            console.log("init next phase")
            room.currentDay += 1
            await models.initCollections(
                hubConfig.client,
                threads.gameStateThread,
                [{name: `NIGHT-${room.currentDay}`, type: "game"}]
            )
            console.log(dayResult)
            console.log("mark player dead")
            if(dayResult.ejectedPlayer !== "none"){
                await models.playerState.markPlayerDead(
                    hubConfig.client,
                    threads.gameStateThread,
                    dayResult.ejectedPlayer
                )
            }
            console.log("notifying player")
            // await models.playerState.markPlayerDead(hubConfig.client, threads.gameStateThread, dayResult.deadPlayer)
            message = {
                subject: "EJECTED_PLAYER",
                message: dayResult.ejectedPlayer,
                to: "ALL",
                from: identity.public.toString(),
                type: "SYSTEM"
            }
            await hubConfig.client.create(threads.villagerThread, 'chat', [message])
            break
        case "ENDED":
            room.phase = "ENDED"
            break
        default:
            break
    }
    await hubConfig.client.save(threadId, "rooms", [room])
    winner = await models.game.checkWinningCondition(hubConfig.client, threads.gameStateThread)
    if (winner) {
        message = {
            subject: "WINNER",
            message: winner,
            to: "ALL",
            from: identity.public.toString(),
            type: "SYSTEM"
        }
        await hubConfig.client.create(threads.villagerThread, 'chat', [message])
    }
}

(async() => {
    try{
        await updater()
    } catch (e) {
        console.log(e);
    }
    // signal to parent that the job is done
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
})()