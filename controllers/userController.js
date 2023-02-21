const User = require('../models/userModel')

exports.getAllUsers = async (req, res, next) => {
    const users = await User.find()
    res.json(users)
}

exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.userId)
    res.json(user)
}

exports.deleteUser = async (req, res) => {
    const removedUser = await User.remove({ _id: req.params.userId })
    res.json(removedUser)
}

exports.testUser = async (req, res) => {    
    const userData = await User.findById({ _id: req.params.userId }).populate('friends') 
    const userMovieList = userData.movies
    const compare = (friendMovieList) => {
        const sharedMovies = []
        for ( let i = 0; i < friendMovieList.length; i += 1 ) {
            if (userMovieList.indexOf(friendMovieList[i]) > -1) {
                sharedMovies.push(friendMovieList[i])
            }
        }
        return sharedMovies
    }
    let userMatchedData = []
        
    userData.friends.map(friend => {
        userMatchedData.push({name: friend.username, matches: compare(friend.movies)})
    })
    
    res.json(userMatchedData)
}

