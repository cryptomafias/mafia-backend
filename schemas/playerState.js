const playerStateSchema = {
    title: "Player State",
    type: "object",
    description: "In-game player state",
    properties: {
        _id: {
            type: "integer",
            description: "player's no."
        },
        publicId: {
          type: "string"
        },
        role: {
            type: "string",
            enum: ["MAFIA", "VILLAGER", "DOCTOR", "DETECTIVE"]
        },
        key: {
            type: "string",
            description: "Key used to encrypt the role"
        },
        isAlive: {
            type: "bool"
        }
    }
}

module.exports = {playerStateSchema}