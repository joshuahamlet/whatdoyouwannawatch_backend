const express = require('express')
const router = express.Router()
const movieController = require('../controllers/movieController')

router
    .route('/liked')
    .post(movieController.likeMovie)

router
    .route('/getbatch')
    .get(movieController.getMovieBatch)

router
    .route('/')
    .get(movieController.getMovies)


module.exports =  router