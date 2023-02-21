const mongoose = require('mongoose')

const MovieSchema = mongoose.Schema({
    netflixid: {type: String,},
    title: {type: String,},
    image: {type: String,},
    synopsis: {type: String,},
    rating: {type: String,},
    type: {type: String,},
    released: {type: String,},
    runtime: {type: String,},
    largeimage: {type: String,},
    unogsdate: {type: String,},
    imdbid: {type: String,},
})

const Movie = mongoose.model('Movie', MovieSchema)

module.exports = Movie 