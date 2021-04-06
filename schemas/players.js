const playerSchema = {
  title: "Player",
  type: "object",
  description: "Player profile",
  properties: {
    _id: {
      type: "string",
      description: "player's id."
    },
    name: {
      type: "string",
      description: "In-game username"
    },
    encryptedKey: {
      type: "string"
    },
    encryptedRole: {
      type: "string"
    }
  }
}

module.exports = {playerSchema}