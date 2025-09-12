const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },

    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

});

//* Ensuring a user can only rate a store once (compound index)
RatingSchema.index({ user: 1, store: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);