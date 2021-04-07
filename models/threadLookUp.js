getThreads = async(client, threadId, roomId) => {
    const threads = await client.findByID(threadId, 'threadLookUp', roomId)
    return threads
}

createThreads = async(client, threadId, threads) => {
    await client.create(threadId, "threadLookUp", [threads])
}

module.exports = {getThreads, createThreads}
