const mongoose = require('mongoose');

const reviewModel = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seekers', 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room'
    },

    fullname: String
});

const Review = mongoose.model("review", reviewModel)


module.exports = Review;
