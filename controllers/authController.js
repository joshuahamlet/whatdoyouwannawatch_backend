const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = async (req, res, next) => {
    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    
    const token = signToken(newUser._id)
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: {
                _id: newUser._id,
                email: newUser.email
            }
        }
    })
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new Error('Please provide email and password.', 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !await user.checkPassword(password, user.password)) {
        return next(new Error('Incorrect email or password.', 401))
    }

    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token
    })
}

exports.protect = async (req, res, next) => {
    let token 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) {
        return next(new Error('Please log in for access.', 401))
    }

    const decoded = await promisify (jwt.verify)(token, process.env.JWT_SECRET)

    const userExists = await User.findById(decoded.id)

    if(!userExists) {
        return(new Error('User no longer exists.', 401))
    }

    if (userExists.passwordHasChanged(decoded.iat)) {
        return next(new Error('Password has changed. Please log in again', 401))
    }


    req.user = userExists
    next()
}