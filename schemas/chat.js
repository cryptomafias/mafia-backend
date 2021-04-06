const chatSchema = {
  title: "Chat",
  type: "object",
  description: "An in-game chat group",
  properties: {
    _id: {
      type: "string"
    },
    subject: {
      type: "string"
    },
    message: {
      type: "string"
    },
    to: {
      type: "string"
    },
    from: {
      type: "string"
    },
    type: {
      type: "string",
      enum: ["SYSTEM", "CHAT"]
    }
  }
}

module.exports = {chatSchema}