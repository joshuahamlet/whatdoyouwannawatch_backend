const express = require('express')
const app = express()

require('express-async-errors')
require('dotenv/config')
require('winston-mongodb')
const winston = require('winston')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieSession = require('cookie-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GoogleUser = require('./models/googleUserModel')

app.use(cors())

///////
const PORT = 4000
const server = require('http').createServer(app)
server.listen(PORT)
console.log(`listening on ${PORT}`)

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
})

io.on('connection', socket => {
    
  console.log(`a user connected: ${socket.id}`)
  
  socket.on('send-message', message => {
    socket.broadcast.emit('receive-message', message.message + ' Howdy')
    socket.emit('receive-message', message.message + ' EMIT')
  })
})

////////


//////////{ Cookie Setup}
app.use(cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
}))
app.use(passport.initialize())
app.use(passport.session())
//^^^^^^^^//^^^^^^^^//

//////////{ Parser }
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//^^^^^^^^//^^^^^^^^//


//////////{ Google OAuth }
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    GoogleUser.findById(id)
        .then(user => {
            done(null, user)
        })
})

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, 
    (accessToken, refreshToken, profile, done) => {
        GoogleUser.findOne({ googleId: profile.id })
            .then(existingUser => {
                if (existingUser) {
                    done(null, existingUser)
                } else {
                    new GoogleUser({
                            googleId: profile.id,
                            username: profile.displayName,
                            email: profile.emails[0].value,
                            usericon: profile.photos[0].value
                        })
                        .save()
                        .then(user => done(null, user))
                }
            })
    }))

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

app.get('/auth/google/callback', passport.authenticate('google'),
    (req, res) => {
        res.redirect('/')
    }
)

app.get('/api/logout', (req, res) => {
    req.logout()
    res.send(req.user)
})

app.get('/api/current_user', async (req, res) => {
    //res.json(req.user)
    try {
        const currentUser = await GoogleUser
        .findOne({ _id: req.user._id })
        .populate('movies')
        .populate('friends', ['movies', 'usericon', 'username'])

        const { friends } = currentUser
          
        const promises = friends.map(async friend => {
          const friendPop = await friend.populate('movies').execPopulate()
          return friendPop
        })
          
        const userFriends = await Promise.all(promises)

        return res.json({currentUser, userFriends})

    } catch (err) {
        return res.json({message: err})         
    }
})
//^^^^^^^^//^^^^^^^^//


//////////{ Routes }
app.get('/', (req,res) => {
    res.send('We are on home')
})

const userRoutes = require('./routes/userRoutes')
const User = require('./models/userModel')
app.use('/users', userRoutes)

const movieRoutes = require('./routes/movieRoutes')
const { Console } = require('console')
app.use('/movies', movieRoutes)
//^^^^^^^^//^^^^^^^^//


mongoose.connect(
    process.env.DB_CONNECTION, 
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }, 
    () => console.log('connected to DB!') 
)
