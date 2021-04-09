const ethersUtils = require("ethers/lib/utils");
const models = require(".");

async function killVote(client, threadId, gamePhaseName, mafiaId, victimId){
    const timestamp = new Date().getTime();
    const _id = ethersUtils.id(`${mafiaId}-${victimId}`)
    const gameAction = {_id, action: "KILL_VOTE", to: victimId, from: mafiaId, time: timestamp}
    await client.create(threadId, gamePhaseName, [gameAction])
}

async function vote(client, threadId, gamePhaseName, playerId, victimId){
    const timestamp = new Date().getTime();
    const _id = ethersUtils.id(`${playerId}-${victimId}`)
    const gameAction = {_id, action: "VOTE", to: victimId, from: playerId, time: timestamp}
    await client.create(threadId, gamePhaseName, [gameAction])
}

async function inspect(client, threadId, gamePhaseName, detectiveId, victimId){
    const timestamp = new Date().getTime();
    const _id = ethersUtils.id(`${detectiveId}-${victimId}`)
    const gameAction = {_id, action: "INSPECT", to: victimId, from: detectiveId, time: timestamp}
    await client.create(threadId, gamePhaseName, [gameAction])
    const player = await models.playerState.getPlayer(client, threadId, victimId)
    return player.role
}

async function heal(client, threadId, gamePhaseName, doctorId, victimId){
    const timestamp = new Date().getTime();
    const _id = ethersUtils.id(`${doctorId}-${victimId}`)
    const gameAction = {_id, action: "HEAL", to: victimId, from: doctorId, time: timestamp}
    await client.create(threadId, gamePhaseName, [gameAction])
}

async function nightResult(client, threadId, gamePhaseName){
    const gameActions = client.find(threadId, gamePhaseName, {})
    const mafiaVote = {}
    let healedPlayer
    for(let gameAction of gameActions){
        if(gameAction.action === "KILL_VOTE"){
            mafiaVote[gameAction.to] = mafiaVote.hasOwnProperty(gameAction.to) ? mafiaVote[gameAction.to] + 1 : 1
        } else if (gameAction.action === "HEAL"){
            healedPlayer = gameAction.to
        }
    }
    const deadPlayer = Object.keys(mafiaVote).reduce((a, b) => mafiaVote[a] > mafiaVote[b] ? a : b);
    if(deadPlayer === healedPlayer){
        return {deadPlayer: "none"}
    } else {
        return {deadPlayer: deadPlayer}
    }
}

async function dayResult(client, threadId, gamePhaseName){
    const gameActions = client.find(threadId, gamePhaseName, {})
    const votes = {}
    for(let gameAction of gameActions){
        if(gameAction.action === "KILL_VOTE"){
            votes[gameAction.to] = votes.hasOwnProperty(gameAction.to) ? votes[gameAction.to] + 1 : 1
        }
    }
    const keysSorted = Object.keys(votes).sort((a, b) => (votes[b] - votes[a]))
    const highestVote = votes[keysSorted[0]]
    const secondHighestVote = votes[keysSorted[1]]
    if(highestVote === secondHighestVote){
        return {ejectedPlayer: "none"}
    } else {
        return {ejectedPlayer: keysSorted[0]}
    }
}

async function checkWinningCondition(client, threadId){
    const players = await client.find(threadId, "playerState", {})
    let noOfAliveMafia = 0
    let noOfAliveVillager = 0
    for(let player of players){
        if(player.role === "MAFIA"){
            noOfAliveMafia++
        } else {
            noOfAliveVillager++
        }
    }
    if(noOfAliveMafia === 0){
        return {win: "VILLAGER"}
    } else if(noOfAliveMafia === noOfAliveVillager) {
        return {win: "MAFIA"}
    } else {
        return
    }
}

module.exports = {
    killVote,
    vote,
    inspect,
    heal,
    dayResult,
    nightResult,
    checkWinningCondition
}