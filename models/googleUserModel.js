const mongoose = require('mongoose')
const { Schema } = mongoose

const googleUserSchema = new Schema ({
    googleId: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    usericon: {
        type: String,
    },
    movies: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Movie',
        unique: true 
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'EmailUsers' 
    }]
})

const GoogleUser = mongoose.model('GoogleUsers', googleUserSchema, 'users')

module.exports = GoogleUser