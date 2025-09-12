
const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please provide store name"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,

        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },

    address: {
        type: String,
        required: [true, "Please provide store address"],
        maxlength: [400, "Address cannot exceed 400 characters"],
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

   totalRatings: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Store', StoreSchema);