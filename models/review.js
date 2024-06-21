const mongoose = require('mongoose')

const User = require('./user.js')
const rev = new mongoose.Schema({
    productId: {
        type: String,
       
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    rating: Number,
    comment: String
})
const Review = mongoose.model('Review', rev)
module.exports = Review