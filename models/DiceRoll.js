const mongoose = require('mongoose');

// schema för tärningskast
const diceRollSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true
    },
    roll: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    total: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DiceRoll', diceRollSchema);
