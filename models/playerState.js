class PlayerState {
    constructor(client, threadId) {
        this.client = client;
        this.threadId = threadId;
    }

    addPlayers = async(players) => {
        const playerIds = await this.client.create(this.threadId, "playerState", players)
        return playerIds
    }

    markPlayerDead = async(playerId) => {
        const player = await this.client.findByID(playerId)
        player.isAlive = false
        await this.client.save(this.threadId, "playerState", [player])
    }
}