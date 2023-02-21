const Movie = require('../models/movieModel')
const GoogleUser = require('../models/googleUserModel')
const { logger } = require('../models/logger')


exports.getMovies = async (req, res, next) => {
    logger.error('Testing')
    const movies = await Movie.find().limit(10)
    res.json(movies)
}

exports.likeMovie = async (req, res, next) => {
    await GoogleUser
    .findOneAndUpdate(
        {_id: req.user._id },
        { $push: { movies: req.body.movie } },   
    )
    res.json(`${req.body.movie} was liked`)
}

exports.getMovieBatch = async (req, res, next) => {
    const user = await GoogleUser
    .findOne({_id: req.user._id })
    console.log(user)
    const userMovies = []
    await user.movies.map(movie => {
        userMovies.push(movie._id.toString())
    })
    console.log(userMovies)
    const movieList = await Movie.find()
    const movieBatchScrubbed = movieList.reduce((result, movie) => {
            if (userMovies.indexOf(movie._id.toString()) < 0) {
                result.push(movie);
            }
            return result;
    }, []);
    const movieBatch = movieBatchScrubbed.splice(0,10)
    res.json(movieBatch)
}

