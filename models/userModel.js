const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = mongoose.Schema({
    username: {
        type: String, 
        required: [true, 'Please provide a username.']
    },
    email: {
        type: String, 
        required: [true, 'Please provide an email.'], 
        unique: true, 
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'EmailUsers' 
    }],
    movies: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Movie' 
    }],
    password: {
        type: String, 
        required: [true, 'Please provide a password.'],
        minlength: 8,
        select: false
    },
    passwordChangedAt: Date
})

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    next()
})

UserSchema.methods.checkPassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword)
}

UserSchema.methods.passwordHasChanged =  function(JWTTimestamp) {
    if (passwordChangedAt) {

        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000, 10
        )

        console(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }

    return false
}

const User = mongoose.model('EmailUsers', UserSchema,  'users')

module.exports = User 