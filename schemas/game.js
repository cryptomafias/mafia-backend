const gameSchema = {
  title: "Game",
  type: "object",
  description: "game-action records",
  properties: {
    _id: {
      type: "string"
    },
    action: {
      type: "string",
      enum: ["KILL_VOTE", "VOTE", "INSPECT", "HEAL"]
    },
    to: {
      type: "string"
    },
    from: {
      type: "string"
    },
    time: {
      type: "integer"
    }
  }
}

module.exports = {gameSchema}