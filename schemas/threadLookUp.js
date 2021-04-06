const threadLookUpSchema = {
  title: "threadLookUp",
  type: "object",
  description: "get threads by roomId",
  properties: {
    _id: {
      type: "string",
      description: "The room's id."
    },
    villagerThread: {
      type: "string"
    },
    mafiaThread: {
      type: "string"
    },
    gameStateThread: {
      type: "string"
    }
  }
}

module.exports = {threadLookUpSchema}