const { Schema, model } = require('mongoose');

const movieSchema = new Schema({
    imdbid:{
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    year:{
        type: Number,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    ranking: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

module.exports = model('Movie', movieSchema);