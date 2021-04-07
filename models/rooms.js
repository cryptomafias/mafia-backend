const shuffleSeed = require('shuffle-seed');
const {PolyRand, PolyAES} = require('poly-crypto');
const { PublicKey } = require('@textile/hub');
const toBuffer = require("it-to-buffer");
const models = require(".");

class Rooms{
    constructor(identity, client, threadId, bree){
        this.identity = identity;
        this.client = client;
        this.threadId = threadId;
        this.bree = bree;
    }

    listRooms = async() => {
        const rooms = await this.client.find(this.threadId, 'rooms', {})
        return rooms
    }

    createRoom = async(playerId) => {
        const villagerThread = (await this.client.newDB()).toString()
        const mafiaThread = (await this.client.newDB()).toString()
        const gameStateThread = (await this.client.newDB()).toString()
        const room = await this.client.create(this.threadId, 'rooms', [{
            phase: "WAITING",
            players: [playerId],
            villagerThread
        }])
        const roomId = room[0]
        await models.threadLookUp.createThreads(this.client, this.threadId, {
            _id: roomId,
            villagerThread,
            mafiaThread,
            gameStateThread
        })
        return {roomId, villagerThread}
    }

    joinRoom = async(roomId, playerId) => {
        const room = await this.getRoom(roomId)
        const playerPublicId = playerId.public.toString()
        if(room.players.length < 8){
            room.players.push(playerPublicId)
            await this.client.save(this.threadId, "rooms", [room])
            if(room.players.length == 8){
                const roles = ["MAFIA", "MAFIA", "MAFIA", "VILLAGER", "VILLAGER", "VILLAGER", "DOCTOR", "DETECTIVE"]
                const timestamp = new Date().getTime();
                const shuffledRoles = shuffleSeed.shuffle(roles, timestamp)
                const threads = await models.threadLookUp.getThreads(this.client, this.threadId, roomId);
                await models.createCollection(this.client, threads.villagerThread,"chat");
                await models.createCollection(this.client, threads.gameStateThread, "playerState");
                const players = []
                const messages = []
                for(let i=0; i<8; i++){
                    const hexKey = PolyRand.slug(16)
                    const player = {
                        _id: i,
                        publicId: room.players[i],
                        role: shuffledRoles[i],
                        key: hexKey,
                        isAlive: true
                    }
                    players.push(player)
                    const pubKey = PublicKey.fromString(playerPublicId)
                    const encryptedRole = await pubKey.encrypt(Buffer.from(PolyAES.withKey(hexKey).encrypt(shuffledRoles[i])))
                    const encryptedRoleString = await toBuffer(encryptedRole)
                    const messagePayload = (shuffledRoles[i] === "MAFIA") ? JSON.stringify({
                        encryptedRole: encryptedRoleString,
                        mafiaThread: threads.mafiaThread
                    }) : JSON.stringify({
                        encryptedRole: encryptedRoleString
                    })
                    const message = {
                        subject: "RoleAssignment",
                        message: messagePayload,
                        to: playerPublicId,
                        from: this.identity.public.toString(),
                        type: "SYSTEM"
                    }
                    messages.push(message)
                }
                const playerIds = await models.playerState.addPlayers(this.client, threads.gameStateThread, players)
                const messageIds = await this.client.create(threads.villagerThread, 'chat', messages)
                this.updateRoomPhase(roomId)
            }
        }
        throw new Error("Room is full!")
    }

    getRoom = async(roomId) => {
        const room = await this.client.findById(this.threadId, 'rooms', roomId)
        return room
    }

    updateRoomPhase(roomId) {
        const updater = async() => {
            const room = await this.getRoom(roomId)
            const threads = await models.threadLookUp.getThreads(this.client, this.threadId, roomId)
            let message, winner
            switch (room.phase) {
                case "WAITING":
                    room.phase = "NIGHT"
                    room.currentDay = 1
                    await models.createCollection(this.client, threads.gameStateThread, `NIGHT-${room.currentDay}`)
                    break
                case "NIGHT":
                    room.phase = "DISCUSSION"
                    const nightResult = await models.game.nightResult(
                        this.client,
                        threads.gameStateThread,
                        `NIGHT-${room.currentDay}`
                    )
                    await models.playerState.markPlayerDead(this.client, this.threadId, nightResult.deadPlayer)
                    message = {
                        subject: "DEAD_PLAYER",
                        message: nightResult,
                        to: "ALL",
                        from: this.identity.public.toString(),
                        type: "SYSTEM"
                    }
                    await this.client.create(threads.villagerThread, 'chat', [message])
                    break
                case "DISCUSSION":
                    room.phase = "VOTING"
                    await models.createCollection(this.client, threads.gameStateThread, `DAY-${room.currentDay}`)
                    break
                case "VOTING":
                    room.phase = "NIGHT"
                    room.currentDay += 1
                    await models.createCollection(this.client, threads.gameStateThread, `NIGHT-${room.currentDay}`)
                    const dayResult = await models.game.nightResult(
                        this.client,
                        threads.gameStateThread,
                        `DAY-${room.currentDay}`
                    )
                    await models.playerState.markPlayerDead(this.client, this.threadId, dayResult.deadPlayer)
                    message = {
                        subject: "EJECTED_PLAYER",
                        message: dayResult,
                        to: "ALL",
                        from: this.identity.public.toString(),
                        type: "SYSTEM"
                    }
                    await this.client.create(threads.villagerThread, 'chat', [message])
                    break
                case "ENDED":
                    room.phase = "ENDED"
                    break
                default:
                    break
            }
            await this.client.save(this.threadId, "rooms", [room])
            winner = await models.game.checkWinningCondition(this.client, this.threadId)
            if(winner){
                message = {
                    subject: "WINNER",
                    message: winner,
                    to: "ALL",
                    from: this.identity.public.toString(),
                    type: "SYSTEM"
                }
                await this.client.create(threads.villagerThread, 'chat', [message])
                this.bree.stop(roomId)
            }
        }
        this.bree.add([{
            name: roomId,
            path: updater,
            interval: "1m"
        }])
        this.bree.start(roomId)
    }
}

module.exports = {Rooms}
