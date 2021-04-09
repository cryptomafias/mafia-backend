addPlayers = async(client, threadId, players) => {
    const playerIds = await client.create(threadId, "playerState", players)
    return playerIds
}

markPlayerDead = async(client, threadId, playerId) => {
    const player = await client.findByID(threadId, "playerState", playerId)
    player.isAlive = false
    await this.client.save(threadId, "playerState", [player])
}

getPlayer = async(client, threadId, playerId) => {
    const player = await client.findByID(threadId, "playerState", playerId)
    return player
}

module.exports = {
    addPlayers,
    markPlayerDead,
    getPlayer
}