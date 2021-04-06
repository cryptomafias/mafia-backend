const shuffleSeed = require('shuffle-seed');
const {PolyRand, PolyAES} = require('poly-crypto');
const { PublicKey } = require('@textile/hub');
const toBuffer = require("it-to-buffer");
const models = require(".");

class Rooms{
    constructor(identity, client, threadId){
        this.identity = identity;
        this.client = client;
        this.threadId = threadId;
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
        const threadLookUp = await this.client.create(this.threadId, "threadLookUp", [{
            _id: roomId,
            villagerThread,
            mafiaThread,
            gameStateThread
        }])
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
                    const message = {
                        subject: "RoleAssignment",
                        message: encryptedRoleString,
                        to: playerPublicId,
                        from: this.identity.public.toString(),
                        type: "SYSTEM"
                    }
                    messages.push(message)
                }
                const playerIds = await this.client.create(threads.gameStateThread, 'playerState', players)
                const messageIds = await this.client.create(threads.villagerThread, 'chat', messages)
            }
        }
        throw new Error("Room is full!")
    }

    getRoom = async(roomId) => {
        const room = await this.client.findById(this.threadId, 'rooms', roomId)
        return room
    }
}

module.exports = {Rooms}
