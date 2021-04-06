getThreads = async(client, threadId, roomId) => {
    const threads = await client.findByID(threadId, 'threadLookUp', roomId)
    return threads
}

module.exports = {getThreads}
