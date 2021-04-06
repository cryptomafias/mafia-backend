const roomSchema = {
  title: "Room",
  type: "object",
  description: "An in-game room",
  properties: {
    _id: {
      type: "string",
      description: "The room's id."
    },
    phase: {
      type: "string",
      enum: ["WAITING", "NIGHT", "DISCUSSION", "VOTING", "ENDED"]
    },
    currentDay: {
      type: "integer",
      default: 0
    },
    villagerThread: {
      type: "string"
    },
    players: {
      type: "array",
      description: "An array of players that joined this room.",
      items: {
        type: "string",
        description: "public keys of the players"
      },
      minItems: 1,
      uniqueItems: true
    }
  }
}

module.exports = {roomSchema}