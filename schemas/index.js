rooms = require('./rooms');
chat = require('./chat');
threadLookUp = require('./threadLookUp');

module.exports = {
    rooms: rooms.roomSchema,
    chat: chat.chatSchema,
    threadLookUp: threadLookUp.threadLookUpSchema
}