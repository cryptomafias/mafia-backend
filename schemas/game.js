const gameSchema = {
  title: "Game",
  type: "object",
  description: "game-action records",
  properties: {
    _id: {
      type: "string"
    },
    action: {
      type: "string"
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