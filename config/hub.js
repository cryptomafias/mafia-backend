const hub = require('@textile/hub')
const KEY = {key: process.env.KEY}

async function initClient(identity){
    const client = await hub.Client.withKeyInfo(KEY)
    await client.getToken(identity)
    return client
}

async function initUsers(identity){
    const users = await hub.Users.withKeyInfo(KEY)
    await users.getToken(identity)
    return users
}

async function initBuckets(identity){
    const buckets = await hub.Buckets.withKeyInfo(KEY)
    await buckets.getToken(identity)
    return buckets
}

async function getHub(identity) {
    const client = await initClient(identity)
    const users = await initUsers(identity)
    const buckets = await initBuckets(identity)
    const hub = {
        client,
        users,
        buckets
    }
    return hub
}

module.exports = getHub